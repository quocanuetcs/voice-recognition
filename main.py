from typing import List
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import numpy as np
from modeling.gru_gru import GRU_GRU
import data_preparing

N_MFCC = 13

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = GRU_GRU(num_features=N_MFCC)
model.load_weights()

@app.post("/comparespeaker/")
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