from typing import List
from fastapi import FastAPI, File, UploadFile, Form, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
import numpy as np
from modeling.gru_gru import GRU_GRU
import data_preparing

N_MFCC = 13

fake_users_db = {
    "johndoe": {
        "username": "johndoe",
        "hashed_password": "fakehashedsecret",
    },
    "alice": {
        "username": "alice",
        "hashed_password": "fakehashedsecret2",
    },
}

model = GRU_GRU(num_features=N_MFCC)
model.load_weights()

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

@app.post("/signup")
async def sign_up(username: str = Form(...), password: str = Form(...), voiceprint: UploadFile = File(...)):
    user = User(username=username)
    data_db = user.dict()
    return data_db['username']

def fake_hash_password(password: str):
    return "fakehashed" + password

@app.post("/token")
async def log_in(form_data: OAuth2PasswordRequestForm = Depends()):
    user_dict = fake_users_db.get(form_data.username)
    if not user_dict:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    user = UserInDB(**user_dict)
    hashed_password = fake_hash_password(form_data.password)
    if not hashed_password == user.hashed_password:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
        
    return {"access_token": user.username, "token_type": "bearer"}

def get_user(db, username: str):
    if username in db:
        user_dict = db[username]
        return UserInDB(**user_dict)

def fake_decode_token(token):
    user = get_user(fake_users_db, token)
    return user

async def get_current_user(token: str = Depends(oauth2_scheme)):
    user = fake_decode_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

@app.get("/users/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.post("/comparespeaker")
async def compare_speaker(file_1: UploadFile = File(...), file_2: UploadFile = File(...)):
    if not ((file_1.filename.endswith(".wav") and file_2.filename.endswith(".wav"))
           or (file_1.filename.endswith(".npy") and file_2.filename.endswith(".npy"))):
        return {"error": "WAV files are required."}
    
    test_pair = data_preparing.process(file_1.file, file_2.file, file_type=file_1.filename[-3:])
    result = np.sqrt(np.mean(np.square(model.predict_proba(test_pair).flatten())))
    return {"same_speaker_probability": f"{result:.7f}"}
#     result = model.predict_proba(test_pair).flatten()
#     result.sort()
#     return {"same_speaker_probability": f"{result[len(result)//2]:.7f}"}

@app.get("/")
async def main():
    content = """
        <body>
            <form action="/comparespeaker/" enctype="multipart/form-data" method="post">
                <input name="file_1" type="file"><br/>
                <input name="file_2" type="file"><br/>
                <input type="submit">
            </form>
        </body>
        """
    return HTMLResponse(content=content)