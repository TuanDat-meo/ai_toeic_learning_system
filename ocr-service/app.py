import io
import os

import fitz
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError
from paddleocr import PaddleOCR

MAX_FILE_BYTES = 256 * 1024 * 1024
MAX_IMAGE_PIXELS = 30_000_000
MAX_PDF_PAGES = 400
OCR_LANG = os.getenv("PADDLE_OCR_LANG", "en")

Image.MAX_IMAGE_PIXELS = MAX_IMAGE_PIXELS
app = FastAPI(title="TOEIC content OCR")
ocr = PaddleOCR(use_angle_cls=True, lang=OCR_LANG, show_log=False)


def image_lines(image: np.ndarray) -> list[str]:
    result = ocr.ocr(image, cls=True)
    if not result or not result[0]:
        return []
    lines = [
        (entry[0][1], entry[0][0], entry[1][0].strip())
        for entry in result[0]
        if entry[1][0].strip()
    ]
    lines.sort(key=lambda line: (line[0], line[1]))
    return [line[2] for line in lines]


def extract_image(data: bytes) -> list[dict[str, object]]:
    try:
        image = Image.open(io.BytesIO(data))
        if image.width * image.height > MAX_IMAGE_PIXELS:
            raise HTTPException(status_code=413, detail="Image dimensions exceed the OCR limit.")
        image = image.convert("RGB")
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError) as exc:
        raise HTTPException(status_code=400, detail="Invalid or unsupported image.") from exc
    return [{"page": 1, "text": "\n".join(image_lines(np.asarray(image)))}]


def extract_pdf(data: bytes) -> list[dict[str, object]]:
    try:
        document = fitz.open(stream=data, filetype="pdf")
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid or unsupported PDF.") from exc
    pages = []
    with document:
        if len(document) > MAX_PDF_PAGES:
            raise HTTPException(
                status_code=413,
                detail=f"PDF has {len(document)} pages; the maximum is {MAX_PDF_PAGES}.",
            )
        for index, page in enumerate(document):
            # Extract selectable digital text first (fast, 100% accurate)
            page_text = page.get_text().strip()
            if page_text:
                pages.append({"page": index + 1, "text": page_text})
                continue

            # Fallback to OCR for scanned image pages
            if page.rect.width * page.rect.height * 4 > MAX_IMAGE_PIXELS:
                raise HTTPException(
                    status_code=413,
                    detail=f"PDF page {index + 1} exceeds the OCR image-dimension limit.",
                )
            image = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
            page_image = Image.frombytes("RGB", [image.width, image.height], image.samples)
            pages.append({"page": index + 1, "text": "\n".join(image_lines(np.asarray(page_image)))})
    return pages


@app.post("/extract")
async def extract(file: UploadFile = File(...)) -> dict[str, object]:
    data = await file.read(MAX_FILE_BYTES + 1)
    if not data:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")
    if len(data) > MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail="File size exceeds 256 MiB.")
    filename = (file.filename or "").lower()
    extension = filename.rsplit(".", 1)[-1] if "." in filename else ""
    if extension == "pdf":
        pages = extract_pdf(data)
    elif extension in {"png", "jpg", "jpeg", "webp"}:
        pages = extract_image(data)
    else:
        raise HTTPException(status_code=415, detail="Only PDF and PNG/JPG/JPEG/WEBP files are supported.")
    text = "\n\n".join(page["text"] for page in pages)
    return {"text": text, "pages": pages}
