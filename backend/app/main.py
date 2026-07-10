from fastapi import FastAPI, UploadFile, File, HTTPException
from PIL import Image
import torch

from app.inference import model, device, idx_to_class
from app.utils import val_transform

app = FastAPI()


@app.get("/")
def home():
    return {"message": "RoadScanAI API is running"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        image = Image.open(file.file).convert("RGB")

        image_tensor = val_transform(image).unsqueeze(0).to(device)

        with torch.no_grad():
            logits = model(image_tensor)
            probs = torch.softmax(logits, dim=1).squeeze(0)

        pred_idx = probs.argmax().item()

        return {
            "prediction": idx_to_class[pred_idx],
            "confidence": round(probs[pred_idx].item(), 4),
            "probabilities": {
                idx_to_class[i]: round(probs[i].item(), 4)
                for i in range(len(idx_to_class))
            },
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
