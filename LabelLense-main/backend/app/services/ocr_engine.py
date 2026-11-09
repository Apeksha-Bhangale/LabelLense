"""
OCR Text Extraction Engine for LabelLens.
Hybrid support for Tesseract OCR and RapidOCR ONNX engine.
Extracts bounding boxes, word/line structures, and confidence ratings.
"""
import os
import shutil
import cv2
import numpy as np
from typing import Dict, Any, List, Optional
import pytesseract
from rapidocr_onnxruntime import RapidOCR

# Initialize RapidOCR engine once
_rapid_ocr_engine = None

def get_rapid_ocr():
    global _rapid_ocr_engine
    if _rapid_ocr_engine is None:
        _rapid_ocr_engine = RapidOCR()
    return _rapid_ocr_engine

def check_tesseract_available() -> bool:
    """Checks whether tesseract binary is available on PATH or in standard paths."""
    # Check default PATH
    if shutil.which("tesseract"):
        return True
    # Check Windows default installation directories
    common_win_paths = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        os.path.expanduser(r"~\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"),
    ]
    for p in common_win_paths:
        if os.path.exists(p):
            pytesseract.pytesseract.tesseract_cmd = p
            return True
    return False

def run_tesseract_ocr(image_path: str) -> Optional[Dict[str, Any]]:
    """Runs pytesseract and returns structured lines with bounding boxes and confidences."""
    if not check_tesseract_available():
        return None
    try:
        img = cv2.imread(image_path)
        h, w = img.shape[:2]
        data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
        
        lines_dict: Dict[int, List[Dict[str, Any]]] = {}
        n_boxes = len(data['text'])
        
        confidences = []
        for i in range(n_boxes):
            text = data['text'][i].strip()
            conf = float(data['conf'][i])
            if text and conf >= 0:
                line_num = data['line_num'][i]
                word_entry = {
                    "text": text,
                    "confidence": round(conf, 1),
                    "bbox": {
                        "x": float(data['left'][i]),
                        "y": float(data['top'][i]),
                        "width": float(data['width'][i]),
                        "height": float(data['height'][i])
                    }
                }
                lines_dict.setdefault(line_num, []).append(word_entry)
                confidences.append(conf)
                
        lines = []
        full_text_lines = []
        for line_num, words in sorted(lines_dict.items()):
            line_text = " ".join(w["text"] for w in words)
            full_text_lines.append(line_text)
            min_x = min(w["bbox"]["x"] for w in words)
            min_y = min(w["bbox"]["y"] for w in words)
            max_x = max(w["bbox"]["x"] + w["bbox"]["width"] for w in words)
            max_y = max(w["bbox"]["y"] + w["bbox"]["height"] for w in words)
            avg_conf = sum(w["confidence"] for w in words) / len(words)
            lines.append({
                "text": line_text,
                "confidence": round(avg_conf, 1),
                "bbox": {
                    "x": min_x,
                    "y": min_y,
                    "width": max_x - min_x,
                    "height": max_y - min_y
                },
                "words": words
            })
            
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
        return {
            "engine": "Tesseract OCR",
            "raw_text": "\n".join(full_text_lines),
            "confidence_avg": round(avg_confidence, 1),
            "lines": lines,
            "image_width": w,
            "image_height": h
        }
    except Exception as e:
        print(f"Tesseract OCR encountered error: {e}")
        return None

def run_rapid_ocr(image_path: str) -> Dict[str, Any]:
    """Runs RapidOCR ONNX model, extracting high-accuracy bounding boxes and confidence."""
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Could not load image: {image_path}")
    h, w = img.shape[:2]
    
    engine = get_rapid_ocr()
    result, _ = engine(image_path)
    
    if not result:
        return {
            "engine": "RapidOCR Engine",
            "raw_text": "",
            "confidence_avg": 0.0,
            "lines": [],
            "image_width": w,
            "image_height": h
        }
        
    lines = []
    full_text_lines = []
    confidences = []
    
    for item in result:
        box, text, score = item
        text = str(text).strip()
        if not text:
            continue
        
        conf_pct = round(float(score) * 100, 1)
        confidences.append(conf_pct)
        full_text_lines.append(text)
        
        pts = np.array(box, dtype=float)
        min_x = float(np.min(pts[:, 0]))
        max_x = float(np.max(pts[:, 0]))
        min_y = float(np.min(pts[:, 1]))
        max_y = float(np.max(pts[:, 1]))
        
        # Split into words for fine-grained interaction
        words_raw = text.split()
        words = []
        if words_raw:
            word_w = (max_x - min_x) / len(words_raw)
            for idx, wrd in enumerate(words_raw):
                words.append({
                    "text": wrd,
                    "confidence": conf_pct,
                    "bbox": {
                        "x": min_x + (idx * word_w),
                        "y": min_y,
                        "width": word_w,
                        "height": max_y - min_y
                    }
                })
                
        lines.append({
            "text": text,
            "confidence": conf_pct,
            "bbox": {
                "x": min_x,
                "y": min_y,
                "width": max_x - min_x,
                "height": max_y - min_y,
                "polygon": pts.tolist()
            },
            "words": words
        })
        
    avg_conf = sum(confidences) / len(confidences) if confidences else 0.0
    return {
        "engine": "RapidOCR ONNX Engine",
        "raw_text": "\n".join(full_text_lines),
        "confidence_avg": round(avg_conf, 1),
        "lines": lines,
        "image_width": w,
        "image_height": h
    }

def extract_text_from_image(image_path: str, prefer_tesseract: bool = False) -> Dict[str, Any]:
    """
    Main OCR extraction entry point.
    Attempts Tesseract if configured/requested, and falls back to RapidOCR seamlessly.
    """
    if prefer_tesseract:
        res = run_tesseract_ocr(image_path)
        if res and res.get("raw_text"):
            return res
            
    # Default to RapidOCR
    res = run_rapid_ocr(image_path)
    if res.get("raw_text"):
        return res
        
    # If rapidocr yielded empty text, try tesseract as backup
    tess_res = run_tesseract_ocr(image_path)
    if tess_res and tess_res.get("raw_text"):
        return tess_res
        
    return res
