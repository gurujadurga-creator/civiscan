import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  Activity,
  Layers,
  ArrowUpRight,
  Filter,
  Eye,
  MapPin,
  Sparkles,
  Calendar,
  Building,
  User,
  Plus,
} from 'lucide-react';
import { IssueCategory, IssueStatus } from '../types/index.ts';

export const Dashboard: React.FC = () => {
  const { stats, issues, setSelectedIssue, setCurrentPage, currentUser } = useApp();

  const recentIssues = issues.slice(0, 6);

  const categories: IssueCategory[] = ['Pothole', 'Road Crack', 'Roadside Garbage', 'Uncertain'];
  const statuses: IssueStatus[] = [
    'New Issue',
    'Pending',
    'Assigned',
    'In Progress',
    'Awaiting Verification',
    'Completed',
  ];

  const total = stats?.totalIssues || 1;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Municipal Command Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time civic deficiency monitoring, triage statistics, and repair dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage('upload')}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Report New Issue</span>
          </button>
          <button
            onClick={() => setCurrentPage('map')}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            <MapPin className="h-4 w-4 text-blue-600" />
            <span>Interactive Map</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (8 Key Cards strictly calculated from DB records) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {/* Total Issues */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total</span>
            <Layers className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {stats?.totalIssues ?? 0}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">All logged defects</span>
        </div>

        {/* New Today */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">New Today</span>
            <Activity className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-blue-600">
            {stats?.newIssuesToday ?? 0}
          </div>
          <span className="text-[10px] text-blue-700 font-medium">New intakes</span>
        </div>

        {/* High Priority - Red indicator */}
        <div className="rounded-2xl border border-red-200 bg-red-50/40 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-700">High Risk</span>
            <span className="h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-red-600">
            {stats?.highPriority ?? 0}
          </div>
          <span className="text-[10px] text-red-700 font-semibold">Immediate action</span>
        </div>

        {/* Medium Priority - Orange indicator */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Medium</span>
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-600">
            {stats?.mediumPriority ?? 0}
          </div>
          <span className="text-[10px] text-amber-700 font-semibold">Scheduled repair</span>
        </div>

        {/* Low Priority - Blue/Slate indicator */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Low</span>
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-700">
            {stats?.lowPriority ?? 0}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Routine pickup</span>
        </div>

        {/* Pending */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-800">
            {stats?.pendingIssues ?? 0}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Triage queue</span>
        </div>

        {/* In Progress */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/30 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">In Progress</span>
            <Activity className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-blue-700">
            {stats?.inProgressIssues ?? 0}
          </div>
          <span className="text-[10px] text-blue-600 font-semibold">Active field crews</span>
        </div>

        {/* Completed - Green completion indicator */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600">
            {stats?.completedIssues ?? 0}
          </div>
          <span className="text-[10px] text-emerald-700 font-bold">Verified & closed</span>
        </div>
      </div>

      {/* Analytics Charts & Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Category Defect Breakdown</h3>
              <p className="text-xs text-slate-500">Proportions derived from current civic database</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
              {stats?.totalIssues} Records
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {categories.map((cat) => {
              const count = stats?.categoryCounts?.[cat] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const colorClass =
                cat === 'Pothole'
                  ? 'bg-red-500'
                  : cat === 'Road Crack'
                  ? 'bg-amber-500'
                  : cat === 'Roadside Garbage'
                  ? 'bg-blue-600'
                  : 'bg-slate-400';

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <span className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />
                      {cat}
                    </span>
                    <span className="text-slate-500">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full ${colorClass} transition-all duration-500 rounded-full`}
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workflow Status Progression */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Municipal Workflow Funnel</h3>
              <p className="text-xs text-slate-500">Current status distribution across active lifecycle</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
              {stats?.resolutionRatePercent}% Resolved
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {statuses.map((st) => {
              const count = stats?.statusCounts?.[st] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const isCompleted = st === 'Completed';
              const isAwaiting = st === 'Awaiting Verification';

              return (
                <div key={st} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-500'
                            : isAwaiting
                            ? 'bg-purple-500'
                            : st === 'In Progress'
                            ? 'bg-blue-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      {st}
                    </span>
                    <span className="text-slate-500">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-500'
                          : isAwaiting
                          ? 'bg-purple-500'
                          : st === 'In Progress'
                          ? 'bg-blue-500'
                          : 'bg-slate-400'
                      }`}
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Issues Table with Rapid Inspection */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 px-6 py-4 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Municipal Defect Queue</h3>
            <p className="text-xs text-slate-500">Latest street reports requiring triage or action</p>
          </div>
          <button
            onClick={() => setCurrentPage('issues')}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            <span>View All Issues Database</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Issue ID & Photo</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Priority</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Location</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentIssues.map((issue) => (
                <tr
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={issue.imageUrl}
                        alt=""
                        className="h-10 w-12 rounded-lg object-cover border border-slate-200 bg-slate-100 shrink-0"
                      />
                      <div>
                        <span className="font-mono text-xs font-bold text-blue-700">
                          {issue.id}
                        </span>
                        <p className="font-semibold text-slate-900 truncate max-w-xs">
                          {issue.title}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-3.5 font-medium text-slate-700">
                    {issue.category}
                  </td>

                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        issue.priority === 'High'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : issue.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          issue.priority === 'High'
                            ? 'bg-red-600'
                            : issue.priority === 'Medium'
                            ? 'bg-amber-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      {issue.priority}
                    </span>
                  </td>

                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        issue.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : issue.status === 'Awaiting Verification'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : issue.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {issue.status}
                    </span>
                  </td>

                  <td className="px-6 py-3.5 text-slate-600">
                    <div className="flex items-center gap-1.5 truncate max-w-xs">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{issue.location.address}</span>
                    </div>
                  </td>

                  <td className="px-6 py-3.5 text-slate-600 font-medium">
                    {issue.department}
                  </td>

                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIssue(issue);
                      }}
                      className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                      title="Inspect issue"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
