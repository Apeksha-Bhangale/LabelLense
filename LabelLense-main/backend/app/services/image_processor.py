"""
OpenCV Image Preprocessing and Quality Assessment Service for LabelLens.
Enhances text readability, reduces noise, handles uneven lighting, and detects quality issues.
"""
import cv2
import numpy as np
import os
from typing import Dict, Any, Tuple, List

def assess_image_quality(img_bgr: np.ndarray) -> Dict[str, Any]:
    """
    Evaluates image quality metrics:
    - Sharpness / Blurriness (Laplacian variance)
    - Brightness / Exposure (Mean luminance)
    - Contrast (Luminance standard deviation)
    - Resolution / Dimensions
    """
    height, width = img_bgr.shape[:2]
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    
    # Sharpness via Laplacian variance
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    is_blurry = laplacian_var < 80.0
    
    # Brightness & contrast
    mean_brightness = float(np.mean(gray))
    std_contrast = float(np.std(gray))
    
    warnings: List[str] = []
    
    if is_blurry:
        warnings.append(f"Image appears blurry (Sharpness Index: {laplacian_var:.1f}). Hold camera steady and ensure proper focus.")
    elif laplacian_var < 150.0:
        warnings.append("Moderate sharpness. Text in small print may require manual verification.")
        
    if mean_brightness < 45:
        warnings.append("Low lighting / underexposed label. Ensure adequate illumination on the package.")
    elif mean_brightness > 225:
        warnings.append("Overexposed / strong glare detected. Angling the package away from direct light helps readability.")
        
    if std_contrast < 30:
        warnings.append("Low contrast between text and background. Legibility may be compromised.")
        
    if width < 600 or height < 600:
        warnings.append("Low resolution image. Higher resolution capture is recommended for fine legal declarations.")
        
    return {
        "width": width,
        "height": height,
        "sharpness_score": round(laplacian_var, 2),
        "is_blurry": bool(is_blurry),
        "brightness": round(mean_brightness, 2),
        "contrast": round(std_contrast, 2),
        "warnings": warnings,
        "quality_level": "OPTIMAL" if not warnings else ("MODERATE" if len(warnings) == 1 else "POOR")
    }

def preprocess_for_ocr(input_image_path: str, output_image_path: str) -> Tuple[str, Dict[str, Any]]:
    """
    Applies multi-stage OpenCV preprocessing to enhance label legibility for OCR:
    1. Read original image
    2. Assess image quality
    3. Convert to Grayscale
    4. Contrast-Limited Adaptive Histogram Equalization (CLAHE) to fix glare/uneven lighting
    5. Bilateral Filtering to remove packaging speckle/texture noise while keeping sharp font edges
    6. Gentle unsharp masking for crisp text definition
    Saves the preprocessed image and returns path + quality report.
    """
    img = cv2.imread(input_image_path)
    if img is None:
        raise ValueError(f"Could not load image at path: {input_image_path}")
        
    quality_report = assess_image_quality(img)
    
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply CLAHE to balance shadows and packaging glare
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    contrast_enhanced = clahe.apply(gray)
    
    # Bilateral filter removes texture noise while keeping font edges crisp
    denoised = cv2.bilateralFilter(contrast_enhanced, d=5, sigmaColor=50, sigmaSpace=50)
    
    # Gentle unsharp mask for font definition
    gaussian = cv2.GaussianBlur(denoised, (0, 0), 2.0)
    sharpened = cv2.addWeighted(denoised, 1.3, gaussian, -0.3, 0)
    
    # Ensure directory exists and write
    os.makedirs(os.path.dirname(output_image_path), exist_ok=True)
    cv2.imwrite(output_image_path, sharpened)
    
    return output_image_path, quality_report

def get_image_dimensions(image_path: str) -> Tuple[int, int]:
    img = cv2.imread(image_path)
    if img is None:
        return 800, 600
    h, w = img.shape[:2]
    return w, h
