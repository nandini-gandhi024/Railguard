import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(dotenv_path=env_path)

# Database URL: Environment override for production, SQLite for local dev
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DB_PATH = Path(__file__).resolve().parent.parent / "railguard.db"
    DATABASE_URL = f"sqlite:///{DB_PATH}"

# Fix postgresql:// URI format if necessary
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Create SQLAlchemy engine
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    connect_args=connect_args
)

# Create SessionLocal factory for creating database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# DeclarativeBase class for defining database models
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that provides a database session to API routes
    and closes the session automatically after the request completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()