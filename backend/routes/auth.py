"""
RailGuard Auth Routes
POST /auth/login           - email+password → JWT tokens
POST /auth/logout          - revoke refresh token
POST /auth/refresh         - swap refresh → new access token
POST /auth/request-access  - public: submit access request
GET  /auth/me              - current user profile
PUT  /auth/me/password     - change own password
"""
import json
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from database.database import get_db
# pyrefly: ignore [missing-import]
from auth.models import User, AccessRequest, AuditLog
# pyrefly: ignore [missing-import]
from auth.security import (
    verify_password, hash_password,
    create_access_token, create_refresh_token,
    decode_token, revoke_token, is_token_revoked,
    record_failed_attempt, is_locked_out, clear_attempts,
)

# pyrefly: ignore [missing-import]
from auth.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ── Request / Response schemas ────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


class AccessRequestCreate(BaseModel):
    full_name: str = Field(..., min_length=2)
    email: str
    designation: Optional[str] = None
    organization: Optional[str] = None
    purpose: Optional[str] = None
    requested_role: str = "viewer"


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


class RefreshRequest(BaseModel):
    refresh_token: str


# ── Helper: write audit log ───────────────────────────────────────────────────

def _audit(db: Session, user_email: Optional[str], action: str,
           target: Optional[str] = None, request: Optional[Request] = None,
           detail: Optional[dict] = None):
    ip = None
    if request:
        forwarded = request.headers.get("X-Forwarded-For")
        ip = forwarded.split(",")[0].strip() if forwarded else str(request.client.host) if request.client else None
    log = AuditLog(
        user_email=user_email,
        action=action,
        target=target,
        ip_address=ip,
        detail=json.dumps(detail) if detail else None,
    )
    db.add(log)
    db.commit()


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, request: Request, db: Session = Depends(get_db)):
    """Authenticate with email and password. Returns access + refresh JWT tokens."""
    email = body.email.lower().strip()

    # Brute-force check
    if is_locked_out(email):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed attempts. Account locked for 15 minutes.",
        )

    user = db.query(User).filter(User.email == email).first()

    if not user:
        # Check if there is an access request for this email
        req = db.query(AccessRequest).filter(AccessRequest.email == email).order_by(AccessRequest.requested_at.desc()).first()
        if req and req.status == "pending":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your access request is awaiting approval.",
            )
        if req and req.status == "rejected":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your access request was not approved.",
            )

        locked = record_failed_attempt(email)
        _audit(db, email, "LOGIN_FAILED", detail={"locked": locked}, request=request)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not verify_password(body.password, user.hashed_password):
        locked = record_failed_attempt(email)
        _audit(db, email, "LOGIN_FAILED", detail={"locked": locked}, request=request)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your access request is awaiting approval.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is currently disabled.",
        )

    clear_attempts(email)
    user.last_login = datetime.now(timezone.utc)
    db.commit()

    access_token = create_access_token(subject=email, extra={"role": user.role, "name": user.full_name})
    refresh_token = create_refresh_token(subject=email)

    _audit(db, email, "LOGIN", request=request)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "designation": user.designation,
            "organization": user.organization,
            "last_login": user.last_login.isoformat() if user.last_login else None,
        },
    }


@router.post("/logout")
def logout(body: RefreshRequest, request: Request,
           current_user: User = Depends(get_current_user),
           db: Session = Depends(get_db)):
    """Revoke the refresh token and write logout audit entry."""
    revoke_token(body.refresh_token)
    _audit(db, current_user.email, "LOGOUT", request=request)
    return {"message": "Logged out successfully."}


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(body: RefreshRequest, db: Session = Depends(get_db)):
    """Swap a valid refresh token for a new access token."""
    if is_token_revoked(body.refresh_token):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token has been revoked.")

    payload = decode_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token.")

    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.is_active or not user.is_approved:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive.")

    new_access = create_access_token(subject=email, extra={"role": user.role, "name": user.full_name})
    new_refresh = create_refresh_token(subject=email)
    revoke_token(body.refresh_token)  # Rotate refresh token

    return {
        "access_token": new_access,
        "refresh_token": new_refresh,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "designation": user.designation,
            "organization": user.organization,
            "last_login": user.last_login.isoformat() if user.last_login else None,
        },
    }


@router.post("/request-access", status_code=status.HTTP_201_CREATED)
def request_access(body: AccessRequestCreate, db: Session = Depends(get_db)):
    """
    Public endpoint — submit an access request for administrator review.
    No authentication required. Does NOT create a user account.
    """
    email = body.email.lower().strip()

    # Check if already a user
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    # Check for duplicate pending request
    existing_req = db.query(AccessRequest).filter(
        AccessRequest.email == email,
        AccessRequest.status == "pending"
    ).first()
    if existing_req:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A pending access request for this email already exists.",
        )

    req = AccessRequest(
        full_name=body.full_name,
        email=email,
        designation=body.designation,
        organization=body.organization,
        purpose=body.purpose,
        requested_role=body.requested_role,
    )
    db.add(req)
    db.commit()

    return {"message": "Access request submitted for administrator approval."}


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """Return the current authenticated user's profile."""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "designation": current_user.designation,
        "organization": current_user.organization,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        "last_login": current_user.last_login.isoformat() if current_user.last_login else None,
    }


@router.put("/me/password")
def change_password(
    body: PasswordChangeRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Change the current user's password after verifying the existing password."""
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )
    if len(body.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters.",
        )

    current_user.hashed_password = hash_password(body.new_password)
    db.commit()
    _audit(db, current_user.email, "PASSWORD_CHANGED", request=request)

    return {"message": "Password changed successfully."}
