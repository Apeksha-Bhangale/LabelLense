import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  FileSpreadsheet,
  Calendar,
  ExternalLink,
  Download,
  PlusCircle,
  RefreshCw,
  FileCheck2,
  ChevronRight
} from 'lucide-react';
import { InspectionSummary, PageView } from '../types';
import { fetchInspections } from '../api';
import { StatusBadge } from '../components/StatusBadge';

interface InspectionHistoryPageProps {
  onSelectInspection: (id: string, targetPage?: PageView) => void;
  onNavigate: (page: PageView) => void;
}

export const InspectionHistoryPage: React.FC<InspectionHistoryPageProps> = ({
  onSelectInspection,
  onNavigate,
}) => {
  const [inspections, setInspections] = useState<InspectionSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string>('ALL');
  const [date, setDate] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchInspections(search, status, date);
      setInspections(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [status, date]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 mb-1.5">
            <History className="w-3.5 h-3.5 text-teal-600" />
            <span>Archive & Persistence</span>
          </div>
          <h1 className="text-2xl font-extrabold text-navy-950">
            Inspection History & Records Archive
          </h1>
          <p className="text-xs text-slate-500">
            Search, filter, and inspect past packaging audits. Reopen any record to inspect label evidence, update declarations, review verification remarks, or download reports.
          </p>
        </div>

        <button
          onClick={() => onNavigate('new_inspection')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Inspection</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search bar (6 cols) */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, Product Name, Brand, Shop, District..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Status filter (3 cols) */}
          <div className="sm:col-span-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="ALL">All Compliance Statuses</option>
              <option value="COMPLIANT">Compliant Only</option>
              <option value="POTENTIAL_VIOLATIONS">Potential Violations</option>
              <option value="NEEDS_REVIEW">Needs Review</option>
            </select>
          </div>

          {/* Date filter (2 cols) */}
          <div className="sm:col-span-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full py-1.5 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>

          {/* Search submit / reset (1 col) */}
          <div className="sm:col-span-1 flex items-center gap-1.5">
            <button
              type="submit"
              className="w-full py-2 px-3 text-xs font-bold rounded-lg bg-navy-800 hover:bg-navy-900 text-white transition-colors cursor-pointer"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
              <span className="text-sm">Fetching historical inspection records...</span>
            </div>
          ) : inspections.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-400 stroke-1" />
              <div className="text-sm font-semibold text-slate-700">No inspection records found</div>
              <p className="text-xs text-slate-400">Try adjusting your filter or start a new inspection.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Inspection ID</th>
                  <th className="py-3 px-4">Product & Category</th>
                  <th className="py-3 px-4">Shop & Location</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Findings</th>
                  <th className="py-3 px-4 text-center">Report</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {inspections.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-teal-50/30 transition-colors cursor-pointer"
                    onClick={() => onSelectInspection(item.id, 'saved_details')}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-navy-950">
                      {item.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-navy-950">{item.product_name}</div>
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
                      <StatusBadge status={item.overall_status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.violation_checks > 0 ? (
                        <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                          {item.violation_checks} violation(s)
                        </span>
                      ) : item.review_checks > 0 ? (
                        <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          {item.review_checks} for review
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          0 findings
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {item.report_generated ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                          <FileCheck2 className="w-3 h-3 text-teal-600" />
                          <span>Generated</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Pending</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectInspection(item.id, 'saved_details')}
                          className="px-2.5 py-1 text-xs font-medium text-navy-700 hover:text-navy-950 hover:bg-slate-100 rounded border border-slate-200"
                        >
                          View Details
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
      </div>
    </div>
  );
};
