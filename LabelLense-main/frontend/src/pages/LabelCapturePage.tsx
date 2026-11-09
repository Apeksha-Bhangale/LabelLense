import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  RefreshCw,
  ArrowRight,
  Eye,
  Layers,
  FileImage,
  Info
} from 'lucide-react';
import { InspectionDetail, PageView, PackagePanel } from '../types';
import { uploadPanelImage, loadDemoSamplePanel, deletePanelImage } from '../api';
import { ImageEvidenceViewer } from '../components/ImageEvidenceViewer';

interface LabelCapturePageProps {
  inspection: InspectionDetail;
  onInspectionUpdated: (updated: InspectionDetail) => void;
  onNavigate: (page: PageView) => void;
}

export const LabelCapturePage: React.FC<LabelCapturePageProps> = ({
  inspection,
  onInspectionUpdated,
  onNavigate,
}) => {
  const [panelType, setPanelType] = useState<string>('Principal Display Panel');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPanelIndex, setSelectedPanelIndex] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const panels = inspection.panels || [];
  const currentPanel = panels[selectedPanelIndex] || panels[0];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);
      const updated = await uploadPanelImage(inspection.id, panelType, file);
      onInspectionUpdated(updated);
      setSelectedPanelIndex(updated.panels.length - 1);
    } catch (err: any) {
      setError(err.message || 'Failed to upload and process image via OCR');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleLoadDemo = async (demoKey: 'rice' | 'spread' | 'syrup') => {
    try {
      setIsUploading(true);
      setError(null);
      const updated = await loadDemoSamplePanel(inspection.id, demoKey);
      onInspectionUpdated(updated);
      setSelectedPanelIndex(updated.panels.length - 1);
    } catch (err: any) {
      setError(err.message || 'Failed to load demonstration sample');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePanel = async (panelId: string) => {
    if (!window.confirm('Are you sure you want to remove this package panel image?')) return;
    try {
      setIsUploading(true);
      const updated = await deletePanelImage(inspection.id, panelId);
      onInspectionUpdated(updated);
      setSelectedPanelIndex(Math.max(0, selectedPanelIndex - 1));
    } catch (err: any) {
      setError(err.message || 'Failed to remove panel');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 mb-1.5">
            <Camera className="w-3.5 h-3.5 text-teal-600" />
            <span>Inspection Workflow • Step 2 of 5</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-950">
            Label Image Capture & OCR Processing
          </h1>
          <p className="text-xs text-slate-500">
            Capture or upload packaged product label images. The system preserves the original photo, applies OpenCV contrast and edge preprocessing, extracts text coordinates with OCR, and parses statutory declarations.
          </p>
        </div>

        {/* Next Step Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('declarations')}
            disabled={panels.length === 0}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all ${
              panels.length > 0
                ? 'bg-teal-600 hover:bg-teal-500 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Proceed to Declaration Review</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Zone & Demo Picker Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Upload and Camera Controls */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-navy-950 uppercase tracking-wide flex items-center gap-2">
            <Upload className="w-4 h-4 text-teal-600" />
            <span>Add Packaging Panel Photo</span>
          </h2>

          {/* Panel Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Panel Face / Section:
            </label>
            <select
              value={panelType}
              onChange={(e) => setPanelType(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="Principal Display Panel">Principal Display Panel (PDP / Front)</option>
              <option value="Declarations & MRP Panel">Back / Statutory Declarations Panel</option>
              <option value="Side Nutrition & Specs Panel">Side Nutrition & Specifications Panel</option>
              <option value="Top / Flap Date Stamp Panel">Top / Flap Batch & Date Stamping</option>
              <option value="Supplementary Label">Supplementary / Imported Over-label</option>
            </select>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Take Camera Photo (Mobile-friendly) */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isUploading}
              className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-teal-500/50 bg-teal-50/50 hover:bg-teal-50 hover:border-teal-500 text-teal-800 transition-all cursor-pointer text-center group"
            >
              <Camera className="w-6 h-6 text-teal-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Use Mobile Camera</span>
              <span className="text-[10px] text-teal-600">Capture in field</span>
            </button>

            {/* Upload from Gallery / Computer */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 text-slate-700 transition-all cursor-pointer text-center group"
            >
              <Upload className="w-6 h-6 text-slate-500 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Upload Image File</span>
              <span className="text-[10px] text-slate-500">JPG, PNG, WebP</span>
            </button>
          </div>

          {/* Demonstration Sample Loader (SIH Requirement) */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Or Load Realistic Demonstration Sample:</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleLoadDemo('rice')}
                disabled={isUploading}
                className="px-2 py-2 text-center rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 transition-colors cursor-pointer"
              >
                <div className="text-[11px] font-bold">Basmati Rice</div>
                <div className="text-[9px] text-emerald-700">Compliant (PASS)</div>
              </button>

              <button
                type="button"
                onClick={() => handleLoadDemo('spread')}
                disabled={isUploading}
                className="px-2 py-2 text-center rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-900 transition-colors cursor-pointer"
              >
                <div className="text-[11px] font-bold">Hazelnut Spread</div>
                <div className="text-[9px] text-red-700">3 Violations</div>
              </button>

              <button
                type="button"
                onClick={() => handleLoadDemo('syrup')}
                disabled={isUploading}
                className="px-2 py-2 text-center rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 transition-colors cursor-pointer"
              >
                <div className="text-[11px] font-bold">Cough Syrup</div>
                <div className="text-[9px] text-amber-700">Needs Review</div>
              </button>
            </div>
          </div>

          {/* Processing Loading Indicator */}
          {isUploading && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-800 flex items-center gap-2 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
              <span>Executing OpenCV preprocessing and OCR text recognition...</span>
            </div>
          )}
        </div>

        {/* Middle/Right: Uploaded Panels Thumbnail List & Active Viewer */}
        <div className="lg:col-span-2 space-y-4">
          {panels.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
              <FileImage className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-navy-950 mb-1">
                No Package Panels Uploaded Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Upload packaging photographs or choose one of the demonstration samples to run OCR extraction under Legal Metrology Rules.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Panel Tabs (if multi-panel) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {panels.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPanelIndex(idx)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 border ${
                      selectedPanelIndex === idx
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Panel {idx + 1}: {p.panel_type}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePanel(p.id);
                      }}
                      className="ml-1 text-slate-400 hover:text-red-500"
                      title="Remove panel"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </button>
                ))}
              </div>

              {/* Active Image Viewer Component with OpenCV Toggle */}
              {currentPanel && (
                <div className="space-y-3">
                  <ImageEvidenceViewer panel={currentPanel} />

                  {/* OCR Recognition Summary Bar */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border-r border-slate-100 pr-3">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase">
                        Recognized Text Lines
                      </div>
                      <div className="text-lg font-bold text-navy-950 mt-0.5">
                        {currentPanel.ocr_lines?.length || 0} lines
                      </div>
                      <div className="text-[11px] text-teal-600 font-medium">
                        Coordinates mapped to evidence
                      </div>
                    </div>

                    <div className="border-r border-slate-100 pr-3">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase">
                        OCR Legibility Score
                      </div>
                      <div className="text-lg font-bold text-teal-700 mt-0.5">
                        {currentPanel.ocr_confidence ? `${currentPanel.ocr_confidence.toFixed(1)}%` : '—'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {currentPanel.ocr_confidence && currentPanel.ocr_confidence > 70
                          ? 'High confidence extraction'
                          : 'Manual check recommended'}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-semibold text-slate-500 uppercase">
                        Preprocessed with OpenCV
                      </div>
                      <div className="text-xs font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>CLAHE & Denoising Applied</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Original preserved alongside
                      </div>
                    </div>
                  </div>

                  {/* Image Quality Advisories (if any) */}
                  {currentPanel.quality_warnings && currentPanel.quality_warnings.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-800">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Image Quality Advisory</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                        {currentPanel.quality_warnings.map((w, wIdx) => (
                          <li key={wIdx}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Extracted Raw OCR Text (Collapsible view) */}
                  <details className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
                    <summary className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                      View Raw OCR Text Extraction ({currentPanel.ocr_lines?.length || 0} recognized items)
                    </summary>
                    <pre className="mt-2 text-[11px] font-mono bg-slate-50 p-3 rounded border border-slate-200 text-slate-800 max-h-48 overflow-auto whitespace-pre-wrap">
                      {currentPanel.ocr_text || 'No text recognized.'}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
