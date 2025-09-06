"""FastAPI service to load trained pneumonia detection model and provide prediction endpoint.

Endpoints:
POST /predict  - multipart/form-data with field 'file' (X-ray image). Returns JSON {prediction: 'PNEUMONIA'|'NORMAL', confidence: float}
GET /health    - health check.

Model: expects a Keras model file path via env MODEL_PATH (default: pneumonia_detection_model.keras)
Image preprocessing matches training: resize to 150x150, scale 0-1.
"""
import os
import io
from typing import Tuple
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
try:
    import fitz  # PyMuPDF
    _HAS_PYMUPDF = True
except Exception:
    _HAS_PYMUPDF = False
import tensorflow as tf

MODEL_PATH = os.getenv("MODEL_PATH", "pneumonia_detection_model.keras")
IMG_SIZE = (150, 150)

app = FastAPI(title="Pneumonia Detection Inference API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"]
    ,allow_headers=["*"]
)

model = None

def load_model():
    global model
    if model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}. Train the model first.")
        model = tf.keras.models.load_model(MODEL_PATH)
    return model

def preprocess(image: Image.Image) -> np.ndarray:
    image = image.convert("RGB")
    image = image.resize(IMG_SIZE)
    arr = np.array(image) / 255.0
    arr = np.expand_dims(arr, axis=0)
    return arr

@app.get("/health")
def health():
    return {"status": "ok"}

def _load_image_from_pdf(data: bytes) -> Image.Image:
    if not _HAS_PYMUPDF:
        raise HTTPException(status_code=400, detail="PDF support requires PyMuPDF. Please install 'pymupdf'.")
    try:
        doc = fitz.open(stream=data, filetype="pdf")
        if doc.page_count == 0:
            raise HTTPException(status_code=400, detail="Empty PDF")
        page = doc.load_page(0)
        # Render first page at higher zoom for clarity
        zoom = fitz.Matrix(2, 2)
        pix = page.get_pixmap(matrix=zoom, alpha=False)
        mode = "RGB" if pix.n < 4 else "RGBA"
        img = Image.frombytes(mode, [pix.width, pix.height], pix.samples)
        return img.convert("RGB")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to process PDF")


def _read_upload_as_image(upload: UploadFile) -> Image.Image:
    # Reads UploadFile and returns a PIL Image; supports PDF (first page) and common image formats
    contents = upload.file.read() if upload.file else None
    if contents is None:
        contents = b""
    # If empty (some servers), use await interface
    if not contents:
        # This function may be called from async path, keep a fallback
        contents = upload.file.read() if upload.file else b""
    ctype = (upload.content_type or "").lower()
    name = (upload.filename or "").lower()
    if ctype == "application/pdf" or name.endswith(".pdf"):
        return _load_image_from_pdf(contents)
    try:
        img = Image.open(io.BytesIO(contents))
        # For animated formats, select first frame
        if getattr(img, "is_animated", False):
            img.seek(0)
        return img.convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or unsupported image file")


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        if (file.content_type or "").lower() == "application/pdf" or (file.filename or "").lower().endswith(".pdf"):
            image = _load_image_from_pdf(contents)
        else:
            image = Image.open(io.BytesIO(contents))
            if getattr(image, "is_animated", False):
                image.seek(0)
            image = image.convert("RGB")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image or PDF file")

    model_loaded = load_model()
    arr = preprocess(image)
    preds = model_loaded.predict(arr)
    prob = float(preds[0][0])  # sigmoid output
    
    # Use lower threshold (0.3) to catch more pneumonia cases and reduce false negatives
    # This is especially important for bacterial infections that may have lower probability scores
    threshold = 0.3
    label = "PNEUMONIA" if prob >= threshold else "NORMAL"
    confidence = prob if label == "PNEUMONIA" else 1 - prob
    
    # Enhanced response with additional metadata
    return {
        "prediction": label, 
        "confidence": round(confidence, 4),
        "raw_probability": round(prob, 4),
        "threshold_used": threshold,
        "model_version": "Pneumonia Detection v2.1 (Enhanced Sensitivity)",
        "filename": file.filename or "unknown"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("inference_service:app", host="0.0.0.0", port=8001, reload=True)