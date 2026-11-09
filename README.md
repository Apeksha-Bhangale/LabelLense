# LabelLens — AI-Powered Product Label Inspection & Report Generation System

**Smart India Hackathon 2026**  
**Problem Statement ID:** 26034  
**Title:** Software System to Check Compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011  
**Tagline:** *Scan. Verify. Report.*  

---

## 🛡️ Executive Summary

**LabelLens** is a responsive, modern web application designed for government Legal Metrology field inspectors. It enables inspectors to:
1. Capture or upload packaged commodity label photographs in the field.
2. Enhance text legibility and handle glare/shadows using OpenCV image preprocessing (CLAHE, bilateral denoising, unsharp mask).
3. Extract text coordinates, lines, and confidence scores via hybrid OCR (Tesseract & RapidOCR ONNX).
4. Organize recognized text into statutory declaration fields under Legal Metrology Rules, 2011.
5. Deterministically evaluate statutory packaging compliance across mandatory requirements (Rule 6, Rule 12, Rule 13).
6. Spotlight visual packaging evidence with interactive bounding boxes on original vs. preprocessed images.
7. Record official inspector verification decisions (Confirm / Reject / Further Review) and remarks.
8. Automatically compile and generate publication-quality, downloadable PDF inspection dossiers (Sections A to H).
9. Persist and retrieve historical inspection records from a local SQLite database.

---

## 🏛️ Legal Metrology Compliance Rules Evaluated

LabelGuard adheres strictly to verifiable statutory requirements under the **Legal Metrology (Packaged Commodities) Rules, 2011** (as amended up to 2024):

| Rule Reference | Statutory Mandate | Verification Criteria | Status Outcomes |
|---|---|---|---|
| **Rule 6(1)(a)** | Manufacturer / Packer / Importer Name & Complete Address | Physical identity with postal PIN code, street, and locality | PASS / POTENTIAL VIOLATION / NEEDS REVIEW |
| **Rule 6(1)(b)** | Common or Generic Name of Commodity | Prominently displayed generic name on Principal Display Panel (PDP) | PASS / POTENTIAL VIOLATION / NEEDS REVIEW |
| **Rule 6(1)(c) read with Rule 12 & 13** | Net Quantity & Standard Unit of Measure | Standard metric units (`g`, `kg`, `ml`, `L`, `N`). Prohibits illegal non-standard units (`gms`, `kilos`, `ltrs`, `m.l.`) | PASS / POTENTIAL VIOLATION |
| **Rule 6(1)(e)** | Maximum Retail Price (MRP) & Tax Declaration | Declared retail price accompanied by mandatory wording: *"inclusive of all taxes"* or *"incl. of all taxes"* | PASS / POTENTIAL VIOLATION / NEEDS REVIEW |
| **Rule 6(11)** | Unit Sale Price (USP) | Mandatory indication (e.g. ₹ per g / ₹ per 100g / ₹ per ml) on commodities exceeding 1 unit / 100g / 100ml | PASS / POTENTIAL VIOLATION / NEEDS REVIEW |
| **Rule 6(1)(d)** | Month & Year of Manufacture / Packing / Import | Clear date stamp indicating month and year of packaging | PASS / POTENTIAL VIOLATION / NEEDS REVIEW |
| **Rule 6(1)(f)** | Consumer Care / Grievance Redressal Mechanism | Name, complete address, telephone helpline, AND email address of consumer care cell | PASS / POTENTIAL VIOLATION / NEEDS REVIEW |
| **Rule 6(10)** | Country of Origin | Mandatory declaration of origin on imported packaged commodities | PASS / POTENTIAL VIOLATION / NOT APPLICABLE |
| **Rule 7 & Rule 9** | Legibility, Contrast and Conspicuous Display | Plain, prominent, contrasting typography; OCR legibility index | PASS / NEEDS REVIEW |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+ (Tested on Python 3.13)
- Node.js 18+ (Tested on Node.js v24.12.0)
- npm 9+

### 2. Backend Setup & Startup
```powershell
cd C:\Users\prati\.gemini\antigravity\scratch\labelguard\backend
# Install dependencies (already installed)
pip install -r requirements.txt
# Run FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000
```
*The backend automatically initializes the SQLite database (`labelguard.db`), seeds 3 realistic sample inspections, and starts listening on port 8000.*

