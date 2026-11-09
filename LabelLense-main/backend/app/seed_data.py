"""
Database Seeder for LabelLens Demonstration.
Populates realistic sample inspections with real OCR runs, compliance evaluations,
and generated PDF inspection reports.
"""
import os
import shutil
from datetime import datetime
from app.database import save_inspection, get_inspection, save_report_record
from app.services.sample_generator import generate_sample_label_images
from app.services.image_processor import preprocess_for_ocr, assess_image_quality
from app.services.ocr_engine import extract_text_from_image
from app.services.declaration_extractor import extract_declarations
from app.services.compliance_engine import evaluate_compliance, compute_overall_status
from app.services.pdf_generator import generate_inspection_pdf

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
SAMPLES_DIR = os.path.join(UPLOADS_DIR, "sample_labels")
REPORTS_DIR = os.path.join(UPLOADS_DIR, "reports")

def seed_database_if_empty():
    """
    Seeds 3 distinct, realistic sample inspections into the database if not present.
    """
    os.makedirs(SAMPLES_DIR, exist_ok=True)
    os.makedirs(REPORTS_DIR, exist_ok=True)
    
    # 1. Generate label images
    sample_paths = generate_sample_label_images(SAMPLES_DIR)
    
    # Sample 1: Compliant Basmati Rice
    id1 = "LG-2026-0101"
    if not get_inspection(id1):
        print("Seeding Sample 1: Royal Heritage Basmati Rice (Compliant)...")
        img1_orig = sample_paths["sample_rice"]
        img1_prep = os.path.join(UPLOADS_DIR, "prep_rice_0101.png")
        preprocess_for_ocr(img1_orig, img1_prep)
        
        ocr_res = extract_text_from_image(img1_orig)
        quality = assess_image_quality(img1_orig) if hasattr(img1_orig, 'shape') else {"is_blurry": False, "warnings": []}
        
        product_info = {
            "product_name": "Royal Heritage Basmati Rice",
            "brand": "Royal Heritage",
            "product_category": "Packaged Food Grain",
            "product_type": "Retail Consumer Pack",
            "manufacturer_details": "Heritage Agro Foods Pvt. Ltd., Plot No. 42-45, Phase III, Food Park Industrial Estate, Sonipat, Haryana - 131001, India",
            "importer_details": "",
            "batch_lot_number": "RH-B24-8902",
            "shop_name": "Modern Hypermarket & Departmental Stores",
            "shop_address": "Shop 14-16, Sector 29 Commercial Complex, Gurugram, Haryana - 122001",
            "district": "Gurugram",
            "state": "Haryana",
            "inspection_date": "2026-10-22",
            "inspector_name": "Rajesh Kumar Sharma",
            "inspector_id": "LM-INSP-HR-048",
            "inspection_notes": "Routine scheduled market surveillance under Legal Metrology Act, 2009."
        }
        
        panel_id = "panel-0101-1"
        decls = extract_declarations(ocr_res["lines"], ocr_res["raw_text"], "Packaged Food Grain", panel_id)
        comp_results = evaluate_compliance(decls, product_info, quality)
        stats = compute_overall_status(comp_results)
        
        panel_data = {
            "id": panel_id,
            "inspection_id": id1,
            "panel_type": "Principal Display Panel & Statutory Declarations",
            "original_filename": "sample_rice_compliant.png",
            "file_url": "/uploads/sample_labels/sample_rice_compliant.png",
            "preprocessed_url": "/uploads/prep_rice_0101.png",
            "image_width": ocr_res["image_width"],
            "image_height": ocr_res["image_height"],
            "ocr_text": ocr_res["raw_text"],
            "ocr_confidence": ocr_res["confidence_avg"],
            "ocr_lines": ocr_res["lines"],
            "quality_warnings": quality.get("warnings", []),
            "created_at": "2026-10-22T10:30:00"
        }
        
        insp_record = {
            "id": id1,
            **product_info,
            **stats,
            "panels": [panel_data],
            "declarations": decls,
            "compliance_results": comp_results,
            "report_generated": True,
            "latest_report_id": f"REP-{id1}-V1",
            "latest_report_url": f"/uploads/reports/Report_{id1}_V1.pdf",
            "report_version": 1,
            "report_generated_at": "2026-10-22T11:15:00",
            "inspector_remarks": "All statutory declarations verified against Physical Package. Legibility and contrast standards met under Rule 9.",
            "conclusion": "The pre-packaged commodity complies with Legal Metrology (Packaged Commodities) Rules, 2011.",
            "signoff_name": "Rajesh Kumar Sharma",
            "signoff_date": "2026-10-22",
            "created_at": "2026-10-22T10:15:00"
        }
        
        # Generate the PDF
        pdf_path = os.path.join(REPORTS_DIR, f"Report_{id1}_V1.pdf")
        generate_inspection_pdf(insp_record, pdf_path)
        save_report_record(id1, id1, 1, pdf_path, f"/uploads/reports/Report_{id1}_V1.pdf", insp_record["inspector_remarks"], insp_record["conclusion"], insp_record["signoff_name"], insp_record["signoff_date"])
        save_inspection(insp_record)
        print("Sample 1 seeded successfully.")

    # Sample 2: Hazelnut Cocoa Spread (POTENTIAL VIOLATIONS)
    id2 = "LG-2026-0102"
    if not get_inspection(id2):
        print("Seeding Sample 2: AlpsDelight Spread (Potential Violations)...")
        img2_orig = sample_paths["sample_spread"]
        img2_prep = os.path.join(UPLOADS_DIR, "prep_spread_0102.png")
        preprocess_for_ocr(img2_orig, img2_prep)
        
        ocr_res2 = extract_text_from_image(img2_orig)
        quality2 = {"is_blurry": False, "warnings": []}
        
        product_info2 = {
            "product_name": "AlpsDelight Gourmet Hazelnut Cocoa Spread",
            "brand": "AlpsDelight",
            "product_category": "Packaged Confectionery",
            "product_type": "Imported Pre-Packaged Good",
            "manufacturer_details": "Confectionery Alps S.p.A., Torino, Italy",
            "importer_details": "Continental Gourmet Imports Ltd., Building 12, Export Zone, Andheri East, Mumbai, Maharashtra - 400069",
            "batch_lot_number": "AD-ITA-9921",
            "shop_name": "Gourmet Avenue Delicatessen",
            "shop_address": "Shop 4, Linking Road, Bandra West, Mumbai, Maharashtra - 400050",
            "district": "Mumbai Suburban",
            "state": "Maharashtra",
            "inspection_date": "2026-10-23",
            "inspector_name": "Pooja V. Patil",
            "inspector_id": "LM-INSP-MH-112",
            "inspection_notes": "Spot check on imported confectionery commodities based on consumer grievance."
        }
        
        panel_id2 = "panel-0102-1"
        decls2 = extract_declarations(ocr_res2["lines"], ocr_res2["raw_text"], "Packaged Confectionery", panel_id2)
        comp_results2 = evaluate_compliance(decls2, product_info2, quality2)
        
        # Simulate inspector confirming the violations
        for r in comp_results2:
            if r["status"] == "POTENTIAL_VIOLATION":
                r["verification_status"] = "CONFIRMED"
                r["inspector_remarks"] = "Confirmed violation upon physical package examination by inspecting officer."
                
        stats2 = compute_overall_status(comp_results2)
        
        panel_data2 = {
            "id": panel_id2,
            "inspection_id": id2,
            "panel_type": "Declarations & MRP Panel",
            "original_filename": "sample_spread_violations.png",
            "file_url": "/uploads/sample_labels/sample_spread_violations.png",
            "preprocessed_url": "/uploads/prep_spread_0102.png",
            "image_width": ocr_res2["image_width"],
            "image_height": ocr_res2["image_height"],
            "ocr_text": ocr_res2["raw_text"],
            "ocr_confidence": ocr_res2["confidence_avg"],
            "ocr_lines": ocr_res2["lines"],
            "quality_warnings": quality2.get("warnings", []),
            "created_at": "2026-10-23T14:10:00"
        }
        
        insp_record2 = {
            "id": id2,
            **product_info2,
            **stats2,
            "panels": [panel_data2],
            "declarations": decls2,
            "compliance_results": comp_results2,
            "report_generated": True,
            "latest_report_id": f"REP-{id2}-V1",
            "latest_report_url": f"/uploads/reports/Report_{id2}_V1.pdf",
            "report_version": 1,
            "report_generated_at": "2026-10-23T15:20:00",
            "inspector_remarks": "Physical verification confirmed: 1. Illegal unit symbol 'gms' used instead of 'g'. 2. Missing mandatory tax wording 'incl. of all taxes'. 3. Country of Origin omitted on imported commodity.",
            "conclusion": "Packaged commodity is in prima facie violation of Rule 6(1)(e), Rule 6(10), and Rule 12 & 13 of Legal Metrology (Packaged Commodities) Rules, 2011. Notice under Section 36(1) recommended.",
            "signoff_name": "Pooja V. Patil",
            "signoff_date": "2026-10-23",
            "created_at": "2026-10-23T14:00:00"
        }
        
        pdf_path2 = os.path.join(REPORTS_DIR, f"Report_{id2}_V1.pdf")
        generate_inspection_pdf(insp_record2, pdf_path2)
        save_report_record(id2, id2, 1, pdf_path2, f"/uploads/reports/Report_{id2}_V1.pdf", insp_record2["inspector_remarks"], insp_record2["conclusion"], insp_record2["signoff_name"], insp_record2["signoff_date"])
        save_inspection(insp_record2)
        print("Sample 2 seeded successfully.")

    # Sample 3: Herbal Cough Syrup (NEEDS REVIEW)
    id3 = "LG-2026-0103"
    if not get_inspection(id3):
        print("Seeding Sample 3: Herbal Cough Syrup (Needs Review)...")
        img3_orig = sample_paths["sample_syrup"]
        img3_prep = os.path.join(UPLOADS_DIR, "prep_syrup_0103.png")
        preprocess_for_ocr(img3_orig, img3_prep)
        
        ocr_res3 = extract_text_from_image(img3_orig)
        quality3 = {"is_blurry": False, "warnings": ["Moderate sharpness: Batch number area partially faded"]}
        
        product_info3 = {
            "product_name": "Breathe-Easy Herbal Cough Relief Syrup",
            "brand": "AyurVeda",
            "product_category": "Ayurvedic Medicine / Liquid Formulation",
            "product_type": "Glass Bottle 100ml",
            "manufacturer_details": "AyurVeda Pharmaceuticals India Limited, Plot 88, Herbal Valley, Solan, Himachal Pradesh - 173212",
            "importer_details": "",
            "batch_lot_number": "BY-0284",
            "shop_name": "Sanjeevani Medicos & Wellness Store",
            "shop_address": "Shop 12, Main Market, Solan, Himachal Pradesh - 173212",
            "district": "Solan",
            "state": "Himachal Pradesh",
            "inspection_date": "2026-10-24",
            "inspector_name": "Anil Verma",
            "inspector_id": "LM-INSP-HP-019",
            "inspection_notes": "Sample drawn for verification of date stamping clarity."
        }
        
        panel_id3 = "panel-0103-1"
        decls3 = extract_declarations(ocr_res3["lines"], ocr_res3["raw_text"], "Ayurvedic Medicine", panel_id3)
        comp_results3 = evaluate_compliance(decls3, product_info3, quality3)
        stats3 = compute_overall_status(comp_results3)
        
        panel_data3 = {
            "id": panel_id3,
            "inspection_id": id3,
            "panel_type": "Primary Bottle Label",
            "original_filename": "sample_syrup_review.png",
            "file_url": "/uploads/sample_labels/sample_syrup_review.png",
            "preprocessed_url": "/uploads/prep_syrup_0103.png",
            "image_width": ocr_res3["image_width"],
            "image_height": ocr_res3["image_height"],
            "ocr_text": ocr_res3["raw_text"],
            "ocr_confidence": ocr_res3["confidence_avg"],
            "ocr_lines": ocr_res3["lines"],
            "quality_warnings": quality3.get("warnings", []),
            "created_at": "2026-10-24T09:15:00"
        }
        
        insp_record3 = {
            "id": id3,
            **product_info3,
            **stats3,
            "panels": [panel_data3],
            "declarations": decls3,
            "compliance_results": comp_results3,
            "report_generated": False,
            "latest_report_id": None,
            "latest_report_url": None,
            "report_version": 0,
            "inspector_remarks": "Faded ink on batch stamp requires secondary magnification and verification with manufacturer invoice.",
            "conclusion": "Inspection pending secondary verification.",
            "signoff_name": "Anil Verma",
            "signoff_date": "2026-10-24",
            "created_at": "2026-10-24T09:00:00"
        }
        save_inspection(insp_record3)
        print("Sample 3 seeded successfully.")
