import os
import json
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def clean_json(text):
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return text.strip()

def extract_resume_info(raw_text: str):
    prompt = f"""
You are a resume parser. Given the following resume text, extract information and return ONLY a JSON object with no extra text, no markdown, no backticks.

The JSON must have exactly these keys:
- skills: list of technical and soft skills
- education: list of education entries (degree, institution, year)
- experience: list of work experience entries (title, company, duration, description)
- projects: list of projects (name, description, technologies used)

Resume text:
{raw_text}

Return only the JSON object, nothing else.
"""
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(clean_json(response.choices[0].message.content))


def generate_questions(resume_info: dict):
    prompt = f"""
You are an expert technical interviewer. Based on the candidate's resume below, generate exactly 8 interview questions.
Mix: 3 technical questions based on their skills/projects, 3 behavioral questions, 2 role-specific questions.
Return ONLY a JSON array of strings, no extra text, no markdown, no backticks.

Resume info:
{json.dumps(resume_info)}

Example format: ["Question 1?", "Question 2?"]
"""
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(clean_json(response.choices[0].message.content))


def evaluate_answer(question: str, answer: str):
    prompt = f"""
You are an expert interviewer evaluating a candidate's answer.

Question: {question}
Answer: {answer}

Return ONLY a JSON object with no extra text, no markdown, no backticks, no explanation.

Exactly this structure:
{{
  "score": 7,
  "clarity": "your feedback here",
  "relevance": "your feedback here",
  "depth": "your feedback here",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"]
}}
"""
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}]
    )
    raw = response.choices[0].message.content
    print("EVAL RAW RESPONSE:", raw)  # this prints to your backend terminal
    return json.loads(clean_json(raw))