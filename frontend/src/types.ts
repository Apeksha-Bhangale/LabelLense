export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  polygon?: number[][];
}

export interface OCRWord {
  text: string;
  confidence: number;
  bbox: BoundingBox;
}

export interface OCRLine {
  text: string;
  confidence: number;
  bbox: BoundingBox;
  words?: OCRWord[];
}

export interface PackagePanel {
  id: string;
  inspection_id: string;
  panel_type: string;
  original_filename: string;
  file_url: string;
  preprocessed_url?: string;
  image_width: number;
  image_height: number;
  ocr_text?: string;
  ocr_confidence?: number;
  ocr_lines: OCRLine[];
  quality_warnings: string[];
  created_at: string;
}

export interface DeclarationItem {
  id: string;
  field_key: string;
  label: string;
  legal_rule_ref: string;
  extracted_value: string;
  corrected_value?: string;
  confidence: number;
  evidence_panel_id?: string;
  evidence_bbox?: BoundingBox;
  is_applicable: boolean;
  is_missing: boolean;
  notes?: string;
}

export interface ComplianceCheckResult {
  rule_id: string;
  rule_code: string;
  legal_reference: string;
  rule_version: string;
  declaration_key: string;
  title: string;
  requirement: string;
  observed_value: string;
  status: 'PASS' | 'POTENTIAL_VIOLATION' | 'NEEDS_REVIEW' | 'NOT_APPLICABLE';
  explanation: string;
  evidence_text?: string;
  evidence_panel_id?: string;
  evidence_bbox?: BoundingBox;
  ocr_confidence?: number;
  verification_status: 'UNVERIFIED' | 'CONFIRMED' | 'REJECTED' | 'FURTHER_REVIEW';
  inspector_remarks?: string;
  is_demo_rule: boolean;
}

export interface InspectionDetail {
  id: string;
  product_name: string;
  brand: string;
  product_category: string;
  product_type: string;
  manufacturer_details?: string;
  importer_details?: string;
  batch_lot_number?: string;
  
  shop_name: string;
  shop_address: string;
  district: string;
  state: string;
  inspection_date: string;
  inspector_name: string;
  inspector_id: string;
  inspection_notes?: string;
  
  overall_status: 'COMPLIANT' | 'POTENTIAL_VIOLATIONS' | 'NEEDS_REVIEW' | 'IN_PROGRESS';
  total_checks: number;
  passed_checks: number;
  violation_checks: number;
  review_checks: number;
  na_checks: number;
  
  panels: PackagePanel[];
  declarations: DeclarationItem[];
  compliance_results: ComplianceCheckResult[];
  
  report_generated: boolean;
  latest_report_id?: string;
  latest_report_url?: string;
  report_version: number;
  report_generated_at?: string;
  
  inspector_remarks?: string;
  conclusion?: string;
  signoff_name?: string;
  signoff_date?: string;
  
  created_at: string;
  updated_at: string;
}

export interface InspectionSummary {
  id: string;
  product_name: string;
  brand: string;
  product_category: string;
  shop_name: string;
  district: string;
  state: string;
  inspection_date: string;
  overall_status: string;
  total_checks: number;
  violation_checks: number;
  review_checks: number;
  passed_checks: number;
  report_generated: boolean;
  latest_report_id?: string;
  latest_report_url?: string;
  created_at: string;
}

export interface DashboardStats {
  total_inspections: number;
  inspections_with_violations: number;
  inspections_needing_review: number;
  compliant_inspections: number;
  reports_generated: number;
  recent_inspections: InspectionSummary[];
}

export type PageView =
  | 'dashboard'
  | 'new_inspection'
  | 'capture'
  | 'declarations'
  | 'compliance'
  | 'report_preview'
  | 'history'
  | 'saved_details';
