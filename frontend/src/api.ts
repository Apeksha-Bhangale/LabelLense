import { DashboardStats, InspectionDetail, InspectionSummary } from './types';

const API_BASE = '/api';

export async function fetchDashboard(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
  return res.json();
}

export async function fetchInspections(
  search?: string,
  status?: string,
  date?: string
): Promise<InspectionSummary[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status && status !== 'ALL') params.append('status', status);
  if (date) params.append('date', date);

  const res = await fetch(`${API_BASE}/inspections?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to list inspections');
  return res.json();
}

export async function fetchInspection(id: string): Promise<InspectionDetail> {
  const res = await fetch(`${API_BASE}/inspections/${id}`);
  if (!res.ok) throw new Error(`Inspection ${id} not found`);
  return res.json();
}

export async function createInspection(data: {
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
  inspection_date?: string;
  inspector_name: string;
  inspector_id: string;
  inspection_notes?: string;
}): Promise<InspectionDetail> {
  const res = await fetch(`${API_BASE}/inspections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create inspection record');
  return res.json();
}

export async function uploadPanelImage(
  inspectionId: string,
  panelType: string,
  file: File
): Promise<InspectionDetail> {
  const formData = new FormData();
  formData.append('panel_type', panelType);
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/inspections/${inspectionId}/panels/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || 'Failed to upload and process panel image');
  }
  return res.json();
}

export async function loadDemoSamplePanel(
  inspectionId: string,
  demoType: 'rice' | 'spread' | 'syrup'
): Promise<InspectionDetail> {
  const res = await fetch(
    `${API_BASE}/inspections/${inspectionId}/panels/demo-load?demo_type=${demoType}`,
    { method: 'POST' }
  );
  if (!res.ok) throw new Error('Failed to load demonstration sample image');
  return res.json();
}

export async function deletePanelImage(
  inspectionId: string,
  panelId: string
): Promise<InspectionDetail> {
  const res = await fetch(`${API_BASE}/inspections/${inspectionId}/panels/${panelId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to remove panel');
  return res.json();
}

export async function updateDeclarationField(
  inspectionId: string,
  fieldKey: string,
  correctedValue: string,
  notes?: string
): Promise<InspectionDetail> {
  const res = await fetch(`${API_BASE}/inspections/${inspectionId}/declarations`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      field_key: fieldKey,
      corrected_value: correctedValue,
      inspector_notes: notes || '',
    }),
  });
  if (!res.ok) throw new Error('Failed to update declaration');
  return res.json();
}

export async function verifyComplianceRule(
  inspectionId: string,
  ruleId: string,
  verificationStatus: 'CONFIRMED' | 'REJECTED' | 'FURTHER_REVIEW',
  inspectorRemarks: string
): Promise<InspectionDetail> {
  const res = await fetch(`${API_BASE}/inspections/${inspectionId}/compliance/verify`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rule_id: ruleId,
      verification_status: verificationStatus,
      inspector_remarks: inspectorRemarks,
    }),
  });
  if (!res.ok) throw new Error('Failed to record inspector verification');
  return res.json();
}

export async function generateInspectionReport(
  inspectionId: string,
  data: {
    inspector_remarks?: string;
    conclusion?: string;
    signoff_name?: string;
    signoff_date?: string;
  }
): Promise<{
  status: string;
  report_id: string;
  version: number;
  pdf_url: string;
  inspection: InspectionDetail;
}> {
  const res = await fetch(`${API_BASE}/inspections/${inspectionId}/reports/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to generate inspection report');
  return res.json();
}
