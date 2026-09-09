"""
RailGuard Administrator Setup CLI
Securely create or update the initial Administrator account for RailGuard.

Features:
- Validates email and enforces strong password policy (min 8 chars)
- Interactive masked input with visual asterisk (*) feedback
- Secure bcrypt hashing with cryptographic salt (never stores plaintext)
- Sets user as approved + active with 'admin' role
- Records setup in immutable audit_log table
- Zero hardcoded credentials or default passwords
- Supports direct CLI flags (--email and --password) to bypass terminal input quirks

Usage:
    Interactive mode:
        python backend/setup_admin.py
        .\\setup_admin.bat

    Command-line mode (recommended if terminal has input quirks):
        python backend/setup_admin.py --email admin@domain.com --password "YourSecretPassword123"
        .\\setup_admin.bat --email admin@domain.com --password "YourSecretPassword123"

    Status check:
        python backend/setup_admin.py --status
        .\\setup_admin.bat --status
"""
import argparse
import getpass
import json
import os
import re
import sys

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database.database import engine, Base, SessionLocal
from auth.models import User, AuditLog
from auth.security import hash_password


def validate_email(email: str) -> bool:
    regex = r"^[\w\.\+\-]+@[\w\-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(regex, email.strip()))


def prompt_password(prompt="Enter Password: ") -> str:
    """
    Prompt for password with visual asterisk (*) feedback on Windows.
    Handles Enter, Backspace, Ctrl+C, and function keys cleanly.
    Falls back to getpass if msvcrt is unavailable or stdin is redirected.
    """
    sys.stdout.write(prompt)
    sys.stdout.flush()

    # If stdin is not a real TTY / interactive console, use standard fallback
    if not sys.stdin.isatty():
        try:
            return getpass.getpass("")
        except Exception:
            return sys.stdin.readline().strip()

    try:
        import msvcrt
        chars = []
        while True:
            ch = msvcrt.getch()
            # Enter key (CR or LF)
            if ch in (b"\r", b"\n"):
                sys.stdout.write("\n")
                sys.stdout.flush()
                break
            # Ctrl+C
            elif ch == b"\x03":
                sys.stdout.write("\n")
                raise KeyboardInterrupt
            # Backspace
            elif ch in (b"\x08", b"\x7f"):
                if chars:
                    chars.pop()
                    sys.stdout.write("\b \b")
                    sys.stdout.flush()
            # Extended / arrow / special keys (prefix 0x00 or 0xe0)
            elif ch in (b"\x00", b"\xe0"):
                msvcrt.getch()  # consume second byte
            else:
                try:
                    c = ch.decode("utf-8", errors="ignore")
                    if c and ord(c) >= 32:  # printable characters
                        chars.append(c)
                        sys.stdout.write("*")
                        sys.stdout.flush()
                except Exception:
                    pass
        return "".join(chars)
    except Exception:
        # Fallback to getpass or input
        try:
            return getpass.getpass("")
        except Exception:
            return input("")


def check_status(db):
    """Display current database authentication state."""
    users = db.query(User).all()
    admins = [u for u in users if u.role == "admin" and u.is_active and u.is_approved]
    print("\n==================================================")
    print("  RAILGUARD AUTHENTICATION STATUS")
    print("==================================================")
    print(f"Total Registered Users: {len(users)}")
    print(f"Active Administrators:  {len(admins)}")
    if admins:
        print("\nRegistered Administrator Accounts:")
        for a in admins:
            print(f"  • {a.email} ({a.full_name}) - Active & Approved")
    else:
        print("\n[WARNING] No active Administrator account exists!")
        print("Run this script to set up your first Administrator account.")
    print("==================================================\n")


