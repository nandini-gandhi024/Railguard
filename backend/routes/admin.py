"""
RailGuard Admin Routes (Admin role only)
GET  /admin/users                          - list all users
GET  /admin/access-requests                - pending access requests
POST /admin/access-requests/{id}/approve   - approve → create user account
POST /admin/access-requests/{id}/reject    - reject request
PUT  /admin/users/{id}/activate            - activate or deactivate user
PUT  /admin/users/{id}/role               - change user role
GET  /admin/audit-log                      - recent audit entries
"""
import json
import secrets
import string
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database.database import get_db
# pyrefly: ignore [missing-import]
from auth.models import User, AccessRequest, AuditLog
# pyrefly: ignore [missing-import]
from auth.security import hash_password
# pyrefly: ignore [missing-import]
from auth.deps import require_role

router = APIRouter(prefix="/admin", tags=["Administration"])

ADMIN_ONLY = Depends(require_role("admin"))

VALID_ROLES = {"admin", "railway_operator", "maintenance_engineer", "viewer"}


# ── Schemas ───────────────────────────────────────────────────────────────────

class ApproveRequestBody(BaseModel):
    role: str = "viewer"
    temporary_password: Optional[str] = None   # If blank, auto-generated


class RoleUpdateBody(BaseModel):
    role: str


class ActivateBody(BaseModel):
    is_active: bool


class CreateUserBody(BaseModel):
    full_name: str
    email: str
    password: str
    role: str = "viewer"
    designation: Optional[str] = None
    organization: Optional[str] = None
    is_active: bool = True


# ── Helpers ───────────────────────────────────────────────────────────────────

def _audit(db, user_email, action, target=None, request=None, detail=None):
    ip = None
    if request:
        forwarded = request.headers.get("X-Forwarded-For")
        ip = forwarded.split(",")[0].strip() if forwarded else (
            str(request.client.host) if request.client else None
        )
    db.add(AuditLog(
        user_email=user_email,
        action=action,
        target=str(target) if target else None,
        ip_address=ip,
        detail=json.dumps(detail) if detail else None,
    ))
    db.commit()


def _gen_password(length=12) -> str:
    alphabet = string.ascii_letters + string.digits + "!@#$"
    return "".join(secrets.choice(alphabet) for _ in range(length))


def _user_dict(u: User) -> dict:
    return {
        "id": u.id,
        "email": u.email,
        "full_name": u.full_name,
        "role": u.role,
        "designation": u.designation,
        "organization": u.organization,
        "is_active": u.is_active,
        "is_approved": u.is_approved,
        "created_at": u.created_at.isoformat() if u.created_at else None,
        "last_login": u.last_login.isoformat() if u.last_login else None,
    }


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/users")
def list_users(
    admin: User = ADMIN_ONLY,
    db: Session = Depends(get_db),
):
    """List all registered users."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return {"users": [_user_dict(u) for u in users], "total": len(users)}


@router.post("/users", status_code=status.HTTP_201_CREATED)
def create_user(
    body: CreateUserBody,
    http_request: Request,
    admin: User = ADMIN_ONLY,
    db: Session = Depends(get_db),
):
    """Administrator directly creates an authorized account."""
    email = body.email.lower().strip()
    if body.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Invalid role. Valid roles: {sorted(list(VALID_ROLES))}")

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"An account with email {email} already exists.")

    new_user = User(
        email=email,
        full_name=body.full_name.strip(),
        hashed_password=hash_password(body.password),
        role=body.role,
        designation=body.designation,
        organization=body.organization,
        is_active=body.is_active,
        is_approved=True,
    )
    db.add(new_user)

    # If there was a pending request for this email, mark it approved
    req = db.query(AccessRequest).filter(AccessRequest.email == email, AccessRequest.status == "pending").first()
    if req:
        req.status = "approved"
        req.reviewed_at = datetime.now(timezone.utc)
        req.reviewed_by = admin.email

    db.commit()

    _audit(db, admin.email, "CREATE_USER", target=email, request=http_request,
           detail={"role": body.role, "name": body.full_name})

    return {
        "message": f"User account created for {email}.",
        "user": _user_dict(new_user),
    }


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    http_request: Request,
    admin: User = ADMIN_ONLY,
    db: Session = Depends(get_db),
):
    """Remove user access / delete user account."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own admin account.")

    deleted_email = user.email
    db.delete(user)
    db.commit()

    _audit(db, admin.email, "DELETE_USER", target=deleted_email, request=http_request)
    return {"message": f"Account for {deleted_email} has been permanently removed."}


