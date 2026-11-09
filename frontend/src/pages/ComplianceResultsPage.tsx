import React, { useState } from 'react';
import {
  CheckSquare,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  MinusCircle,
  ArrowRight,
  Eye,
  Save,
  ShieldAlert,
  FileCheck2,
  Scale
} from 'lucide-react';
import { InspectionDetail, PageView, ComplianceCheckResult } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { verifyComplianceRule } from '../api';
import { ImageEvidenceViewer } from '../components/ImageEvidenceViewer';

interface ComplianceResultsPageProps {
  inspection: InspectionDetail;
  onInspectionUpdated: (updated: InspectionDetail) => void;
  onNavigate: (page: PageView) => void;
}

export const ComplianceResultsPage: React.FC<ComplianceResultsPageProps> = ({
  inspection,
  onInspectionUpdated,
  onNavigate,
}) => {
  const results = inspection.compliance_results || [];
  const panels = inspection.panels || [];

  const [selectedResult, setSelectedResult] = useState<ComplianceCheckResult | null>(
    results.find((r) => r.status === 'POTENTIAL_VIOLATION') || results[0] || null
  );

  // Inspector verification states
  const [verificationMap, setVerificationMap] = useState<
    Record<string, { status: 'CONFIRMED' | 'REJECTED' | 'FURTHER_REVIEW'; remarks: string }>
  >(() => {
    const map: Record<string, any> = {};
    results.forEach((r) => {
      map[r.rule_id] = {
        status: (r.verification_status as any) || 'UNVERIFIED',
        remarks: r.inspector_remarks || '',
      };
    });
    return map;
  });

  const [savingRuleId, setSavingRuleId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleVerificationChange = (
    ruleId: string,
    status: 'CONFIRMED' | 'REJECTED' | 'FURTHER_REVIEW'
  ) => {
    setVerificationMap((prev) => ({
      ...prev,
      [ruleId]: { ...prev[ruleId], status },
    }));
  };

  const handleRemarksChange = (ruleId: string, remarks: string) => {
    setVerificationMap((prev) => ({
      ...prev,
      [ruleId]: { ...prev[ruleId], remarks },
    }));
  };

  const handleSaveDecision = async (ruleId: string) => {
    const item = verificationMap[ruleId];
    if (!item) return;

    try {
      setSavingRuleId(ruleId);
      const updated = await verifyComplianceRule(
        inspection.id,
        ruleId,
        item.status,
        item.remarks
      );
      onInspectionUpdated(updated);
      setFeedbackMsg(`Verification recorded for ${ruleId}.`);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to record verification');
    } finally {
      setSavingRuleId(null);
    }
  };

  const activePanel =
    panels.find((p) => p.id === selectedResult?.evidence_panel_id) || panels[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 mb-1.5">
            <Scale className="w-3.5 h-3.5 text-teal-600" />
            <span>Inspection Workflow • Step 4 of 5</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-950">
            Legal Metrology Compliance Results
          </h1>
          <p className="text-xs text-slate-500">
            Algorithmic rule findings evaluated under Legal Metrology (Packaged Commodities) Rules, 2011. Inspect evidence, review suspected non-compliances, and record formal inspector verification decisions.
          </p>
        </div>

        {/* Generate Report Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('report_preview')}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Generate Inspection Report</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Summary Scorecard Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Total */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 text-center shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">
            Total Checks
          </div>
          <div className="text-2xl font-extrabold text-navy-950 mt-0.5">
            {inspection.total_checks}
          </div>
          <div className="text-[10px] text-slate-400">Rule 6 & Rule 12/13</div>
        </div>

        {/* Passed */}
        <div className="bg-white rounded-xl border border-emerald-200 p-3.5 text-center shadow-xs">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase">
            Passed Checks
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-0.5">
            {inspection.passed_checks}
          </div>
          <div className="text-[10px] text-emerald-600 font-medium">Standard met</div>
        </div>

        {/* Potential Violations */}
        <div className="bg-white rounded-xl border border-red-200 p-3.5 text-center shadow-xs">
          <div className="text-[11px] font-semibold text-red-700 uppercase">
            Potential Violations
          </div>
          <div className="text-2xl font-extrabold text-red-600 mt-0.5">
            {inspection.violation_checks}
          </div>
          <div className="text-[10px] text-red-600 font-medium">Statutory flags</div>
        </div>

        {/* Needs Review */}
        <div className="bg-white rounded-xl border border-amber-200 p-3.5 text-center shadow-xs">
          <div className="text-[11px] font-semibold text-amber-700 uppercase">
            Needs Review
          </div>
          <div className="text-2xl font-extrabold text-amber-600 mt-0.5">
            {inspection.review_checks}
          </div>
          <div className="text-[10px] text-amber-600 font-medium">Visual check req.</div>
        </div>

        {/* Not Applicable */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 text-center shadow-xs col-span-2 sm:col-span-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">
            Not Applicable
          </div>
          <div className="text-2xl font-extrabold text-slate-600 mt-0.5">
            {inspection.na_checks}
          </div>
          <div className="text-[10px] text-slate-400">Exempt / Domestic</div>
        </div>
      </div>

      {/* Main Grid: Left Rules Findings List (7 cols), Right Evidence Inspector (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Findings Table & Verification Controls */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-3">
            {results.map((r) => {
              const isSelected = selectedResult?.rule_id === r.rule_id;
              const isViolation = r.status === 'POTENTIAL_VIOLATION';
              const isReview = r.status === 'NEEDS_REVIEW';
              const verifState = verificationMap[r.rule_id] || {
                status: r.verification_status,
                remarks: r.inspector_remarks,
              };

              return (
                <div
                  key={r.rule_id}
                  onClick={() => setSelectedResult(r)}
                  className={`bg-white rounded-xl border p-4 shadow-2xs transition-all cursor-pointer ${
                    isSelected
                      ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                      : isViolation
                      ? 'border-red-200 hover:border-red-300 bg-red-50/10'
                      : isReview
                      ? 'border-amber-200 hover:border-amber-300 bg-amber-50/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-navy-950">
                        {r.title}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {r.rule_code}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={r.status} size="sm" />
                      {r.evidence_bbox && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedResult(r);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded hover:bg-teal-100 border border-teal-200"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Evidence</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Observed Value & Statutory Requirement */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase">
                        Observed On Packaging:
                      </span>
                      <span className="font-mono text-slate-900 font-medium">
                        {r.observed_value || '[Not Detected]'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block text-[10px] uppercase">
                        Statutory Mandate:
                      </span>
                      <span className="text-slate-700">{r.requirement}</span>
                    </div>
                  </div>

                  {/* Legal Explanation */}
                  <div
                    className={`text-xs p-2.5 rounded-lg border mb-3 ${
                      isViolation
                        ? 'bg-red-50 text-red-900 border-red-200'
                        : isReview
                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    }`}
                  >
                    <span className="font-bold">Statutory Finding:</span> {r.explanation}
                    <div className="text-[10px] font-mono mt-1 opacity-75">
                      Ref: {r.legal_reference}
                    </div>
                  </div>

                  {/* Inspector Verification Controls for Potential Findings */}
                  {(isViolation || isReview) && (
                    <div
                      className="mt-3 pt-3 border-t border-slate-200 space-y-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">
                          Inspector Verification Decision:
                        </span>
                        {r.verification_status !== 'UNVERIFIED' && (
                          <StatusBadge status={r.verification_status} size="sm" />
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleVerificationChange(r.rule_id, 'CONFIRMED')}
                          className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
                            verifState.status === 'CONFIRMED'
                              ? 'bg-red-600 text-white border-red-600 shadow-xs'
                              : 'bg-white text-red-700 border-red-200 hover:bg-red-50'
                          }`}
                        >
                          Confirm Violation
                        </button>
                        <button
                          type="button"
                          onClick={() => handleVerificationChange(r.rule_id, 'REJECTED')}
                          className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
                            verifState.status === 'REJECTED'
                              ? 'bg-slate-700 text-white border-slate-700 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          Reject Finding (Inspector Discretion)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleVerificationChange(r.rule_id, 'FURTHER_REVIEW')}
                          className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
                            verifState.status === 'FURTHER_REVIEW'
                              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                              : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
                          }`}
                        >
                          Mark for Laboratory / Further Review
                        </button>
                      </div>

                      {/* Inspector Remarks Input */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={verifState.remarks}
                          onChange={(e) => handleRemarksChange(r.rule_id, e.target.value)}
                          placeholder="Enter inspector justification or remarks..."
                          className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveDecision(r.rule_id)}
                          disabled={savingRuleId === r.rule_id}
                          className="px-3 py-1.5 text-xs font-bold rounded bg-navy-800 hover:bg-navy-900 active:bg-navy-950 text-white flex items-center gap-1 flex-shrink-0 cursor-pointer disabled:opacity-50"
                        >
                          <Save className="w-3.5 h-3.5 text-teal-300" />
                          <span>{savingRuleId === r.rule_id ? 'Saving...' : 'Save'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Evidence Visualizer (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs sticky top-20">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-navy-950 uppercase">
                <Eye className="w-4 h-4 text-teal-600" />
                <span>Evidence Spotlight</span>
              </div>
              {selectedResult && (
                <span className="text-[10px] font-mono text-slate-500">
                  {selectedResult.rule_code}
                </span>
              )}
            </div>

            {activePanel ? (
              <div className="space-y-3">
                <ImageEvidenceViewer
                  panel={activePanel}
                  highlightBbox={selectedResult?.evidence_bbox}
                  highlightLabel={selectedResult?.title}
                  isViolation={selectedResult?.status === 'POTENTIAL_VIOLATION'}
                />

                {selectedResult ? (
                  <div
                    className={`p-3 rounded-lg border text-xs ${
                      selectedResult.status === 'POTENTIAL_VIOLATION'
                        ? 'bg-red-50 text-red-900 border-red-200'
                        : selectedResult.status === 'NEEDS_REVIEW'
                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    }`}
                  >
                    <div className="font-bold">{selectedResult.title}</div>
                    <div className="text-[11px] mt-1">
                      {selectedResult.evidence_bbox ? (
                        <span>
                          Target OCR Region Spotlighted on Package Panel above.
                        </span>
                      ) : (
                        <span className="italic">
                          Declaration was not detected in OCR evidence. Coordinates unavailable.
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-2 text-xs text-slate-500 italic">
                    Select any statutory rule finding on the left to spotlight packaging evidence.
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No panel image uploaded for evidence verification.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
