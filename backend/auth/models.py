"""
RailGuard Auth Database Models
Added to the existing SQLite database (railguard.db).
Tables: users, access_requests, audit_log
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from database.database import Base


class User(Base):
    """Authenticated RailGuard user account."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="viewer")          # admin | railway_operator | maintenance_engineer | viewer
    is_active = Column(Boolean, default=True)        # Can be deactivated by admin
    is_approved = Column(Boolean, default=False)     # Must be approved before first login
    designation = Column(String, nullable=True)      # e.g. "Senior Track Engineer"
    organization = Column(String, nullable=True)     # e.g. "Northern Railway, Delhi Division"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)


class AccessRequest(Base):
    """Access request submitted via the public 'Request Access' form."""
    __tablename__ = "access_requests"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, index=True, nullable=False)
    designation = Column(String, nullable=True)
    organization = Column(String, nullable=True)
    purpose = Column(Text, nullable=True)            # Why do they need access?
    requested_role = Column(String, default="viewer")
    status = Column(String, default="pending")       # pending | approved | rejected
    requested_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_by = Column(String, nullable=True)      # admin email


class AuditLog(Base):
    """Immutable audit trail for important user actions."""
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True, nullable=True)   # None for unauthenticated
    action = Column(String, nullable=False)          # e.g. LOGIN, LOGOUT, APPROVE_REQUEST, RUN_ANALYSIS
    target = Column(String, nullable=True)           # e.g. track_id, user_id, request_id
    ip_address = Column(String, nullable=True)
    detail = Column(Text, nullable=True)             # JSON string with extra context
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
