import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
  Clock,
  Sparkles,
  FileCheck,
  Building,
} from 'lucide-react';
import { IssuePriority, Issue } from '../types/index.ts';

export const PriorityManagement: React.FC = () => {
  const {
    issues,
    currentUser,
    overridePriority,
    setSelectedIssue,
  } = useApp();

  const isOfficerOrAdmin =
    currentUser.role === 'Municipal Officer' || currentUser.role === 'Administrator';

  const [selectedIssueId, setSelectedIssueId] = useState<string>('');
  const [newPriority, setNewPriority] = useState<IssuePriority>('High');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const openIssues = issues.filter((i) => i.status !== 'Completed');
  const overriddenIssues = issues.filter((i) => Boolean(i.priorityOverride));

  const filteredOpen = openIssues.filter((i) => {
    if (filterPriority !== 'all' && i.priority !== filterPriority) return false;
    return true;
  });

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssueId) {
      alert('Please select an issue to override.');
      return;
    }
    if (!overrideReason.trim() || overrideReason.trim().length < 8) {
      alert('A detailed justification reason (at least 8 characters) is required for official audit compliance.');
      return;
    }

    setIsSubmitting(true);
    const ok = await overridePriority(selectedIssueId, newPriority, overrideReason);
    setIsSubmitting(false);

    if (ok) {
      alert('Priority level successfully overridden and logged into municipal audit history.');
      setOverrideReason('');
      setSelectedIssueId('');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Explainable Priority Management & Override
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Algorithmic severity triaging, civil safety risk parameters, and authorized officer overrides.
        </p>
      </div>

      {/* Explainable Logic Framework Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* High Priority */}
        <div className="rounded-2xl border border-red-200 bg-red-50/30 p-6 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-red-100 text-red-700 text-xs font-bold px-2.5 py-0.5 border border-red-200">
              High Priority (Red)
            </span>
            <span className="h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Critical Hazard & Structural Failure</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Severe road cavities (&gt;7cm depth), arterial transit lanes (&gt;35mph), motorcycle wheel entrapment, or garbage obstructing storm drainage channels causing flash flood risks.
          </p>
          <div className="text-[11px] font-semibold text-red-700 pt-1">
            • Target SLA: 24 - 48 Hours Dispatch
          </div>
        </div>

        {/* Medium Priority */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/30 p-6 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 border border-amber-200">
              Medium Priority (Orange)
            </span>
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Active Degradation & Impediment</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Longitudinal asphalt fractures with water penetration, bike path seams, sidewalk trip hazards, or medium volume roadside trash heaps not blocking primary storm drainage.
          </p>
          <div className="text-[11px] font-semibold text-amber-800 pt-1">
            • Target SLA: 3 - 5 Business Days
          </div>
        </div>

        {/* Low Priority */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-0.5 border border-slate-300">
              Low Priority (Slate)
            </span>
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Routine Maintenance & Aesthetics</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Superficial pavement micro-cracks, faded paint striping, non-hazardous litter in collection bins, or low-speed alleyway surface unevenness.
          </p>
          <div className="text-[11px] font-semibold text-slate-600 pt-1">
            • Target SLA: Scheduled Cycle (7 - 14 Days)
          </div>
        </div>
      </div>

      {/* Authorized Override Workbench */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-blue-600" />
              Officer Priority Override Control
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Adjust AI or intake priority ratings based on field intelligence or urgent civic factors.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Authorized Operator:</span>
            <span className="font-bold text-slate-900">{currentUser.name}</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isOfficerOrAdmin ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {currentUser.role}
            </span>
          </div>
        </div>

        {!isOfficerOrAdmin ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-center gap-3">
            <Lock className="h-5 w-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold">Access Restricted</p>
              <p>
                Only Municipal Officers and Administrators are authorized to override priority levels. As Repair Staff, your role is focused on field task execution.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleOverrideSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Target Issue *
                </label>
                <select
                  required
                  value={selectedIssueId}
                  onChange={(e) => setSelectedIssueId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-semibold text-slate-900"
                >
                  <option value="">-- Choose active issue --</option>
                  {openIssues.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.id} - {i.title} (Currently: {i.priority} Priority)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adjust New Priority Level *
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as IssuePriority)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs font-bold text-slate-900"
                >
                  <option value="High">High (Immediate Danger / Escalated)</option>
                  <option value="Medium">Medium (Moderate Priority)</option>
                  <option value="Low">Low (De-escalated Maintenance)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Mandatory Justification Reason * (Enforced Audit Trail)
              </label>
              <textarea
                required
                rows={3}
                placeholder="Detail reason for override (e.g. Near elementary school crossing; citizen complaints surging; emergency ambulance route)..."
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
              >
                <span>Commit Priority Override</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Historical Override Audit Log Feed */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-emerald-600" />
          Recorded Priority Overrides in Current System
        </h3>
        <p className="text-xs text-slate-500">
          Tamper-evident record of all manual changes made by municipal officers.
        </p>

        {overriddenIssues.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 italic">No priority overrides logged yet.</p>
        ) : (
          <div className="space-y-3">
            {overriddenIssues.map((issue) => {
              const ov = issue.priorityOverride;
              if (!ov) return null;
              return (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className="cursor-pointer rounded-xl border border-amber-200 bg-amber-50/40 p-4 transition-all hover:bg-amber-50/80"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700">{issue.id}</span>
                      <span className="font-bold text-slate-900 text-xs">{issue.title}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      {new Date(ov.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1">
                    <span>Change:</span>
                    <span className="line-through text-slate-400">{ov.originalPriority}</span>
                    <ArrowRight className="h-3 w-3 text-slate-500" />
                    <span className="text-red-700 font-bold">{ov.newPriority} Priority</span>
                    <span className="text-slate-400">• By Officer:</span>
                    <span className="text-slate-900">{ov.officerName}</span>
                  </div>

                  <p className="text-xs text-slate-600 bg-white/70 p-2 rounded border border-amber-200 italic mt-2">
                    "{ov.reason}"
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
