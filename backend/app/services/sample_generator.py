"""
Generates realistic high-resolution package label images for demonstration and testing.
Evaluators can also upload their own live photos from mobile camera or gallery.
"""
import os
from PIL import Image, ImageDraw, ImageFont

def generate_sample_label_images(output_dir: str):
    """
    Creates realistic demonstration label images with sharp statutory text,
    borders, regulatory tables, and barcodes.
    """
    os.makedirs(output_dir, exist_ok=True)
    
    # -------------------------------------------------------------------------
    # 1. Compliant Basmati Rice Label (5 kg)
    # -------------------------------------------------------------------------
    img1_path = os.path.join(output_dir, "sample_rice_compliant.png")
    if not os.path.exists(img1_path):
        w, h = 900, 750
        img = Image.new("RGB", (w, h), color="#ffffff")
        draw = ImageDraw.Draw(img)
        
        # Outer border
        draw.rectangle([15, 15, w-15, h-15], outline="#0b1d3a", width=4)
        draw.rectangle([25, 25, w-25, 110], fill="#0b1d3a")
        
        # Header banner
        draw.text((45, 40), "ROYAL HERITAGE BASMATI RICE", fill="#ffffff", font_size=28)
        draw.text((45, 75), "PREMIUM AGED EXTRA LONG GRAIN • 100% PURE", fill="#2dd4bf", font_size=15)
        
        # Product Category & Name
        draw.text((45, 130), "Generic Name: Basmati Rice (Packaged Food Grain)", fill="#0f172a", font_size=18)
        draw.text((45, 160), "Grade: Super Extra Long Grain Aged Basmati", fill="#475569", font_size=14)
        
        # Dividing line
        draw.line([45, 195, w-45, 195], fill="#cbd5e1", width=2)
        
        # Net Quantity box (Principal Display Panel requirement)
        draw.rectangle([45, 215, 420, 290], fill="#f0fdfa", outline="#0d9488", width=2)
        draw.text((60, 225), "NET QUANTITY", fill="#0f766e", font_size=14)
        draw.text((60, 245), "5 kg", fill="#0b1d3a", font_size=32)
        draw.text((150, 255), "(5000 g)", fill="#64748b", font_size=16)
        
        # MRP & USP Box
        draw.rectangle([445, 215, w-45, 290], fill="#f8fafc", outline="#334e68", width=2)
        draw.text((460, 225), "MAXIMUM RETAIL PRICE (MRP):", fill="#334e68", font_size=13)
        draw.text((460, 242), "MRP Rs. 650.00 (inclusive of all taxes)", fill="#0b1d3a", font_size=18)
        draw.text((460, 267), "Unit Sale Price: Rs. 130.00 / kg", fill="#0d9488", font_size=14)
        
        # Manufacturing and Batch Grid
        draw.rectangle([45, 310, w-45, 385], outline="#cbd5e1", fill="#f8fafc", width=1)
        draw.text((60, 320), "Batch No: RH-B24-8902", fill="#0f172a", font_size=15)
        draw.text((360, 320), "Date of Mfg: 08/2024", fill="#0f172a", font_size=15)
        draw.text((630, 320), "Best Before: 24 Months from Mfg", fill="#0f172a", font_size=15)
        draw.text((60, 350), "Country of Origin: India", fill="#0d9488", font_size=16)
        draw.text((360, 350), "Commodity Code: AG-1121", fill="#475569", font_size=14)
        
        # Manufacturer & Packer Details
        draw.line([45, 405, w-45, 405], fill="#cbd5e1", width=2)
        draw.text((45, 420), "MANUFACTURED & PACKED BY:", fill="#0b1d3a", font_size=16)
        draw.text((45, 445), "Heritage Agro Foods Private Limited", fill="#0f172a", font_size=15)
        draw.text((45, 470), "Plot No. 42-45, Phase III, Food Park Industrial Estate, Sonipat, Haryana - 131001, India", fill="#334155", font_size=13)
        draw.text((45, 495), "FSSAI Central Lic. No. 10019064001872", fill="#475569", font_size=12)
        
        # Consumer Care Box
        draw.rectangle([45, 530, w-45, 630], fill="#f0f4f8", outline="#94a3b8", width=1)
        draw.text((60, 540), "CONSUMER GRIEVANCE REDRESSAL / CUSTOMER CARE CELL:", fill="#0b1d3a", font_size=14)
        draw.text((60, 565), "Manager - Consumer Services, Heritage Agro Foods Pvt. Ltd., Plot No. 42-45, Sonipat, Haryana - 131001", fill="#334155", font_size=12)
        draw.text((60, 590), "Toll Free Helpline: 1800-209-4321  |  Email: care@royalheritage.in", fill="#0d9488", font_size=14)
        draw.text((60, 610), "Website: www.royalheritage.in", fill="#475569", font_size=12)
        
        # Barcode representation
        draw.rectangle([w-220, 645, w-45, 715], outline="#000000", width=1)
        for x_bar in range(w-205, w-60, 6):
            draw.line([x_bar, 655, x_bar, 695], fill="#000000", width=2)
        draw.text((w-190, 700), "8 901234 567890", fill="#000000", font_size=10)
        
        draw.text((45, 660), "100% Vegetarian • Store in cool, dry hygienic place", fill="#16a34a", font_size=13)
        draw.text((45, 685), "Standardized Packaging under Legal Metrology Rules, 2011", fill="#64748b", font_size=11)
        
        img.save(img1_path)
        
    # -------------------------------------------------------------------------
    # 2. Spread Label with Potential Violations (350 gms, Missing Tax, Missing Origin)
    # -------------------------------------------------------------------------
    img2_path = os.path.join(output_dir, "sample_spread_violations.png")
    if not os.path.exists(img2_path):
        w, h = 900, 750
        img = Image.new("RGB", (w, h), color="#fffdfa")
        draw = ImageDraw.Draw(img)
        
        # Outer border
        draw.rectangle([15, 15, w-15, h-15], outline="#78350f", width=4)
        draw.rectangle([25, 25, w-25, 110], fill="#78350f")
        
        # Header banner
        draw.text((45, 40), "ALPSDELIGHT GOURMET HAZELNUT SPREAD", fill="#ffffff", font_size=26)
        draw.text((45, 75), "RICH COCOA & ROASTED HAZELNUTS • PREMIUM IMPORT", fill="#fde68a", font_size=14)
        
        # Generic Name
        draw.text((45, 130), "Generic Name: Hazelnut and Cocoa Spread", fill="#0f172a", font_size=18)
        
        # Dividing line
        draw.line([45, 175, w-45, 175], fill="#e2e8f0", width=2)
        
        # VIOLATION 1: Non-standard unit "gms" (Rule 12 & 13 violation)
        draw.rectangle([45, 195, 420, 275], fill="#fee2e2", outline="#dc2626", width=2)
        draw.text((60, 205), "NET WEIGHT", fill="#991b1b", font_size=14)
        draw.text((60, 225), "350 gms", fill="#dc2626", font_size=32)
        draw.text((220, 235), "[Illegal unit: 'gms']", fill="#b91c1c", font_size=14)
        
        # VIOLATION 2: Missing mandatory "inclusive of all taxes" (Rule 6(1)(e) violation)
        draw.rectangle([445, 195, w-45, 275], fill="#fee2e2", outline="#dc2626", width=2)
        draw.text((460, 205), "PRICE (NON-COMPLIANT DECLARATION):", fill="#991b1b", font_size=13)
        draw.text((460, 228), "MRP Rs. 420.00", fill="#dc2626", font_size=26)
        draw.text((460, 258), "[Missing mandatory 'incl. of all taxes' wording]", fill="#b91c1c", font_size=12)
        
        # Batch and Date
        draw.rectangle([45, 295, w-45, 365], outline="#cbd5e1", fill="#f8fafc", width=1)
        draw.text((60, 310), "Batch No: AD-ITA-9921", fill="#0f172a", font_size=15)
        draw.text((360, 310), "Date of Packing: 05/2024", fill="#0f172a", font_size=15)
        draw.text((630, 310), "Best Before: 12 Months", fill="#0f172a", font_size=15)
        
        # Importer info
        draw.line([45, 385, w-45, 385], fill="#cbd5e1", width=2)
        draw.text((45, 400), "IMPORTED & MARKETED IN INDIA BY:", fill="#0b1d3a", font_size=16)
        draw.text((45, 425), "Continental Gourmet Imports Ltd.", fill="#0f172a", font_size=15)
        draw.text((45, 450), "Building 12, Export Zone, Andheri East, Mumbai, Maharashtra - 400069", fill="#334155", font_size=13)
        
        # VIOLATION 3: Missing Country of Origin on Imported good (Rule 6(10) violation)
        draw.rectangle([45, 480, w-45, 525], fill="#fee2e2", outline="#dc2626", width=1)
        draw.text((60, 492), "COUNTRY OF ORIGIN: [OMITTED / MISSING ON LABEL]", fill="#dc2626", font_size=15)
        
        # VIOLATION 4: Incomplete Consumer Care (Missing email, only has telephone number) (Rule 6(1)(f))
        draw.rectangle([45, 545, w-45, 630], fill="#fef3c7", outline="#d97706", width=1)
        draw.text((60, 555), "CUSTOMER FEEDBACK / QUERIES:", fill="#92400e", font_size=14)
        draw.text((60, 580), "Call helpline: 1800-444-1212", fill="#0f172a", font_size=15)
        draw.text((60, 605), "[Email address missing — Rule 6(1)(f) requires both telephone & email]", fill="#b45309", font_size=12)
        
        # Barcode
        draw.rectangle([w-220, 645, w-45, 715], outline="#000000", width=1)
        for x_bar in range(w-205, w-60, 6):
            draw.line([x_bar, 655, x_bar, 695], fill="#000000", width=2)
        draw.text((w-190, 700), "8 001234 987654", fill="#000000", font_size=10)
        
        draw.text((45, 665), "Imported Confectionery • Contains Tree Nuts & Milk", fill="#475569", font_size=13)
        
        img.save(img2_path)
        
    # -------------------------------------------------------------------------
    # 3. Cough Syrup Label (Needs Review - ambiguous date/partial print)
    # -------------------------------------------------------------------------
    img3_path = os.path.join(output_dir, "sample_syrup_review.png")
    if not os.path.exists(img3_path):
        w, h = 900, 750
        img = Image.new("RGB", (w, h), color="#ffffff")
        draw = ImageDraw.Draw(img)
        
        draw.rectangle([15, 15, w-15, h-15], outline="#0f766e", width=4)
        draw.rectangle([25, 25, w-25, 110], fill="#0f766e")
        
        draw.text((45, 40), "BREATHE-EASY HERBAL COUGH RELIEF", fill="#ffffff", font_size=26)
        draw.text((45, 75), "AYURVEDIC PROPRIETARY MEDICINE • 100% HERBAL", fill="#ccfbf1", font_size=14)
        
        draw.text((45, 130), "Generic Name: Herbal Cough Syrup (Ayurvedic Formulation)", fill="#0f172a", font_size=17)
        
        # Net Quantity
        draw.rectangle([45, 185, 420, 260], fill="#f0fdfa", outline="#0d9488", width=2)
        draw.text((60, 195), "NET VOLUME", fill="#0f766e", font_size=13)
        draw.text((60, 215), "100 ml", fill="#0b1d3a", font_size=30)
        
        # MRP with taxes
        draw.rectangle([445, 185, w-45, 260], fill="#f8fafc", outline="#334e68", width=2)
        draw.text((460, 195), "MAXIMUM RETAIL PRICE:", fill="#334e68", font_size=13)
        draw.text((460, 218), "MRP Rs. 95.00 (incl. of all taxes)", fill="#0b1d3a", font_size=20)
        
        # Manufacturer
        draw.text((45, 280), "MANUFACTURED IN INDIA BY:", fill="#0b1d3a", font_size=15)
        draw.text((45, 305), "AyurVeda Pharmaceuticals India Limited", fill="#0f172a", font_size=14)
        draw.text((45, 330), "Plot 88, Herbal Valley, Solan, Himachal Pradesh - 173212", fill="#334155", font_size=13)
        
        # Smudged / Ambiguous Batch & Date box (Flagged for Review)
        draw.rectangle([45, 365, w-45, 445], fill="#fef3c7", outline="#d97706", width=2)
        draw.text((60, 375), "BATCH & MANUFACTURING INFORMATION (LIGHT PRINT):", fill="#92400e", font_size=13)
        draw.text((60, 395), "Batch: BY-02?? / Mfg Dt: ??/24", fill="#0f172a", font_size=18)
        draw.text((60, 422), "Notice: Ink stamp faded on packaging. Physical stamp verification required.", fill="#b45309", font_size=12)
        
        # Consumer care
        draw.rectangle([45, 465, w-45, 555], fill="#f0f4f8", outline="#94a3b8", width=1)
        draw.text((60, 475), "CONSUMER HELPLINE:", fill="#0b1d3a", font_size=14)
        draw.text((60, 500), "Tel: 1800-112-9988  |  Email: contact@ayurvedapharma.co.in", fill="#0d9488", font_size=14)
        draw.text((60, 525), "Country of Origin: India", fill="#334155", font_size=13)
        
        draw.text((45, 580), "Schedule E(1) Caution: Take under medical supervision", fill="#dc2626", font_size=12)
        
        img.save(img3_path)
        
    return {
        "sample_rice": img1_path,
        "sample_spread": img2_path,
        "sample_syrup": img3_path
    }
