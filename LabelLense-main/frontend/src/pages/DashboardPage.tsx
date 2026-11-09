import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  AlertTriangle,
  HelpCircle,
  FileSpreadsheet,
  PlusCircle,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';
import { DashboardStats, PageView, InspectionSummary } from '../types';
import { fetchDashboard } from '../api';
import { StatusBadge } from '../components/StatusBadge';

interface DashboardPageProps {
  onNavigate: (page: PageView) => void;
  onSelectInspection: (id: string, targetPage?: PageView) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onSelectInspection,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDashboard();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Could not load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter recent inspections
  const filteredRecent = stats?.recent_inspections.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shop_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || item.overall_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Quick Action */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-navy-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle decorative accent */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-teal-500/10 to-transparent pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold tracking-wide border border-teal-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>SIH 2026 Problem Statement ID #26034</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Inspector Enforcement Portal
          </h1>
          <p className="text-sm text-navy-200 max-w-2xl leading-relaxed">
            Legal Metrology (Packaged Commodities) Rules, 2011 Compliance Verification. Read product packaging labels with OCR, check mandatory statutory declarations, highlight suspected violations, and generate structured inspection reports.
          </p>
        </div>

        {/* Start Inspection Action */}
        <div className="z-10 flex-shrink-0">
          <button
            onClick={() => onNavigate('new_inspection')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-navy-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <PlusCircle className="w-5 h-5 text-navy-950" />
            <span>Start New Inspection</span>
          </button>
        </div>
      </div>

      {/* KPI Cards — Dynamically Calculated from Database */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Inspections */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Inspections
            </span>
            <div className="w-9 h-9 rounded-lg bg-navy-50 text-navy-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-navy-950">
              {loading ? '—' : stats?.total_inspections ?? 0}
            </span>
            <span className="text-xs text-slate-500">records on file</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {stats?.compliant_inspections ?? 0} verified fully compliant
          </div>
        </div>

        {/* Potential Violations */}
        <div className="bg-white rounded-xl p-5 border border-red-200 shadow-xs hover:border-red-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">
              Potential Violations
            </span>
            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-red-600">
              {loading ? '—' : stats?.inspections_with_violations ?? 0}
            </span>
            <span className="text-xs text-red-600 font-medium">flagged products</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Rule 6(1) or Rule 12/13 breaches detected
          </div>
        </div>

        {/* Needs Manual Review */}
        <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-xs hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Needs Manual Review
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-700">
              {loading ? '—' : stats?.inspections_needing_review ?? 0}
            </span>
            <span className="text-xs text-amber-600 font-medium">pending inspector</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Low OCR readability or ambiguous text
          </div>
        </div>

        {/* Reports Generated */}
        <div className="bg-white rounded-xl p-5 border border-teal-200 shadow-xs hover:border-teal-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
              Reports Generated
            </span>
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-teal-800">
              {loading ? '—' : stats?.reports_generated ?? 0}
            </span>
            <span className="text-xs text-teal-600 font-medium">PDF reports</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Structured Section A–H dossiers
          </div>
        </div>
      </div>

      {/* Recent Inspections Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Header & Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-navy-950">
              Recent Inspection Records
            </h2>
            <p className="text-xs text-slate-500">
              Real-time records inspected under Packaged Commodities Rules
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID, product, brand, shop..."
                className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 w-56 sm:w-64"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-1.5 px-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLIANT">Compliant</option>
              <option value="POTENTIAL_VIOLATIONS">Potential Violations</option>
              <option value="NEEDS_REVIEW">Needs Review</option>
            </select>

            {/* Refresh */}
            <button
              onClick={loadData}
              className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
              <span className="text-sm">Loading inspection records from database...</span>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          ) : !filteredRecent || filteredRecent.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-400 stroke-1" />
              <div className="text-sm font-medium">No inspections match current criteria</div>
              <button
                onClick={() => onNavigate('new_inspection')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create a new inspection now</span>
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Inspection ID</th>
                  <th className="py-3 px-4">Product & Brand</th>
                  <th className="py-3 px-4">Shop / Location</th>
                  <th className="py-3 px-4">Inspection Date</th>
                  <th className="py-3 px-4 text-center">Potential Findings</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Report</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRecent.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-teal-50/40 transition-colors group cursor-pointer"
                    onClick={() => onSelectInspection(item.id, 'saved_details')}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-navy-950">
                      {item.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-navy-950">
                        {item.product_name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Brand: <span className="font-medium text-slate-700">{item.brand}</span> • {item.product_category}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="font-medium text-slate-900">{item.shop_name}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.district}, {item.state}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {item.inspection_date}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.violation_checks > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                          {item.violation_checks} violation(s)
                        </span>
                      ) : item.review_checks > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          {item.review_checks} for review
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          0 findings
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={item.overall_status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.report_generated ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                          <FileCheck2 className="w-3 h-3 text-teal-600" />
                          <span>Ready</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Not generated</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectInspection(item.id, 'saved_details')}
                          className="px-2.5 py-1 text-xs font-medium text-navy-700 hover:text-navy-950 hover:bg-slate-100 rounded border border-slate-200"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => onSelectInspection(item.id, 'report_preview')}
                          className="px-2.5 py-1 text-xs font-medium text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 rounded border border-teal-200"
                        >
                          Report
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Link */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1"
          >
            <span>View Complete Inspection History Archive</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
