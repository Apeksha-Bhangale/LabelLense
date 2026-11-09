import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  ArrowLeft,
  Calendar,
  Store,
  Building,
  Layers,
  Scale,
  FileCheck2,
  ExternalLink,
  Edit,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { InspectionDetail, PageView } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ImageEvidenceViewer } from '../components/ImageEvidenceViewer';

interface SavedInspectionDetailsPageProps {
  inspection: InspectionDetail;
  onNavigate: (page: PageView) => void;
  onSelectInspection: (id: string, targetPage?: PageView) => void;
}

export const SavedInspectionDetailsPage: React.FC<SavedInspectionDetailsPageProps> = ({
  inspection,
  onNavigate,
  onSelectInspection,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'compliance' | 'report'>('overview');

  const panels = inspection.panels || [];
  const decls = inspection.declarations || [];
  const compResults = inspection.compliance_results || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <button
            onClick={() => onNavigate('history')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-950 mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Inspection History Archive</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-navy-950">
              Inspection Details: <span className="font-mono text-teal-700">{inspection.id}</span>
            </h1>
            <StatusBadge status={inspection.overall_status} size="md" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Product: <b>{inspection.product_name}</b> ({inspection.brand}) • Inspected on {inspection.inspection_date}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Re-enter Workflow */}
          <button
            onClick={() => onSelectInspection(inspection.id, 'declarations')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-navy-800 hover:bg-navy-900 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5 text-teal-300" />
            <span>Edit Declarations</span>
          </button>

          {/* View / Generate Report */}
          <button
            onClick={() => onSelectInspection(inspection.id, 'report_preview')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>View Full Report</span>
          </button>

          {inspection.report_generated && (
            <button
              onClick={() => window.open(`/api/inspections/${inspection.id}/reports/pdf`, '_blank')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Overview & Declarations ({decls.length})
        </button>
        <button
          onClick={() => setActiveTab('evidence')}
          className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'evidence'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Scanned Evidence Panels ({panels.length})
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'compliance'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Compliance Findings ({compResults.length})
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'report'
              ? 'border-teal-600 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Report Versioning & Attestation
        </button>
      </div>

      {/* Tab 1: Overview & Declarations */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Meta */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase text-navy-950 flex items-center gap-2">
                <Building className="w-4 h-4 text-teal-600" />
                <span>Commodity Identification</span>
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block">Product:</span>
                  <span className="font-bold text-navy-950">{inspection.product_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Brand:</span>
                  <span className="font-bold text-teal-800">{inspection.brand}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Category:</span>
                  <span className="text-slate-800">{inspection.product_category}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Batch No:</span>
                  <span className="font-mono text-slate-800">
                    {inspection.batch_lot_number || 'N/A'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 font-semibold block">Manufacturer / Packer:</span>
                  <span className="text-slate-800">
                    {inspection.manufacturer_details || 'Extracted via OCR from packaging'}
                  </span>
                </div>
              </div>
            </div>

            {/* Premises Meta */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase text-navy-950 flex items-center gap-2">
                <Store className="w-4 h-4 text-teal-600" />
                <span>Inspection & Retail Premises</span>
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block">Retailer:</span>
                  <span className="font-bold text-navy-950">{inspection.shop_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Date:</span>
                  <span className="text-slate-800">{inspection.inspection_date}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Inspector:</span>
                  <span className="text-slate-800">
                    {inspection.inspector_name} ({inspection.inspector_id})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Jurisdiction:</span>
                  <span className="text-slate-800">
                    {inspection.district}, {inspection.state}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 font-semibold block">Address:</span>
                  <span className="text-slate-800">{inspection.shop_address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Declarations Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-navy-950 uppercase">
              Observed Statutory Declarations
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase text-[10px]">
                    <th className="py-2.5 px-4">Statutory Declaration</th>
                    <th className="py-2.5 px-4">Observed / Extracted Text</th>
                    <th className="py-2.5 px-4">Legal Metrology Rule</th>
                    <th className="py-2.5 px-4 text-center">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {decls.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-semibold text-navy-950">
                        {d.label}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-800">
                        {d.corrected_value || d.extracted_value || (
                          <span className="text-red-500 italic">Not Detected</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {d.legal_rule_ref}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {d.confidence > 0 ? (
                          <span className="font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-[11px] border border-teal-200">
                            {d.confidence.toFixed(0)}%
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Scanned Evidence Panels */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          {panels.map((p, idx) => (
            <div key={p.id} className="space-y-3">
              <h3 className="text-sm font-bold text-navy-950">
                Panel {idx + 1}: {p.panel_type}
              </h3>
              <ImageEvidenceViewer panel={p} />
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Compliance Findings */}
      {activeTab === 'compliance' && (
        <div className="space-y-4">
          {compResults.map((r) => (
            <div
              key={r.rule_id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-navy-950">{r.title}</span>
                  <span className="font-mono text-[10px] text-slate-500">{r.rule_code}</span>
                </div>
                <StatusBadge status={r.status} size="sm" />
              </div>
              <div className="text-slate-700">{r.explanation}</div>
              <div className="text-[11px] text-slate-500">
                Requirement: <i>{r.requirement}</i>
              </div>
              {r.verification_status !== 'UNVERIFIED' && (
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700">
                    Inspector Status: <b>{r.verification_status}</b>
                  </span>
                  {r.inspector_remarks && (
                    <span className="text-slate-600 italic">
                      Remarks: "{r.inspector_remarks}"
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Report Versioning */}
      {activeTab === 'report' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-950">
                Inspection Report Dossier Status
              </h3>
              <p className="text-slate-500 text-[11px]">
                Preserved PDF reports generated for this inspection record
              </p>
            </div>
            {inspection.report_generated ? (
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                Version {inspection.report_version} Active
              </span>
            ) : (
              <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                Draft / Unfinalized
              </span>
            )}
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div>
              <span className="text-slate-500 font-semibold">Latest Report Number:</span>{' '}
              <span className="font-mono font-bold text-navy-950">
                {inspection.latest_report_id || 'Not Generated'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold">Attesting Inspector:</span>{' '}
              <span className="text-slate-800">
                {inspection.signoff_name || inspection.inspector_name}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold">Attestation Date:</span>{' '}
              <span className="text-slate-800">
                {inspection.signoff_date || inspection.inspection_date}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onSelectInspection(inspection.id, 'report_preview')}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold transition-colors cursor-pointer"
            >
              Open Full Printable Report
            </button>
            {inspection.report_generated && (
              <button
                onClick={() => window.open(`/api/inspections/${inspection.id}/reports/pdf`, '_blank')}
                className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold transition-colors cursor-pointer"
              >
                Download Official PDF
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
