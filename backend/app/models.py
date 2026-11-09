"""
Data models and schemas for LabelLens Legal Metrology Inspection System.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class VerificationStatusEnum:
    UNVERIFIED = "UNVERIFIED"
    CONFIRMED = "CONFIRMED"
    REJECTED = "REJECTED"
    FURTHER_REVIEW = "FURTHER_REVIEW"

class ComplianceStatusEnum:
    PASS = "PASS"
    POTENTIAL_VIOLATION = "POTENTIAL_VIOLATION"
    NEEDS_REVIEW = "NEEDS_REVIEW"
    NOT_APPLICABLE = "NOT_APPLICABLE"

class OverallStatusEnum:
    COMPLIANT = "COMPLIANT"
    POTENTIAL_VIOLATIONS = "POTENTIAL_VIOLATIONS"
    NEEDS_REVIEW = "NEEDS_REVIEW"
    IN_PROGRESS = "IN_PROGRESS"

# Product & Inspection Info
class InspectionCreate(BaseModel):
    # Product info
    product_name: str
    brand: str
    product_category: str = "Packaged Food"
    product_type: str = "Standard Package"
    manufacturer_details: Optional[str] = ""
    importer_details: Optional[str] = ""
    batch_lot_number: Optional[str] = ""
    
    # Inspection info
    shop_name: str
    shop_address: str
    district: str
    state: str
    inspection_date: Optional[str] = None
    inspector_name: str
    inspector_id: str
    inspection_notes: Optional[str] = ""

class PackagePanelCreate(BaseModel):
    panel_type: str = "Principal Display Panel"
    notes: Optional[str] = ""

class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float
    # Optional polygon coordinates or normalized coords
    polygon: Optional[List[List[float]]] = None

class OCRWord(BaseModel):
    text: str
    confidence: float
    bbox: BoundingBox

class OCRLine(BaseModel):
    text: str
    confidence: float
    bbox: BoundingBox
    words: List[OCRWord] = []

class OCRResult(BaseModel):
    raw_text: str
    confidence_avg: float
    lines: List[OCRLine] = []
    image_width: int
    image_height: int
    image_quality: Dict[str, Any] = {}
    preprocessed_image_url: Optional[str] = None

class DeclarationUpdate(BaseModel):
    field_key: str
    corrected_value: str
    inspector_notes: Optional[str] = ""

class ComplianceVerificationUpdate(BaseModel):
    rule_id: str
    verification_status: str # CONFIRMED, REJECTED, FURTHER_REVIEW
    inspector_remarks: Optional[str] = ""

class ReportGenerateRequest(BaseModel):
    inspector_remarks: Optional[str] = ""
    conclusion: Optional[str] = ""
    signoff_name: Optional[str] = None
    signoff_date: Optional[str] = None

class DeclarationItem(BaseModel):
    id: str
    field_key: str
    label: str
    legal_rule_ref: str
    extracted_value: str
    corrected_value: Optional[str] = None
    confidence: float
    evidence_panel_id: Optional[str] = None
    evidence_bbox: Optional[BoundingBox] = None
    is_applicable: bool = True
    is_missing: bool = False
    notes: Optional[str] = None

class ComplianceCheckResult(BaseModel):
    rule_id: str
    rule_code: str
    legal_reference: str
    rule_version: str = "Legal Metrology (Packaged Commodities) Rules, 2011 (as amended 2024)"
    declaration_key: str
    title: str
    requirement: str
    observed_value: str
    status: str # PASS, POTENTIAL_VIOLATION, NEEDS_REVIEW, NOT_APPLICABLE
    explanation: str
    evidence_text: Optional[str] = None
    evidence_panel_id: Optional[str] = None
    evidence_bbox: Optional[BoundingBox] = None
    ocr_confidence: Optional[float] = None
    verification_status: str = "UNVERIFIED" # UNVERIFIED, CONFIRMED, REJECTED, FURTHER_REVIEW
    inspector_remarks: Optional[str] = None
    is_demo_rule: bool = False

class PackagePanel(BaseModel):
    id: str
    inspection_id: str
    panel_type: str
    original_filename: str
    file_url: str
    preprocessed_url: Optional[str] = None
    image_width: int
    image_height: int
    ocr_text: Optional[str] = None
    ocr_confidence: Optional[float] = None
    ocr_lines: List[OCRLine] = []
    quality_warnings: List[str] = []
    created_at: str

class InspectionDetail(BaseModel):
    id: str
    product_name: str
    brand: str
    product_category: str
    product_type: str
    manufacturer_details: Optional[str] = ""
    importer_details: Optional[str] = ""
    batch_lot_number: Optional[str] = ""
    
    shop_name: str
    shop_address: str
    district: str
    state: str
    inspection_date: str
    inspector_name: str
    inspector_id: str
    inspection_notes: Optional[str] = ""
    
    overall_status: str # COMPLIANT, POTENTIAL_VIOLATIONS, NEEDS_REVIEW, IN_PROGRESS
    total_checks: int = 0
    passed_checks: int = 0
    violation_checks: int = 0
    review_checks: int = 0
    na_checks: int = 0
    
    panels: List[PackagePanel] = []
    declarations: List[DeclarationItem] = []
    compliance_results: List[ComplianceCheckResult] = []
    
    report_generated: bool = False
    latest_report_id: Optional[str] = None
    latest_report_url: Optional[str] = None
    report_version: int = 0
    report_generated_at: Optional[str] = None
    
    created_at: str
    updated_at: str

class InspectionSummary(BaseModel):
    id: str
    product_name: str
    brand: str
    product_category: str
    shop_name: str
    district: str
    state: str
    inspection_date: str
    overall_status: str
    total_checks: int
    violation_checks: int
    review_checks: int
    passed_checks: int
    report_generated: bool
    latest_report_id: Optional[str] = None
    created_at: str

class DashboardStats(BaseModel):
    total_inspections: int
    inspections_with_violations: int
    inspections_needing_review: int
    reports_generated: int
    compliant_inspections: int
    recent_inspections: List[InspectionSummary]
