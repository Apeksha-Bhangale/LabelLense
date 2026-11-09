import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Edit3,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Save,
  HelpCircle,
  Eye
} from 'lucide-react';
import { InspectionDetail, PageView, DeclarationItem } from '../types';
import { updateDeclarationField } from '../api';
import { ImageEvidenceViewer } from '../components/ImageEvidenceViewer';

interface DeclarationReviewPageProps {
  inspection: InspectionDetail;
  onInspectionUpdated: (updated: InspectionDetail) => void;
  onNavigate: (page: PageView) => void;
}

export const DeclarationReviewPage: React.FC<DeclarationReviewPageProps> = ({
  inspection,
  onInspectionUpdated,
  onNavigate,
}) => {
  const declarations = inspection.declarations || [];
  const panels = inspection.panels || [];

  // Edit states for fields
  const [editedValues, setEditedValues] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    declarations.forEach((d) => {
      map[d.field_key] = d.corrected_value ?? d.extracted_value ?? '';
    });
    return map;
  });

  const [savingField, setSavingField] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedDeclForEvidence, setSelectedDeclForEvidence] = useState<DeclarationItem | null>(null);

  const handleValueChange = (fieldKey: string, val: string) => {
    setEditedValues((prev) => ({ ...prev, [fieldKey]: val }));
  };

  const handleSaveField = async (d: DeclarationItem) => {
    const newVal = editedValues[d.field_key] ?? '';
    try {
      setSavingField(d.field_key);
      const updated = await updateDeclarationField(inspection.id, d.field_key, newVal);
      onInspectionUpdated(updated);
      setSuccessMsg(`Updated '${d.label}' successfully.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save correction');
    } finally {
      setSavingField(null);
    }
  };

  const activePanel = panels.find((p) => p.id === selectedDeclForEvidence?.evidence_panel_id) || panels[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 mb-1.5">
            <FileText className="w-3.5 h-3.5 text-teal-600" />
            <span>Inspection Workflow • Step 3 of 5</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-950">
            Statutory Declaration Review & Corrections
          </h1>
          <p className="text-xs text-slate-500">
            Verify OCR-parsed declarations against the product package. Inspectors can rectify any OCR misinterpretations or enter declarations manually. AI confidence alone does not establish legal compliance.
          </p>
        </div>

        {/* Action to proceed to Step 4 */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('compliance')}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <span>Proceed to Compliance Engine</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid: Declarations List on Left, Evidence Image on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Declarations Form (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-navy-950 uppercase tracking-wide">
                Evaluated Declarations ({declarations.length})
              </span>
              <span className="text-[11px] text-slate-500 ml-2">
                Legal Metrology (Packaged Commodities) Rules, 2011
              </span>
            </div>
            <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-medium">
              Click 'Inspect Evidence' to highlight region
            </span>
          </div>

          {declarations.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-500 text-xs">
              No declarations available. Please upload a label image in Step 2.
            </div>
          ) : (
            <div className="space-y-3">
              {declarations.map((d) => {
                const currentVal = editedValues[d.field_key] ?? '';
                const isModified = currentVal !== (d.extracted_value || '');
                const isMissing = !currentVal.trim();
                const isSelected = selectedDeclForEvidence?.id === d.id;

                return (
                  <div
                    key={d.id}
                    className={`bg-white rounded-xl border transition-all p-4 shadow-2xs ${
                      isSelected
                        ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                        : isMissing
                        ? 'border-red-200 bg-red-50/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Header info */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-navy-950">
                          {d.label}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-navy-50 text-navy-700 border border-navy-200">
                          {d.legal_rule_ref}
                        </span>
                      </div>

                      {/* Badges & Evidence Trigger */}
                      <div className="flex items-center gap-2">
                        {d.confidence > 0 && (
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                              d.confidence > 75
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            OCR: {d.confidence.toFixed(0)}%
                          </span>
                        )}

                        {d.evidence_bbox && (
                          <button
                            type="button"
                            onClick={() => setSelectedDeclForEvidence(d)}
                            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded transition-colors ${
                              isSelected
                                ? 'bg-teal-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700'
                            }`}
                          >
                            <Eye className="w-3 h-3" />
                            <span>Inspect Region</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Missing Alert if empty */}
                    {isMissing && (
                      <div className="mb-2 text-[11px] text-red-700 flex items-center gap-1.5 bg-red-50 p-1.5 rounded border border-red-200">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                        <span>Declaration was not detected in OCR scan. Enter value manually if present on packaging.</span>
                      </div>
                    )}

                    {/* Editable Text Field */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={currentVal}
                          onChange={(e) => handleValueChange(d.field_key, e.target.value)}
                          placeholder={`Enter ${d.label.toLowerCase()}...`}
                          className={`w-full text-xs px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium ${
                            isModified
                              ? 'border-teal-500 bg-teal-50/20 text-navy-950 font-semibold'
                              : 'border-slate-300 text-slate-800'
                          }`}
                        />

                        {/* Save Button for this field */}
                        <button
                          type="button"
                          onClick={() => handleSaveField(d)}
                          disabled={savingField === d.field_key}
                          className="px-3 py-2 text-xs font-semibold rounded-lg bg-navy-800 hover:bg-navy-900 active:bg-navy-950 text-white flex items-center gap-1 transition-colors flex-shrink-0 cursor-pointer disabled:opacity-50"
                          title="Save Inspector Correction"
                        >
                          <Save className="w-3.5 h-3.5 text-teal-300" />
                          <span>{savingField === d.field_key ? 'Saving...' : 'Save'}</span>
                        </button>
                      </div>

                      {/* Statutory Requirement Guide Note */}
                      {d.notes && (
                        <p className="text-[11px] text-slate-500 leading-tight">
                          <span className="font-semibold text-slate-600">Requirement:</span> {d.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Evidence Visualizer (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs sticky top-20">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-navy-950 uppercase">
                <Eye className="w-4 h-4 text-teal-600" />
                <span>Visual Packaging Evidence</span>
              </div>
              {selectedDeclForEvidence && (
                <button
                  onClick={() => setSelectedDeclForEvidence(null)}
                  className="text-[11px] text-slate-500 hover:text-slate-800"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {activePanel ? (
              <div className="space-y-3">
                <ImageEvidenceViewer
                  panel={activePanel}
                  highlightBbox={selectedDeclForEvidence?.evidence_bbox}
                  highlightLabel={selectedDeclForEvidence?.label}
                  isViolation={false}
                />
                {selectedDeclForEvidence ? (
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-xs text-teal-900">
                    <span className="font-bold text-teal-950">Active Declaration:</span> {selectedDeclForEvidence.label}
                    <div className="text-[11px] text-teal-700 mt-1 font-mono">
                      Extracted Text: "{selectedDeclForEvidence.extracted_value || 'None'}"
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-2 text-xs text-slate-500 italic">
                    Click 'Inspect Region' on any declaration to spotlight its physical packaging coordinates.
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
