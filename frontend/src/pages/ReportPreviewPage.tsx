import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Save,
  CheckCircle2,
  AlertTriangle,
  History,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  FileCheck2,
  ExternalLink
} from 'lucide-react';
import { InspectionDetail, PageView } from '../types';
import { generateInspectionReport } from '../api';
import { StatusBadge } from '../components/StatusBadge';

interface ReportPreviewPageProps {
  inspection: InspectionDetail;
  onInspectionUpdated: (updated: InspectionDetail) => void;
  onNavigate: (page: PageView) => void;
}

export const ReportPreviewPage: React.FC<ReportPreviewPageProps> = ({
  inspection,
  onInspectionUpdated,
  onNavigate,
}) => {
  const [remarks, setRemarks] = useState<string>(
    inspection.inspector_remarks ||
      'All declarations examined under Legal Metrology (Packaged Commodities) Rules, 2011. Evidence verified against physical packaging.'
  );

  const [conclusion, setConclusion] = useState<string>(
    inspection.conclusion ||
      (inspection.violation_checks > 0
        ? `Potential statutory non-compliance observed in ${inspection.violation_checks} check(s). Recommend issuance of formal notice under Section 36(1) of Legal Metrology Act, 2009 subject to administrative ratification.`
        : inspection.review_checks > 0
        ? 'Inspection pending clarification of ambiguous packaging declarations.'
        : 'The pre-packaged commodity satisfies all statutory declarations evaluated under Rule 6 of the Legal Metrology (Packaged Commodities) Rules, 2011.')
  );

  const [signoffName, setSignoffName] = useState<string>(
    inspection.signoff_name || inspection.inspector_name
  );
  const [signoffDate, setSignoffDate] = useState<string>(
    inspection.signoff_date || new Date().toISOString().slice(0, 10)
  );

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleGeneratePdf = async () => {
    try {
      setIsGenerating(true);
      const res = await generateInspectionReport(inspection.id, {
        inspector_remarks: remarks,
        conclusion: conclusion,
        signoff_name: signoffName,
        signoff_date: signoffDate,
      });
      onInspectionUpdated(res.inspection);
      setStatusMsg(`Report generated successfully (Version ${res.version}).`);
      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to generate inspection report PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = () => {
    window.open(`/api/inspections/${inspection.id}/reports/pdf`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const violations = inspection.compliance_results?.filter(
    (r) => r.status === 'POTENTIAL_VIOLATION'
  ) || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Toolbar (Non-printable) */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
              Inspection Report Dossier
            </span>
            <span className="text-xs font-mono font-bold text-navy-950">
              {inspection.latest_report_id || `REP-${inspection.id}-DRAFT`}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              v{inspection.report_version || 1}
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-navy-950 mt-1">
            Inspection Report Preview & PDF Generation
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Regenerate / Update PDF */}
          <button
            onClick={handleGeneratePdf}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-navy-900 hover:bg-navy-950 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Building PDF...' : 'Regenerate PDF'}</span>
          </button>

          {/* Download PDF */}
          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>

          {/* Print Report */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          {/* Return to History */}
          <button
            onClick={() => onNavigate('history')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="no-print bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* =====================================================================
          FORMAL INSPECTION REPORT PREVIEW DOCUMENT (SECTIONS A TO H)
         ===================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden printable-card p-8 sm:p-12 space-y-8 text-slate-900">
        {/* SECTION A: REPORT HEADER */}
        <div className="border-b-2 border-teal-600 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-navy-950 font-black text-2xl tracking-tight">
                <ShieldCheck className="w-8 h-8 text-teal-600" />
                <span>LABELLENS INSPECTORATE</span>
              </div>
              <p className="text-xs font-semibold text-teal-700 tracking-wide mt-0.5">
                Government Legal Metrology Enforcement System • Problem Statement ID #26034
              </p>
              <p className="text-[11px] text-slate-500">
                Statutory Packaging Compliance under Legal Metrology (Packaged Commodities) Rules, 2011
              </p>
            </div>

            <div className="text-right text-xs space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200 sm:min-w-[240px]">
              <div>
                <span className="text-slate-500 font-semibold">Report ID:</span>{' '}
                <span className="font-mono font-bold text-navy-950">
                  {inspection.latest_report_id || `REP-${inspection.id}-V1`}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Inspection ID:</span>{' '}
                <span className="font-mono font-bold text-navy-950">{inspection.id}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Generated:</span>{' '}
                <span className="font-medium text-slate-800">
                  {inspection.report_generated_at
                    ? new Date(inspection.report_generated_at).toLocaleString()
                    : new Date().toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <h2 className="text-xl font-extrabold tracking-tight text-navy-950 uppercase">
              Product Label Compliance Inspection Report
            </h2>
            <div className="mt-2 inline-flex items-center">
              <StatusBadge status={inspection.overall_status} size="lg" />
            </div>
          </div>
        </div>

        {/* SECTION B: INSPECTOR & PREMISES DETAILS */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-navy-950 border-l-3 border-teal-600 pl-2.5">
            B. Inspector & Premises Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 font-semibold block">Inspecting Officer:</span>
              <span className="font-bold text-navy-950">
                {inspection.inspector_name} (ID: {inspection.inspector_id})
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">Inspection Date:</span>
              <span className="font-medium text-slate-900">{inspection.inspection_date}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">Shop / Retailer Name:</span>
              <span className="font-bold text-navy-950">{inspection.shop_name}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">Jurisdiction District & State:</span>
              <span className="font-medium text-slate-900">
                {inspection.district}, {inspection.state}
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-500 font-semibold block">Shop Physical Address:</span>
              <span className="font-medium text-slate-800">{inspection.shop_address}</span>
            </div>
          </div>
        </div>

        {/* SECTION C: PRODUCT DETAILS */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-navy-950 border-l-3 border-teal-600 pl-2.5">
            C. Packaged Commodity Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 font-semibold block">Product Name:</span>
              <span className="font-bold text-navy-950">{inspection.product_name}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">Brand:</span>
              <span className="font-bold text-teal-800">{inspection.brand}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">Commodity Category / Format:</span>
              <span className="font-medium text-slate-800">
                {inspection.product_category} • {inspection.product_type}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">Batch / Lot Identification:</span>
              <span className="font-mono text-slate-800">
                {inspection.batch_lot_number || '[Not Stated on Package]'}
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-500 font-semibold block">Manufacturer / Packer Identity:</span>
              <span className="font-medium text-slate-800">
                {inspection.manufacturer_details || '[Extracted from Packaging Label]'}
              </span>
            </div>
            {inspection.importer_details && (
              <div className="sm:col-span-2">
                <span className="text-slate-500 font-semibold block">Importer Details:</span>
                <span className="font-medium text-slate-800">{inspection.importer_details}</span>
              </div>
            )}
          </div>
        </div>

        {/* SECTION D: INSPECTION EVIDENCE */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-navy-950 border-l-3 border-teal-600 pl-2.5">
            D. Physical Package Scanned Evidence
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {inspection.panels?.map((p, idx) => (
              <div
                key={p.id}
                className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2"
              >
                <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={p.file_url}
                    alt={p.original_filename}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span className="font-bold text-navy-950">
                    Panel {idx + 1}: {p.panel_type}
                  </span>
                  <span className="font-mono text-teal-700">
                    OCR Conf: {p.ocr_confidence ? `${p.ocr_confidence.toFixed(1)}%` : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION E: RULE-BY-RULE COMPLIANCE FINDINGS */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-navy-950 border-l-3 border-teal-600 pl-2.5">
            E. Rule-by-Rule Compliance Findings Table
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-navy-950 text-white font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Statutory Declaration</th>
                  <th className="py-2.5 px-3">Observed Value</th>
                  <th className="py-2.5 px-3">Applicable Mandate</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3">Statutory Explanation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {inspection.compliance_results?.map((r) => (
                  <tr key={r.rule_id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-semibold text-navy-950 whitespace-nowrap">
                      {r.title}
                      <div className="text-[10px] font-mono text-slate-500 font-normal">
                        {r.rule_code}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-800">
                      {r.observed_value || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600 max-w-xs">
                      {r.requirement}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-700 max-w-sm">
                      {r.explanation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION F: POTENTIAL PACKAGING VIOLATIONS */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-navy-950 border-l-3 border-teal-600 pl-2.5">
            F. Suspected Packaging Violations & Statutory Grounds
          </h3>
          {violations.length === 0 ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                No statutory violations detected on the evaluated package panels. All checked declarations comply with Legal Metrology (Packaged Commodities) Rules, 2011.
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {violations.map((v, vIdx) => (
                <div
                  key={v.rule_id}
                  className="bg-red-50/60 rounded-xl border border-red-200 p-4 text-xs space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-red-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-red-900">
                        Finding VIO-{String(vIdx + 1).padStart(2, '0')}: {v.title}
                      </span>
                      <span className="font-mono text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                        {v.rule_code}
                      </span>
                    </div>
                    <span className="font-semibold text-red-800">
                      Inspector Status: <b>{v.verification_status}</b>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-red-700 font-semibold block">Observed Condition:</span>
                      <span className="text-slate-900 font-mono font-medium">
                        {v.observed_value || '[Missing on Packaging]'}
                      </span>
                    </div>
                    <div>
                      <span className="text-red-700 font-semibold block">Legal Reference:</span>
                      <span className="text-slate-800">{v.legal_reference}</span>
                    </div>
                  </div>

                  <p className="text-slate-800 text-[11px] leading-relaxed">
                    <span className="font-semibold text-red-900">Explanation of Non-Compliance:</span>{' '}
                    {v.explanation}
                  </p>

                  {v.inspector_remarks && (
                    <div className="text-[11px] text-slate-700 bg-white/70 p-2 rounded border border-red-200">
                      <span className="font-bold text-navy-950">Inspector Observation:</span>{' '}
                      {v.inspector_remarks}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION G: REMARKS AND CONCLUSION (Editable in Preview) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-navy-950 border-l-3 border-teal-600 pl-2.5">
            G. Inspector Remarks and Statutory Assessment
          </h3>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-navy-950 mb-1">
                Inspector Observations & Text Rectifications:
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={2}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter field observations..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-950 mb-1">
                Statutory Assessment & Enforcement Recommendation:
              </label>
              <textarea
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                rows={2}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                placeholder="Enter enforcement recommendation..."
              />
            </div>
          </div>
        </div>

        {/* SECTION H: SIGN-OFF & STATUTORY DISCLAIMER */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-navy-950 border-l-3 border-teal-600 pl-2.5">
            H. Official Sign-Off & Attestation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs">
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600">
                  Inspecting Officer Name:
                </label>
                <input
                  type="text"
                  value={signoffName}
                  onChange={(e) => setSignoffName(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Identifier / Badge:</span>
                <span className="font-mono font-bold text-navy-950">
                  {inspection.inspector_id}
                </span>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600">
                  Attestation Date:
                </label>
                <input
                  type="date"
                  value={signoffDate}
                  onChange={(e) => setSignoffDate(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 bg-white"
                />
              </div>
            </div>

            <div className="flex flex-col justify-between border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-6 pt-4 sm:pt-0">
              <span className="text-[11px] font-bold text-slate-700">
                Authorized Signature / Digital Seal:
              </span>
              <div className="my-4 h-16 border-b-2 border-dashed border-slate-300 flex items-end justify-center pb-1 text-slate-400 font-serif italic text-sm">
                [ Digitally Signed by {signoffName} ]
              </div>
              <div className="text-[10px] text-slate-500 text-center">
                Legal Metrology Field Enforcement Officer
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-100 rounded-lg text-[10px] text-slate-500 leading-relaxed">
            <b>STATUTORY NOTICE & DISCLAIMER:</b> This document is an inspection report generated by the LabelLens digital verification system for Smart India Hackathon 2026. Under the Legal Metrology Act, 2009 and Packaged Commodities Rules, 2011, this document records field observations, OCR readings, and automated rule comparisons. It does not constitute an official certificate or administrative penalty order unless formally ratified through designated statutory procedures.
          </div>
        </div>
      </div>
    </div>
  );
};
