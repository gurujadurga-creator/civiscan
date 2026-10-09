import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Search,
  Filter,
  Download,
  Eye,
  MapPin,
  Calendar,
  Building,
  User,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { IssueCategory, IssuePriority, IssueStatus } from '../types/index.ts';

export const AllIssues: React.FC = () => {
  const {
    issues,
    setSelectedIssue,
    setCurrentPage,
    fetchIssues,
    isLoading,
  } = useApp();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const filtered = issues.filter((issue) => {
    if (categoryFilter !== 'all' && issue.category !== categoryFilter) return false;
    if (priorityFilter !== 'all' && issue.priority !== priorityFilter) return false;
    if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
    if (departmentFilter !== 'all' && issue.department !== departmentFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        issue.id.toLowerCase().includes(q) ||
        issue.title.toLowerCase().includes(q) ||
        issue.description.toLowerCase().includes(q) ||
        issue.location.address.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleDownloadCsv = () => {
    window.open('/api/export/csv', '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            All Municipal Issues
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Master database of road damage and garbage reports across civic jurisdictions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
            title="Download CSV report"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setCurrentPage('upload')}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Report Issue</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search bar */}
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID, road, keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Category */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
            >
              <option value="all">All Categories</option>
              <option value="Pothole">Pothole</option>
              <option value="Road Crack">Road Crack</option>
              <option value="Roadside Garbage">Roadside Garbage</option>
              <option value="Uncertain">Uncertain</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
            >
              <option value="all">All Priorities</option>
              <option value="High">High Priority (Red)</option>
              <option value="Medium">Medium Priority (Orange)</option>
              <option value="Low">Low Priority (Blue)</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="New Issue">New Issue</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Awaiting Verification">Awaiting Verification</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
            >
              <option value="all">All Departments</option>
              <option value="Roads & Highways">Roads & Highways</option>
              <option value="Waste Management">Waste Management</option>
              <option value="Public Works">Public Works</option>
              <option value="Traffic Safety">Traffic Safety</option>
            </select>
          </div>
        </div>

        {/* Active Results Summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Showing <b>{filtered.length}</b> of <b>{issues.length}</b> total issues
          </span>
          {(categoryFilter !== 'all' ||
            priorityFilter !== 'all' ||
            statusFilter !== 'all' ||
            departmentFilter !== 'all' ||
            search) && (
            <button
              onClick={() => {
                setSearch('');
                setCategoryFilter('all');
                setPriorityFilter('all');
                setStatusFilter('all');
                setDepartmentFilter('all');
              }}
              className="text-blue-600 font-semibold hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">ID & Image</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Priority</th>
                <th className="px-6 py-3.5">Severity</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Assigned Staff</th>
                <th className="px-6 py-3.5">Date Logged</th>
                <th className="px-6 py-3.5 text-right">Inspect</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    No municipal issues match the selected criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((issue) => (
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
                          className="h-11 w-14 rounded-lg object-cover border border-slate-200 bg-slate-100 shrink-0"
                        />
                        <div>
                          <span className="font-mono text-xs font-bold text-blue-700">
                            {issue.id}
                          </span>
                          <p className="font-semibold text-slate-900 truncate max-w-xs">
                            {issue.title}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate max-w-xs flex items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {issue.location.address}
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

                    <td className="px-6 py-3.5 font-semibold text-slate-700">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {issue.severityScore}/10
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

                    <td className="px-6 py-3.5 text-slate-600 font-medium">
                      {issue.department}
                    </td>

                    <td className="px-6 py-3.5 text-slate-600">
                      {issue.assignedStaff ? (
                        <div className="flex items-center gap-1 font-medium text-slate-900">
                          <User className="h-3 w-3 text-slate-400" />
                          <span>{issue.assignedStaff.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="px-6 py-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIssue(issue);
                        }}
                        className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
