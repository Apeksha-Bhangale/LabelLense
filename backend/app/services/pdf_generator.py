"""
Professional PDF Report Generator for LabelLens.
Generates publication-quality inspection reports under Legal Metrology Rules, 2011.
Includes all Sections A to H as strictly required by Problem Statement ID 26034.
"""
import os
from datetime import datetime
from typing import Dict, Any, List, Optional

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer, Image as RLImage,
    KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

# Color palette
NAVY_PRIMARY = colors.HexColor("#0b1d3a")
NAVY_SECONDARY = colors.HexColor("#1b365d")
TEAL_ACCENT = colors.HexColor("#0d9488")
TEAL_LIGHT = colors.HexColor("#ccfbf1")

COLOR_PASS = colors.HexColor("#16a34a")
COLOR_PASS_BG = colors.HexColor("#dcfce7")
COLOR_VIOLATION = colors.HexColor("#dc2626")
COLOR_VIOLATION_BG = colors.HexColor("#fee2e2")
COLOR_REVIEW = colors.HexColor("#d97706")
COLOR_REVIEW_BG = colors.HexColor("#fef3c7")
COLOR_NA = colors.HexColor("#64748b")
COLOR_NA_BG = colors.HexColor("#f1f5f9")

class NumberedCanvas(canvas.Canvas):
    """Adds running headers and footers with total page numbers."""
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_header_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header (pages after page 1)
        if self._pageNumber > 1:
            self.drawString(40, 805, "LabelLens — Legal Metrology (Packaged Commodities) Inspection Report")
            self.drawRightString(555, 805, "Confidential Government Inspection Record")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(40, 798, 555, 798)
            
        # Footer on all pages
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(40, 35, 555, 35)
        
        self.drawString(40, 23, "LabelLens System • Scan. Verify. Report. • Legal Metrology (Packaged Commodities) Rules, 2011")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(555, 23, page_str)
        self.restoreState()

