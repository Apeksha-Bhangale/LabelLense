"""
Structured Declaration Extractor for Legal Metrology Packaged Commodities.
Analyzes OCR text and bounding boxes to extract statutory declarations under
Legal Metrology (Packaged Commodities) Rules, 2011.
"""
import re
from typing import Dict, Any, List, Optional

def extract_declarations(
    ocr_lines: List[Dict[str, Any]],
    raw_text: str,
    product_category: str = "Packaged Food",
    panel_id: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Parses OCR lines and raw text into structured Legal Metrology statutory declaration fields.
    Preserves evidence bounding boxes and OCR confidence scores.
    """
    declarations: List[Dict[str, Any]] = []
    
    # Pre-index lines for regex searches
    line_texts = [line["text"] for line in ocr_lines]
    
    # -------------------------------------------------------------------------
    # 1. Manufacturer / Packer / Importer Details - Rule 6(1)(a)
    # -------------------------------------------------------------------------
    mfg_value = ""
    mfg_bbox = None
    mfg_conf = 0.0
    mfg_evidence_text = ""
    
    mfg_pattern = re.compile(r"(mfg|manufactured|packed|marketed|pkg|importer|imported|mfd\sby|pkd\sby)\b", re.IGNORECASE)
    address_keywords = re.compile(r"(pvt|ltd|limited|plot|sector|phase|industrial|road|street|estate|nagar|village|taluk|dist|district|pin\s*code|pin|india)\b", re.IGNORECASE)
    pin_pattern = re.compile(r"\b[1-9][0-9]{5}\b")
    
    mfg_matching_lines = []
    for idx, line in enumerate(ocr_lines):
        txt = line["text"]
        if mfg_pattern.search(txt) or (address_keywords.search(txt) and pin_pattern.search(txt)):
            mfg_matching_lines.append(idx)
            # Collect consecutive address lines if any
            for next_idx in range(idx + 1, min(idx + 4, len(ocr_lines))):
                next_txt = ocr_lines[next_idx]["text"]
                if address_keywords.search(next_txt) or pin_pattern.search(next_txt):
                    if next_idx not in mfg_matching_lines:
                        mfg_matching_lines.append(next_idx)
                else:
                    break
                    
    if mfg_matching_lines:
        matched_lines = [ocr_lines[i] for i in mfg_matching_lines]
        mfg_value = " ".join(line["text"] for line in matched_lines)
        mfg_evidence_text = mfg_value
        mfg_bbox = matched_lines[0]["bbox"]
        mfg_conf = sum(l["confidence"] for l in matched_lines) / len(matched_lines)
    else:
        # Check raw text with pin code
        pin_match = pin_pattern.search(raw_text)
        if pin_match:
            # find surrounding text
            start = max(0, pin_match.start() - 100)
            end = min(len(raw_text), pin_match.end() + 20)
            mfg_value = raw_text[start:end].strip().replace("\n", " ")
            mfg_evidence_text = mfg_value
            mfg_conf = 65.0
            
    declarations.append({
        "id": "decl-mfg-address",
        "field_key": "mfg_packer_address",
        "label": "Manufacturer / Packer / Importer Name & Address",
        "legal_rule_ref": "Rule 6(1)(a)",
        "extracted_value": mfg_value.strip(),
        "corrected_value": mfg_value.strip(),
        "confidence": round(mfg_conf, 1) if mfg_value else 0.0,
        "evidence_panel_id": panel_id,
        "evidence_bbox": mfg_bbox,
        "is_applicable": True,
        "is_missing": not bool(mfg_value.strip()),
        "notes": "Name and complete physical address including postal PIN code"
    })
    
    # -------------------------------------------------------------------------
    # 2. Common or Generic Product Name - Rule 6(1)(b)
    # -------------------------------------------------------------------------
    generic_value = ""
    generic_bbox = None
    generic_conf = 0.0
    
    generic_prefix_pattern = re.compile(r"(generic\s*name|common\s*name|commodity|product\s*name|product)\s*[:\-]\s*(.+)", re.IGNORECASE)
    for line in ocr_lines:
        match = generic_prefix_pattern.search(line["text"])
        if match:
            generic_value = match.group(2).strip()
            generic_bbox = line["bbox"]
            generic_conf = line["confidence"]
            break
            
    if not generic_value and ocr_lines:
        # Fallback to the prominent first 2 lines
        for line in ocr_lines[:2]:
            t = line["text"].strip()
            if len(t) > 3 and not re.search(r"(mrp|rs|₹|net|qty|batch|mfg|exp)", t, re.IGNORECASE):
                generic_value = t
                generic_bbox = line["bbox"]
                generic_conf = line["confidence"]
                break
                
    declarations.append({
        "id": "decl-generic-name",
        "field_key": "generic_name",
        "label": "Common / Generic Name of Commodity",
        "legal_rule_ref": "Rule 6(1)(b)",
        "extracted_value": generic_value.strip(),
        "corrected_value": generic_value.strip(),
        "confidence": round(generic_conf, 1) if generic_value else 0.0,
        "evidence_panel_id": panel_id,
        "evidence_bbox": generic_bbox,
        "is_applicable": True,
        "is_missing": not bool(generic_value.strip()),
        "notes": "Must appear clearly on the Principal Display Panel"
    })
    
    # -------------------------------------------------------------------------
    # 3. Net Quantity & Standard Unit - Rule 6(1)(c)
    # -------------------------------------------------------------------------
    net_qty_value = ""
    net_qty_bbox = None
    net_qty_conf = 0.0
    
    # Regex for standard or non-standard quantity declarations
    qty_pattern = re.compile(
        r"(?:net\s*(?:qty|quantity|content|wt|weight)|quantity|contents)?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*(kg|kilos|kilogram|kilograms|g|gm|gms|gram|grams|mg|l|lt|ltr|ltrs|liter|litres|liters|ml|mL|m\.l\.|millilitres|piece|pieces|pcs|count|units|unit|N|U)\b",
        re.IGNORECASE
    )
    
    for line in ocr_lines:
        m = qty_pattern.search(line["text"])
        if m:
            net_qty_value = m.group(0).strip()
            net_qty_bbox = line["bbox"]
            net_qty_conf = line["confidence"]
            break
            
    declarations.append({
        "id": "decl-net-quantity",
        "field_key": "net_quantity",
        "label": "Net Quantity & Metric Unit",
        "legal_rule_ref": "Rule 6(1)(c) & Rule 12-13",
        "extracted_value": net_qty_value.strip(),
        "corrected_value": net_qty_value.strip(),
        "confidence": round(net_qty_conf, 1) if net_qty_value else 0.0,
        "evidence_panel_id": panel_id,
        "evidence_bbox": net_qty_bbox,
        "is_applicable": True,
        "is_missing": not bool(net_qty_value.strip()),
        "notes": "Metric units must be standard SI symbols (g, kg, ml, L, N). 'gms' or 'ltrs' are illegal non-standard units."
    })
    
    # -------------------------------------------------------------------------
    # 4. Maximum Retail Price (MRP) & Tax Declaration - Rule 6(1)(e)
    # -------------------------------------------------------------------------
    mrp_value = ""
    mrp_bbox = None
    mrp_conf = 0.0
    
    mrp_pattern = re.compile(
        r"(?:m\.?r\.?p\.?|maximum\s*retail\s*price|retail\s*price)\s*[:\-]?\s*(?:rs\.?|₹)?\s*(\d+(?:\.\d{1,2})?)(?:.*?((?:incl|inclusive)\.?\s*(?:of)?\s*all\s*taxes))?",
        re.IGNORECASE
    )
    
    # Also search for standalone MRP lines
    for line in ocr_lines:
        txt = line["text"]
        if re.search(r"\b(mrp|m\.r\.p|retail price)\b", txt, re.IGNORECASE):
            mrp_value = txt.strip()
            mrp_bbox = line["bbox"]
            mrp_conf = line["confidence"]
            # Check if taxes phrase is in next line
            curr_idx = ocr_lines.index(line)
            if curr_idx + 1 < len(ocr_lines):
                next_txt = ocr_lines[curr_idx + 1]["text"]
                if re.search(r"(incl|inclusive).*all\s*taxes", next_txt, re.IGNORECASE):
                    mrp_value += " " + next_txt.strip()
            break
            
    if not mrp_value:
        # Fallback currency search
        curr_match = re.search(r"(?:₹|Rs\.?)\s*(\d+(?:\.\d{1,2})?)", raw_text, re.IGNORECASE)
        if curr_match:
            mrp_value = curr_match.group(0).strip()
            mrp_conf = 70.0
            
    declarations.append({
        "id": "decl-mrp",
        "field_key": "mrp",
        "label": "Maximum Retail Price (MRP) & Tax Declaration",
        "legal_rule_ref": "Rule 6(1)(e)",
        "extracted_value": mrp_value.strip(),
        "corrected_value": mrp_value.strip(),
        "confidence": round(mrp_conf, 1) if mrp_value else 0.0,
        "evidence_panel_id": panel_id,
        "evidence_bbox": mrp_bbox,
        "is_applicable": True,
        "is_missing": not bool(mrp_value.strip()),
        "notes": "Must state Maximum Retail Price and mandatory wording 'inclusive of all taxes' or 'incl. of all taxes'"
    })
    
    # -------------------------------------------------------------------------
    # 5. Unit Sale Price (USP) - Rule 6(11) (Mandatory for retail pre-packaged goods)
    # -------------------------------------------------------------------------
    usp_value = ""
    usp_bbox = None
    usp_conf = 0.0
    
    usp_pattern = re.compile(
        r"(?:unit\s*sale\s*price|u\.?s\.?p\.?)\s*[:\-]?\s*(?:rs\.?|₹)?\s*(\d+(?:\.\d{1,2})?)\s*(?:per|\/)\s*([a-zA-Z0-9]+)",
        re.IGNORECASE
    )
    for line in ocr_lines:
        m = usp_pattern.search(line["text"])
        if m:
            usp_value = line["text"].strip()
            usp_bbox = line["bbox"]
            usp_conf = line["confidence"]
            break
            
    declarations.append({
        "id": "decl-usp",
        "field_key": "unit_sale_price",
        "label": "Unit Sale Price (USP)",
        "legal_rule_ref": "Rule 6(11) (2021/2022 Amendment)",
        "extracted_value": usp_value.strip(),
        "corrected_value": usp_value.strip(),
        "confidence": round(usp_conf, 1) if usp_value else 0.0,
        "evidence_panel_id": panel_id,
        "evidence_bbox": usp_bbox,
        "is_applicable": True,
        "is_missing": not bool(usp_value.strip()),
        "notes": "Mandatory on packages containing more than 1 unit/100g/100ml (e.g. ₹X per g or ₹X per 100ml)"
    })
    
    # -------------------------------------------------------------------------
    # 6. Date of Manufacture / Packing / Import - Rule 6(1)(d)
    # -------------------------------------------------------------------------
    mfg_date_value = ""
    mfg_date_bbox = None
    mfg_date_conf = 0.0
    
    date_header_pattern = re.compile(r"(mfg|mfd|date\s*of\s*mfg|pkd|packed|date\s*of\s*packing|import\s*date|mfg\s*date)\b", re.IGNORECASE)
    date_val_pattern = re.compile(r"(?:0[1-9]|1[0-2])[\/\-\.](?:20\d\d|\d\d)|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s\/\-\.]+(?:20\d\d|\d\d)", re.IGNORECASE)
    
    for line in ocr_lines:
        if date_header_pattern.search(line["text"]):
            mfg_date_value = line["text"].strip()
            mfg_date_bbox = line["bbox"]
            mfg_date_conf = line["confidence"]
            break
            
    if not mfg_date_value:
        # Search for standalone date in raw text
        d_match = date_val_pattern.search(raw_text)
        if d_match:
            mfg_date_value = d_match.group(0).strip()
            mfg_date_conf = 65.0
            
    declarations.append({
        "id": "decl-mfg-date",
        "field_key": "mfg_date",
        "label": "Month & Year of Manufacture / Packing / Import",
        "legal_rule_ref": "Rule 6(1)(d)",
        "extracted_value": mfg_date_value.strip(),
        "corrected_value": mfg_date_value.strip(),
        "confidence": round(mfg_date_conf, 1) if mfg_date_value else 0.0,
        "evidence_panel_id": panel_id,
        "evidence_bbox": mfg_date_bbox,
        "is_applicable": True,
        "is_missing": not bool(mfg_date_value.strip()),
        "notes": "Month and Year of manufacture or packing must be declared prominently"
    })
    
    # -------------------------------------------------------------------------
    # 7. Consumer Care Details / Grievance Redressal - Rule 6(1)(f)
    # -------------------------------------------------------------------------
    care_value = ""
    care_bbox = None
    care_conf = 0.0
    
    email_pattern = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
    phone_pattern = re.compile(r"(?:toll\s*free|tel|phone|contact|call|helpline|care)?\s*[:\-]?\s*(?:1800[- ]?\d{3}[- ]?\d{3,4}|\+?91[- ]?[6-9]\d{9}|\b[0-9]{10}\b)", re.IGNORECASE)
    care_header_pattern = re.compile(r"(consumer\s*care|customer\s*care|feedback|complaint|queries|helpline|contact\s*us)\b", re.IGNORECASE)
    
    care_lines = []
    for line in ocr_lines:
        txt = line["text"]
        if care_header_pattern.search(txt) or email_pattern.search(txt) or (phone_pattern.search(txt) and "1800" in txt):
            care_lines.append(line)
            
    if care_lines:
        care_value = " | ".join(l["text"] for l in care_lines)
        care_bbox = care_lines[0]["bbox"]
        care_conf = sum(l["confidence"] for l in care_lines) / len(care_lines)
    else:
        # Fallback regex in raw text
        em = email_pattern.search(raw_text)
        ph = phone_pattern.search(raw_text)
        parts = []
        if em:
            parts.append(em.group(0))
        if ph:
            parts.append(ph.group(0))
        if parts:
            care_value = " | ".join(parts)
            care_conf = 75.0
            
    declarations.append({
        "id": "decl-consumer-care",
        "field_key": "consumer_care",
        "label": "Consumer Care / Grievance Redressal Mechanism",
        "legal_rule_ref": "Rule 6(1)(f)",
        "extracted_value": care_value.strip(),
        "corrected_value": care_value.strip(),
        "confidence": round(care_conf, 1) if care_value else 0.0,
        "evidence_panel_id": panel_id,
        "evidence_bbox": care_bbox,
        "is_applicable": True,
        "is_missing": not bool(care_value.strip()),
        "notes": "Requires name, complete address, telephone number, and e-mail of consumer care cell"
    })
    
    # -------------------------------------------------------------------------
    # 8. Country of Origin - Rule 6(10)
    # -------------------------------------------------------------------------
    origin_value = ""
    origin_bbox = None
    origin_conf = 0.0
    
    origin_pattern = re.compile(r"(?:country\s*of\s*origin|made\s*in|product\s*of|origin)\s*[:\-]?\s*([a-zA-Z\s]+)", re.IGNORECASE)
    for line in ocr_lines:
        m = origin_pattern.search(line["text"])
        if m:
            origin_value = line["text"].strip()
            origin_bbox = line["bbox"]
            origin_conf = line["confidence"]
            break
            
    declarations.append({
        "id": "decl-country-origin",
        "field_key": "country_of_origin",
        "label": "Country of Origin",
        "legal_rule_ref": "Rule 6(10) & E-Commerce / Legal Metrology Mandates",
        "extracted_value": origin_value.strip(),
        "corrected_value": origin_value.strip(),
        "confidence": round(origin_conf, 1) if origin_value else 0.0,
        "evidence_panel_id": panel_id,
        "evidence_bbox": origin_bbox,
        "is_applicable": True,
        "is_missing": not bool(origin_value.strip()),
        "notes": "Mandatory for imported packaged commodities and all commodities manufactured outside India"
    })
    
    # -------------------------------------------------------------------------
    # 9. Batch / Lot / Code Number - Rule 6(1)(g) / Food Safety standards
    # -------------------------------------------------------------------------
    batch_value = ""
    batch_bbox = None
    batch_conf = 0.0
    
    batch_pattern = re.compile(r"(?:batch\s*(?:no|number)?|lot\s*(?:no|number)?|b\.?\s*no\.?)\s*[:\-]?\s*([a-zA-Z0-9\-\/]+)", re.IGNORECASE)
    for line in ocr_lines:
        m = batch_pattern.search(line["text"])
        if m:
            batch_value = line["text"].strip()
            batch_bbox = line["bbox"]
            batch_conf = line["confidence"]
            break
            
    declarations.append({
        "id": "decl-batch-lot",
        "field_key": "batch_lot_number",
        "label": "Batch / Lot / Identification Number",
        "legal_rule_ref": "Rule 6(1)(g) & Standards",
        "extracted_value": batch_value.strip(),
        "corrected_value": batch_value.strip(),
        "confidence": round(batch_conf, 1) if batch_value else 0.0,
        "evidence_panel_id": panel_id,
        "evidence_bbox": batch_bbox,
        "is_applicable": True,
        "is_missing": not bool(batch_value.strip()),
        "notes": "Identification code to trace manufacturing or packing batch"
    })
    
    # -------------------------------------------------------------------------
    # 10. Best Before / Expiry Date
    # -------------------------------------------------------------------------
    expiry_value = ""
    expiry_bbox = None
    expiry_conf = 0.0
    
    expiry_pattern = re.compile(r"(best\s*before|expiry\s*date|exp\.?\s*date|use\s*by|exp:)\b", re.IGNORECASE)
    for line in ocr_lines:
        if expiry_pattern.search(line["text"]):
            expiry_value = line["text"].strip()
            expiry_bbox = line["bbox"]
            expiry_conf = line["confidence"]
            break
            
    declarations.append({
        "id": "decl-expiry-date",
        "field_key": "expiry_date",
        "label": "Best Before / Expiry Declaration",
        "legal_rule_ref": "Packaged Commodities Rule 6 & Food Safety Regulations",
        "extracted_value": expiry_value.strip(),
        "corrected_value": expiry_value.strip(),
        "confidence": round(expiry_conf, 1) if expiry_value else 0.0,
        "evidence_panel_id": panel_id,
        "evidence_bbox": expiry_bbox,
        "is_applicable": True,
        "is_missing": not bool(expiry_value.strip()),
        "notes": "Best before period or expiry date for perishable or packaged consumable commodities"
    })
    
    return declarations
