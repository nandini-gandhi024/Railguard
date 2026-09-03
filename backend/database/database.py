from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Database URL for SQLite
DATABASE_URL = "sqlite:///./railguard.db"

# Create SQLAlchemy engine
# connect_args={"check_same_thread": False} is required only for SQLite in multi-threaded FastAPI apps
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
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