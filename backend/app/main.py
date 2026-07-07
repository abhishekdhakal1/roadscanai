from fastapi import FastAPI, UploadFile, File

app = FastAPI()


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    return {"filename": file.filename}
