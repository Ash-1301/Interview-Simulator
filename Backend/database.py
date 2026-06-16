from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

engine = create_engine("sqlite:///./interview_app.db")
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class InterviewResult(Base):
    __tablename__ = "results"
    id = Column(Integer, primary_key=True)
    user_email = Column(String, index=True)
    question = Column(Text)
    answer = Column(Text)
    score = Column(Float)
    strengths = Column(Text)
    improvements = Column(Text)
    clarity = Column(Text)
    relevance = Column(Text)
    depth = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()