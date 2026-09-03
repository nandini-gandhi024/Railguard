import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def create_guide_docx():
    doc = docx.Document()

    # Define Color Palette
    NAVY = RGBColor(15, 23, 42)        # Primary Dark #0F172A
    CYAN = RGBColor(0, 150, 200)       # Accent Cyan #0096C8
    SLATE = RGBColor(71, 85, 105)      # Secondary Text #475569
    DARK_GRAY = RGBColor(30, 41, 59)   # Main Body Text #1E293B
    WHITE = RGBColor(255, 255, 255)

    # Set Document Margins
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Helper Functions for Formatting
    def set_cell_background(cell, fill_hex):
        shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
        cell._tc.get_or_add_tcPr().append(shading_elm)

    def add_title(text, subtitle_text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(26)
        run.font.bold = True
        run.font.color.rgb = NAVY
        
        p2 = doc.add_paragraph()
        p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run2 = p2.add_run(subtitle_text)
        run2.font.name = 'Arial'
        run2.font.size = Pt(13)
        run2.font.italic = True
        run2.font.color.rgb = CYAN
        p2.paragraph_format.space_after = Pt(24)

    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(8)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(18)
        run.font.bold = True
        run.font.color.rgb = NAVY

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(14)
        run.font.bold = True
        run.font.color.rgb = CYAN

    def add_h3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(12)
        run.font.bold = True
        run.font.color.rgb = SLATE

    def add_body(text, bold_prefix=None, space_after=6):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            run_b = p.add_run(bold_prefix)
            run_b.font.name = 'Calibri'
            run_b.font.size = Pt(11)
            run_b.font.bold = True
            run_b.font.color.rgb = DARK_GRAY
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(11)
        run.font.color.rgb = DARK_GRAY
        return p

    def add_bullet(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            run_b = p.add_run(bold_prefix)
            run_b.font.name = 'Calibri'
            run_b.font.size = Pt(11)
            run_b.font.bold = True
            run_b.font.color.rgb = DARK_GRAY
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(11)
        run.font.color.rgb = DARK_GRAY

    def add_code_block(code_text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(6)
        p.paragraph_format.space_after = Pt(8)
        p.paragraph_format.left_indent = Inches(0.2)
        p.paragraph_format.right_indent = Inches(0.2)
        
        run = p.add_run(code_text)
        run.font.name = 'Consolas'
        run.font.size = Pt(9.5)
        run.font.color.rgb = RGBColor(15, 23, 42)

    # ==========================================
    # DOCUMENT CONTENT GENERATION
    # ==========================================

    add_title("RailGuard Backend Developer Guide", "Comprehensive Technical Manual & Learning Reference for Member 2\nSmart India Hackathon (SIH 2026) • Problem Statement SIH26027")

    # ------------------------------------------
    # 1. PROJECT OVERVIEW
    # ------------------------------------------
    add_h1("1. Project Overview")
    add_body("RailGuard is an AI-powered railway risk assessment and automatic maintenance block planning decision-support system developed for Smart India Hackathon (SIH 2026). The system tackles SIH Problem Statement SIH26027: 'AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways'.")
    
    add_h2("What the Backend Does")
    add_body("The backend acts as the central brain of RailGuard. It receives railway track inspection requests, processes AI flaw detections, retrieves physical track data and weather stress indicators, calculates multi-factor risk scores, predicts future degradation, and computes optimized maintenance block schedules that minimize train delays.")

    add_h2("Your Responsibility as Member 2 (Backend + AI Integration)")
    add_bullet("Build and maintain the FastAPI application framework and REST API endpoints.", "FastAPI & REST APIs: ")
    add_bullet("Define Pydantic data schemas to ensure strict, type-safe JSON contracts between the backend and frontend.", "Data Validation: ")
    add_bullet("Connect Member 1's database tables (Track, Inspection, RiskRecord, TrainSchedule, MaintenanceBlock) to FastAPI endpoints using SQLAlchemy ORM.", "Database Integration: ")
    add_bullet("Provide clean service interfaces for Member 3 (Computer Vision AI Model) and Member 4 (Risk Prediction AI Model).", "AI Integration: ")
    add_bullet("Incorporate weather and geospatial environmental indicators provided by Member 6.", "External Data Integration: ")
    add_bullet("Serve clean, reliable REST responses to Member 5's React UI Dashboard.", "Frontend Communication: ")
    add_bullet("Implement What-If scenario simulation engines and SIH26027 maintenance block optimization solvers.", "Decision Support: ")

    # ------------------------------------------
    # 2. BACKEND STRUCTURE
    # ------------------------------------------
    add_h1("2. Backend Directory & File Architecture")
    add_body("The backend follows a clean, modular service-oriented architecture to separate route controllers, validation models, business logic, and database management.")

    add_code_block(
"""backend/
├── .env                        # Local environment variables & secrets
├── .gitignore                  # Git exclusion rules (venv, *.db, cache)
├── requirements.txt            # Python dependencies list
├── main.py                     # App entry point, CORS, and route aggregation
├── seed.py                     # Executable CLI database seeding script
├── test_suite.py              # Automated test suite for all 9 API endpoints
│
├── database/                   # Database Layer (Member 1 Integration)
│   ├── __init__.py             # Python package marker
│   ├── database.py             # SQLite engine setup & SessionLocal generator
│   └── models.py               # SQLAlchemy ORM database tables
│
├── models/                     # Data Validation Layer
│   ├── __init__.py             # Python package marker
│   └── schemas.py              # Pydantic request & response schemas
│
├── routes/                     # API Route Endpoints Layer (Member 2 Routers)
│   ├── __init__.py             # Python package marker
│   ├── tracks.py               # GET /health, GET /tracks, POST /tracks
│   ├── analysis.py             # POST /analyze-image (Master Core Pipeline)
│   ├── risk.py                 # GET /risk/{track_id} (Risk & XAI metrics)
│   ├── simulation.py           # POST /simulate (What-If Simulator)
│   └── optimization.py         # POST /optimize-maintenance (SIH26027 Solver)
│
└── services/                   # Business Logic & AI Services Layer
    ├── __init__.py             # Python package marker
    ├── fault_detection.py      # Member 3 CV AI Model interface
    ├── cv_detector.py          # Computer vision bounding box & image analyzer
    ├── risk_engine.py          # Member 4 Risk AI Model interface
    ├── weather.py              # Member 6 Weather & satellite context
    ├── maintenance_optimizer.py# SIH26027 maintenance block solver logic
    ├── block_optimizer.py      # Corridor timetable constraint solver & stringline data
    └── seed_data.py            # 31 synthetic track records populator"""
    )

    add_h2("Component Purpose Breakdown")
    add_bullet("App initialization, CORS middleware configuration, automatic database startup seeding, and mounting sub-routers.", "main.py: ")
    add_bullet("Manages SQLite database connections, SQLAlchemy sessions, and table definitions.", "database/: ")
    add_bullet("Pydantic models ensuring data type validation and JSON formatting.", "models/: ")
    add_bullet("Modular API controllers grouped by feature area (tracks, analysis, risk, simulation, optimization).", "routes/: ")
    add_bullet("Pure Python business logic, AI mock interfaces, risk scoring formulas, and timetable optimization algorithms.", "services/: ")
    add_bullet("Automated unit and integration test scripts verifying endpoint functionality.", "test_suite.py & test_*.py: ")

    # ------------------------------------------
    # 3. DATABASE
    # ------------------------------------------
    add_h1("3. Database Architecture & Data Storage")
    add_body("RailGuard uses an SQLite relational database (file: railguard.db) managed via SQLAlchemy Object-Relational Mapping (ORM).")

    add_h2("Database Module Roles")
    add_bullet("Creates the SQLAlchemy engine, configures thread-safe connections, instantiates SessionLocal factories, and defines the get_db() FastAPI dependency generator.", "database/database.py: ")
    add_bullet("Defines the 5 core database tables as Python classes inheriting from SQLAlchemy Base.", "database/models.py: ")

    add_h2("The Track Table Schema (15 Fields)")
    add_body("The Track model represents physical track sections across Indian Railways divisions:")
    add_bullet("Integer Primary Key (auto-incrementing internal ID).", "1. id: ")
    add_bullet("Unique string identifier (e.g. 'T041', 'TRK-NR-101'). Primary lookup key.", "2. track_id: ")
    add_bullet("Text description of track location (e.g. 'KM 142.5 Delhi-Kanpur Mainline').", "3. location: ")
    add_bullet("Corridor section name (e.g. 'NDLS-CNB High-Density Corridor').", "4. section: ")
    add_bullet("Indian Railways division name (e.g. 'Delhi Division', 'Mumbai Division').", "5. division: ")
    add_bullet("Indian Railways zone (e.g. 'Northern Railway (NR)', 'Central Railway (CR)').", "6. zone: ")
    add_bullet("Age of rail steel in years (1 to 30 years).", "7. track_age: ")
    add_bullet("Rail steel specification (e.g. 'IU-60 1080 Head Hardened', '60kg 90UTS').", "8. steel_grade: ")
    add_bullet("Traffic density measured in Gross Million Tonnes per day (GMT/day).", "9. traffic_per_day: ")
    add_bullet("Normal sectional speed limit in km/h (80 to 160 km/h).", "10. speed_limit: ")
    add_bullet("Curve radius in meters (sharp curves < 500m increase derailment risk).", "11. curve_radius: ")
    add_bullet("Count of prior repair interventions on section.", "12. previous_repairs: ")
    add_bullet("Days elapsed since last machine tamping operation.", "13. last_tamping_days: ")
    add_bullet("Corridor priority rating scale (1 = Branch line to 10 = Golden Quadrilateral).", "14. network_importance: ")
    add_bullet("Current operational status ('Operational', 'Speed Restricted', 'Block Required').", "15. status: ")

    add_h2("Other Core Database Tables")
    add_bullet("Stores visual flaw detection logs (defect_type, confidence, severity, bounding_box, detected_at).", "inspections: ")
    add_bullet("Stores multi-factor risk scores, category, priority, TSR speed limit, 7/14-day predictions, and XAI breakdown.", "risk_records: ")
    add_bullet("Stores express passenger (Vande Bharat, Rajdhani) and freight train timetables.", "train_schedules: ")
    add_bullet("Stores requested maintenance jobs and AI-scheduled block windows.", "maintenance_blocks: ")

    add_h2("Usage of the 31 Synthetic Railway Tracks")
    add_body("To enable realistic prototype testing without claiming to use live proprietary Indian Railways datasets, RailGuard seeds 31 synthetic track sections across 6 zones (NR, CR, WR, ER, SCR, SR). These records provide a balanced mixture of critical, high, moderate, and low-risk sections used by Member 5's React UI and Member 2's simulation APIs.")

    # ------------------------------------------
    # 4. PYDANTIC SCHEMAS
    # ------------------------------------------
    add_h1("4. Pydantic Data Schemas (models/schemas.py)")
    add_body("Pydantic is a data validation and settings management library for Python. In FastAPI, Pydantic schemas enforce type safety, validate incoming HTTP request payloads, and format outgoing JSON responses.")

    add_h2("Why Pydantic Schemas Are Necessary")
    add_bullet("If a user sends 'traffic_per_day': 'text' instead of an integer, Pydantic catches the error automatically.", "Type Validation: ")
    add_bullet("FastAPI reads Pydantic models to construct interactive Swagger UI (/docs) specifications.", "Automatic OpenAPI Docs: ")
    add_bullet("Ensures Member 3's CV AI, Member 4's Risk AI, and Member 5's React UI communicate using identical JSON formats.", "Team Data Contracts: ")

    add_h2("Key Schemas Implemented")
    add_bullet("Validates track creation input data.", "TrackCreate: ")
    add_bullet("Serializes database Track objects into API JSON responses.", "TrackResponse: ")
    add_bullet("Data contract matching Member 3's CV output (defect_type, confidence, severity).", "FaultDetectionResponse: ")
    add_bullet("Data contract matching Member 4's Risk AI output (score, category, priority, tsr_speed_kmh).", "RiskMetrics: ")
    add_bullet("Projected 7-day and 14-day risk escalation metrics.", "PredictionMetrics: ")
    add_bullet("Master schema unifying fault, risk, predictions, recommendations, and XAI metrics.", "AnalyzeImageResponse: ")
    add_bullet("Input payload for What-If delayed maintenance simulation (track_id, delay_days, temperature_c).", "SimulationRequest: ")
    add_bullet("Output payload for What-If simulation (current_risk, predicted_risk, risk_change).", "SimulationResponse: ")
    add_bullet("Output payload for SIH26027 maintenance block solver (optimized_blocks, asset_availability_gain_pct).", "OptimizationResponse: ")

    # ------------------------------------------
    # 5. API ENDPOINTS TABLE
    # ------------------------------------------
    add_h1("5. API Endpoints Reference Table")
    add_body("Below is the complete catalog of backend REST API endpoints implemented for Member 2:")

    table_data = [
        ["Endpoint", "Method", "Purpose", "Input Payload", "Output Payload", "Team User"],
        ["/health", "GET", "Health Check", "None", "{ 'status': 'healthy' }", "All / System"],
        ["/tracks", "GET", "List All Tracks", "None", "Array of TrackResponse items", "Member 5 (React UI)"],
        ["/tracks", "POST", "Create/Update Track", "TrackCreate JSON", "TrackResponse JSON", "Member 1 & Member 5"],
        ["/tracks/{track_id}", "GET", "Get Track Detail", "track_id (Path)", "TrackResponse JSON", "Member 5 (React UI)"],
        ["/analyze-image", "POST", "Master Pipeline", "track_id + Photo (Form)", "AnalyzeImageResponse JSON", "Member 3, 4, 5"],
        ["/risk/{track_id}", "GET", "Risk & XAI Metrics", "track_id (Path)", "Risk & XAI breakdown JSON", "Member 4 & Member 5"],
        ["/simulate", "POST", "What-If Simulator", "SimulationRequest JSON", "SimulationResponse JSON", "Member 5 (React UI)"],
        ["/optimize-maintenance", "POST", "SIH26027 Block Solver", "OptimizationRequest JSON", "OptimizationResponse JSON", "Member 5 (React UI)"]
    ]

    table = doc.add_table(rows=len(table_data), cols=6)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    col_widths = [Inches(1.5), Inches(0.7), Inches(1.3), Inches(1.3), Inches(1.3), Inches(0.9)]

    for row_idx, row in enumerate(table.rows):
        if row_idx == 0:
            for col_idx, cell in enumerate(row.cells):
                cell.width = col_widths[col_idx]
                set_cell_background(cell, "0F172A")
                p = cell.paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                run = p.runs[0] if p.runs else p.add_run(table_data[row_idx][col_idx])
                run.font.name = 'Arial'
                run.font.size = Pt(9.5)
                run.font.bold = True
                run.font.color.rgb = WHITE
        else:
            fill_hex = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
            for col_idx, cell in enumerate(row.cells):
                cell.width = col_widths[col_idx]
                set_cell_background(cell, fill_hex)
                p = cell.paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                text_val = table_data[row_idx][col_idx]
                run = p.add_run(text_val)
                run.font.name = 'Calibri'
                run.font.size = Pt(9)
                run.font.color.rgb = DARK_GRAY

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # ------------------------------------------
    # 6. COMPLETE DATA FLOW
    # ------------------------------------------
    add_h1("6. Complete End-to-End Data Flow")
    add_body("Understanding how data flows through RailGuard is critical for Member 2:")

    add_code_block(
"""[ Member 5: React Dashboard UI ]
               │
               │ HTTP GET / POST Request
               ▼
[ Member 2: FastAPI Router (routes/)] ──► Validate Request Schema (models/schemas.py)
               │
      ┌────────┴──────────────────────────┐
      ▼                                   ▼
[ AI Services (services/) ]       [ Database Layer (database/) ]
• Member 3 CV Fault AI            • Fetch Track Physical Data
• Member 4 Risk Prediction AI     • Save Inspection Audit Record
• Member 6 Weather Context        • Save Risk Record Log
      │                                   │
      └────────┬──────────────────────────┘
               ▼
[ Master Response Formatter ] ──► Serialize JSON Payload
               │
               ▼
[ Return HTTP 200 OK Response to React Dashboard ]"""
    )

    add_h2("Detailed User Workflow Scenarios")
    add_bullet("React frontend calls GET /tracks/T041. FastAPI fetches row from SQLite using SQLAlchemy ORM and returns TrackResponse JSON.", "1. Viewing a Track: ")
    add_bullet("React calls GET /risk/T041. Backend queries track parameters, executes calculate_risk(), computes XAI factors, and returns risk metrics.", "2. Checking Track Risk: ")
    add_bullet("User uploads inspection photo to POST /analyze-image. Backend passes photo to detect_fault(), fetches track DB row, calls get_weather_context(), runs calculate_risk(), saves Inspection + RiskRecord to SQLite, and returns unified JSON payload.", "3. Uploading Inspection Image: ")
    add_bullet("User adjusts delay sliders on React UI. React sends POST /simulate with delay_days: 7. Backend computes current risk vs simulated risk and returns risk_change.", "4. Running What-If Simulation: ")
    add_bullet("User clicks 'Run AI Optimizer'. React calls POST /optimize-maintenance. Backend evaluates pending maintenance jobs against corridor train timetables and returns low-density night windows (01:00–03:00) with 0 train delays.", "5. Requesting Maintenance Optimization: ")

    # ------------------------------------------
    # 7. AI INTEGRATION & MOCK VS REAL BREAKDOWN
    # ------------------------------------------
    add_h1("7. AI Integration & Implementation Status")
    add_body("To allow independent development across all team members, RailGuard clearly categorizes its components:")

    add_bullet("services/fault_detection.py (CV flaw detector interface), services/risk_engine.py (multi-factor risk equation), services/weather.py (environmental context fetcher).", "MOCK SERVICES: ")
    add_bullet("30 synthetic track records across Indian Railways corridors, synthetic GMT traffic loads, synthetic tamping history.", "SYNTHETIC DATA: ")
    add_bullet("WEATHER_API_KEY in .env file (ready for live OpenWeatherMap API connection).", "PLACEHOLDER: ")
    add_bullet("FastAPI app framework, Pydantic schemas, SQLAlchemy database tables, SQLite persistence engine, REST API routes, test suite.", "REAL COMPONENTS: ")

    add_h2("Member 3 Integration Point (Computer Vision)")
    add_body("Member 3 builds their YOLO/PyTorch rail crack detection model. They will plug their real inference logic directly into services/fault_detection.py:")
    add_code_block(
"""# In services/fault_detection.py
def detect_fault(image_bytes: bytes = None) -> dict:
    # MEMBER 3: Replace mock dictionary with real YOLO inference call
    # results = yolo_model.predict(image_bytes)
    return {
        "defect_type": "crack",
        "confidence": 0.94,
        "severity": 85.0,
        "bounding_box": {"ymin": 35, "xmin": 40, "ymax": 65, "xmax": 65}
    }"""
    )

    add_h2("Member 4 Integration Point (Risk Prediction AI)")
    add_body("Member 4 builds their ML risk prediction model. They will plug their trained model into services/risk_engine.py:")
    add_code_block(
"""# In services/risk_engine.py
def calculate_risk(track_data, fault_data, weather_data, delay_days=0) -> dict:
    # MEMBER 4: Replace equation with real Scikit-Learn/PyTorch model prediction
    # risk_score = risk_ml_model.predict(features)
    return {
        "risk_score": 92.0,
        "risk_category": "Critical",
        "priority": 1,
        "predicted_risk_7_days": 97.0
    }"""
    )

    # ------------------------------------------
    # 8. TEAM INTEGRATION
    # ------------------------------------------
    add_h1("8. Team Member Collaboration Mapping")
    add_body("RailGuard's architecture maps directly to the 6 team member roles:")

    add_bullet("Maintains database schemas in database/models.py and seeds physical railway datasets.", "Member 1 (Database): ")
    add_bullet("Builds FastAPI routes (routes/), Pydantic schemas (models/schemas.py), and connects all AI services.", "Member 2 (Backend & Integration - YOU): ")
    add_bullet("Develops computer vision flaw detection and plugs into services/fault_detection.py.", "Member 3 (Computer Vision): ")
    add_bullet("Develops ML risk scoring and plugs into services/risk_engine.py.", "Member 4 (Risk AI): ")
    add_bullet("Develops React UI dashboard and connects to your backend REST endpoints (http://localhost:8000).", "Member 5 (Frontend): ")
    add_bullet("Provides railway operational datasets, weather context, and satellite data to services/weather.py.", "Member 6 (Data & Weather): ")

    # ------------------------------------------
    # 9. SIH26027 CONNECTION
    # ------------------------------------------
    add_h1("9. SIH Problem Statement Connection (SIH26027)")
    add_body("Problem Statement SIH26027 focuses on: 'AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways'.")

    add_h2("How the Optimization API Supports SIH26027")
    add_body("Rather than just outputting a static risk score, RailGuard's POST /optimize-maintenance endpoint solves the block scheduling problem:")
    add_bullet("Prioritizes high-risk tracks (Risk >= 75) for immediate block allocation.", "Risk-Based Prioritization: ")
    add_bullet("Matches maintenance job durations against low-density night corridor gaps (01:00–03:00).", "Timetable Gap Selection: ")
    add_bullet("Ensures high-priority express trains (Vande Bharat, Rajdhani) suffer zero delay penalties.", "Zero Delay Enforcement: ")
    add_bullet("Increases track asset availability from baseline 82.5% to 96.5% (+14.0% gain).", "Availability Optimization: ")

    # ------------------------------------------
    # 10. TESTING GUIDE
    # ------------------------------------------
    add_h1("10. Testing Guide for Member 2")
    add_body("You can test the backend using three different methods:")

    add_h2("Method 1: Automated Terminal Testing")
    add_body("Run the complete automated test suite verifying all 9 endpoints:")
    add_code_block("powershell\ncd backend\n.\\venv\\Scripts\\python.exe test_suite.py")

    add_h2("Method 2: Interactive Swagger UI Testing")
    add_body("Launch the Uvicorn dev server and open your browser:")
    add_code_block("powershell\n.\\venv\\Scripts\\activate\nuvicorn main:app --reload --port 8000")
    add_body("Visit Swagger UI at: http://localhost:8000/docs")

    add_h2("Method 3: Reseeding Synthetic Dataset")
    add_body("Re-seed 31 synthetic track records safely anytime:")
    add_code_block("powershell\n.\\venv\\Scripts\\python.exe seed.py")

    # ------------------------------------------
    # 11. BEGINNER GUIDE
    # ------------------------------------------
    add_h1("11. Beginner Learning Guide: Things Member 2 Should Master")
    add_body("As Member 2, focusing on these core concepts will accelerate your development skills:")

    add_bullet("Functions, dictionaries, decorators (@app.get), list comprehensions, and imports.", "1. Python for Backend: ")
    add_bullet("Key-value pairs, nested objects, strings vs numbers, lists of objects.", "2. JSON (JavaScript Object Notation): ")
    add_bullet("Understanding HTTP verbs (GET for reading data, POST for sending data), status codes (200 OK, 201 Created, 400 Bad Request, 404 Not Found).", "3. REST APIs & HTTP: ")
    add_bullet("Routing (@app.get, @app.post), path parameters (/tracks/{track_id}), dependency injection (Depends(get_db)).", "4. FastAPI Framework: ")
    add_bullet("BaseModel, Field validation, type hints (str, int, float, List, Optional).", "5. Pydantic Schemas: ")
    add_bullet("Tables, columns, primary keys, querying (db.query(Track).filter(...).first()).", "6. SQL & SQLAlchemy ORM: ")
    add_bullet("git status, git add ., git commit -m 'message', git push origin main.", "7. Git & GitHub: ")
    add_bullet("Understanding CORS headers, JSON payloads, async fetch calls.", "8. Connecting APIs to React: ")

    # ------------------------------------------
    # 12. NEXT STEPS CHECKLIST
    # ------------------------------------------
    add_h1("12. Actionable Next Steps Checklist for Member 2")
    
    add_bullet("[ ] Share http://localhost:8000/docs API documentation with Member 5 (Frontend).", "Step 1 (Frontend Handoff): ")
    add_bullet("[ ] Share services/fault_detection.py JSON schema contract with Member 3 (Computer Vision).", "Step 2 (CV AI Handoff): ")
    add_bullet("[ ] Share services/risk_engine.py JSON schema contract with Member 4 (Risk AI).", "Step 3 (Risk AI Handoff): ")
    add_bullet("[ ] Integrate live weather API keys in .env when Member 6 provides external data credentials.", "Step 4 (Weather Integration): ")
    add_bullet("[ ] Run python test_suite.py before every Git commit to ensure zero regression errors.", "Step 5 (Continuous Testing): ")

    # Save Document safely with timestamp fallback if file is locked
    target_dir = "c:\\Users\\gandh\\OneDrive\\Desktop\\RailGuard"
    primary_file = os.path.join(target_dir, "RailGuard_Member_2_Backend_Guide.docx")
    
    try:
        doc.save(primary_file)
        print(f"Document successfully created at: {primary_file}")
    except PermissionError:
        alt_file = os.path.join(target_dir, "RailGuard_Member_2_Backend_Guide_v2.docx")
        doc.save(alt_file)
        print(f"Primary file locked; saved successfully to: {alt_file}")

if __name__ == "__main__":
    create_guide_docx()
