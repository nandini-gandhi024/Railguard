"""
RailGuard Auth Security Utilities
- Password hashing (bcrypt via passlib)
- JWT creation and verification (python-jose)
- Brute-force protection (in-memory attempt tracker)
"""
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
# pyrefly: ignore [missing-import]
from passlib.context import CryptContext

# ── Config (from env with safe defaults for dev) ─────────────────────────────
JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", secrets.token_hex(32))
JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# pyrefly: ignore [missing-import]
import bcrypt


# ── Password hashing (native bcrypt) ──────────────────────────────────────────
def hash_password(plain: str) -> str:
    pwd_bytes = plain.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        pwd_bytes = plain.encode("utf-8")[:72]
        return bcrypt.checkpw(pwd_bytes, hashed.encode("utf-8"))
    except Exception:
        return False


# ── JWT token helpers ─────────────────────────────────────────────────────────
def create_access_token(subject: str, extra: dict | None = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": subject, "exp": expire, "type": "access"}
    if extra:
        payload.update(extra)
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def create_refresh_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {"sub": subject, "exp": expire, "type": "refresh"}
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        return None


# ── Brute-force protection ────────────────────────────────────────────────────
# Simple in-memory store: {email -> {attempts, locked_until}}
_login_attempts: dict[str, dict] = {}
MAX_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


def record_failed_attempt(email: str) -> bool:
    """Record a failed login. Returns True if account is now locked."""
    now = datetime.now(timezone.utc)
    entry = _login_attempts.get(email, {"attempts": 0, "locked_until": None})

    # Clear lockout if it has expired
    if entry["locked_until"] and now > entry["locked_until"]:
        entry = {"attempts": 0, "locked_until": None}

    entry["attempts"] += 1
    if entry["attempts"] >= MAX_ATTEMPTS:
        entry["locked_until"] = now + timedelta(minutes=LOCKOUT_MINUTES)

    _login_attempts[email] = entry
    return entry["locked_until"] is not None


def is_locked_out(email: str) -> bool:
    """Returns True if the email is currently locked out."""
    entry = _login_attempts.get(email)
    if not entry:
        return False
    if entry["locked_until"] and datetime.now(timezone.utc) > entry["locked_until"]:
        _login_attempts[email] = {"attempts": 0, "locked_until": None}
        return False
    return entry["locked_until"] is not None


def clear_attempts(email: str) -> None:
    """Clear failed attempts on successful login."""
    _login_attempts.pop(email, None)


# ── Refresh token blocklist (in-memory for dev) ───────────────────────────────
_revoked_tokens: set[str] = set()


def revoke_token(token: str) -> None:
    _revoked_tokens.add(token)


def is_token_revoked(token: str) -> bool:
    return token in _revoked_tokens
