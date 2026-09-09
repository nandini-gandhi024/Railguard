"""
RailGuard MySQL Analysis Database
Separate SQLAlchemy engine for the railguard_analysis database.
Reads connection URL from MYSQL_URL or individual MYSQL_* environment variables.
Gracefully falls back to SQLite for development if MySQL is unreachable.
"""
import os
from urllib.parse import quote_plus
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

# Ensure backend/.env is loaded even if imported standalone
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(dotenv_path=env_path)

AnalysisBase = declarative_base()


def _build_mysql_url() -> str:
    raw_url = os.getenv("MYSQL_URL")
    user = os.getenv("MYSQL_USER", "root")
    password = os.getenv("MYSQL_PASSWORD")
    host = os.getenv("MYSQL_HOST", "localhost")
    port = os.getenv("MYSQL_PORT", "3306")
    db_name = os.getenv("MYSQL_DATABASE") or os.getenv("MYSQL_DB", "railguard_analysis")

    # If explicit MYSQL_URL is given
    if raw_url and raw_url.startswith("mysql"):
        # If MYSQL_PASSWORD is also provided and raw_url has empty password (e.g. root:@)
        if password and ("root:@" in raw_url or f"{user}:@" in raw_url):
            quoted_pw = quote_plus(password)
            raw_url = raw_url.replace(f"{user}:@", f"{user}:{quoted_pw}@")
        return raw_url

    # If individual env vars or MYSQL_PASSWORD provided
    if password is not None or os.getenv("MYSQL_USER"):
        quoted_pw = quote_plus(password) if password else ""
        return f"mysql+pymysql://{user}:{quoted_pw}@{host}:{port}/{db_name}"

    # Default fallback URL if MYSQL_URL was set in .env
    if raw_url:
        return raw_url

    return "sqlite:///./railguard_analysis.db"


def _init_engine():
    target_url = _build_mysql_url()
    if target_url.startswith("mysql"):
        try:
            eng = create_engine(target_url, pool_pre_ping=True, echo=False)
            with eng.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("[RailGuard] MySQL connection successful")
            return eng, target_url, True
        except Exception as e:
            print(f"[RailGuard] MySQL connection failed ({e}). Falling back to SQLite for analysis storage.")
            fallback_url = "sqlite:///./railguard_analysis.db"
            eng = create_engine(fallback_url, pool_pre_ping=True, connect_args={"check_same_thread": False}, echo=False)
            return eng, fallback_url, False
    else:
        connect_args = {"check_same_thread": False} if target_url.startswith("sqlite") else {}
        eng = create_engine(target_url, pool_pre_ping=True, connect_args=connect_args, echo=False)
        return eng, target_url, False


analysis_engine, EFFECTIVE_MYSQL_URL, IS_MYSQL_ACTIVE = _init_engine()
AnalysisSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=analysis_engine)


def get_analysis_db():
    """FastAPI dependency providing a database session for analysis results."""
    db = AnalysisSessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_mysql_connection() -> dict:
    """
    Test connectivity to the analysis database. Returns status dict.
    """
    try:
        with analysis_engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {
            "status": "MySQL connection successful" if IS_MYSQL_ACTIVE else "connected",
            "url": EFFECTIVE_MYSQL_URL.split("@")[-1] if "@" in EFFECTIVE_MYSQL_URL else EFFECTIVE_MYSQL_URL,
            "engine": "MySQL" if IS_MYSQL_ACTIVE else "SQLite",
            "is_mysql": IS_MYSQL_ACTIVE,
        }
    except Exception as e:
        return {"status": "error", "detail": str(e), "engine": "error", "is_mysql": False}