def generate_inspection_pdf(
    inspection: Dict[str, Any],
    output_pdf_path: str,
    remarks_conclusion: Optional[Dict[str, Any]] = None
) -> str:
    """
    Builds the formal Legal Metrology Inspection Report PDF.
    """
    os.makedirs(os.path.dirname(output_pdf_path), exist_ok=True)
    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=46,
        bottomMargin=46
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=NAVY_PRIMARY
    )
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=TEAL_ACCENT
    )
    section_h1 = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=NAVY_PRIMARY,
        spaceBefore=10,
        spaceAfter=4
    )
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#1e293b")
    )
    bold_style = ParagraphStyle(
        'BoldDark',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#0f172a")
    )
    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#334155")
    )
    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )
    badge_pass = ParagraphStyle(
        'BadgePass',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=COLOR_PASS,
        alignment=1
    )
    badge_violation = ParagraphStyle(
        'BadgeViol',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=COLOR_VIOLATION,
        alignment=1
    )
    badge_review = ParagraphStyle(
        'BadgeRev',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=COLOR_REVIEW,
        alignment=1
    )
    badge_na = ParagraphStyle(
        'BadgeNA',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=COLOR_NA,
        alignment=1
    )

    story = []
    
    # -------------------------------------------------------------------------
    # SECTION A: REPORT HEADER
    # -------------------------------------------------------------------------
    report_num = inspection.get("latest_report_id") or f"REP-{inspection.get('id', 'LG')}-V1"
    now_str = datetime.now().strftime("%d-%b-%Y %I:%M %p")
    
    header_data = [
        [
            Paragraph("<b>LABELLENS INSPECTORATE</b><br/><font size=8 color='#0d9488'>Legal Metrology (Packaged Commodities) Enforcement System</font>", subtitle_style),
            Paragraph(f"<b>REPORT ID:</b> {report_num}<br/><b>INSPECTION ID:</b> {inspection.get('id')}<br/><b>DATE/TIME:</b> {now_str}", body_style)
        ]
    ]
    header_table = Table(header_data, colWidths=[330, 193])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=2, color=TEAL_ACCENT, spaceBefore=4, spaceAfter=8))
    
    story.append(Paragraph("PRODUCT LABEL COMPLIANCE INSPECTION REPORT", title_style))
    story.append(Paragraph("Under Legal Metrology (Packaged Commodities) Rules, 2011 (As Amended)", subtitle_style))
    story.append(Spacer(1, 8))
    
    # Summary Status Banner
    ov_status = inspection.get("overall_status", "IN_PROGRESS")
    if ov_status == "COMPLIANT":
        banner_bg = COLOR_PASS_BG
        banner_border = COLOR_PASS
        banner_text = f"<b>OVERALL STATUS: COMPLIANT WITH VERIFIED DECLARATIONS</b> ({inspection.get('passed_checks', 0)} of {inspection.get('total_checks', 0)} checks passed)"
    elif ov_status == "POTENTIAL_VIOLATIONS":
        banner_bg = COLOR_VIOLATION_BG
        banner_border = COLOR_VIOLATION
        banner_text = f"<b>OVERALL STATUS: POTENTIAL VIOLATIONS DETECTED</b> ({inspection.get('violation_checks', 0)} potential violation(s) flagged for statutory action)"
    else:
        banner_bg = COLOR_REVIEW_BG
        banner_border = COLOR_REVIEW
        banner_text = f"<b>OVERALL STATUS: MANUAL INSPECTOR REVIEW REQUIRED</b> ({inspection.get('review_checks', 0)} declaration(s) ambiguous or unverified)"
        
    status_table = Table([[Paragraph(banner_text, ParagraphStyle('Banner', parent=body_style, textColor=banner_border, fontSize=9, alignment=1))]], colWidths=[523])
    status_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), banner_bg),
        ('BOX', (0, 0), (-1, -1), 1, banner_border),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(status_table)
    story.append(Spacer(1, 10))
    
    # -------------------------------------------------------------------------
    # SECTION B & C: INSPECTION & PRODUCT DETAILS
    # -------------------------------------------------------------------------
    story.append(Paragraph("B. Inspector & Premises Details", section_h1))
    
    insp_data = [
        [
            Paragraph("<b>Inspector Name:</b>", body_style),
            Paragraph(f"{inspection.get('inspector_name')} (ID: {inspection.get('inspector_id')})", body_style),
            Paragraph("<b>Inspection Date:</b>", body_style),
            Paragraph(str(inspection.get("inspection_date")), body_style),
        ],
        [
            Paragraph("<b>Shop / Retailer:</b>", body_style),
            Paragraph(str(inspection.get("shop_name")), body_style),
            Paragraph("<b>District & State:</b>", body_style),
            Paragraph(f"{inspection.get('district')}, {inspection.get('state')}", body_style),
        ],
        [
            Paragraph("<b>Retail Address:</b>", body_style),
            Paragraph(str(inspection.get("shop_address")), body_style),
            Paragraph("<b>Inspector Notes:</b>", body_style),
            Paragraph(str(inspection.get("inspection_notes") or "Field routine inspection"), body_style),
        ]
    ]
    insp_table = Table(insp_data, colWidths=[110, 150, 110, 153])
    insp_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(insp_table)
    story.append(Spacer(1, 8))
    
    story.append(Paragraph("C. Packaged Product Information", section_h1))
    prod_data = [
        [
            Paragraph("<b>Product Name:</b>", body_style),
            Paragraph(str(inspection.get("product_name")), body_style),
            Paragraph("<b>Brand:</b>", body_style),
            Paragraph(str(inspection.get("brand")), body_style),
        ],
        [
            Paragraph("<b>Category / Type:</b>", body_style),
            Paragraph(f"{inspection.get('product_category')} / {inspection.get('product_type')}", body_style),
            Paragraph("<b>Batch / Lot No:</b>", body_style),
            Paragraph(str(inspection.get("batch_lot_number") or "Not declared on packaging"), body_style),
        ],
        [
            Paragraph("<b>Manufacturer Details:</b>", body_style),
            Paragraph(str(inspection.get("manufacturer_details") or "Extracted from package label"), body_style),
            Paragraph("<b>Importer Details:</b>", body_style),
            Paragraph(str(inspection.get("importer_details") or "N/A (Domestic Commodity)"), body_style),
        ]
    ]
    prod_table = Table(prod_data, colWidths=[110, 150, 110, 153])
    prod_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(prod_table)
    story.append(Spacer(1, 10))
    
    # -------------------------------------------------------------------------
    # SECTION D: INSPECTION EVIDENCE & IMAGES
    # -------------------------------------------------------------------------
    story.append(Paragraph("D. Scanned Package Evidence & OCR Extraction", section_h1))
    
    panels = inspection.get("panels", [])
    if panels:
        evidence_flowables = []
        for p_idx, panel in enumerate(panels[:2]):  # show up to 2 primary panel photos
            img_path = panel.get("file_url")
            # Convert url to local path if needed
            local_path = None
            if img_path:
                if img_path.startswith("/uploads/"):
                    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
                    local_path = os.path.join(base_dir, img_path.lstrip("/"))
                elif os.path.exists(img_path):
                    local_path = img_path
                    
            if local_path and os.path.exists(local_path):
                try:
                    # Scale image proportionally to fit width of ~240pt, height max 180pt
                    rl_img = RLImage(local_path, width=220, height=140)
                    caption = Paragraph(f"<b>Panel {p_idx+1}: {panel.get('panel_type', 'Package Label')}</b><br/><font size=7 color='#64748b'>Readability: {panel.get('ocr_confidence', 0):.1f}% | File: {panel.get('original_filename')}</font>", table_cell)
                    evidence_flowables.append([rl_img, caption])
                except Exception as e:
                    print(f"Error loading image into PDF: {e}")
                    
        if evidence_flowables:
            if len(evidence_flowables) == 2:
                ev_table = Table([[evidence_flowables[0][0], evidence_flowables[1][0]],
                                  [evidence_flowables[0][1], evidence_flowables[1][1]]], colWidths=[260, 260])
            else:
                ev_table = Table([[evidence_flowables[0][0]], [evidence_flowables[0][1]]], colWidths=[523])
            ev_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            story.append(ev_table)
            story.append(Spacer(1, 6))
            
    # Structured declarations summary
    decls = inspection.get("declarations", [])
    if decls:
        decl_rows = [[
            Paragraph("<b>Statutory Declaration</b>", table_header),
            Paragraph("<b>Extracted / Corrected Observed Text</b>", table_header),
            Paragraph("<b>Rule Reference</b>", table_header),
            Paragraph("<b>OCR Conf.</b>", table_header)
        ]]
        for d in decls:
            val = d.get("corrected_value") or d.get("extracted_value") or "[Missing / Not Detected]"
            conf_str = f"{d.get('confidence', 0):.0f}%" if d.get('confidence', 0) > 0 else "—"
            decl_rows.append([
                Paragraph(f"<b>{d.get('label')}</b>", table_cell),
                Paragraph(val, table_cell),
                Paragraph(d.get("legal_rule_ref", ""), table_cell),
                Paragraph(conf_str, table_cell)
            ])
        dt = Table(decl_rows, colWidths=[140, 250, 93, 40])
        dt.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), NAVY_PRIMARY),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ]))
        story.append(dt)
        story.append(Spacer(1, 10))
        
    # -------------------------------------------------------------------------
    # SECTION E: RULE-BY-RULE COMPLIANCE FINDINGS
    # -------------------------------------------------------------------------
    story.append(Paragraph("E. Rule-by-Rule Compliance Findings", section_h1))
    
    comp_results = inspection.get("compliance_results", [])
    table_rows = [[
        Paragraph("<b>Declaration</b>", table_header),
        Paragraph("<b>Observed Value</b>", table_header),
        Paragraph("<b>Applicable Requirement</b>", table_header),
        Paragraph("<b>Status</b>", table_header),
        Paragraph("<b>Explanation</b>", table_header)
    ]]
    
    for r in comp_results:
        st = r.get("status")
        if st == "PASS":
            badge = Paragraph("PASS", badge_pass)
            bg_col = COLOR_PASS_BG
        elif st == "POTENTIAL_VIOLATION":
            badge = Paragraph("VIOLATION", badge_violation)
            bg_col = COLOR_VIOLATION_BG
        elif st == "NEEDS_REVIEW":
            badge = Paragraph("REVIEW", badge_review)
            bg_col = COLOR_REVIEW_BG
        else:
            badge = Paragraph("N/A", badge_na)
            bg_col = COLOR_NA_BG
            
        table_rows.append([
            Paragraph(f"<b>{r.get('title')}</b><br/><font size=7 color='#64748b'>{r.get('rule_code')}</font>", table_cell),
            Paragraph(r.get("observed_value") or "—", table_cell),
            Paragraph(r.get("requirement") or "", table_cell),
            badge,
            Paragraph(r.get("explanation") or "", table_cell)
        ])
        
    findings_table = Table(table_rows, colWidths=[100, 95, 115, 65, 148])
    findings_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY_PRIMARY),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
    ]))
    story.append(findings_table)
    story.append(Spacer(1, 10))
    
    # -------------------------------------------------------------------------
    # SECTION F: POTENTIAL VIOLATIONS (DETAILED)
    # -------------------------------------------------------------------------
    violations = [r for r in comp_results if r.get("status") == "POTENTIAL_VIOLATION"]
    story.append(Paragraph(f"F. Potential Packaging Violations ({len(violations)} item(s) detected)", section_h1))
    
    if not violations:
        story.append(Paragraph("<i>No potential violations were detected based on the scanned package panels and current rule evaluation.</i>", body_style))
    else:
        for idx, viol in enumerate(violations):
            v_verif = viol.get("verification_status", "UNVERIFIED")
            v_remarks = viol.get("inspector_remarks") or "Awaiting inspector confirmation"
            v_id = f"VIO-{idx+1:02d}"
            
            viol_box_data = [
                [
                    Paragraph(f"<b>Finding ID:</b> {v_id}", bold_style),
                    Paragraph(f"<b>Declaration:</b> {viol.get('title')}", bold_style),
                    Paragraph(f"<b>Legal Ref:</b> {viol.get('legal_reference')}", bold_style),
                ],
                [
                    Paragraph(f"<b>Observed Value / Note:</b> {viol.get('observed_value')}", body_style),
                    Paragraph(f"<b>Suspected Issue:</b> {viol.get('explanation')}", body_style),
                    Paragraph(f"<b>Inspector Verification:</b> <b>{v_verif}</b><br/><font size=7 color='#64748b'>Remarks: {v_remarks}</font>", body_style),
                ]
            ]
            v_table = Table(viol_box_data, colWidths=[150, 180, 193])
            v_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), COLOR_VIOLATION_BG),
                ('BOX', (0, 0), (-1, -1), 1, COLOR_VIOLATION),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            story.append(v_table)
            story.append(Spacer(1, 6))
            
    story.append(Spacer(1, 6))
    
    # -------------------------------------------------------------------------
    # SECTION G: INSPECTOR REMARKS AND CONCLUSION
    # -------------------------------------------------------------------------
    story.append(Paragraph("G. Inspector Remarks and Inspection Conclusion", section_h1))
    
    user_remarks = (remarks_conclusion.get("inspector_remarks") if remarks_conclusion else None) or inspection.get("inspector_remarks") or "Label declarations examined under Legal Metrology (Packaged Commodities) Rules, 2011. Evidence recorded through high-resolution capture."
    user_conclusion = (remarks_conclusion.get("conclusion") if remarks_conclusion else None) or inspection.get("conclusion")
    
    if not user_conclusion:
        if ov_status == "COMPLIANT":
            user_conclusion = "The inspected packaged commodity conforms with all evaluated statutory declarations under Rule 6 of the Legal Metrology (Packaged Commodities) Rules, 2011 based on available evidence."
        elif ov_status == "POTENTIAL_VIOLATIONS":
            user_conclusion = f"Potential non-compliance detected in {len(violations)} statutory requirement(s). The seller / manufacturer is recommended for statutory show-cause notice under Section 36(1) of the Legal Metrology Act, 2009 subject to administrative confirmation."
        else:
            user_conclusion = "Inspection is inconclusive pending submission of supplementary packaging panels or physical verification of ambiguous declarations."
            
    conclusion_data = [
        [Paragraph("<b>Inspector Observations & Corrections:</b>", bold_style)],
        [Paragraph(user_remarks, body_style)],
        [Spacer(1, 4)],
        [Paragraph("<b>Statutory Assessment & Recommendation:</b>", bold_style)],
        [Paragraph(user_conclusion, body_style)]
    ]
    conc_table = Table(conclusion_data, colWidths=[523])
    conc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(conc_table)
    story.append(Spacer(1, 12))
    
    # -------------------------------------------------------------------------
    # SECTION H: SIGN-OFF AND STATUTORY NOTICE
    # -------------------------------------------------------------------------
    sign_name = (remarks_conclusion.get("signoff_name") if remarks_conclusion else None) or inspection.get("signoff_name") or inspection.get("inspector_name")
    sign_date = (remarks_conclusion.get("signoff_date") if remarks_conclusion else None) or inspection.get("signoff_date") or now_str[:11]
    
    signoff_data = [
        [
            Paragraph(f"<b>Inspecting Officer:</b> {sign_name}<br/><b>Identifier / Badge No:</b> {inspection.get('inspector_id')}<br/><b>Verification Date:</b> {sign_date}", body_style),
            Paragraph("<b>Authorized Signature:</b><br/><br/><font color='#94a3b8'>___________________________________<br/>Legal Metrology Field Inspector</font>", body_style)
        ]
    ]
    sign_table = Table(signoff_data, colWidths=[280, 243])
    sign_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(KeepTogether([
        Paragraph("H. Inspector Verification Sign-Off", section_h1),
        sign_table,
        Spacer(1, 8),
        Paragraph("<font size=7 color='#64748b'><b>LEGAL DISCLAIMER:</b> This document is an inspection report generated by the LabelLens digital verification assistant. Under the Legal Metrology Act, 2009 and Packaged Commodities Rules, 2011, this report records field observations and algorithmic rule findings. It does not constitute an official conviction or certificate unless formally ratified through designated statutory procedures.</font>", table_cell)
    ]))
    
    doc.build(story, canvasmaker=NumberedCanvas)
    return output_pdf_path
