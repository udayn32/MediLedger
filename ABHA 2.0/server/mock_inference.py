"""Lightweight mock inference API for demo purposes.

This service mimics the real inference API but does not require TensorFlow.
It accepts multipart file uploads and returns a random prediction with confidence.

Run for demo: python mock_inference.py
"""
import random
import io
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

app = FastAPI(title="Mock Pneumonia Inference API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get('/health')
def health():
    return {"status": "mock ok"}


@app.post('/predict')
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        Image.open(io.BytesIO(contents))
    except Exception:
        raise HTTPException(status_code=400, detail='Invalid image')

    # Random demo prediction
    prob = random.uniform(0, 1)
    label = 'PNEUMONIA' if prob >= 0.5 else 'NORMAL'
    confidence = prob if label == 'PNEUMONIA' else 1 - prob
    return { 'prediction': label, 'confidence': round(confidence, 4) }


if __name__ == '__main__':
    import uvicorn
    uvicorn.run('mock_inference:app', host='0.0.0.0', port=8001, reload=False)