def main():
    parser = argparse.ArgumentParser(description="RailGuard Administrator Account Setup")
    parser.add_argument("--status", action="store_true", help="Check database user & admin status")
    parser.add_argument("--email", help="Admin email address")
    parser.add_argument("--password", help="Admin password (will prompt interactively if omitted)")
    parser.add_argument("--name", default=None, help="Admin full name")
    parser.add_argument("--organization", default="RailGuard Operations", help="Organization / Division")
    parser.add_argument("--designation", default="System Administrator", help="Designation")
    parser.add_argument("--plain-input", action="store_true", help="Use plain visible input instead of masked input")
    args = parser.parse_args()

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if args.status:
            check_status(db)
            return

        # Check existing admins
        existing_admins = db.query(User).filter(
            User.role == "admin", User.is_active == True, User.is_approved == True
        ).all()

        print("\n==================================================")
        print("  RAILGUARD SECURE ADMINISTRATOR SETUP")
        print("==================================================")
        if not existing_admins:
            print("[INFO] No active Administrator exists. Initializing First Admin...")
        else:
            print(f"[INFO] Found {len(existing_admins)} existing active Administrator(s).")
            print("You can add a new Administrator or update an existing account.")
        print("==================================================\n")

        # 1. Email
        email = args.email
        if not email:
            email = input("Enter Administrator Email: ").strip()

        if not email or not validate_email(email):
            print("\n[ERROR] A valid email address is required (e.g. admin@railway.gov.in).")
            sys.exit(1)

        email = email.lower().strip()

        # 2. Name
        full_name = args.name
        if not full_name:
            prompt_name = input("Enter Administrator Full Name [RailGuard Administrator]: ").strip()
            full_name = prompt_name if prompt_name else "RailGuard Administrator"

        # 3. Password
        password = args.password
        if password:
            if len(password) < 8:
                print("\n[ERROR] Password must be at least 8 characters long.")
                sys.exit(1)
        else:
            print("\n[Password Entry]")
            print("Note: Keystrokes will display as '*' on screen.")
            print("(Tip: You can also run with: --password \"YourPassword123\")")
            while True:
                if args.plain_input:
                    p1 = input("Enter Administrator Password (min 8 characters): ")
                else:
                    p1 = prompt_password("Enter Administrator Password (min 8 characters): ")

                if len(p1) < 8:
                    print("Error: Password must be at least 8 characters long. Please try again.")
                    continue

                if args.plain_input:
                    p2 = input("Confirm Administrator Password: ")
                else:
                    p2 = prompt_password("Confirm Administrator Password: ")

                if p1 != p2:
                    print("Error: Passwords do not match. Please try again.\n")
                    continue
                password = p1
                break

        # Check if user already exists
        existing = db.query(User).filter(User.email == email).first()

        if existing:
            print(f"\nAccount for '{email}' already exists with role '{existing.role}'.")
            confirm = input("Do you want to update this account to Administrator and reset password? (y/n): ").strip().lower()
            if confirm != "y":
                print("Setup cancelled. No changes made.")
                sys.exit(0)

            existing.full_name = full_name
            existing.hashed_password = hash_password(password)
            existing.role = "admin"
            existing.designation = args.designation
            existing.organization = args.organization
            existing.is_active = True
            existing.is_approved = True

            # Audit log entry
            log = AuditLog(
                user_email=email,
                action="ADMIN_ACCOUNT_UPDATED",
                target=email,
                detail=json.dumps({"role": "admin", "setup_source": "CLI", "status": "approved_and_active"}),
            )
            db.add(log)
            db.commit()

            print(f"\n[SUCCESS] Account '{email}' promoted to Administrator and activated successfully!")
        else:
            # Create new Administrator
            admin = User(
                email=email,
                full_name=full_name,
                hashed_password=hash_password(password),
                role="admin",
                designation=args.designation,
                organization=args.organization,
                is_active=True,
                is_approved=True,
            )
            db.add(admin)

            # Audit log entry
            log = AuditLog(
                user_email=email,
                action="ADMIN_ACCOUNT_CREATED",
                target=email,
                detail=json.dumps({"role": "admin", "setup_source": "CLI", "status": "approved_and_active"}),
            )
            db.add(log)
            db.commit()

            print(f"\n[SUCCESS] First Administrator account created successfully!")

        print("--------------------------------------------------")
        print(f"  Email:        {email}")
        print(f"  Name:         {full_name}")
        print(f"  Role:         admin")
        print(f"  Status:       Active & Approved")
        print("--------------------------------------------------")
        print("\nYou can now sign in at http://localhost:5173 with your credentials.")
        print("Administrator access grants complete user management and approval privileges.")
        print("==================================================\n")

    finally:
        db.close()


if __name__ == "__main__":
    main()
