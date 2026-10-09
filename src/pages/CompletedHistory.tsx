import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  CheckCircle2,
  Calendar,
  User,
  ShieldCheck,
  MapPin,
  Clock,
  Eye,
  Award,
  Search,
} from 'lucide-react';
import { Issue } from '../types/index.ts';

export const CompletedHistory: React.FC = () => {
  const { issues, setSelectedIssue } = useApp();
  const [search, setSearch] = useState('');

  const completedIssues = issues.filter((i) => i.status === 'Completed');

  const filtered = completedIssues.filter((i) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      i.id.toLowerCase().includes(q) ||
      i.title.toLowerCase().includes(q) ||
      i.location.address.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Completed Remediations Archive
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Official repository of resolved road damage and cleared garbage with before-and-after photo verification.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 border border-emerald-200 text-xs font-bold text-emerald-800">
          <Award className="h-4 w-4 text-emerald-600" />
          <span>{completedIssues.length} Verified Solutions</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search resolved road, ID, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Grid of Before-and-After Comparisons */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          <CheckCircle2 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">No completed issues found</p>
          <p className="text-xs text-slate-400 mt-1">
            As field staff submit repairs and officers approve verification, resolved records appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((issue) => (
            <div
              key={issue.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-blue-700">{issue.id}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      Officer Verified
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900">{issue.title}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span>{issue.location.address}</span>
                </p>

                {/* Side-by-side Before and After Showcase */}
                <div className="grid grid-cols-2 gap-3 my-4">
                  <div className="space-y-1">
                    <div className="relative rounded-xl overflow-hidden aspect-4/3 bg-slate-100 border border-slate-200">
                      <img
                        src={issue.imageUrl}
                        alt="Initial damage"
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 rounded-md bg-red-600/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                        BEFORE
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium block text-center">
                      Logged {new Date(issue.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="relative rounded-xl overflow-hidden aspect-4/3 bg-slate-100 border border-emerald-200">
                      <img
                        src={issue.repairData?.completionPhotoUrl || issue.imageUrl}
                        alt="Completed remediation"
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                        REMEDIATED
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-medium block text-center">
                      Resolved {new Date(issue.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Remediation Specs */}
                <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-2 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Repaired By:</span>
                    <span className="font-semibold text-slate-800">
                      {issue.repairData?.staffName || issue.assignedStaff?.name || 'Municipal Road Crew'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Materials / Action:</span>
                    <span className="font-medium text-slate-700 truncate max-w-xs">
                      {issue.repairData?.materialsUsed || 'Standard HMA Pavement'}
                    </span>
                  </div>
                  {issue.verificationData && (
                    <div className="flex justify-between border-t border-slate-200 pt-1.5 text-emerald-900 font-medium">
                      <span>Verified Officer:</span>
                      <span>{issue.verificationData.officerName || 'Marcus Vance'}</span>
                    </div>
                  )}
                  {issue.repairData?.repairNotes && (
                    <div className="pt-1 text-[11px] text-slate-600 italic">
                      Notes: "{issue.repairData.repairNotes}"
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedIssue(issue)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Eye className="h-3.5 w-3.5 text-blue-600" />
                  <span>View Complete Case File</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
