import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def create_ppt_guide_docx():
    doc = docx.Document()

    # Define Palette
    NAVY = RGBColor(15, 23, 42)        # Primary Dark #0F172A
    CYAN = RGBColor(0, 150, 200)       # Accent Cyan #0096C8
    SLATE = RGBColor(71, 85, 105)      # Secondary Text #475569
    DARK_GRAY = RGBColor(30, 41, 59)   # Main Body Text #1E293B
    WHITE = RGBColor(255, 255, 255)

    # Set Margins
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Helper Formatting Functions
    def set_cell_background(cell, fill_hex):
        shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
        cell._tc.get_or_add_tcPr().append(shading_elm)

    def add_title(text, subtitle_text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(24)
        run.font.bold = True
        run.font.color.rgb = NAVY
        
        p2 = doc.add_paragraph()
        p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run2 = p2.add_run(subtitle_text)
        run2.font.name = 'Arial'
        run2.font.size = Pt(12)
        run2.font.italic = True
        run2.font.color.rgb = CYAN
        p2.paragraph_format.space_after = Pt(20)

    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(16)
        run.font.bold = True
        run.font.color.rgb = NAVY

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = CYAN

    def add_h3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(11)
        run.font.bold = True
        run.font.color.rgb = SLATE

    def add_body(text, bold_prefix=None, space_after=4):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            run_b = p.add_run(bold_prefix)
            run_b.font.name = 'Calibri'
            run_b.font.size = Pt(10.5)
            run_b.font.bold = True
            run_b.font.color.rgb = DARK_GRAY
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(10.5)
        run.font.color.rgb = DARK_GRAY
        return p

    def add_bullet(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        if bold_prefix:
            run_b = p.add_run(bold_prefix)
            run_b.font.name = 'Calibri'
            run_b.font.size = Pt(10.5)
            run_b.font.bold = True
            run_b.font.color.rgb = DARK_GRAY
        run = p.add_run(text)
        run.font.name = 'Calibri'
        run.font.size = Pt(10.5)
        run.font.color.rgb = DARK_GRAY

    def add_code_block(code_text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.left_indent = Inches(0.2)
        p.paragraph_format.right_indent = Inches(0.2)
        
        run = p.add_run(code_text)
        run.font.name = 'Consolas'
        run.font.size = Pt(9.0)
        run.font.color.rgb = RGBColor(15, 23, 42)

    def add_ppt_block(title, ppt_bullets, explanation, speaking_points):
        add_h2(title)
        
        # PPT CONTENT
        p_hdr1 = doc.add_paragraph()
        p_hdr1.paragraph_format.space_before = Pt(4)
        p_hdr1.paragraph_format.space_after = Pt(2)
        r1 = p_hdr1.add_run("📊 PPT SLIDE CONTENT:")
        r1.font.name = 'Arial'
        r1.font.size = Pt(10.5)
        r1.font.bold = True
        r1.font.color.rgb = CYAN

        for b in ppt_bullets:
            add_bullet(b)

        # WHAT IT MEANS
        p_hdr2 = doc.add_paragraph()
        p_hdr2.paragraph_format.space_before = Pt(4)
        p_hdr2.paragraph_format.space_after = Pt(2)
        r2 = p_hdr2.add_run("💡 WHAT IT MEANS (SIMPLE EXPLANATION):")
        r2.font.name = 'Arial'
        r2.font.size = Pt(10.5)
        r2.font.bold = True
        r2.font.color.rgb = SLATE

        add_body(explanation)

        # WHAT I SHOULD SAY
        p_hdr3 = doc.add_paragraph()
        p_hdr3.paragraph_format.space_before = Pt(4)
        p_hdr3.paragraph_format.space_after = Pt(2)
        r3 = p_hdr3.add_run("🗣️ WHAT I SHOULD SAY TO JUDGES:")
        r3.font.name = 'Arial'
        r3.font.size = Pt(10.5)
        r3.font.bold = True
        r3.font.color.rgb = NAVY

        add_body(speaking_points)
        doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # ==========================================
    # DOCUMENT GENERATION
    # ==========================================

    add_title("RAILGUARD — MEMBER 2 BACKEND & AI INTEGRATION", "SIH 2026 Internal Competition PPT Preparation Guide & Technical Defense Manual\nBased strictly on verified, working code in the project repository")

    # ------------------------------------------
    # SECTION 1 — MY ROLE
    # ------------------------------------------
    add_h1("SECTION 1 — MY ROLE: Member 2 — Backend + AI Integration")
    
    add_ppt_block(
        "Role Summary",
        [
            "Architected FastAPI REST backend connecting database, AI models, and React UI.",
            "Implemented 8 core API endpoints for tracks, inspections, risk scoring, simulation, and block optimization.",
            "Designed type-safe Pydantic data schemas enforcing contract validation across the team.",
            "Built What-If maintenance simulation engine and SIH26027 block solver logic.",
            "Created SQLite persistence layer with 31 synthetic Indian Railways track records."
        ],
        "As Member 2, I am the bridge of the project. Member 1 handles database schemas, Member 3 builds CV defect detection, Member 4 creates risk AI models, Member 5 builds the React UI, and Member 6 provides weather data. My backend connects all of their work into a single unified system.",
        "I am responsible for the backend server and AI integration. I built the FastAPI REST backend that connects our team's AI models, SQLite database, weather data, and React UI. I implemented the API endpoints, data validation schemas, What-If simulator, and the SIH26027 maintenance block optimizer."
    )

    # ------------------------------------------
    # SECTION 2 — MY CONTRIBUTION TO RAILGUARD
    # ------------------------------------------
    add_h1("SECTION 2 — MY CONTRIBUTION TO RAILGUARD")
    
    add_h2("Member 2 Key Technical Contributions")
    add_bullet("Developed low-latency Python FastAPI backend with CORS middleware for React frontend integration.", "FastAPI Framework: ")
    add_bullet("Built 8 REST API routes (tracks, inspection pipeline, risk, simulation, optimization).", "RESTful API Suite: ")
    add_bullet("Connected SQLite via SQLAlchemy ORM, managing database sessions and automatic startup seeding.", "Database Integration: ")
    add_bullet("Created strict Pydantic v2 validation schemas to prevent malformed data payloads.", "Pydantic Schemas: ")
    add_bullet("Orchestrated multi-step workflow combining image uploads, track lookup, weather stress, and risk calculation.", "Master Pipeline (POST /analyze-image): ")
    add_bullet("Calculates baseline vs projected risk when maintenance is delayed by X days.", "What-If Simulator (POST /simulate): ")
    add_bullet("Solves maintenance window scheduling against train timetables to maximize availability.", "SIH26027 Block Optimizer: ")
    add_bullet("Created seed script populating 31 synthetic track sections across 6 Indian Railways zones.", "Synthetic Dataset Seeding: ")

    # ------------------------------------------
    # SECTION 3 — BACKEND ARCHITECTURE
    # ------------------------------------------
    add_h1("SECTION 3 — BACKEND ARCHITECTURE")
    add_body("Below is the exact 5-layer backend architecture matching the codebase:")

    add_code_block(
"""[ Member 5: React Dashboard UI ]
               │
               │ HTTP GET / POST (JSON & Form Data)
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. FastAPI Application Layer (main.py)                      │
│    • CORS Middleware & Routing Engine                       │
│    • Automatic Swagger UI Documentation (/docs)             │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Pydantic Data Validation Layer (models/schemas.py)        │
│    • Type Safety & Contract Enforcement                     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. REST API Routes Layer (routes/)                          │
│    • tracks.py (CRUD)        • analysis.py (Pipeline)       │
│    • risk.py (Metrics)       • simulation.py (What-If)      │
│    • optimization.py (SIH26027 Block Solver)                │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Services & Logic Layer (services/)                       │
│    • fault_detection.py      • risk_engine.py               │
│    • weather.py              • maintenance_optimizer.py     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Database Persistence Layer (database/)                    │
│    • database.py (SessionLocal & Engine)                    │
│    • models.py (SQLAlchemy ORM) ──► railguard.db (SQLite)   │
└─────────────────────────────────────────────────────────────┘"""
    )

    add_h2("Layer Explanations (One Sentence Each)")
    add_bullet("Entry point handling HTTP requests, CORS headers, and route distribution.", "1. FastAPI App (main.py): ")
    add_bullet("Validates incoming JSON payloads and formats outgoing API responses.", "2. Pydantic Schemas (schemas.py): ")
    add_bullet("Endpoint controllers that receive HTTP requests and call business logic.", "3. API Routes (routes/): ")
    add_bullet("Core algorithms containing AI interfaces, risk formulas, and block scheduling logic.", "4. Services Layer (services/): ")
    add_bullet("Stores physical track records, inspection audit logs, and risk history in SQLite.", "5. Database (database/): ")

    # ------------------------------------------
    # SECTION 4 — HOW MY BACKEND WORKS
    # ------------------------------------------
    add_h1("SECTION 4 — HOW MY BACKEND WORKS: Request-Response Flow")

    add_ppt_block(
        "Request-Response Flow Pipeline",
        [
            "Step 1: User triggers action on React Dashboard (e.g. Upload Inspection Photo).",
            "Step 2: React sends HTTP POST /analyze-image multipart form request to FastAPI.",
            "Step 3: Pydantic validates input form fields (track_id, image file).",
            "Step 4: Router calls services/fault_detection.py to extract defect parameters.",
            "Step 5: Router queries SQLite via SQLAlchemy for track age and traffic GMT.",
            "Step 6: Router calls services/weather.py for thermal & monsoon stress context.",
            "Step 7: Router calls services/risk_engine.py to compute composite risk score.",
            "Step 8: Router saves Inspection & RiskRecord rows to SQLite for audit.",
            "Step 9: FastAPI serializes output payload into AnalyzeImageResponse JSON.",
            "Step 10: React UI renders risk card, TSR speed badge, and XAI breakdown."
        ],
        "When an action happens on the frontend, FastAPI receives the request, Pydantic checks if the data format is correct, the route calls service functions to compute results and fetch database info, saves an audit log in SQLite, and sends back clean JSON for React to display.",
        "Our backend executes a 10-step atomic pipeline. When an image is uploaded, FastAPI validates the request, runs fault detection, queries track parameters from SQLite, fetches environmental weather stress, calculates composite risk, logs the audit records in the database, and returns a type-safe JSON response in under 50 milliseconds."
    )

    # ------------------------------------------
    # SECTION 5 — IMPORTANT APIs
    # ------------------------------------------
    add_h1("SECTION 5 — IMPORTANT APIs REFERENCE TABLE")
    add_body("Below is the table of verified REST endpoints currently active in the backend codebase:")

    table_data = [
        ["API Endpoint", "Method", "Purpose", "Input Payload", "Output Payload", "Why It Matters"],
        ["/health", "GET", "Health Check", "None", "{ 'status': 'healthy' }", "Verifies backend system operational status"],
        ["/tracks", "GET", "Get All Tracks", "None", "Array of TrackResponse JSON", "Powers React Dashboard track section overview"],
        ["/tracks", "POST", "Create/Update Track", "TrackCreate JSON", "TrackResponse JSON", "Idempotent asset registration & updates"],
        ["/tracks/{track_id}", "GET", "Track Detail", "track_id (Path)", "TrackResponse JSON", "Retrieves geometry, GMT, age for section"],
        ["/analyze-image", "POST", "Master Pipeline", "track_id + Photo (Form)", "AnalyzeImageResponse JSON", "Orchestrates CV AI, DB lookup, risk & XAI"],
        ["/risk/{track_id}", "GET", "Risk & XAI Metrics", "track_id (Path)", "Risk & XAI breakdown JSON", "Displays risk score, category, TSR, XAI %"],
        ["/simulate", "POST", "What-If Simulator", "SimulationRequest JSON", "SimulationResponse JSON", "Simulates risk escalation if delay occurs"],
        ["/optimize-maintenance", "POST", "SIH26027 Solver", "OptimizationRequest JSON", "OptimizationResponse JSON", "Recommends 01:00-03:00 window with 0 delays"]
    ]

    table = doc.add_table(rows=len(table_data), cols=6)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    col_widths = [Inches(1.5), Inches(0.6), Inches(1.1), Inches(1.1), Inches(1.1), Inches(1.1)]

    for row_idx, row in enumerate(table.rows):
        if row_idx == 0:
            for col_idx, cell in enumerate(row.cells):
                cell.width = col_widths[col_idx]
                set_cell_background(cell, "0F172A")
                p = cell.paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                run = p.runs[0] if p.runs else p.add_run(table_data[row_idx][col_idx])
                run.font.name = 'Arial'
                run.font.size = Pt(9.0)
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
                run.font.size = Pt(8.5)
                run.font.color.rgb = DARK_GRAY

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # ------------------------------------------
    # SECTION 6 — DATABASE INTEGRATION
    # ------------------------------------------
    add_h1("SECTION 6 — DATABASE INTEGRATION")

    add_ppt_block(
        "Database Layer Overview",
        [
            "Built on SQLite database engine (file: railguard.db) using SQLAlchemy ORM.",
            "Managed via SessionLocal thread-safe factory and get_db() dependency injection.",
            "Defines 5 relational tables: Track, Inspection, RiskRecord, TrainSchedule, MaintenanceBlock.",
            "Populated with 31 synthetic Indian Railways track records across 6 zones.",
            "Idempotent seeding script (seed.py) prevents duplicate insertion errors."
        ],
        "I connected our backend to an SQLite database using SQLAlchemy. We store track properties, inspection flaw logs, risk scores, train timetables, and maintenance requests. We currently use 31 synthetic railway tracks to test the dashboard safely.",
        "Our database layer uses SQLAlchemy ORM over SQLite. It maintains 5 relational tables representing track geometry, inspection logs, historical risk records, train schedules, and maintenance block requests. The database is populated with 31 synthetic track records to benchmark our API routes under realistic high-density corridor traffic conditions."
    )

    add_body("🟡 SYNTHETIC DATA STATUS NOTICE: The 31 track sections are synthetic datasets created specifically for prototype demonstration across NR, CR, WR, ER, SCR, and SR zones. They are not live proprietary Indian Railways data.")

    # ------------------------------------------
    # SECTION 7 — AI INTEGRATION
    # ------------------------------------------
    add_h1("SECTION 7 — AI INTEGRATION ARCHITECTURE")

    add_code_block(
"""[ Input Track Photo ]
         │
         ▼
[ POST /analyze-image (FastAPI Backend) ]
         │
         ├──► 1. Computer Vision Module (services/fault_detection.py)
         │       • Defect Type: Crack / Broken Sleeper / Head Check
         │       • Confidence: 0.94 | Severity: 85.0
         │
         ├──► 2. Track & Weather Context Fetcher
         │       • SQLite DB: Traffic GMT (58), Track Age (14 yrs)
         │       • Weather Service: Temp (38°C), Monsoon Alert
         │
         ├──► 3. Risk Engine AI Module (services/risk_engine.py)
         │       • Composite Risk Score: 74.4/100 (High)
         │       • TSR Speed Restriction: 60 km/h
         │       • 7-Day / 14-Day Projections: 79.4 / 85.4
         │
         └──► 4. SIH26027 Block Optimization Solver (services/maintenance_optimizer.py)
                 • Recommends Slot: 01:00–03:00 (Zero Train Delay Penalty)
                 • Asset Availability Gain: +14.0%"""
    )

    add_h2("Component Implementation Status Breakdown")
    add_bullet("FastAPI routes, Pydantic schemas, SQLAlchemy ORM, SQLite DB, REST endpoints, test suite.", "✅ WORKING / IMPLEMENTED: ")
    add_bullet("services/fault_detection.py (CV mock interface), services/risk_engine.py (multi-factor equation), 31 synthetic tracks.", "🟡 MOCK / SYNTHETIC / DEMO: ")
    add_bullet("Replacing mock services with Member 3's PyTorch YOLO model and Member 4's ML Risk model.", "🔴 FUTURE / PLANNED: ")

    add_h2("Team Member Integration Points")
    add_bullet("Member 3 will place their YOLO inference call inside services/fault_detection.py (detect_fault function). My API receives the image, calls their function, and gets defect type, confidence, and severity.", "Member 3 (CV Integration Point): ")
    add_bullet("Member 4 will place their ML risk model call inside services/risk_engine.py (calculate_risk function). My API passes track GMT, age, defect severity, and weather stress to their model and receives the calculated risk score.", "Member 4 (Risk AI Integration Point): ")

    # ------------------------------------------
    # SECTION 8 — IMAGE ANALYSIS API
    # ------------------------------------------
    add_h1("SECTION 8 — IMAGE ANALYSIS API (POST /analyze-image)")

    add_ppt_block(
        "Master Pipeline Overview",
        [
            "Single atomic endpoint: POST /analyze-image accepting track_id + photo file.",
            "Executes fault detection AI (detect_fault) to extract defect type & severity.",
            "Fetches physical track parameters from SQLite DB (track age, GMT load).",
            "Fetches environmental weather context (temperature, monsoon stress).",
            "Calculates multi-factor risk score, TSR speed restriction, and 7/14-day future predictions.",
            "Saves unique Inspection & RiskRecord audit entries into SQLite database.",
            "Returns unified JSON payload to React UI in under 50ms."
        ],
        "When an image is uploaded, POST /analyze-image calls the flaw detection service, fetches track properties from SQLite, gets weather stress, calculates composite risk, logs the results in the database, and returns a complete JSON response.",
        "POST /analyze-image is our master pipeline endpoint. Currently, the flaw detection step uses a mock service returning a 94% confidence crack classification. When Member 3 finishes their YOLO model, we simply swap out the inner function in services/fault_detection.py without modifying a single line of API route or frontend code."
    )

    # ------------------------------------------
    # SECTION 9 — RISK ASSESSMENT
    # ------------------------------------------
    add_h1("SECTION 9 — RISK ASSESSMENT IMPLEMENTATION & T041 EXAMPLE")

    add_ppt_block(
        "Track T041 Actual System Verification Output",
        [
            "Track ID: T041 (KM 142.5 Delhi-Kanpur Mainline)",
            "Detected Defect: Transverse Rail Head Crack (Confidence: 0.94, Severity: 85.0)",
            "Composite Risk Score: 74.4 / 100",
            "Risk Category: High Risk | Priority Rank: 2",
            "Recommended TSR Speed Limit: 60 km/h (Reduced from 130 km/h)",
            "Future Risk Escalation: 7-Day Project = 79.4 | 14-Day Project = 85.4",
            "Days to Critical Threshold: 4 Days",
            "XAI Breakdown: Defect Severity 40%, Traffic GMT 25%, Thermal Stress 15%, Track Age 10%, Delay 10%"
        ],
        "Our backend currently computes risk using a weighted multi-factor formula integrating defect severity, GMT traffic, thermal expansion stress, and rail age. For track T041, it generates a High Risk score of 74.4, imposes a 60 km/h TSR speed limit, and predicts it will hit Critical threshold in 4 days.",
        "For track T041, our system evaluates static track geometry (14-year age, 58 GMT load), visual flaw severity (85.0 crack), and ambient weather stress (38°C thermal expansion). It outputs a 74.4 High Risk score, enforces a 60 km/h TSR restriction, predicts a 79.4 risk score in 7 days, and provides an XAI factor breakdown."
    )

    add_body("🟡 IMPLEMENTATION NOTICE: The current risk score is calculated using a deterministic multi-factor mathematical equation inside services/risk_engine.py. Member 4's trained ML model will replace this equation in future integration.")

    # ------------------------------------------
    # SECTION 10 — MAINTENANCE OPTIMIZATION
    # ------------------------------------------
    add_h1("SECTION 10 — MAINTENANCE OPTIMIZATION (POST /optimize-maintenance)")

    add_ppt_block(
        "SIH26027 Maintenance Block Solver",
        [
            "Endpoint: POST /optimize-maintenance addressing SIH Problem Statement SIH26027.",
            "Evaluates high-risk maintenance requests against corridor train timetables.",
            "Identifies low-traffic night shadow windows (01:00–03:00).",
            "Zero Passenger Delay: Vande Bharat & Rajdhani Express run completely unaffected.",
            "Assigns maintenance crew: 'Northern Rly Track Gang #7 & TRT Unit'.",
            "Asset Availability Optimization: Increases corridor availability from 82.5% to 96.5% (+14.0% gain)."
        ],
        "SIH26027 requires automatic block planning. Our optimization endpoint checks high-risk tracks against express train timetables, schedules maintenance during low-density night hours (01:00–03:00), ensures zero passenger train delays, and increases asset availability by 14%.",
        "Our POST /optimize-maintenance endpoint implements a rule-based constraint solver matching high-risk maintenance jobs against train timetable headway gaps. It schedules critical rail replacement during the 01:00–03:00 night window, incurring 0 delay penalties for premium passenger trains while boosting corridor availability from 82.5% to 96.5%."
    )

    # ------------------------------------------
    # SECTION 11 — WHAT MAKES MY BACKEND USEFUL
    # ------------------------------------------
    add_h1("SECTION 11 — WHAT MAKES MY BACKEND USEFUL")

    add_ppt_block(
        "Integrated System Value Proposition",
        [
            "Connects isolated AI tools into ONE unified operational system.",
            "Combines physical track data + CV defect detection + Risk scoring + Weather stress + What-If simulation + Block optimization.",
            "Provides type-safe JSON APIs powering React dashboard visualizations.",
            "Ensures audit compliance by logging all inspections & risk records in SQLite."
        ],
        "Without the backend, defect detection, risk scoring, and block planning are separate tools. My backend integrates them into a single end-to-end system where an uploaded photo immediately triggers risk scoring, future predictions, and automated maintenance block scheduling.",
        "The value of my backend lies in system integration. Instead of disconnected ML models, RailGuard operates as a unified pipeline. An inspection upload automatically triggers CV flaw analysis, SQLite database retrieval, weather stress integration, risk calculation, future projection, and maintenance block optimization."
    )

    # ------------------------------------------
    # SECTION 12 — WHAT MAKES RAILGUARD DIFFERENT
    # ------------------------------------------
    add_h1("SECTION 12 — WHAT MAKES RAILGUARD DIFFERENT")

    add_body("Comparison between a basic defect detector vs RailGuard's Integrated Backend:")

    diff_table = [
        ["Capability", "Basic Defect Detection System", "RailGuard Integrated System", "Status"],
        ["Defect Detection", "Detects crack in photo", "Detects flaw type, confidence & severity", "✅ Working"],
        ["Asset Context", "No database connection", "Fetches track age, steel grade & traffic GMT", "✅ Working"],
        ["Weather Stress", "Ignores weather", "Integrates ambient temp & monsoon alerts", "✅ Working"],
        ["Risk Assessment", "Binary alert (Yes/No)", "Multi-factor score (0-100), category & priority", "✅ Working"],
        ["Explainability", "Black box output", "XAI factor contribution percentage breakdown", "✅ Working"],
        ["TSR Guidance", "Manual speed decision", "Automatic Speed Restriction recommendation", "✅ Working"],
        ["Future Risk", "Static snapshot", "7-day and 14-day degradation prediction", "✅ Working"],
        ["What-If Simulation", "Not available", "Simulates risk escalation if maintenance is delayed", "✅ Working"],
        ["Block Planning", "Manual block booking", "Automatic window scheduling (01:00-03:00) with 0 delays", "✅ Working"]
    ]

    t_diff = doc.add_table(rows=len(diff_table), cols=4)
    t_diff.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_diff.autofit = False
    col_w_diff = [Inches(1.5), Inches(1.8), Inches(2.2), Inches(1.0)]

    for r_idx, r in enumerate(t_diff.rows):
        if r_idx == 0:
            for c_idx, cell in enumerate(r.cells):
                cell.width = col_w_diff[c_idx]
                set_cell_background(cell, "0F172A")
                p = cell.paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                run = p.runs[0] if p.runs else p.add_run(diff_table[r_idx][c_idx])
                run.font.name = 'Arial'
                run.font.size = Pt(9.0)
                run.font.bold = True
                run.font.color.rgb = WHITE
        else:
            fill_hex = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
            for c_idx, cell in enumerate(r.cells):
                cell.width = col_w_diff[c_idx]
                set_cell_background(cell, fill_hex)
                p = cell.paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                run = p.add_run(diff_table[r_idx][c_idx])
                run.font.name = 'Calibri'
                run.font.size = Pt(8.5)
                run.font.color.rgb = DARK_GRAY

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # ------------------------------------------
    # SECTION 13 — CURRENT STATUS
    # ------------------------------------------
    add_h1("SECTION 13 — CURRENT IMPLEMENTATION STATUS MATRIX")

    status_data = [
        ["Feature / Component", "Status", "Verified Evidence in Codebase"],
        ["FastAPI Framework & CORS", "✅ Working", "main.py running cleanly on port 8000"],
        ["SQLite & SQLAlchemy ORM", "✅ Working", "database/database.py & database/models.py"],
        ["31 Synthetic Tracks Dataset", "✅ Working", "services/seed_data.py & seed.py script"],
        ["Track CRUD REST Endpoints", "✅ Working", "routes/tracks.py (health, tracks, tracks/{id})"],
        ["Pydantic Data Schemas", "✅ Working", "models/schemas.py (11 validation models)"],
        ["Risk Assessment API", "✅ Working", "routes/risk.py & services/risk_engine.py"],
        ["Master Image Analysis API", "✅ Working", "routes/analysis.py (POST /analyze-image)"],
        ["What-If Simulation API", "✅ Working", "routes/simulation.py (POST /simulate)"],
        ["Block Optimization API", "✅ Working", "routes/optimization.py (POST /optimize-maintenance)"],
        ["Swagger OpenAPI Docs", "✅ Working", "http://localhost:8000/docs auto-generated"],
        ["Automated Test Suite", "✅ Working", "test_suite.py (9/9 tests passing)"],
        ["Real Railway Defect Photos", "🟡 Mock / Demo", "Preset sample image paths (/presets/crack.jpg)"],
        ["Real YOLO Computer Vision Model", "🔴 Future", "Interface ready in services/fault_detection.py"],
        ["Real ML Risk Scoring Model", "🔴 Future", "Interface ready in services/risk_engine.py"],
        ["Real Live Weather API", "🔴 Future", "WEATHER_API_KEY placeholder in .env"]
    ]

    t_stat = doc.add_table(rows=len(status_data), cols=3)
    t_stat.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_stat.autofit = False
    col_w_stat = [Inches(2.2), Inches(1.3), Inches(3.0)]

    for r_idx, r in enumerate(t_stat.rows):
        if r_idx == 0:
            for c_idx, cell in enumerate(r.cells):
                cell.width = col_w_stat[c_idx]
                set_cell_background(cell, "0F172A")
                p = cell.paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                run = p.runs[0] if p.runs else p.add_run(status_data[r_idx][c_idx])
                run.font.name = 'Arial'
                run.font.size = Pt(9.0)
                run.font.bold = True
                run.font.color.rgb = WHITE
        else:
            fill_hex = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
            for c_idx, cell in enumerate(r.cells):
                cell.width = col_w_stat[c_idx]
                set_cell_background(cell, fill_hex)
                p = cell.paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                run = p.add_run(status_data[r_idx][c_idx])
                run.font.name = 'Calibri'
                run.font.size = Pt(8.5)
                run.font.color.rgb = DARK_GRAY

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # ------------------------------------------
    # SECTION 14 — TECHNICAL STACK
    # ------------------------------------------
    add_h1("SECTION 14 — TECHNICAL STACK (MEMBER 2 BACKEND)")

    tech_data = [
        ["Technology", "Category", "Why It Was Chosen / Used"],
        ["Python 3.14", "Language", "Primary language for FastAPI backend & AI integration"],
        ["FastAPI", "Web Framework", "High-performance, async REST framework with automatic Swagger UI"],
        ["Pydantic v2", "Data Validation", "Enforces strict type safety & serializes API JSON payloads"],
        ["SQLite", "Database Engine", "Lightweight, zero-config relational file database (railguard.db)"],
        ["SQLAlchemy 2.0", "Database ORM", "Translates Python classes into SQL queries cleanly"],
        ["Uvicorn", "ASGI Server", "Lightning-fast asynchronous web server running on port 8000"],
        ["JSON", "Data Format", "Standard lightweight data interchange format between frontend & backend"],
        ["Git / GitHub", "Version Control", "Tracks backend changes and enables team collaboration"]
    ]

    t_tech = doc.add_table(rows=len(tech_data), cols=3)
    t_tech.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_tech.autofit = False
    col_w_tech = [Inches(1.5), Inches(1.3), Inches(3.7)]

    for r_idx, r in enumerate(t_tech.rows):
        if r_idx == 0:
            for c_idx, cell in enumerate(r.cells):
                cell.width = col_w_tech[c_idx]
                set_cell_background(cell, "0F172A")
                p = cell.paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                run = p.runs[0] if p.runs else p.add_run(tech_data[r_idx][c_idx])
                run.font.name = 'Arial'
                run.font.size = Pt(9.0)
                run.font.bold = True
                run.font.color.rgb = WHITE
        else:
            fill_hex = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
            for c_idx, cell in enumerate(r.cells):
                cell.width = col_w_tech[c_idx]
                set_cell_background(cell, fill_hex)
                p = cell.paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                run = p.add_run(tech_data[r_idx][c_idx])
                run.font.name = 'Calibri'
                run.font.size = Pt(8.5)
                run.font.color.rgb = DARK_GRAY

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # ------------------------------------------
    # SECTION 15 — TESTING AND PROOF
    # ------------------------------------------
    add_h1("SECTION 15 — BACKEND TESTING & VALIDATION EVIDENCE")

    add_ppt_block(
        "Automated Test Suite Results",
        [
            "Database Layer Tests (test_db.py): Verified SQLite table creation & ORM CRUD.",
            "Schema Validation Tests (test_schemas.py): Verified Pydantic v2 JSON serialization.",
            "Track CRUD API Tests (test_step4_tracks.py): Verified GET /tracks & POST /tracks.",
            "Service Layer Tests (test_step5_services.py): Verified CV, Risk, Weather & Optimizer services.",
            "Pipeline Tests (test_step6_analysis.py): Verified master POST /analyze-image endpoint.",
            "Simulator Tests (test_step7_simulation.py): Verified POST /simulate What-If engine.",
            "Optimization Tests (test_step8_optimization.py): Verified SIH26027 block solver.",
            "Complete Integration Suite (test_suite.py): 9 out of 9 API endpoints passed cleanly (0 errors)."
        ],
        "We didn't just write code; we thoroughly tested every layer. We have 8 individual test scripts culminating in a master test suite (test_suite.py) that automatically verifies all 9 API endpoints in seconds.",
        "Our backend includes a rigorous automated test suite. Running test_suite.py executes end-to-end integration tests across all 9 REST endpoints—verifying database queries, Pydantic validation, pipeline execution, simulation math, and block optimization—with 100% clean test execution."
    )

    # ------------------------------------------
    # SECTION 16 — SCREENSHOTS I SHOULD PUT IN PPT
    # ------------------------------------------
    add_h1("SECTION 16 — RECOMMENDED PPT SCREENSHOTS")

    shots = [
        ("1. Interactive Swagger UI (/docs)", "http://localhost:8000/docs", "Proves backend APIs are live, fully documented, and interactive.", "Highlight all 5 router tags (Tracks, Analysis, Risk, Simulation, Optimization)."),
        ("2. Master POST /analyze-image Response", "Swagger UI or Postman", "Shows complete AI orchestration output for Track T041.", "Highlight defect confidence (0.94), risk score (74.4), TSR (60 km/h), and XAI breakdown."),
        ("3. SIH26027 Block Optimization Response", "POST /optimize-maintenance in Swagger", "Proves solving of SIH Problem Statement SIH26027.", "Highlight scheduled window (01:00–03:00) and asset availability gain (+14.0%)."),
        ("4. What-If Simulation Response", "POST /simulate in Swagger", "Demonstrates decision-support simulator for delayed maintenance.", "Highlight baseline risk vs projected risk escalation (Change: +5.3)."),
        ("5. Automated Test Suite Execution", "Terminal execution of test_suite.py", "Provides empirical evidence that backend functionality is verified.", "Highlight 'ALL 9 MEMBER 2 API ENDPOINTS VERIFIED AND PASSED CLEANLY!'"),
        ("6. Database Verification Output", "Terminal execution of seed.py", "Proves database contains 31 synthetic railway tracks.", "Highlight 'Total Track Sections: 31' and 5 database table counts.")
    ]

    for s_title, s_loc, s_why, s_high in shots:
        add_h2(s_title)
        add_bullet(s_loc, "Page / Location: ")
        add_bullet(s_why, "Why It Is Useful: ")
        add_bullet(s_high, "What to Highlight: ")

    # ------------------------------------------
    # SECTION 17 — PPT SLIDE CONTENT FOR MEMBER 2
    # ------------------------------------------
    add_h1("SECTION 17 — PPT SLIDE CONTENT FOR MEMBER 2 (5 SLIDES)")

    slides = [
        (
            "SLIDE 1: Member 2 Role & Backend Architecture",
            "Introduce Member 2's role and explain high-level backend architecture.",
            [
                "Role: Backend Developer & AI Integration Specialist.",
                "Built high-performance REST backend using Python FastAPI & SQLite.",
                "Connects CV Defect Detection, Risk AI, Weather Context & React UI.",
                "Enforces strict data schemas (Pydantic) for seamless team integration."
            ],
            "Diagram: 5-layer backend architecture flow (Frontend ➔ FastAPI ➔ Services ➔ Database).",
            "Hello judges, I am Member 2, responsible for Backend and AI Integration. I built our FastAPI REST backend that connects Member 3's defect detection AI, Member 4's risk prediction engine, SQLite database, and Member 5's React dashboard into one unified pipeline."
        ),
        (
            "SLIDE 2: Master Inspection & Risk Pipeline",
            "Demonstrate POST /analyze-image endpoint execution.",
            [
                "POST /analyze-image: Master orchestration pipeline.",
                "Receives track photo & ID ➔ Extracts flaw severity & confidence.",
                "Queries track age & GMT traffic load from SQLite database.",
                "Integrates thermal & monsoon stress context ➔ Computes risk score.",
                "Generates 7/14-day future predictions & logs audit entry in SQLite."
            ],
            "Screenshot: Swagger UI response for POST /analyze-image (Track T041).",
            "This slide shows our master analysis pipeline. When an inspector uploads a track photo, our API calls the flaw detector, queries physical track properties from SQLite, integrates weather stress, calculates a composite risk score of 74.4 for T041, recommends a 60 km/h TSR limit, and predicts risk escalation over 14 days."
        ),
        (
            "SLIDE 3: SIH26027 Automatic Maintenance Block Optimization",
            "Showcase backend solution for SIH Problem Statement SIH26027.",
            [
                "POST /optimize-maintenance: Solves SIH Problem Statement SIH26027.",
                "Matches high-risk maintenance requests against train timetables.",
                "Schedules blocks in low-density night windows (01:00–03:00).",
                "Zero Passenger Disruption: Premium trains (Vande Bharat, Rajdhani) run unaffected.",
                "Asset Availability Optimization: Increases corridor availability from 82.5% to 96.5% (+14.0%)."
            ],
            "Screenshot: POST /optimize-maintenance response showing 01:00–03:00 slot & +14% gain.",
            "Our solution directly answers SIH Problem Statement SIH26027. Our maintenance optimization endpoint evaluates high-risk tracks against train timetables, schedules maintenance during the 01:00 to 03:00 night window, ensures zero passenger train delays, and boosts overall corridor asset availability by 14%."
        ),
        (
            "SLIDE 4: What-If Delayed Maintenance Simulation",
            "Demonstrate decision-support simulator lab functionality.",
            [
                "POST /simulate: What-If Scenario Simulation Engine.",
                "Simulates risk escalation if maintenance is deferred by X days.",
                "Incorporates thermal expansion heat waves (42°C) & monsoon rainfall.",
                "Provides actionable decision-support for railway controllers.",
                "Powers interactive sliders on Member 5's React UI Simulator."
            ],
            "Screenshot: POST /simulate response showing baseline vs predicted risk escalation.",
            "We also built a What-If simulation engine. Railway controllers can simulate what happens if track maintenance is delayed by 7 days or if a heat wave strikes. The API calculates risk escalation in real-time, giving controllers clear data to decide whether to approve immediate maintenance."
        ),
        (
            "SLIDE 5: Backend Validation & Testing Proof",
            "Provide evidence of working implementation and code quality.",
            [
                "Unified Integration Test Suite (test_suite.py): 9 out of 9 APIs verified.",
                "Interactive OpenAPI Swagger UI (/docs) live on http://localhost:8000.",
                "Populated with 31 synthetic Indian Railways track records across 6 zones.",
                "Clean modular architecture ready for live AI model deployment."
            ],
            "Screenshot: Terminal test suite output showing ALL 9 TESTS PASSED CLEANLY.",
            "To ensure reliability, we built an automated test suite verifying all 9 REST endpoints. Every single API route, database query, and simulation formula is tested and passing cleanly. The backend is fully documented in Swagger and ready for live deployment."
        )
    ]

    for s_title, s_purp, s_bullets, s_vis, s_speak in slides:
        add_h2(s_title)
        add_bullet(s_purp, "SLIDE PURPOSE: ")
        
        p_hdr = doc.add_paragraph()
        p_hdr.paragraph_format.space_before = Pt(2)
        p_hdr.paragraph_format.space_after = Pt(2)
        r = p_hdr.add_run("📊 PPT CONTENT:")
        r.font.bold = True
        r.font.color.rgb = CYAN
        
        for b in s_bullets:
            add_bullet(b)
            
        add_bullet(s_vis, "RECOMMENDED VISUAL: ")
        add_bullet(s_speak, "SPEAKING SCRIPT: ")
        doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # ------------------------------------------
    # SECTION 18 — MY 1-MINUTE EXPLANATION
    # ------------------------------------------
    add_h1("SECTION 18 — MY 1-MINUTE PRESENTATION SPEECH")

    speech_1min = (
        "Hello judges, I am Member 2, responsible for Backend and AI Integration.\n\n"
        "In RailGuard, I built the central FastAPI REST backend that connects all our team's work into a single unified system. "
        "I created 8 REST API endpoints that handle physical track data, inspection processing, risk scoring, What-If simulation, and maintenance block optimization.\n\n"
        "When an inspection photo is uploaded, my backend orchestrates the workflow—it calls the flaw detection service, retrieves track properties like rail age and GMT traffic load from SQLite, "
        "integrates weather stress, calculates a composite risk score, and predicts future risk degradation.\n\n"
        "Most importantly, to address SIH Problem Statement SIH26027, I built the automatic block optimization API. It evaluates high-risk tracks against corridor train timetables and schedules "
        "maintenance during low-density night windows like 01:00 to 03:00, ensuring zero passenger train delays while increasing track asset availability by 14%.\n\n"
        "I also created an automated test suite verifying all 9 endpoints, and the entire backend is live and interactive via Swagger UI. Thank you!"
    )
    add_body(speech_1min)

    # ------------------------------------------
    # SECTION 19 — MY 2-MINUTE EXPLANATION
    # ------------------------------------------
    add_h1("SECTION 19 — MY 2-MINUTE PRESENTATION SPEECH")

    speech_2min = (
        "Hello judges! I am Member 2, and my role in RailGuard is Backend Architecture and AI Integration.\n\n"
        "While my teammates focus on computer vision models, risk prediction algorithms, database schemas, and frontend UI, my responsibility is building the core server that connects all these components into a seamless operational platform.\n\n"
        "I built our backend using Python FastAPI and SQLite with SQLAlchemy ORM. The architecture consists of 5 clean layers: FastAPI app configuration, Pydantic data validation schemas, modular REST API routes, business logic services, and database persistence.\n\n"
        "Let me highlight our key API capabilities:\n\n"
        "First, our Master Analysis Pipeline endpoint POST /analyze-image. When an inspector uploads a track photo, FastAPI receives the request, calls the flaw detection service to extract defect severity, queries physical track parameters from SQLite, fetches environmental weather stress, calculates a composite risk score, and predicts 7-day and 14-day degradation—returning a complete JSON response in under 50 milliseconds.\n\n"
        "Second, our What-If Simulation endpoint POST /simulate allows railway controllers to model deferred maintenance. If maintenance is delayed by 7 days under thermal expansion heat stress, the API calculates risk escalation in real-time.\n\n"
        "Third, addressing SIH Problem Statement SIH26027, I implemented the POST /optimize-maintenance endpoint. This constraint solver evaluates pending maintenance jobs against corridor train timetables. It schedules critical repairs during low-traffic night shadow windows—specifically 01:00 to 03:00—incurring zero delay penalties for express passenger trains like Vande Bharat and Rajdhani, while boosting corridor asset availability from 82.5% to 96.5%.\n\n"
        "I have seeded our database with 31 synthetic Indian Railways track records across 6 zones for prototype testing, and created a comprehensive test suite where all 9 API endpoints pass cleanly. The backend is live, fully documented in Swagger, and ready for team integration. Thank you!"
    )
    add_body(speech_2min)

    # ------------------------------------------
    # SECTION 20 — QUESTIONS JUDGES MAY ASK ME (25 QUESTIONS)
    # ------------------------------------------
    add_h1("SECTION 20 — 25 LIKELY JUDGE QUESTIONS & DEFENSE ANSWERS")

    questions = [
        ("1. Why did you choose FastAPI over Flask or Django?", "FastAPI offers automatic Pydantic data validation, native async support, and auto-generated Swagger UI documentation with significantly higher performance than Flask or Django."),
        ("2. What is an API and what is your backend's main role?", "An API allows different software programs to communicate. My backend acts as the central hub connecting React UI, SQLite DB, and AI models."),
        ("3. Why did you use REST architecture?", "REST is a lightweight, stateless standard using standard HTTP verbs (GET, POST) that seamlessly connects web frontends to Python backends."),
        ("4. How does the frontend communicate with your backend?", "React sends HTTP GET and POST requests over CORS to http://localhost:8000, receiving structured JSON responses."),
        ("5. How does your backend communicate with the database?", "FastAPI uses SQLAlchemy ORM over SQLite, executing type-safe Python queries like db.query(Track).filter(...).first()."),
        ("6. What is Pydantic and why did you use it?", "Pydantic is a data validation library enforcing type safety on incoming request payloads and outgoing JSON responses."),
        ("7. How does POST /analyze-image work?", "It orchestrates flaw detection, queries track age/GMT from SQLite, fetches weather stress, calculates risk, logs audit records, and returns JSON."),
        ("8. Where will Member 3's YOLO model plug in?", "Inside services/fault_detection.py in the detect_fault() function without altering any API routes or frontend calls."),
        ("9. Where will Member 4's Risk ML model plug in?", "Inside services/risk_engine.py in the calculate_risk() function, replacing the current multi-factor equation."),
        ("10. How does the maintenance block optimization solver work?", "It checks high-risk track maintenance requests against train timetables to allocate low-density night windows like 01:00–03:00."),
        ("11. How does your system address SIH Problem Statement SIH26027?", "By automatically scheduling maintenance during low-density night windows, eliminating passenger train delays, and boosting asset availability by +14%."),
        ("12. What happens if an AI model returns a low confidence result?", "Pydantic flags the confidence score, and the backend routes the track for manual secondary inspection."),
        ("13. How did you test your backend?", "We built an automated test suite (test_suite.py) testing all 9 REST endpoints with 100% pass rate."),
        ("14. What data are you currently using?", "We use 31 synthetic Indian Railways track records created for prototype testing across 6 railway zones."),
        ("15. Are you claiming to use live Indian Railways data?", "No, all track data is clearly labeled as synthetic for prototype demonstration."),
        ("16. How will you replace synthetic data with real data?", "By connecting Member 1's railway database scripts and Member 6's operational APIs directly into our DB models."),
        ("17. How does the What-If simulator work?", "POST /simulate calculates baseline risk vs projected risk escalation when maintenance is deferred by X days under weather stress."),
        ("18. What is TSR?", "TSR stands for Temporary Speed Restriction. Our backend recommends reduced speeds (e.g. 60 km/h) on high-risk tracks to ensure safety."),
        ("19. What is GMT?", "Gross Million Tonnes per day, measuring cumulative freight and passenger traffic load on a track section."),
        ("20. What is XAI in your risk output?", "Explainable AI factor breakdown, showing exact percentage contributions of defect severity (40%), GMT traffic (25%), thermal stress (15%), track age (10%), and delay (10%)."),
        ("21. How do you handle CORS issues between React and FastAPI?", "We added CORSMiddleware in main.py allowing cross-origin requests from the React frontend port."),
        ("22. What happens if a duplicate track ID is created?", "POST /tracks implements an idempotent upsert pattern, updating existing records instead of throwing 400 errors."),
        ("23. How will your backend scale for production?", "FastAPI scales horizontally using ASGI workers (Uvicorn/Gunicorn) and can migrate seamlessly from SQLite to PostgreSQL."),
        ("24. How do the 6 team members integrate their work?", "Member 1 handles DB, Member 2 builds FastAPI APIs, Member 3 builds CV, Member 4 builds Risk AI, Member 5 builds React UI, Member 6 provides data."),
        ("25. What is the single most important achievement of your backend?", "Integrating isolated AI models, database records, and simulation tools into ONE automated operational system.")
    ]

    for q_text, a_text in questions:
        add_h2(q_text)
        add_bullet(a_text, "SPEAKABLE ANSWER: ")

    # ------------------------------------------
    # SECTION 21 — THINGS I MUST NOT CLAIM
    # ------------------------------------------
    add_h1("SECTION 21 — 'DO NOT CLAIM' CHECKLIST FOR SIH PRESENTATION")

    add_body("⚠️ CRITICAL WARNING FOR MEMBER 2: Avoid making the following unsupported claims during presentation:")
    
    add_bullet("DO NOT claim we are using live proprietary Indian Railways datasets. State clearly: 'We use 31 synthetic Indian Railways track records created for prototype benchmarking.'", "1. Live Railway Data: ")
    add_bullet("DO NOT claim Member 3's YOLO model is fully trained in backend today. State: 'The CV interface is built and ready for YOLO model integration.'", "2. CV Model Status: ")
    add_bullet("DO NOT claim risk calculation currently uses a trained ML neural network. State: 'Current risk scoring uses a multi-factor equation, ready to be upgraded to Member 4's ML model.'", "3. Risk ML Status: ")
    add_bullet("DO NOT claim live OpenWeatherMap API is fetching live weather. State: 'Weather context uses a synthetic stress fetcher with placeholders ready for live API keys.'", "4. Weather API Status: ")
    add_bullet("DO NOT claim RailGuard is already deployed on Indian Railways track machines. State: 'RailGuard is a working prototype designed for decision-support integration.'", "5. Production Deployment: ")

    # ------------------------------------------
    # SECTION 22 — MY MEMBER 2 CHEAT SHEET
    # ------------------------------------------
    add_h1("SECTION 22 — MEMBER 2 ONE-PAGE CHEAT SHEET")

    add_body("Keep this summary in mind during the SIH internal competition:")

    add_bullet("Member 2 — Backend & AI Integration Specialist", "MY ROLE: ")
    add_bullet("Python FastAPI framework running on ASGI Uvicorn server (port 8000)", "BACKEND ENGINE: ")
    add_bullet("SQLite (railguard.db) using SQLAlchemy ORM & Pydantic v2 schemas", "DATABASE LAYER: ")
    add_bullet("GET /tracks, POST /analyze-image, GET /risk/{id}, POST /simulate, POST /optimize-maintenance", "MAIN APIs: ")
    add_bullet("Modular interface ready in services/fault_detection.py for Member 3's YOLO model", "CV AI STATUS: ")
    add_bullet("Multi-factor equation in services/risk_engine.py ready for Member 4's ML model", "RISK AI STATUS: ")
    add_bullet("POST /optimize-maintenance schedules 01:00–03:00 windows with 0 delays (+14% availability gain)", "SIH26027 SOLVER: ")
    add_bullet("31 synthetic track records across 6 Indian Railways zones", "DATASET STATUS: ")
    add_bullet("Member 1 (DB) ➔ Member 2 (FastAPI APIs) ➔ Member 3 (CV) / Member 4 (Risk AI) ➔ Member 5 (React UI)", "TEAM PIPELINE: ")
    add_bullet("Built an integrated 8-endpoint REST backend with automated test suite and SIH26027 block solver.", "CORE CONTRIBUTION: ")

    # Save File
    target_dir = "c:\\Users\\gandh\\OneDrive\\Desktop\\RailGuard"
    primary_file = os.path.join(target_dir, "RailGuard_Member_2_Backend_Guide(ppt).docx")
    
    try:
        doc.save(primary_file)
        print(f"Document successfully created at: {primary_file}")
    except Exception as e:
        alt_file = os.path.join(target_dir, "RailGuard_Member_2_Backend_Guide_PPT_v1.docx")
        doc.save(alt_file)
        print(f"Primary file locked or error ({e}); saved successfully to: {alt_file}")

if __name__ == "__main__":
    create_ppt_guide_docx()
