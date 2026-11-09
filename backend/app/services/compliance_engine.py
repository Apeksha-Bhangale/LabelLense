"""
Modular, Deterministic Legal Metrology Compliance Rule Engine for LabelLens.
Implements statutory checks under Legal Metrology (Packaged Commodities) Rules, 2011
(with amendments up to 2024).

All rules store rule references, statutory requirements, observed values,
evidence linkages, bounding boxes, and inspector verification statuses.
Demonstration rules are explicitly tagged.
"""
import re
from typing import List, Dict, Any, Optional

RULE_VERSION = "Legal Metrology (Packaged Commodities) Rules, 2011 (as amended 2024)"

def evaluate_compliance(
    declarations: List[Dict[str, Any]],
    product_info: Dict[str, Any],
    image_quality: Optional[Dict[str, Any]] = None
) -> List[Dict[str, Any]]:
    """
    Evaluates statutory compliance rules deterministically.
    Takes the structured declarations map, product metadata, and image quality metrics.
    Returns a comprehensive list of rule-by-rule findings.
    """
    # Create lookup map for easy field access
    decl_map: Dict[str, Dict[str, Any]] = {
        d["field_key"]: d for d in declarations
    }
    
    results: List[Dict[str, Any]] = []
    
    # -------------------------------------------------------------------------
    # RULE 1: Rule 6(1)(a) - Name & Complete Address of Manufacturer / Packer
    # -------------------------------------------------------------------------
    decl_mfg = decl_map.get("mfg_packer_address", {})
    val_mfg = (decl_mfg.get("corrected_value") or decl_mfg.get("extracted_value") or "").strip()
    
    if not val_mfg:
        status = "POTENTIAL_VIOLATION"
        explanation = "Manufacturer or Packer name and address was not detected on the scanned package panel. Rule 6(1)(a) mandates complete physical identity on all pre-packaged commodities."
    else:
        # Check if address contains postal code / city / locality
        has_pin = bool(re.search(r"\b[1-9][0-9]{5}\b", val_mfg))
        has_locality = bool(re.search(r"(road|street|nagar|plot|phase|sector|estate|city|district|dist|village|p\.o\.|po|pin|state|india)", val_mfg, re.IGNORECASE))
        if has_pin or has_locality:
            status = "PASS"
            explanation = "Complete name and address of manufacturer/packer identified with valid postal and locality identifiers."
        else:
            status = "NEEDS_REVIEW"
            explanation = "Manufacturer name observed, but complete physical address or postal PIN code could not be definitively verified. Physical verification required."
            
    results.append({
        "rule_id": "LMR-2011-R6-1-A",
        "rule_code": "Rule 6(1)(a)",
        "legal_reference": "Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6(1)(a)",
        "rule_version": RULE_VERSION,
        "declaration_key": "mfg_packer_address",
        "title": "Manufacturer, Packer, or Importer Identity & Address",
        "requirement": "Every package shall bear the name and complete address of the manufacturer, or packer, or importer.",
        "observed_value": val_mfg if val_mfg else "Not detected in scanned evidence",
        "status": status,
        "explanation": explanation,
        "evidence_text": val_mfg,
        "evidence_panel_id": decl_mfg.get("evidence_panel_id"),
        "evidence_bbox": decl_mfg.get("evidence_bbox"),
        "ocr_confidence": decl_mfg.get("confidence"),
        "verification_status": "UNVERIFIED",
        "inspector_remarks": "",
        "is_demo_rule": False
    })
    
    # -------------------------------------------------------------------------
    # RULE 2: Rule 6(1)(b) - Common or Generic Product Name
    # -------------------------------------------------------------------------
    decl_gen = decl_map.get("generic_name", {})
    val_gen = (decl_gen.get("corrected_value") or decl_gen.get("extracted_value") or "").strip()
    prod_name = (product_info.get("product_name") or "").strip()
    
    if val_gen:
        status = "PASS"
        explanation = f"Generic or common name observed: '{val_gen}'. Clearly distinguishes commodity type on package."
    elif prod_name:
        status = "NEEDS_REVIEW"
        explanation = f"Common name entered in product info ('{prod_name}'), but could not be definitively isolated from OCR text. Inspector verification requested."
    else:
        status = "POTENTIAL_VIOLATION"
        explanation = "Common or generic name of commodity is missing from the package declarations. Rule 6(1)(b) requires plain naming."
        
    results.append({
        "rule_id": "LMR-2011-R6-1-B",
        "rule_code": "Rule 6(1)(b)",
        "legal_reference": "Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6(1)(b)",
        "rule_version": RULE_VERSION,
        "declaration_key": "generic_name",
        "title": "Common or Generic Name of Commodity",
        "requirement": "The common or generic names of the commodity contained in the package shall be legibly declared.",
        "observed_value": val_gen if val_gen else "Not detected in scanned evidence",
        "status": status,
        "explanation": explanation,
        "evidence_text": val_gen,
        "evidence_panel_id": decl_gen.get("evidence_panel_id"),
        "evidence_bbox": decl_gen.get("evidence_bbox"),
        "ocr_confidence": decl_gen.get("confidence"),
        "verification_status": "UNVERIFIED",
        "inspector_remarks": "",
        "is_demo_rule": False
    })
    
    # -------------------------------------------------------------------------
    # RULE 3: Rule 6(1)(c) & Rule 12-13 - Net Quantity & Standard Unit of Measure
    # -------------------------------------------------------------------------
    decl_qty = decl_map.get("net_quantity", {})
    val_qty = (decl_qty.get("corrected_value") or decl_qty.get("extracted_value") or "").strip()
    
    # Illegal non-standard unit symbols prohibited by Rule 12 & Rule 13
    illegal_units = [r"\bgms\b", r"\bgm\b", r"\bgrams\b", r"\bkilos\b", r"\bltrs\b", r"\bltr\b", r"\bm\.l\.\b"]
    has_illegal_unit = any(re.search(pat, val_qty, re.IGNORECASE) for pat in illegal_units)
    
    if not val_qty:
        status = "POTENTIAL_VIOLATION"
        explanation = "Net quantity declaration was not found on the scanned package. Net weight, volume, or count is mandatory under Rule 6(1)(c)."
    elif has_illegal_unit:
        status = "POTENTIAL_VIOLATION"
        explanation = f"Non-standard metric unit symbol detected in '{val_qty}'. Under Rule 12 and Rule 13, legal symbols are strictly 'g', 'kg', 'ml', 'L'. Unapproved abbreviations like 'gms' or 'ltrs' are statutory violations."
    else:
        # Check standard units
        if re.search(r"\b(\d+(?:\.\d+)?)\s*(g|kg|ml|mL|l|L|mg|piece|pieces|count|N|U)\b", val_qty, re.IGNORECASE):
            status = "PASS"
            explanation = f"Valid standard metric quantity declared: '{val_qty}' conforming to Rule 12 & Rule 13 standard SI unit symbols."
        else:
            status = "NEEDS_REVIEW"
            explanation = f"Quantity text '{val_qty}' was detected but unit formatting is ambiguous. Inspector verification recommended."
            
    results.append({
        "rule_id": "LMR-2011-R6-1-C",
        "rule_code": "Rule 6(1)(c) & Rule 12/13",
        "legal_reference": "Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6(1)(c), Rule 12 & Rule 13",
        "rule_version": RULE_VERSION,
        "declaration_key": "net_quantity",
        "title": "Net Quantity and Standard Unit of Measure",
        "requirement": "Net quantity shall be stated in standard units of weight, measure or number using prescribed SI symbols (g, kg, ml, L, N). Non-standard abbreviations are prohibited.",
        "observed_value": val_qty if val_qty else "Not detected in scanned evidence",
        "status": status,
        "explanation": explanation,
        "evidence_text": val_qty,
        "evidence_panel_id": decl_qty.get("evidence_panel_id"),
        "evidence_bbox": decl_qty.get("evidence_bbox"),
        "ocr_confidence": decl_qty.get("confidence"),
        "verification_status": "UNVERIFIED",
        "inspector_remarks": "",
        "is_demo_rule": False
    })
    
    # -------------------------------------------------------------------------
    # RULE 4: Rule 6(1)(e) - Maximum Retail Price (MRP) & Mandatory Tax Wording
    # -------------------------------------------------------------------------
    decl_mrp = decl_map.get("mrp", {})
    val_mrp = (decl_mrp.get("corrected_value") or decl_mrp.get("extracted_value") or "").strip()
    
    # Check for tax wording: "incl. of all taxes" or "inclusive of all taxes"
    tax_wording_present = bool(re.search(r"(incl|inclusive)\.?\s*(?:of)?\s*all\s*taxes", val_mrp, re.IGNORECASE))
    mrp_number_present = bool(re.search(r"(?:rs\.?|₹|\b)\s*\d+(\.\d{1,2})?", val_mrp, re.IGNORECASE))
    
    if not val_mrp:
        status = "POTENTIAL_VIOLATION"
        explanation = "Maximum Retail Price (MRP) declaration was not detected on the scanned package. Mandatory under Rule 6(1)(e)."
    elif not tax_wording_present:
        status = "POTENTIAL_VIOLATION"
        explanation = f"Observed MRP '{val_mrp}' lacks the mandatory statutory phrase 'inclusive of all taxes' or 'incl. of all taxes' required under Rule 6(1)(e)."
    elif not mrp_number_present:
        status = "NEEDS_REVIEW"
        explanation = "MRP label detected but numerical price value could not be clearly resolved from OCR. Inspector manual confirmation needed."
    else:
        status = "PASS"
        explanation = f"Statutory MRP format verified: '{val_mrp}', including mandatory tax inclusion wording."
        
    results.append({
        "rule_id": "LMR-2011-R6-1-E",
        "rule_code": "Rule 6(1)(e)",
        "legal_reference": "Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6(1)(e)",
        "rule_version": RULE_VERSION,
        "declaration_key": "mrp",
        "title": "Maximum Retail Price (MRP) & Tax Declaration",
        "requirement": "Maximum retail price shall be clearly indicated along with the mandatory phrase 'inclusive of all taxes' or 'incl. of all taxes'.",
        "observed_value": val_mrp if val_mrp else "Not detected in scanned evidence",
        "status": status,
        "explanation": explanation,
        "evidence_text": val_mrp,
        "evidence_panel_id": decl_mrp.get("evidence_panel_id"),
        "evidence_bbox": decl_mrp.get("evidence_bbox"),
        "ocr_confidence": decl_mrp.get("confidence"),
        "verification_status": "UNVERIFIED",
        "inspector_remarks": "",
        "is_demo_rule": False
    })
    
    # -------------------------------------------------------------------------
    # RULE 5: Rule 6(11) - Unit Sale Price (USP)
    # -------------------------------------------------------------------------
    decl_usp = decl_map.get("unit_sale_price", {})
    val_usp = (decl_usp.get("corrected_value") or decl_usp.get("extracted_value") or "").strip()
    
    if val_usp:
        status = "PASS"
        explanation = f"Unit Sale Price declared: '{val_usp}' in accordance with Rule 6(11)."
    else:
        # Check if product is multi-unit or bulk package (>100g / >100ml)
        if any(w in val_qty.lower() for w in ["kg", "500g", "250g", "200g", "1kg", "5kg", "l", "ltr", "500ml"]):
            status = "POTENTIAL_VIOLATION"
            explanation = "Unit Sale Price (USP) (e.g. ₹ per g / ₹ per 100g / ₹ per ml) was not detected on this pre-packaged retail commodity, as mandated under Rule 6(11) amendment."
        else:
            status = "NEEDS_REVIEW"
            explanation = "Unit Sale Price not detected. Verification needed to confirm whether package net quantity is exempt or requires USP declaration."
            
    results.append({
        "rule_id": "LMR-2011-R6-11",
        "rule_code": "Rule 6(11)",
        "legal_reference": "Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6(11) (2021/2022 Amendment)",
        "rule_version": RULE_VERSION,
        "declaration_key": "unit_sale_price",
        "title": "Unit Sale Price (USP) Indication",
        "requirement": "Unit sale price rounded off to nearest two decimal places shall be declared where net quantity is greater than 1 unit, 100g or 100ml.",
        "observed_value": val_usp if val_usp else "Not detected in scanned evidence",
        "status": status,
        "explanation": explanation,
        "evidence_text": val_usp,
        "evidence_panel_id": decl_usp.get("evidence_panel_id"),
        "evidence_bbox": decl_usp.get("evidence_bbox"),
        "ocr_confidence": decl_usp.get("confidence"),
        "verification_status": "UNVERIFIED",
        "inspector_remarks": "",
        "is_demo_rule": False
    })
    
    # -------------------------------------------------------------------------
    # RULE 6: Rule 6(1)(d) - Date of Manufacture / Packing / Import
    # -------------------------------------------------------------------------
    decl_date = decl_map.get("mfg_date", {})
    val_date = (decl_date.get("corrected_value") or decl_date.get("extracted_value") or "").strip()
    
    if not val_date:
        status = "POTENTIAL_VIOLATION"
        explanation = "Month and year of manufacture or packing was not detected. Mandatory under Rule 6(1)(d)."
    else:
        # Check if month and year format is distinguishable
        has_date_format = bool(re.search(r"(?:0[1-9]|1[0-2])[\/\-\.](?:20\d\d|\d\d)|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)", val_date, re.IGNORECASE))
        if has_date_format:
            status = "PASS"
            explanation = f"Month and year of manufacture/packing observed: '{val_date}'."
        else:
            status = "NEEDS_REVIEW"
            explanation = f"Date indicator detected in '{val_date}', but month and year format is ambiguous. Inspector verification recommended."
            
    results.append({
        "rule_id": "LMR-2011-R6-1-D",
        "rule_code": "Rule 6(1)(d)",
        "legal_reference": "Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6(1)(d)",
        "rule_version": RULE_VERSION,
        "declaration_key": "mfg_date",
        "title": "Month and Year of Manufacture / Packing / Import",
        "requirement": "The month and year in which the commodity is manufactured or packed or imported shall be clearly indicated.",
        "observed_value": val_date if val_date else "Not detected in scanned evidence",
        "status": status,
        "explanation": explanation,
        "evidence_text": val_date,
        "evidence_panel_id": decl_date.get("evidence_panel_id"),
        "evidence_bbox": decl_date.get("evidence_bbox"),
        "ocr_confidence": decl_date.get("confidence"),
        "verification_status": "UNVERIFIED",
        "inspector_remarks": "",
        "is_demo_rule": False
    })
    
    # -------------------------------------------------------------------------
    # RULE 7: Rule 6(1)(f) - Consumer Care Details & Grievance Mechanism
    # -------------------------------------------------------------------------
    decl_care = decl_map.get("consumer_care", {})
    val_care = (decl_care.get("corrected_value") or decl_care.get("extracted_value") or "").strip()
    
    has_email = bool(re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", val_care))
    has_phone = bool(re.search(r"(?:1800[- ]?\d{3}[- ]?\d{3,4}|\+?91[- ]?[6-9]\d{9}|\b\d{10}\b)", val_care))
    
    if not val_care:
        status = "POTENTIAL_VIOLATION"
        explanation = "Consumer care / grievance redressal mechanism details were not detected. Rule 6(1)(f) mandates name, address, phone number, and email of consumer care cell."
    elif has_email and has_phone:
        status = "PASS"
        explanation = f"Complete consumer grievance redressal mechanism declared with valid contact phone and email: '{val_care}'."
    elif has_phone and not has_email:
        status = "POTENTIAL_VIOLATION"
        explanation = f"Consumer telephone helpline detected, but statutory email address is missing from declarations. Under Rule 6(1)(f), both telephone and email are mandatory."
    elif has_email and not has_phone:
        status = "POTENTIAL_VIOLATION"
        explanation = f"Consumer email detected, but telephone number / toll-free helpline is missing. Both telephone and email are mandatory under Rule 6(1)(f)."
    else:
        status = "NEEDS_REVIEW"
        explanation = f"Consumer care reference detected ('{val_care}'), but contact specifics require inspector verification."
        
    results.append({
        "rule_id": "LMR-2011-R6-1-F",
        "rule_code": "Rule 6(1)(f)",
        "legal_reference": "Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6(1)(f)",
        "rule_version": RULE_VERSION,
        "declaration_key": "consumer_care",
        "title": "Consumer Care / Grievance Redressal Mechanism",
        "requirement": "Name, address, telephone number, and e-mail address of the person or office to be contacted in case of consumer complaints.",
        "observed_value": val_care if val_care else "Not detected in scanned evidence",
        "status": status,
        "explanation": explanation,
        "evidence_text": val_care,
        "evidence_panel_id": decl_care.get("evidence_panel_id"),
        "evidence_bbox": decl_care.get("evidence_bbox"),
        "ocr_confidence": decl_care.get("confidence"),
        "verification_status": "UNVERIFIED",
        "inspector_remarks": "",
        "is_demo_rule": False
    })
    
    # -------------------------------------------------------------------------
    # RULE 8: Rule 6(10) - Country of Origin (Imported / Foreign Goods)
    # -------------------------------------------------------------------------
    decl_origin = decl_map.get("country_of_origin", {})
    val_origin = (decl_origin.get("corrected_value") or decl_origin.get("extracted_value") or "").strip()
    is_imported = bool(product_info.get("importer_details")) or ("import" in (product_info.get("product_type") or "").lower())
    
    if is_imported:
        if val_origin:
            status = "PASS"
            explanation = f"Country of origin clearly stated on imported commodity: '{val_origin}'."
        else:
            status = "POTENTIAL_VIOLATION"
            explanation = "Package is designated as an imported commodity, but Country of Origin is missing. Rule 6(10) strictly mandates Country of Origin on imported commodities."
    else:
        if val_origin:
            status = "PASS"
            explanation = f"Country of origin declared: '{val_origin}'."
        else:
            # Domestic package where manufacturer address in India is declared
            status = "NOT_APPLICABLE"
            explanation = "Package is manufactured domestically in India with local manufacturer address; explicit separate Country of Origin tag not statutory mandatory if domestic origin is clear."
            
    results.append({
        "rule_id": "LMR-2011-R6-10",
        "rule_code": "Rule 6(10)",
        "legal_reference": "Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6(10)",
        "rule_version": RULE_VERSION,
        "declaration_key": "country_of_origin",
        "title": "Country of Origin (Imported Commodities)",
        "requirement": "Mandatory declaration of the name of country of origin or manufacture on imported packages.",
        "observed_value": val_origin if val_origin else ("Not declared" if is_imported else "Domestic / Not stated"),
        "status": status,
        "explanation": explanation,
        "evidence_text": val_origin,
        "evidence_panel_id": decl_origin.get("evidence_panel_id"),
        "evidence_bbox": decl_origin.get("evidence_bbox"),
        "ocr_confidence": decl_origin.get("confidence"),
        "verification_status": "UNVERIFIED",
        "inspector_remarks": "",
        "is_demo_rule": False
    })
    
    # -------------------------------------------------------------------------
    # RULE 9: Rule 9 - Legibility, Prominence and Contrast
    # -------------------------------------------------------------------------
    avg_conf = sum(d.get("confidence", 0) for d in declarations if d.get("confidence", 0) > 0)
    non_zero = len([d for d in declarations if d.get("confidence", 0) > 0])
    overall_conf = (avg_conf / non_zero) if non_zero else 0.0
    
    is_blurry = image_quality.get("is_blurry", False) if image_quality else False
    warnings = image_quality.get("warnings", []) if image_quality else []
    
    if is_blurry or overall_conf < 55.0:
        status = "NEEDS_REVIEW"
        explanation = f"Scanned package exhibited low visual contrast or sharpness (OCR legibility score: {overall_conf:.1f}%). Inspector visual verification is required under Rule 9."
    else:
        status = "PASS"
        explanation = f"Declarations satisfy legal legibility and contrast requirements (Legibility index: {overall_conf:.1f}%)."
        
    results.append({
        "rule_id": "LMR-2011-R9",
        "rule_code": "Rule 9",
        "legal_reference": "Legal Metrology (Packaged Commodities) Rules, 2011, Rule 9",
        "rule_version": RULE_VERSION,
        "declaration_key": "legibility",
        "title": "Legibility, Definiteness and Plain Display of Declarations",
        "requirement": "Every declaration shall be legible, definite, plain, conspicuous, and in contrasting color to the background.",
        "observed_value": f"Average OCR Readability: {overall_conf:.1f}%; {len(warnings)} quality notes",
        "status": status,
        "explanation": explanation,
        "evidence_text": "Image contrast and font prominence analysis",
        "evidence_panel_id": None,
        "evidence_bbox": None,
        "ocr_confidence": round(overall_conf, 1),
        "verification_status": "UNVERIFIED",
        "inspector_remarks": "",
        "is_demo_rule": False
    })
    
    return results

def compute_overall_status(compliance_results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes overall inspection status and check tallies.
    Rules:
    - If any POTENTIAL_VIOLATION exists -> POTENTIAL_VIOLATIONS
    - Else if any NEEDS_REVIEW exists -> NEEDS_REVIEW
    - Else if all PASS or NOT_APPLICABLE -> COMPLIANT
    """
    total = len(compliance_results)
    passed = sum(1 for r in compliance_results if r["status"] == "PASS")
    violations = sum(1 for r in compliance_results if r["status"] == "POTENTIAL_VIOLATION")
    reviews = sum(1 for r in compliance_results if r["status"] == "NEEDS_REVIEW")
    nas = sum(1 for r in compliance_results if r["status"] == "NOT_APPLICABLE")
    
    if violations > 0:
        overall = "POTENTIAL_VIOLATIONS"
    elif reviews > 0:
        overall = "NEEDS_REVIEW"
    else:
        overall = "COMPLIANT"
        
    return {
        "overall_status": overall,
        "total_checks": total,
        "passed_checks": passed,
        "violation_checks": violations,
        "review_checks": reviews,
        "na_checks": nas
    }
