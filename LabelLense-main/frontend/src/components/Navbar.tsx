import React from 'react';
import { ShieldCheck, User, Wifi, FileCheck, Layers } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: any) => void;
  activeInspectionId?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, activeInspectionId }) => {
  return (
    <header className="bg-navy-950 text-white border-b border-navy-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-teal-900/30 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">
                Label<span className="text-teal-400">Lens</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                SIH 2026 #26034
              </span>
            </div>
            <p className="text-xs text-navy-300 font-medium tracking-wide">
              Scan. Verify. Report. <span className="text-navy-400">• Legal Metrology (PC) Rules, 2011</span>
            </p>
          </div>
        </div>

        {/* Right Info: Active Session & Inspector Badge */}
        <div className="flex items-center gap-4">
          {activeInspectionId && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-navy-900 border border-teal-500/30 text-teal-300 text-xs">
              <Layers className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              <span>Active Inspection: <b>{activeInspectionId}</b></span>
            </div>
          )}

          <div className="hidden md:flex items-center gap-2 text-xs text-navy-300 px-2.5 py-1 rounded bg-navy-900/80 border border-navy-800">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Inspector Mode: <b>Field Ready</b></span>
          </div>

          {/* Inspector Badge */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-navy-800">
            <div className="w-8 h-8 rounded-full bg-navy-800 border border-navy-700 flex items-center justify-center text-teal-300">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:block text-right">
              <div className="text-xs font-semibold text-slate-200">Insp. R. K. Sharma</div>
              <div className="text-[10px] text-teal-400 font-mono">ID: LM-INSP-HR-048</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
