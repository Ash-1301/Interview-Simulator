from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from extractor import extract_text
from llm import extract_resume_info, generate_questions
import shutil
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"

@app.get("/ping")
def ping():
    return {"status": "ok"}

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    allowed_types = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only PDF or DOCX files allowed")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    extracted_text = extract_text(file_path)

    return {
        "message": "File uploaded successfully",
        "filename": file.filename,
        "extracted_text": extracted_text
    }

@app.post("/extract-info")
async def extract_info(payload: dict):
    raw_text = payload.get("raw_text", "")
    if not raw_text:
        raise HTTPException(status_code=400, detail="No text provided")

    resume_info = extract_resume_info(raw_text)
    return resume_info

@app.post("/generate-questions")
async def generate_questions_endpoint(payload: dict):
    resume_info = payload.get("resume_info", {})
    if not resume_info:
        raise HTTPException(status_code=400, detail="No resume info provided")

    questions = generate_questions(resume_info)
    return {"questions": questions}