import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Camera,
  FileText,
  CheckSquare,
  FileCheck2,
  History,
  ChevronRight,
  ShieldAlert,
  Archive
} from 'lucide-react';
import { PageView } from '../types';

interface SidebarProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  activeInspectionId?: string;
  hasPanels?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  activeInspectionId,
  hasPanels = false,
}) => {
  const isWorkflowPage = [
    'new_inspection',
    'capture',
    'declarations',
    'compliance',
    'report_preview',
  ].includes(currentPage);

  return (
    <aside className="w-full md:w-64 bg-navy-900 text-slate-300 flex-shrink-0 flex md:flex-col justify-between border-r border-navy-800">
      <div className="p-4 w-full">
        {/* Core Navigation */}
        <div className="mb-6">
          <div className="text-[11px] font-bold tracking-wider uppercase text-navy-400 mb-2 px-3">
            Core Operations
          </div>
          <nav className="space-y-1">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'dashboard'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'hover:bg-navy-800 text-slate-300 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Inspector Dashboard</span>
            </button>

            <button
              onClick={() => onNavigate('new_inspection')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'new_inspection'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'hover:bg-navy-800 text-teal-400 hover:text-teal-300'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start New Inspection</span>
            </button>

            <button
              onClick={() => onNavigate('history')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 'history'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'hover:bg-navy-800 text-slate-300 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Inspection History</span>
            </button>
          </nav>
        </div>

        {/* Active Inspection Step-by-Step Workflow */}
        {activeInspectionId && (
          <div className="pt-4 border-t border-navy-800">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-teal-400">
                Inspection Workflow
              </span>
              <span className="text-[10px] font-mono text-navy-400">
                {activeInspectionId}
              </span>
            </div>

            <nav className="space-y-1 text-xs">
              {/* Step 1 */}
              <button
                onClick={() => onNavigate('new_inspection')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium transition-colors ${
                  currentPage === 'new_inspection'
                    ? 'bg-navy-800 text-teal-300 border-l-2 border-teal-400'
                    : 'text-slate-400 hover:bg-navy-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-navy-700 text-[10px] flex items-center justify-center font-bold text-teal-300">
                    1
                  </span>
                  <span>1. Product & Shop Details</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Step 2 */}
              <button
                onClick={() => onNavigate('capture')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium transition-colors ${
                  currentPage === 'capture'
                    ? 'bg-navy-800 text-teal-300 border-l-2 border-teal-400'
                    : 'text-slate-400 hover:bg-navy-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-navy-700 text-[10px] flex items-center justify-center font-bold text-teal-300">
                    2
                  </span>
                  <span>2. Label Capture & OCR</span>
                </div>
                <Camera className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Step 3 */}
              <button
                onClick={() => onNavigate('declarations')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium transition-colors ${
                  currentPage === 'declarations'
                    ? 'bg-navy-800 text-teal-300 border-l-2 border-teal-400'
                    : 'text-slate-400 hover:bg-navy-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-navy-700 text-[10px] flex items-center justify-center font-bold text-teal-300">
                    3
                  </span>
                  <span>3. Declaration Review</span>
                </div>
                <FileText className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Step 4 */}
              <button
                onClick={() => onNavigate('compliance')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium transition-colors ${
                  currentPage === 'compliance'
                    ? 'bg-navy-800 text-teal-300 border-l-2 border-teal-400'
                    : 'text-slate-400 hover:bg-navy-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-navy-700 text-[10px] flex items-center justify-center font-bold text-teal-300">
                    4
                  </span>
                  <span>4. Compliance Results</span>
                </div>
                <CheckSquare className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Step 5 */}
              <button
                onClick={() => onNavigate('report_preview')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium transition-colors ${
                  currentPage === 'report_preview'
                    ? 'bg-navy-800 text-teal-300 border-l-2 border-teal-400'
                    : 'text-slate-400 hover:bg-navy-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-navy-700 text-[10px] flex items-center justify-center font-bold text-teal-300">
                    5
                  </span>
                  <span>5. Report & Sign-Off</span>
                </div>
                <FileCheck2 className="w-3.5 h-3.5 opacity-60" />
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Regulatory Badge & Hotline */}
      <div className="p-4 border-t border-navy-800 hidden md:block">
        <div className="bg-navy-950/70 p-3 rounded-lg border border-navy-800 text-[11px] text-navy-300 space-y-1">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-teal-400" />
            <span>Legal Metrology Act, 2009</span>
          </div>
          <p className="text-[10px] text-navy-400 leading-tight">
            Enforcing Packaged Commodities Rules, 2011 across retail packaging.
          </p>
        </div>
      </div>
    </aside>
  );
};