@router.delete("/access-requests/{request_id}")
def delete_access_request(
    request_id: int,
    http_request: Request,
    admin: User = ADMIN_ONLY,
    db: Session = Depends(get_db),
):
    """Dismiss or delete an access request."""
    req = db.query(AccessRequest).filter(AccessRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Access request not found.")

    deleted_email = req.email
    db.delete(req)
    db.commit()

    _audit(db, admin.email, "DELETE_ACCESS_REQUEST", target=deleted_email, request=http_request)
    return {"message": f"Access request for {deleted_email} deleted."}


@router.get("/access-requests")
def list_access_requests(
    status_filter: Optional[str] = None,
    admin: User = ADMIN_ONLY,
    db: Session = Depends(get_db),
):
    """List access requests. Filter by status=pending|approved|rejected."""
    query = db.query(AccessRequest)
    if status_filter:
        query = query.filter(AccessRequest.status == status_filter)
    requests = query.order_by(AccessRequest.requested_at.desc()).all()
    return {
        "requests": [
            {
                "id": r.id,
                "full_name": r.full_name,
                "email": r.email,
                "designation": r.designation,
                "organization": r.organization,
                "purpose": r.purpose,
                "requested_role": r.requested_role,
                "status": r.status,
                "requested_at": r.requested_at.isoformat() if r.requested_at else None,
                "reviewed_at": r.reviewed_at.isoformat() if r.reviewed_at else None,
                "reviewed_by": r.reviewed_by,
            }
            for r in requests
        ],
        "total": len(requests),
    }


@router.post("/access-requests/{request_id}/approve", status_code=status.HTTP_201_CREATED)
def approve_access_request(
    request_id: int,
    body: ApproveRequestBody,
    http_request: Request,
    admin: User = ADMIN_ONLY,
    db: Session = Depends(get_db),
):
    """
    Approve an access request: creates a user account with the requested role.
    Returns the temporary password (admin must share it with the user securely).
    """
    req = db.query(AccessRequest).filter(AccessRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Access request not found.")
    if req.status != "pending":
        raise HTTPException(status_code=409, detail=f"Request is already {req.status}.")

    if body.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Invalid role. Valid: {VALID_ROLES}")

    # Check for duplicate user
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="A user with this email already exists.")

    temp_password = body.temporary_password or _gen_password()

    new_user = User(
        email=req.email,
        full_name=req.full_name,
        hashed_password=hash_password(temp_password),
        role=body.role,
        designation=req.designation,
        organization=req.organization,
        is_active=True,
        is_approved=True,
    )
    db.add(new_user)

    req.status = "approved"
    req.reviewed_at = datetime.now(timezone.utc)
    req.reviewed_by = admin.email
    db.commit()

    _audit(
        db, admin.email, "APPROVE_ACCESS_REQUEST",
        target=req.email, request=http_request,
        detail={"role": body.role, "request_id": request_id}
    )

    return {
        "message": f"Access request approved. User account created for {req.email}.",
        "temporary_password": temp_password,  # Admin must share this securely
        "role": body.role,
        "note": "The user should change their password on first login.",
    }


@router.post("/access-requests/{request_id}/reject")
def reject_access_request(
    request_id: int,
    http_request: Request,
    admin: User = ADMIN_ONLY,
    db: Session = Depends(get_db),
):
    """Reject a pending access request."""
    req = db.query(AccessRequest).filter(AccessRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Access request not found.")
    if req.status != "pending":
        raise HTTPException(status_code=409, detail=f"Request is already {req.status}.")

    req.status = "rejected"
    req.reviewed_at = datetime.now(timezone.utc)
    req.reviewed_by = admin.email
    db.commit()

    _audit(db, admin.email, "REJECT_ACCESS_REQUEST",
           target=req.email, request=http_request, detail={"request_id": request_id})

    return {"message": f"Access request from {req.email} rejected."}


@router.put("/users/{user_id}/activate")
def set_user_active(
    user_id: int,
    body: ActivateBody,
    http_request: Request,
    admin: User = ADMIN_ONLY,
    db: Session = Depends(get_db),
):
    """Activate or deactivate a user account."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="You cannot deactivate your own account.")

    user.is_active = body.is_active
    db.commit()

    action = "ACTIVATE_USER" if body.is_active else "DEACTIVATE_USER"
    _audit(db, admin.email, action, target=user.email, request=http_request)

    return {"message": f"User {user.email} {'activated' if body.is_active else 'deactivated'}."}


@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    body: RoleUpdateBody,
    http_request: Request,
    admin: User = ADMIN_ONLY,
    db: Session = Depends(get_db),
):
    """Change a user's role."""
    if body.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Invalid role. Valid: {VALID_ROLES}")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    old_role = user.role
    user.role = body.role
    db.commit()

    _audit(db, admin.email, "CHANGE_USER_ROLE", target=user.email, request=http_request,
           detail={"from": old_role, "to": body.role})

    return {"message": f"Role for {user.email} updated to {body.role}."}


@router.get("/audit-log")
def get_audit_log(
    limit: int = 100,
    admin: User = ADMIN_ONLY,
    db: Session = Depends(get_db),
):
    """Return recent audit log entries."""
    entries = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return {
        "entries": [
            {
                "id": e.id,
                "user_email": e.user_email,
                "action": e.action,
                "target": e.target,
                "ip_address": e.ip_address,
                "detail": e.detail,
                "timestamp": e.timestamp.isoformat() if e.timestamp else None,
            }
            for e in entries
        ]
    }


@router.get("/my-audit-log")
def get_my_audit_log(
    limit: int = 50,
    current_user: User = Depends(require_role("admin", "railway_operator", "maintenance_engineer", "viewer")),
    db: Session = Depends(get_db),
):
    """Return audit log entries for the current user."""
    entries = (
        db.query(AuditLog)
        .filter(AuditLog.user_email == current_user.email)
        .order_by(AuditLog.timestamp.desc())
        .limit(limit)
        .all()
    )
    return {
        "entries": [
            {
                "id": e.id,
                "action": e.action,
                "target": e.target,
                "timestamp": e.timestamp.isoformat() if e.timestamp else None,
            }
            for e in entries
        ]
    }
