from datetime import datetime, timedelta
from typing import Optional
from fastapi import FastAPI, File, UploadFile, Form, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from jose import JWTError, jwt
import numpy as np
from modeling.gru_gru import GRU_GRU
import data_preparing

# to get a string like this run:
# openssl rand -hex 32
SECRET_KEY = "8c77a99e57cc391421f6bbaaff150e27e4260c0f56ebac1b3cf2567cc6637e4b"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
N_MFCC = 13

fake_users_db = {
    "johndoe": {
        "username": "johndoe",
        "hashed_password": "fakehashedsecret",
        "voiceprint": None,
    }
}

model = GRU_GRU(num_features=N_MFCC)
model.load_weights()

class Token(BaseModel):
    access_token: str
    token_type: str
        
class TokenData(BaseModel):
    username: Optional[str] = None

class User(BaseModel):
    username: str
        
class UserInDB(User):
    hashed_password: str

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_user(db, username: str):
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)

def fake_hash_password(password: str):
    return "fakehashed" + password

def verify_password(plain_password, hashed_password):
    return fake_hash_password(plain_password) == hashed_password

@app.post("/signup")
async def sign_up(form_data: OAuth2PasswordRequestForm = Depends(), voiceprint: UploadFile = File(...)):
    user = get_user(fake_users_db, form_data.username)
    if user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists",
        )
    user_data = {
        "username": form_data.username,
        "hashed_password": fake_hash_password(form_data.password),
        "voiceprint": voiceprint,
    }
    fake_users_db[form_data.username] = user_data
    return "You have registered successfully"

def authenticate_user(fake_db, username: str, password: str):
    user = get_user(fake_db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datatime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/token", response_model=Token)
async def log_in(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )   
    return {"access_token": access_token, "token_type": "bearer"}

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(fake_users_db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

def compare_speaker(file_1, file_2):
    test_pair = data_preparing.process(file_1.file, file_2.file, file_type=file_1.filename[-3:])
    result = np.sqrt(np.mean(np.square(model.predict_proba(test_pair).flatten())))
    return result
#   result = model.predict_proba(test_pair).flatten()
#   result.sort()
#   return result[len(result)//2]

@app.post("/users/changepassword")
async def change_password(current_user: User = Depends(get_current_user),
                          new_password: str = Form(...),
                          voiceprint: UploadFile = File(...)):
    
    if not voiceprint.filename.endswith(".wav"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="WAV file is required",
        )
    saved_voiceprint = fake_users_db[current_user.username]["voiceprint"]
    same_user = compare_speaker(saved_voiceprint, voiceprint) > 0.5
    if not same_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Voiceprints do not match",
        )
    fake_users_db[current_user.username]["hashed_password"] = fake_hash_password(new_password)
    return "Password changed successfully"

@app.post("/demo")
async def demo(file_1: UploadFile = File(...), file_2: UploadFile = File(...)):
    if not ((file_1.filename.endswith(".wav") and file_2.filename.endswith(".wav"))
           or (file_1.filename.endswith(".npy") and file_2.filename.endswith(".npy"))):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="WAV files are required",
        )
        
    same_speaker_probability = compare_speaker(file_1, file_2)
    return {"same_speaker_probability": f"{same_speaker_probability:.7f}"}

@app.get("/")
async def main():
    content = """
        <body>
            <form action="/demo" enctype="multipart/form-data" method="post">
                <input name="file_1" type="file"><br/>
                <input name="file_2" type="file"><br/>
                <input type="submit">
            </form>
        </body>
        """
    return HTMLResponse(content=content)