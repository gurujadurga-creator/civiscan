import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  PieChart,
  CheckCircle2,
  AlertTriangle,
  Building,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { IssueCategory, IssueStatus } from '../types/index.ts';

export const ReportsAndAnalytics: React.FC = () => {
  const { stats, issues, setSelectedIssue } = useApp();
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const total = stats?.totalIssues || 1;
  const completed = stats?.completedIssues || 0;
  const resolutionPct = stats?.resolutionRatePercent || 0;

  const categories: IssueCategory[] = ['Pothole', 'Road Crack', 'Roadside Garbage', 'Uncertain'];
  const statuses: IssueStatus[] = [
    'New Issue',
    'Pending',
    'Assigned',
    'In Progress',
    'Awaiting Verification',
    'Completed',
  ];

  const handleDownloadCsv = () => {
    window.open('/api/export/csv', '_blank');
  };

  const completedWithPhotos = issues
    .filter((i) => i.status === 'Completed' && i.repairData?.completionPhotoUrl)
    .slice(0, 3);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Municipal Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Data-driven civic infrastructure performance, resolution velocity, and filtered exports.
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export Official CSV Report</span>
        </button>
      </div>

      {/* High-Level Metrics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Civic Reports
          </span>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">{total}</div>
          <span className="text-[11px] text-slate-400">Cumulative logged volume</span>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-xs">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            Resolution Rate
          </span>
          <div className="mt-2 text-3xl font-extrabold text-emerald-600">{resolutionPct}%</div>
          <span className="text-[11px] text-emerald-700 font-medium">
            {completed} of {total} closed
          </span>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50/40 p-5 shadow-xs">
          <span className="text-xs font-bold text-red-800 uppercase tracking-wider">
            Critical Risk Rate
          </span>
          <div className="mt-2 text-3xl font-extrabold text-red-600">
            {total > 0 ? Math.round(((stats?.highPriority || 0) / total) * 100) : 0}%
          </div>
          <span className="text-[11px] text-red-700 font-medium">
            {stats?.highPriority || 0} urgent hazards
          </span>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 shadow-xs">
          <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
            Avg Turnaround
          </span>
          <div className="mt-2 text-3xl font-extrabold text-blue-700">~1.8 Days</div>
          <span className="text-[11px] text-blue-600 font-medium">From intake to verification</span>
        </div>
      </div>

      {/* Primary Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Incident Category Distribution</h3>
              <p className="text-xs text-slate-500">Breakdown of road flaws vs sanitation dumps</p>
            </div>
            <BarChart3 className="h-5 w-5 text-slate-400" />
          </div>

          <div className="space-y-4 pt-2">
            {categories.map((cat) => {
              const count = stats?.categoryCounts?.[cat] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const color =
                cat === 'Pothole'
                  ? 'bg-red-500'
                  : cat === 'Road Crack'
                  ? 'bg-amber-500'
                  : cat === 'Roadside Garbage'
                  ? 'bg-blue-600'
                  : 'bg-slate-400';

              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                      {cat}
                    </span>
                    <span className="font-mono text-slate-500">
                      {count} incidents ({pct}%)
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Workload Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Department Workload Distribution</h3>
              <p className="text-xs text-slate-500">Current ticket distribution by city branch</p>
            </div>
            <Building className="h-5 w-5 text-slate-400" />
          </div>

          <div className="space-y-4 pt-2">
            {Object.entries(stats?.departmentCounts || {
              'Roads & Highways': 4,
              'Waste Management': 2,
              'Public Works': 0,
            }).map(([dept, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={dept} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{dept}</span>
                    <span className="font-mono text-slate-500">
                      {count} tasks ({pct}%)
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Featured Before & After Remediation Evidence */}
      {completedWithPhotos.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Remediation Performance Evidence
              </h3>
              <p className="text-xs text-slate-500">Verified field repair photo archives</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {completedWithPhotos.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedIssue(item)}
                className="cursor-pointer rounded-xl border border-slate-200 p-3 hover:shadow-md transition-shadow group"
              >
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
                    <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-red-600 text-white text-[9px] font-bold px-1 rounded">
                      Before
                    </span>
                  </div>
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
                    <img
                      src={item.repairData?.completionPhotoUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-[9px] font-bold px-1 rounded">
                      After
                    </span>
                  </div>
                </div>
                <div className="text-xs font-bold text-slate-900 truncate">{item.title}</div>
                <div className="text-[11px] text-slate-500 truncate">{item.location.address}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
