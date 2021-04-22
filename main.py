from typing import List
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import HTMLResponse
import numpy as np
from modeling.gru_gru import GRU_GRU
import data_preparing

N_MFCC = 13

app = FastAPI()
model = GRU_GRU(num_features=N_MFCC)
model.load_weights()

@app.post("/comparespeaker/")
async def compare_speaker(files: List[UploadFile] = File(...)):
    if not ((files[0].filename.endswith(".wav") and files[1].filename.endswith(".wav"))
           or (files[0].filename.endswith(".npy") and files[1].filename.endswith(".npy"))):
        return {"error": "WAV files are required."}
    
    test_pair = data_preparing.process(files[0].file, files[1].file, file_type=files[0].filename[-3:])
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
                <input name="files" type="file" multiple>
                <input type="submit">
            </form>
        </body>
        """
    return HTMLResponse(content=content)