### 3. Frontend Setup & Startup
```powershell
cd C:\Users\prati\.gemini\antigravity\scratch\labelguard\frontend
# Run Vite dev server
npm run dev -- --host 127.0.0.1 --port 3000
```
Open **[http://127.0.0.1:3000](http://127.0.0.1:3000)** in your web browser.

---

## 🧪 Live Evaluator Demonstration Workflow

The application is pre-seeded with 3 realistic demonstration inspection records and sample label images to allow instant evaluation:

### Step 1: Inspector Dashboard
1. Open [http://127.0.0.1:3000](http://127.0.0.1:3000).
2. Observe dynamically computed metrics:
   - **Total Inspections**
   - **Potential Violations**
   - **Needs Manual Review**
   - **Reports Generated**
3. Use the search and status filter dropdown to inspect recent records.

### Step 2: Start a New Inspection
1. Click **Start New Inspection**.
2. Click one of the **Demo Autofill** buttons:
   - **Basmati Rice** (Compliant sample)
   - **Imported Spread** (Violations sample)
   - **Cough Syrup** (Needs Review sample)
   *Or enter your own product and premises information.*
3. Click **Proceed to Label Capture & OCR**. A unique Inspection ID (e.g. `LG-2026-XXXX`) is assigned.

### Step 3: Label Capture & OCR
1. Under **Add Packaging Panel Photo**:
   - Click **Use Mobile Camera** or **Upload Image File** to test your own label image.
   - OR click one of the 1-click demonstration labels: **Basmati Rice**, **Hazelnut Spread**, or **Cough Syrup**.
2. Watch OpenCV preprocessing run automatically:
   - Toggle between **Original** and **OpenCV Enhanced** views.
   - Toggle **OCR Boxes** to inspect word and line bounding boxes.
   - Hover over any recognized text box on the label to view its OCR text and confidence score.
3. Click **Proceed to Declaration Review**.

### Step 4: Declaration Review & Corrections
1. Review parsed statutory declarations: Manufacturer, Generic Name, Net Qty, MRP & Taxes, USP, Mfg Date, Consumer Care, Origin, Batch.
2. Click **Inspect Region** on any declaration to spotlight its exact bounding box on the packaging photo.
3. Edit any field value to rectify OCR misreadings or enter missing information, and click **Save**.
4. Click **Proceed to Compliance Engine**.

### Step 5: Compliance Results & Inspector Verification
1. Inspect the scorecard: Total Checks, Passed, Potential Violations, Needs Review, Not Applicable.
2. Review suspected packaging violations (e.g. non-standard unit `'gms'`, missing `'incl. of all taxes'` wording, missing Country of Origin on imported goods).
3. Use the **Inspector Verification Controls**:
   - Select **Confirm Violation**, **Reject Finding**, or **Mark for Laboratory Review**.
   - Input your justification remarks and click **Save**.
4. Click **Generate Inspection Report**.

### Step 6: Inspection Report Preview & PDF Download
1. View the structured inspection report containing all statutory sections:
   - **Section A:** Report Header with LabelGuard branding, Report ID, Inspection ID, Timestamp.
   - **Section B:** Inspector & Premises Details.
   - **Section C:** Packaged Commodity Information.
   - **Section D:** Physical Scanned Package Evidence with embedded label images.
   - **Section E:** Rule-by-rule Findings Table.
   - **Section F:** Potential Packaging Violations with statutory grounds.
   - **Section G:** Inspector Remarks and Enforcement Recommendation (editable live!).
   - **Section H:** Official Sign-off block with Inspector Name, Date, and Legal Disclaimer.
2. Click **Download PDF** to obtain the actual generated ReportLab PDF.
3. Click **Print** to test printer-ready output.
4. Click **History** to review all saved inspections in the persistence archive.

---

## 🏗️ Technical Architecture

```
labelguard/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application, routing, CORS, static mounts
│   │   ├── database.py                 # SQLite database schema, queries, report versioning
│   │   ├── models.py                   # Pydantic schemas for inspections, panels, declarations
│   │   ├── seed_data.py                # Pre-populates realistic sample inspections & PDFs
│   │   └── services/
│   │       ├── image_processor.py      # OpenCV CLAHE, bilateral filtering, quality checks
│   │       ├── ocr_engine.py           # Hybrid Tesseract & RapidOCR ONNX with bounding boxes
│   │       ├── declaration_extractor.py# Legal Metrology statutory field pattern extractor
│   │       ├── compliance_engine.py    # Packaged Commodities Rules 2011 rule engine
│   │       ├── pdf_generator.py        # ReportLab PDF generator (Sections A to H)
│   │       └── sample_generator.py     # Generates demonstration label images
│   ├── uploads/
│   │   ├── sample_labels/              # Demo label graphics
│   │   ├── panels/                     # User-uploaded package panel images
│   │   ├── preprocessed/               # OpenCV preprocessed images
│   │   └── reports/                    # Generated inspection report PDFs
│   └── labelguard.db                   # SQLite database
│
└── frontend/
    ├── src/
    │   ├── api.ts                      # Backend REST API client
    │   ├── types.ts                    # TypeScript data models
    │   ├── App.tsx                     # Top-level workflow router
    │   ├── components/
    │   │   ├── Navbar.tsx              # Government header with inspector badge
    │   │   ├── Sidebar.tsx             # Navigation drawer & 5-step workflow stepper
    │   │   ├── StatusBadge.tsx         # Color-coded compliance badges
    │   │   └── ImageEvidenceViewer.tsx # Interactive image viewer with bounding box overlay
    │   └── pages/
    │       ├── DashboardPage.tsx       # Dynamic KPI metrics & recent inspections table
    │       ├── NewInspectionPage.tsx   # Guided inspection creation form
    │       ├── LabelCapturePage.tsx    # Multi-panel camera/file upload & OCR preview
    │       ├── DeclarationReviewPage.tsx # Statutory declaration editor & corrections
    │       ├── ComplianceResultsPage.tsx # Rule evaluation & inspector verification
    │       ├── ReportPreviewPage.tsx   # Report preview, PDF generation & sign-off
    │       ├── InspectionHistoryPage.tsx # Searchable historical inspection archive
    │       └── SavedInspectionDetailsPage.tsx # Complete inspection detail viewer
    ├── package.json
    ├── tailwind.config.js              # Dark navy, white, teal & compliance color palette
    └── vite.config.ts                  # Vite config with backend API proxy
```

---

## ⚖️ Legal Disclaimer
*LabelLens is developed as an inspection assistance and compliance report generation prototype for Smart India Hackathon 2026. Findings recorded represent algorithmic comparisons under the Legal Metrology (Packaged Commodities) Rules, 2011 and do not constitute an official conviction or certificate unless ratified through designated statutory procedures by competent legal authorities.*
