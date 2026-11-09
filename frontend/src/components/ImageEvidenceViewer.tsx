import React, { useState, useRef } from 'react';
import { PackagePanel, BoundingBox, OCRLine } from '../types';
import { ZoomIn, ZoomOut, RotateCcw, Eye, Sparkles, AlertCircle } from 'lucide-react';

interface ImageEvidenceViewerProps {
  panel: PackagePanel;
  highlightBbox?: BoundingBox | null;
  highlightLabel?: string;
  isViolation?: boolean;
}

export const ImageEvidenceViewer: React.FC<ImageEvidenceViewerProps> = ({
  panel,
  highlightBbox,
  highlightLabel,
  isViolation = false,
}) => {
  const [viewMode, setViewMode] = useState<'original' | 'preprocessed'>('original');
  const [zoom, setZoom] = useState<number>(1);
  const [showAllBoxes, setShowAllBoxes] = useState<boolean>(true);
  const [hoveredLine, setHoveredLine] = useState<OCRLine | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);

  const imgUrl =
    viewMode === 'preprocessed' && panel.preprocessed_url
      ? panel.preprocessed_url
      : panel.file_url;

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 2.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.75));
  const handleResetZoom = () => setZoom(1);

  // Calculate box position in percentages relative to intrinsic image dimensions
  const getBoxStyle = (bbox: BoundingBox, isHighlight: boolean = false) => {
    const widthPct = (bbox.width / panel.image_width) * 100;
    const heightPct = (bbox.height / panel.image_height) * 100;
    const leftPct = (bbox.x / panel.image_width) * 100;
    const topPct = (bbox.y / panel.image_height) * 100;

    return {
      left: `${leftPct}%`,
      top: `${topPct}%`,
      width: `${Math.max(widthPct, 2)}%`,
      height: `${Math.max(heightPct, 2)}%`,
    };
  };

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-md">
      {/* Top Toolbar */}
      <div className="bg-slate-950 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">Panel:</span>
          <span className="text-teal-400 font-medium">{panel.panel_type}</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">
            {panel.image_width} × {panel.image_height} px
          </span>
          {panel.ocr_confidence && (
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-teal-300 font-mono text-[11px] border border-slate-700">
              Avg OCR: {panel.ocr_confidence.toFixed(1)}%
            </span>
          )}
        </div>

        {/* View Toggle & Zoom Controls */}
        <div className="flex items-center gap-3">
          {/* Original vs Preprocessed Toggle */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setViewMode('original')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'original'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Original
            </button>
            <button
              onClick={() => setViewMode('preprocessed')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                viewMode === 'preprocessed'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="OpenCV CLAHE contrast & denoising applied for OCR readability"
            >
              <Sparkles className="w-3 h-3 text-teal-300" />
              <span>OpenCV Enhanced</span>
            </button>
          </div>

          {/* Toggle OCR Bounding Boxes */}
          <button
            onClick={() => setShowAllBoxes(!showAllBoxes)}
            className={`px-2 py-1 rounded text-xs flex items-center gap-1 border transition-colors ${
              showAllBoxes
                ? 'bg-navy-800 border-teal-500 text-teal-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>OCR Boxes</span>
          </button>

          {/* Zoom Buttons */}
          <div className="flex items-center gap-1 bg-slate-800 px-1 py-0.5 rounded border border-slate-700">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:text-white text-slate-400"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1 text-slate-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:text-white text-slate-400"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 hover:text-white text-slate-400"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Image Canvas with Overlays */}
      <div className="relative overflow-auto max-h-[500px] flex items-center justify-center p-4 bg-slate-950/60 select-none">
        <div
          className="relative inline-block transition-transform duration-150 origin-top"
          style={{ transform: `scale(${zoom})` }}
        >
          <img
            ref={imgRef}
            src={imgUrl}
            alt={panel.original_filename}
            className="max-w-full h-auto rounded shadow-lg block max-h-[460px] object-contain"
          />

          {/* Highlighted Specific Evidence Bounding Box */}
          {highlightBbox && (
            <div
              className={`absolute border-2 pointer-events-none transition-all z-20 ${
                isViolation
                  ? 'border-red-500 bg-red-500/25 ring-2 ring-red-400 ring-offset-1'
                  : 'border-teal-400 bg-teal-400/20 ring-2 ring-teal-300'
              }`}
              style={getBoxStyle(highlightBbox, true)}
            >
              {highlightLabel && (
                <div
                  className={`absolute -top-6 left-0 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-md whitespace-nowrap ${
                    isViolation
                      ? 'bg-red-600 text-white'
                      : 'bg-teal-600 text-white'
                  }`}
                >
                  {highlightLabel}
                </div>
              )}
            </div>
          )}

          {/* General OCR Line Bounding Boxes (if toggled) */}
          {showAllBoxes &&
            panel.ocr_lines?.map((line, idx) => {
              const isHighlighted =
                highlightBbox &&
                Math.abs(line.bbox.x - highlightBbox.x) < 5 &&
                Math.abs(line.bbox.y - highlightBbox.y) < 5;

              if (isHighlighted) return null; // already rendered above

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredLine(line)}
                  onMouseLeave={() => setHoveredLine(null)}
                  className="absolute border border-teal-400/30 hover:border-teal-400 hover:bg-teal-400/20 cursor-pointer transition-colors z-10"
                  style={getBoxStyle(line.bbox)}
                />
              );
            })}
        </div>
      </div>

      {/* Hover Information / Quality Warning Footer */}
      <div className="bg-slate-950 px-4 py-2 text-xs border-t border-slate-800 flex items-center justify-between min-h-[36px]">
        {hoveredLine ? (
          <div className="flex items-center gap-2 text-teal-300 font-mono">
            <span className="text-slate-400">OCR Read:</span>
            <span className="font-semibold text-white truncate max-w-lg">
              "{hoveredLine.text}"
            </span>
            <span className="text-xs text-teal-400 bg-slate-800 px-1.5 py-0.5 rounded">
              Conf: {hoveredLine.confidence.toFixed(1)}%
            </span>
          </div>
        ) : highlightLabel ? (
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-slate-400">Target Region:</span>
            <span
              className={`font-semibold ${
                isViolation ? 'text-red-400' : 'text-teal-400'
              }`}
            >
              {highlightLabel}
            </span>
          </div>
        ) : (
          <div className="text-slate-500 italic">
            Hover over any recognized text box on the label image to view extracted OCR data.
          </div>
        )}

        {/* Quality warnings pill */}
        {panel.quality_warnings && panel.quality_warnings.length > 0 && (
          <div className="flex items-center gap-1.5 text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/60 text-[11px]">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>{panel.quality_warnings.length} quality advisory</span>
          </div>
        )}
      </div>
    </div>
  );
};
