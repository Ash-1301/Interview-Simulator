from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from extractor import extract_text
from llm import extract_resume_info, generate_questions, evaluate_answer
from database import get_db, User, InterviewResult
from auth import hash_password, verify_password, create_token, decode_token
import shutil, os, json

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

# ─── AUTH ────────────────────────────────────────────

@app.post("/signup")
def signup(payload: dict, db: Session = Depends(get_db)):
    email = payload.get("email")
    password = payload.get("password")
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=email, hashed_password=hash_password(password))
    db.add(user)
    db.commit()
    token = create_token({"sub": email})
    return {"token": token, "email": email}

@app.post("/login")
def login(payload: dict, db: Session = Depends(get_db)):
    email = payload.get("email")
    password = payload.get("password")
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token({"sub": email})
    return {"token": token, "email": email}

# ─── RESUME ──────────────────────────────────────────

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
    return {"message": "File uploaded successfully", "filename": file.filename, "extracted_text": extracted_text}

@app.post("/extract-info")
async def extract_info(payload: dict):
    raw_text = payload.get("raw_text", "")
    if not raw_text:
        raise HTTPException(status_code=400, detail="No text provided")
    return extract_resume_info(raw_text)

@app.post("/generate-questions")
async def gen_questions(payload: dict):
    resume_info = payload.get("resume_info", {})
    questions = generate_questions(resume_info)
    return {"questions": questions}

@app.post("/evaluate-answer")
async def eval_answer(payload: dict):
    question = payload.get("question", "")
    answer = payload.get("answer", "")
    return evaluate_answer(question, answer)

# ─── SAVE RESULTS ─────────────────────────────────────

@app.post("/save-results")
async def save_results(payload: dict, db: Session = Depends(get_db)):
    token = payload.get("token")
    decoded = decode_token(token)
    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid token")
    email = decoded["sub"]
    for item in payload.get("evaluations", []):
        ev = item.get("evaluation", {})
        result = InterviewResult(
            user_email=email,
            question=item.get("question"),
            answer=item.get("answer"),
            score=ev.get("score", 0),
            strengths=json.dumps(ev.get("strengths", [])),
            improvements=json.dumps(ev.get("improvements", [])),
            clarity=ev.get("clarity", ""),
            relevance=ev.get("relevance", ""),
            depth=ev.get("depth", ""),
        )
        db.add(result)
    db.commit()
    return {"message": "Results saved"}

# ─── GET DASHBOARD ────────────────────────────────────

@app.get("/dashboard")
async def dashboard(token: str, db: Session = Depends(get_db)):
    decoded = decode_token(token)
    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid token")
    email = decoded["sub"]
    results = db.query(InterviewResult).filter(
        InterviewResult.user_email == email
    ).order_by(InterviewResult.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "question": r.question,
            "answer": r.answer,
            "score": r.score,
            "strengths": json.loads(r.strengths),
            "improvements": json.loads(r.improvements),
            "clarity": r.clarity,
            "relevance": r.relevance,
            "depth": r.depth,
            "created_at": str(r.created_at),
        }
        for r in results
    ]