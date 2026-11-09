"""
LabelLens FastAPI Backend Application.
Legal Metrology (Packaged Commodities) Rules, 2011 Inspection System.
"""
import os
import uuid
import shutil
from datetime import datetime
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from app.database import (
    init_db, save_inspection, get_inspection, list_inspections,
    get_dashboard_metrics, save_report_record
)
from app.models import (
    InspectionCreate, DeclarationUpdate, ComplianceVerificationUpdate,
    ReportGenerateRequest
)
from app.services.image_processor import preprocess_for_ocr, assess_image_quality
from app.services.ocr_engine import extract_text_from_image
from app.services.declaration_extractor import extract_declarations
from app.services.compliance_engine import evaluate_compliance, compute_overall_status
from app.services.pdf_generator import generate_inspection_pdf
from app.seed_data import seed_database_if_empty

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
REPORTS_DIR = os.path.join(UPLOADS_DIR, "reports")
PANELS_DIR = os.path.join(UPLOADS_DIR, "panels")
PREP_DIR = os.path.join(UPLOADS_DIR, "preprocessed")

os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)
os.makedirs(PANELS_DIR, exist_ok=True)
os.makedirs(PREP_DIR, exist_ok=True)

app = FastAPI(
    title="LabelLens API",
    description="Legal Metrology Packaged Commodities Rule 2011 Inspection & Report System",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded images and reports
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

@app.on_event("startup")
def startup_event():
    init_db()
    seed_database_if_empty()

# -----------------------------------------------------------------------------
# 1. Dashboard
# -----------------------------------------------------------------------------
@app.get("/api/dashboard")
def get_dashboard():
    metrics = get_dashboard_metrics()
    return metrics

# -----------------------------------------------------------------------------
# 2. Inspections CRUD & Listing
# -----------------------------------------------------------------------------
@app.get("/api/inspections")
def get_inspections(
    search: Optional[str] = None,
    status: Optional[str] = None,
    date: Optional[str] = None,
    limit: int = 100
):
    results = list_inspections(search_query=search, status_filter=status, date_filter=date, limit=limit)
    return results

@app.post("/api/inspections")
def create_inspection(data: InspectionCreate):
    # Generate unique Inspection ID: LG-2026-XXXX
    unique_suffix = str(uuid.uuid4().hex[:4]).upper()
    inspection_id = f"LG-2026-{unique_suffix}"
    now = datetime.now().isoformat()
    
    inspection_dict = {
        "id": inspection_id,
        "product_name": data.product_name,
        "brand": data.brand,
        "product_category": data.product_category,
        "product_type": data.product_type,
        "manufacturer_details": data.manufacturer_details or "",
        "importer_details": data.importer_details or "",
        "batch_lot_number": data.batch_lot_number or "",
        "shop_name": data.shop_name,
        "shop_address": data.shop_address,
        "district": data.district,
        "state": data.state,
        "inspection_date": data.inspection_date or now[:10],
        "inspector_name": data.inspector_name,
        "inspector_id": data.inspector_id,
        "inspection_notes": data.inspection_notes or "",
        "overall_status": "IN_PROGRESS",
        "total_checks": 0,
        "passed_checks": 0,
        "violation_checks": 0,
        "review_checks": 0,
        "na_checks": 0,
        "panels": [],
        "declarations": [],
        "compliance_results": [],
        "report_generated": False,
        "latest_report_id": None,
        "latest_report_url": None,
        "report_version": 0,
        "created_at": now,
        "updated_at": now
    }
    
    save_inspection(inspection_dict)
    return inspection_dict

@app.get("/api/inspections/{inspection_id}")
def get_inspection_detail(inspection_id: str):
    record = get_inspection(inspection_id)
    if not record:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return record

# -----------------------------------------------------------------------------
# 3. Panel Image Upload & OCR Processing
# -----------------------------------------------------------------------------
@app.post("/api/inspections/{inspection_id}/panels/upload")
async def upload_panel_image(
    inspection_id: str,
    panel_type: str = Form("Principal Display Panel"),
    file: UploadFile = File(...)
):
    inspection = get_inspection(inspection_id)
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
        
    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".bmp"]:
        raise HTTPException(status_code=400, detail="Unsupported image format. Please upload JPG, PNG or WebP.")
        
    panel_id = f"panel-{uuid.uuid4().hex[:6]}"
    filename = f"{inspection_id}_{panel_id}{ext}"
    orig_path = os.path.join(PANELS_DIR, filename)
    
    # Save original image
    with open(orig_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # OpenCV Preprocessing
    prep_filename = f"prep_{inspection_id}_{panel_id}.png"
    prep_path = os.path.join(PREP_DIR, prep_filename)
    try:
        prep_path, quality_report = preprocess_for_ocr(orig_path, prep_path)
    except Exception as e:
        quality_report = {"warnings": [f"Preprocessing notice: {str(e)}"]}
        
    # OCR Extraction
    try:
        ocr_result = extract_text_from_image(orig_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR Extraction encountered error: {str(e)}")
        
    # Extract declarations for this panel
    new_decls = extract_declarations(
        ocr_result["lines"],
        ocr_result["raw_text"],
        inspection.get("product_category", "General"),
        panel_id
    )
    
    # Merge declarations with existing declarations (prefer non-empty values)
    existing_decls = inspection.get("declarations", [])
    merged_decls_map = {d["field_key"]: d for d in existing_decls}
    for nd in new_decls:
        fk = nd["field_key"]
        if fk not in merged_decls_map or not merged_decls_map[fk].get("extracted_value"):
            merged_decls_map[fk] = nd
        elif nd.get("extracted_value"):
            # Update if higher confidence
            if nd.get("confidence", 0) > merged_decls_map[fk].get("confidence", 0):
                merged_decls_map[fk] = nd
                
    final_declarations = list(merged_decls_map.values())
    
    # Run Compliance Engine
    compliance_results = evaluate_compliance(final_declarations, inspection, quality_report)
    stats = compute_overall_status(compliance_results)
    
    # Panel model
    new_panel = {
        "id": panel_id,
        "inspection_id": inspection_id,
        "panel_type": panel_type,
        "original_filename": file.filename,
        "file_url": f"/uploads/panels/{filename}",
        "preprocessed_url": f"/uploads/preprocessed/{prep_filename}",
        "image_width": ocr_result["image_width"],
        "image_height": ocr_result["image_height"],
        "ocr_text": ocr_result["raw_text"],
        "ocr_confidence": ocr_result["confidence_avg"],
        "ocr_lines": ocr_result["lines"],
        "quality_warnings": quality_report.get("warnings", []),
        "created_at": datetime.now().isoformat()
    }
    
    panels = inspection.get("panels", [])
    panels.append(new_panel)
    
    inspection["panels"] = panels
    inspection["declarations"] = final_declarations
    inspection["compliance_results"] = compliance_results
    inspection.update(stats)
    
    save_inspection(inspection)
    return inspection

# -----------------------------------------------------------------------------
# 4. Load Sample Demonstration Label (for Evaluators)
# -----------------------------------------------------------------------------
@app.post("/api/inspections/{inspection_id}/panels/demo-load")
def load_demo_panel(
    inspection_id: str,
    demo_type: str = Query(..., description="rice, spread, or syrup")
):
    inspection = get_inspection(inspection_id)
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
        
    sample_file_map = {
        "rice": ("sample_rice_compliant.png", "Principal Display Panel & Statutory Grid"),
        "spread": ("sample_spread_violations.png", "Declarations & MRP Panel (Imported Confectionery)"),
        "syrup": ("sample_syrup_review.png", "Primary Bottle Label (Ayurvedic Medicine)")
    }
    
    if demo_type not in sample_file_map:
        raise HTTPException(status_code=400, detail="Invalid demo type. Choose 'rice', 'spread', or 'syrup'.")
        
    s_file, p_type = sample_file_map[demo_type]
    s_path = os.path.join(BASE_DIR, "uploads", "sample_labels", s_file)
    if not os.path.exists(s_path):
        # Regenerate
        from app.services.sample_generator import generate_sample_label_images
        generate_sample_label_images(os.path.join(BASE_DIR, "uploads", "sample_labels"))
        
    panel_id = f"panel-demo-{uuid.uuid4().hex[:4]}"
    copy_filename = f"{inspection_id}_{panel_id}_{s_file}"
    dest_path = os.path.join(PANELS_DIR, copy_filename)
    shutil.copyfile(s_path, dest_path)
    
    # Preprocess
    prep_filename = f"prep_{copy_filename}"
    prep_path = os.path.join(PREP_DIR, prep_filename)
    prep_path, quality_report = preprocess_for_ocr(dest_path, prep_path)
    
    # OCR
    ocr_result = extract_text_from_image(dest_path)
    
    # Extract declarations
    new_decls = extract_declarations(
        ocr_result["lines"],
        ocr_result["raw_text"],
        inspection.get("product_category", "Food"),
        panel_id
    )
    
    compliance_results = evaluate_compliance(new_decls, inspection, quality_report)
    stats = compute_overall_status(compliance_results)
    
    panel_data = {
        "id": panel_id,
        "inspection_id": inspection_id,
        "panel_type": p_type,
        "original_filename": s_file,
        "file_url": f"/uploads/panels/{copy_filename}",
        "preprocessed_url": f"/uploads/preprocessed/{prep_filename}",
        "image_width": ocr_result["image_width"],
        "image_height": ocr_result["image_height"],
        "ocr_text": ocr_result["raw_text"],
        "ocr_confidence": ocr_result["confidence_avg"],
        "ocr_lines": ocr_result["lines"],
        "quality_warnings": quality_report.get("warnings", []),
        "created_at": datetime.now().isoformat()
    }
    
    panels = inspection.get("panels", [])
    panels.append(panel_data)
    
    inspection["panels"] = panels
    inspection["declarations"] = new_decls
    inspection["compliance_results"] = compliance_results
    inspection.update(stats)
    
    save_inspection(inspection)
    return inspection

# -----------------------------------------------------------------------------
# 5. Remove Panel
# -----------------------------------------------------------------------------
@app.delete("/api/inspections/{inspection_id}/panels/{panel_id}")
def remove_panel(inspection_id: str, panel_id: str):
    inspection = get_inspection(inspection_id)
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
        
    panels = [p for p in inspection.get("panels", []) if p["id"] != panel_id]
    inspection["panels"] = panels
    
    # If no panels left, clear declarations
    if not panels:
        inspection["declarations"] = []
        inspection["compliance_results"] = []
        inspection["overall_status"] = "IN_PROGRESS"
        inspection["total_checks"] = 0
        inspection["passed_checks"] = 0
        inspection["violation_checks"] = 0
        inspection["review_checks"] = 0
        inspection["na_checks"] = 0
    else:
        # Re-evaluate
        comp = evaluate_compliance(inspection.get("declarations", []), inspection)
        stats = compute_overall_status(comp)
        inspection["compliance_results"] = comp
        inspection.update(stats)
        
    save_inspection(inspection)
    return inspection

# -----------------------------------------------------------------------------
# 6. Inspector Declaration Corrections
# -----------------------------------------------------------------------------
@app.put("/api/inspections/{inspection_id}/declarations")
def update_declaration(inspection_id: str, update: DeclarationUpdate):
    inspection = get_inspection(inspection_id)
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
        
    decls = inspection.get("declarations", [])
    found = False
    for d in decls:
        if d["field_key"] == update.field_key:
            d["corrected_value"] = update.corrected_value
            d["is_missing"] = not bool(update.corrected_value.strip())
            d["notes"] = update.inspector_notes or d.get("notes")
            found = True
            break
            
    if not found:
        # Add new declaration entry if not already present
        decls.append({
            "id": f"decl-custom-{uuid.uuid4().hex[:4]}",
            "field_key": update.field_key,
            "label": update.field_key.replace("_", " ").title(),
            "legal_rule_ref": "Legal Metrology Rules 2011",
            "extracted_value": "",
            "corrected_value": update.corrected_value,
            "confidence": 100.0,
            "evidence_panel_id": None,
            "evidence_bbox": None,
            "is_applicable": True,
            "is_missing": not bool(update.corrected_value.strip()),
            "notes": update.inspector_notes
        })
        
    # Re-evaluate compliance based on corrections
    comp = evaluate_compliance(decls, inspection)
    stats = compute_overall_status(comp)
    
    inspection["declarations"] = decls
    inspection["compliance_results"] = comp
    inspection.update(stats)
    
    save_inspection(inspection)
    return inspection

# -----------------------------------------------------------------------------
# 7. Compliance Verification Decisions (Confirm / Reject / Further Review)
# -----------------------------------------------------------------------------
@app.put("/api/inspections/{inspection_id}/compliance/verify")
def verify_compliance_finding(inspection_id: str, update: ComplianceVerificationUpdate):
    inspection = get_inspection(inspection_id)
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
        
    comp_results = inspection.get("compliance_results", [])
    for r in comp_results:
        if r["rule_id"] == update.rule_id:
            r["verification_status"] = update.verification_status
            r["inspector_remarks"] = update.inspector_remarks or ""
            break
            
    inspection["compliance_results"] = comp_results
    save_inspection(inspection)
    return inspection

# -----------------------------------------------------------------------------
# 8. Inspection Report Generation (PDF) & Preview
# -----------------------------------------------------------------------------
@app.post("/api/inspections/{inspection_id}/reports/generate")
def generate_report(inspection_id: str, req: ReportGenerateRequest):
    inspection = get_inspection(inspection_id)
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
        
    curr_version = inspection.get("report_version", 0) + 1
    report_id = f"REP-{inspection_id}-V{curr_version}"
    pdf_filename = f"Report_{inspection_id}_V{curr_version}.pdf"
    pdf_path = os.path.join(REPORTS_DIR, pdf_filename)
    pdf_url = f"/uploads/reports/{pdf_filename}"
    
    remarks_data = {
        "inspector_remarks": req.inspector_remarks or inspection.get("inspector_remarks"),
        "conclusion": req.conclusion or inspection.get("conclusion"),
        "signoff_name": req.signoff_name or inspection.get("inspector_name"),
        "signoff_date": req.signoff_date or datetime.now().strftime("%Y-%m-%d")
    }
    
    inspection["report_generated"] = True
    inspection["latest_report_id"] = report_id
    inspection["latest_report_url"] = pdf_url
    inspection["report_version"] = curr_version
    inspection["report_generated_at"] = datetime.now().isoformat()
    inspection["inspector_remarks"] = remarks_data["inspector_remarks"]
    inspection["conclusion"] = remarks_data["conclusion"]
    inspection["signoff_name"] = remarks_data["signoff_name"]
    inspection["signoff_date"] = remarks_data["signoff_date"]
    
    # Generate PDF with actual saved data
    generate_inspection_pdf(inspection, pdf_path, remarks_data)
    
    # Save version record
    save_report_record(
        inspection_id=inspection_id,
        report_number=inspection_id,
        version=curr_version,
        pdf_path=pdf_path,
        pdf_url=pdf_url,
        inspector_remarks=remarks_data["inspector_remarks"] or "",
        conclusion=remarks_data["conclusion"] or "",
        signoff_name=remarks_data["signoff_name"] or "",
        signoff_date=remarks_data["signoff_date"] or ""
    )
    
    save_inspection(inspection)
    return {
        "status": "success",
        "report_id": report_id,
        "version": curr_version,
        "pdf_url": pdf_url,
        "inspection": inspection
    }

@app.get("/api/inspections/{inspection_id}/reports/pdf")
def download_report_pdf(inspection_id: str, version: Optional[int] = None):
    inspection = get_inspection(inspection_id)
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
        
    v = version or inspection.get("report_version", 1)
    pdf_filename = f"Report_{inspection_id}_V{v}.pdf"
    pdf_path = os.path.join(REPORTS_DIR, pdf_filename)
    
    if not os.path.exists(pdf_path):
        # Generate on the fly
        generate_inspection_pdf(inspection, pdf_path)
        
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=f"LabelLens_{inspection_id}_Report.pdf"
    )
