import React, { useState } from 'react';
import { Issue, IssuePriority, IssueStatus } from '../types/index.ts';
import { useApp } from '../context/AppContext.tsx';
import {
  X,
  MapPin,
  Calendar,
  AlertTriangle,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Send,
  Building,
  Upload,
  Info,
} from 'lucide-react';

interface Props {
  issue: Issue | null;
  onClose: () => void;
}

export const IssueDetailModal: React.FC<Props> = ({ issue, onClose }) => {
  const {
    currentUser,
    users,
    overridePriority,
    updateStatus,
    assignIssue,
    fetchIssues,
  } = useApp();

  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [newPriority, setNewPriority] = useState<IssuePriority>('High');
  const [overrideReason, setOverrideReason] = useState('');

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState('');

  // Repair Staff submission state
  const [repairNotes, setRepairNotes] = useState('');
  const [materialsUsed, setMaterialsUsed] = useState('');
  const [laborHours, setLaborHours] = useState('2.5');
  const [repairPhoto, setRepairPhoto] = useState('');

  // Officer Verification state
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!issue) return null;

  const staffUsers = users.filter((u) => u.role === 'Repair Staff');
  const isOfficerOrAdmin = currentUser.role === 'Municipal Officer' || currentUser.role === 'Administrator';
  const isAssignedToCurrent = issue.assignedStaff?.id === currentUser.id;

  const handlePrioritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim()) {
      alert('A justification reason is required.');
      return;
    }
    setIsSubmitting(true);
    const ok = await overridePriority(issue.id, newPriority, overrideReason);
    setIsSubmitting(false);
    if (ok) {
      setOverrideModalOpen(false);
      setOverrideReason('');
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) return;
    setIsSubmitting(true);
    const ok = await assignIssue(issue.id, selectedStaffId);
    setIsSubmitting(false);
    if (ok) {
      setAssignModalOpen(false);
    }
  };

  const handleStartWork = async () => {
    setIsSubmitting(true);
    await updateStatus(issue.id, 'In Progress', 'Repair staff initialized on-site repairs.');
    setIsSubmitting(false);
  };

  const handleRepairSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairNotes.trim()) {
      alert('Please provide repair field notes.');
      return;
    }
    setIsSubmitting(true);
    await updateStatus(
      issue.id,
      'Awaiting Verification',
      `Field repair completed by ${currentUser.name}. Submitted for officer sign-off.`,
      {
        completedAt: new Date().toISOString(),
        completedByStaffId: currentUser.id,
        staffName: currentUser.name,
        completionPhotoUrl: repairPhoto || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
        repairNotes,
        materialsUsed: materialsUsed || 'Standard municipal pavement mix',
        laborHours: parseFloat(laborHours) || 2,
      }
    );
    setIsSubmitting(false);
  };

  const handleOfficerVerification = async (approved: boolean) => {
    setIsSubmitting(true);
    if (approved) {
      await updateStatus(
        issue.id,
        'Completed',
        `Official verification approved by Officer ${currentUser.name}. ${verificationNotes}`,
        undefined,
        {
          verifiedAt: new Date().toISOString(),
          verifiedByOfficerId: currentUser.id,
          officerName: currentUser.name,
          verificationNotes: verificationNotes || 'Work inspected and approved to municipal standards.',
          approved: true,
        }
      );
    } else {
      await updateStatus(
        issue.id,
        'In Progress',
        `Verification rejected by Officer ${currentUser.name}. Revision requested: ${verificationNotes}`
      );
    }
    setIsSubmitting(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setRepairPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative my-8 w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
              {issue.id}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                issue.priority === 'High'
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : issue.priority === 'Medium'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {issue.priority} Priority
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
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
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visuals */}
            <div>
              <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 aspect-video sm:aspect-4/3">
                <img
                  src={issue.imageUrl}
                  alt={issue.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-md">
                  Reported Damage Photo
                </div>
              </div>

              {/* Before & After comparison if completed */}
              {issue.repairData?.completionPhotoUrl && (
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Field Completion Photo
                  </h4>
                  <div className="relative rounded-xl overflow-hidden border border-emerald-200 shadow-xs bg-slate-100 aspect-video sm:aspect-4/3">
                    <img
                      src={issue.repairData.completionPhotoUrl}
                      alt="Repaired condition"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                      Verified Remediation
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Core Info */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 leading-snug">{issue.title}</h2>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{issue.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase">Category</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{issue.category}</p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase">Severity Score</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-bold text-slate-900 text-sm">{issue.severityScore}/10</span>
                    <div className="h-2 flex-1 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full ${
                          issue.severityScore >= 8
                            ? 'bg-red-500'
                            : issue.severityScore >= 5
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${issue.severityScore * 10}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase">Department</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5 flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-slate-500" />
                    {issue.department}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase">Assigned Staff</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-500" />
                    {issue.assignedStaff ? issue.assignedStaff.name : 'Unassigned'}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="rounded-xl border border-slate-200 p-3.5 bg-white">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{issue.location.address}</p>
                    {issue.location.lat != null && issue.location.lng != null ? (
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                        GPS: {issue.location.lat.toFixed(6)}, {issue.location.lng.toFixed(6)} • Source: {issue.location.source}
                      </p>
                    ) : (
                      <p className="text-[11px] text-amber-600 mt-0.5 font-medium">
                        No GPS coordinates attached to this report
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Priority Override Banner if present */}
              {issue.priorityOverride && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Priority Overridden by {issue.priorityOverride.officerName}
                  </div>
                  <p className="text-amber-800 mt-1">
                    Changed from <b>{issue.priorityOverride.originalPriority}</b> to <b>{issue.priorityOverride.newPriority}</b>.
                  </p>
                  <p className="text-amber-700 italic mt-0.5">
                    Reason: "{issue.priorityOverride.reason}"
                  </p>
                </div>
              )}

              {/* AI Analysis Card */}
              {issue.aiAnalysis && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-blue-900">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      Computer Vision AI Diagnosis
                    </div>
                    {issue.aiAnalysis.isSimulatedDemo ? (
                      <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        Simulated Demo
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        {issue.aiAnalysis.modelUsed || 'Gemini Vision Active'}
                      </span>
                    )}
                  </div>
                  <p className="text-blue-950 mt-1.5 leading-relaxed font-medium">
                    {issue.aiAnalysis.assessment}
                  </p>
                  {issue.aiAnalysis.detectedLabels && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {issue.aiAnalysis.detectedLabels.map((lbl, idx) => (
                        <span key={idx} className="bg-white text-slate-700 px-2 py-0.5 rounded border border-blue-200 text-[10px] font-semibold">
                          {lbl}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Workflow Action Buttons (Role Based) */}
          <div className="border-t border-slate-200 pt-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Municipal Workflow Actions (Current Role: {currentUser.role})
            </h3>

            <div className="flex flex-wrap gap-3">
              {/* Officer / Admin Actions */}
              {isOfficerOrAdmin && (
                <>
                  <button
                    onClick={() => setOverrideModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
                  >
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Override Priority
                  </button>

                  <button
                    onClick={() => setAssignModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
                  >
                    <User className="h-4 w-4 text-blue-600" />
                    Assign Field Staff
                  </button>
                </>
              )}

              {/* Repair Staff Actions */}
              {currentUser.role === 'Repair Staff' && (
                <>
                  {issue.status === 'Assigned' && (
                    <button
                      onClick={handleStartWork}
                      disabled={isSubmitting}
                      className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-2xs"
                    >
                      <ArrowRight className="h-4 w-4" />
                      Start Work (Mark In Progress)
                    </button>
                  )}
                </>
              )}

              {/* Awaiting Verification actions for Officer */}
              {issue.status === 'Awaiting Verification' && isOfficerOrAdmin && (
                <div className="w-full rounded-xl border border-purple-200 bg-purple-50/60 p-4 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-purple-900">
                    <ShieldCheck className="h-5 w-5 text-purple-600" />
                    Municipal Officer Inspection & Verification
                  </div>
                  <p className="text-xs text-purple-800">
                    Staff {issue.repairData?.staffName || 'Technician'} submitted remediation notes:
                    <span className="block mt-1 italic font-medium bg-white/80 p-2 rounded border border-purple-200">
                      "{issue.repairData?.repairNotes || 'Repairs performed.'}"
                    </span>
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Verification Sign-off Notes:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Inspected on-site; asphalt surface profile level; seal approved."
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-purple-600"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOfficerVerification(true)}
                      disabled={isSubmitting}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-2xs"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Verify & Approve (Mark Completed)
                    </button>
                    <button
                      onClick={() => handleOfficerVerification(false)}
                      disabled={isSubmitting}
                      className="flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 shadow-2xs"
                    >
                      Reject & Request Revision
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Repair Staff Completion Form if In Progress */}
            {currentUser.role === 'Repair Staff' && issue.status === 'In Progress' && (
              <form onSubmit={handleRepairSubmission} className="mt-4 rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
                <div className="font-bold text-sm text-blue-950 flex items-center gap-2">
                  <CheckCircle2 className="h-4.5 w-4.5 text-blue-600" />
                  Submit Work Completion for Municipal Officer Verification
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Repair Field Notes *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Describe patch depth, asphalt compaction, curb cleaning or materials applied..."
                    value={repairNotes}
                    onChange={(e) => setRepairNotes(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Materials Used
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1.2 tons Hot Mix Asphalt, Bitumen Seal"
                      value={materialsUsed}
                      onChange={(e) => setMaterialsUsed(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Labor Hours
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={laborHours}
                      onChange={(e) => setLaborHours(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Upload Completion Photo (Proof of Remediation)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {repairPhoto && (
                    <img src={repairPhoto} alt="Preview" className="mt-2 h-20 w-32 object-cover rounded-md border border-slate-300" />
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-2xs"
                >
                  Submit for Verification
                </button>
              </form>
            )}
          </div>

          {/* Audit / Workflow History Timeline */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Tamper-Evident Workflow History
            </h3>
            <div className="space-y-2.5">
              {issue.history.map((h, i) => (
                <div key={i} className="flex items-start gap-3 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <Clock className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{h.action}</span>
                      <span className="text-[11px] text-slate-500">
                        {new Date(h.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5">{h.details}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Actor: {h.actorName} ({h.actorRole})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Override Submodal */}
        {overrideModalOpen && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/60 p-4">
            <form
              onSubmit={handlePrioritySubmit}
              className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200 space-y-4"
            >
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Override Priority Level
              </h4>
              <p className="text-xs text-slate-600">
                Authorized Municipal Officers can adjust the priority level. A recorded justification is legally mandatory for audit compliance.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Priority Level
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as IssuePriority)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold text-slate-900"
                >
                  <option value="High">High (Immediate Hazard / Red)</option>
                  <option value="Medium">Medium (Moderate Hazard / Orange)</option>
                  <option value="Low">Low (Routine Maintenance / Blue)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Justification Reason *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain reason (e.g. proximity to school crossing, high bus volume, risk of basement flooding)..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOverrideModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                >
                  Confirm Override
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Staff Assignment Submodal */}
        {assignModalOpen && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/60 p-4">
            <form
              onSubmit={handleAssignSubmit}
              className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200 space-y-4"
            >
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Assign Field Repair Staff
              </h4>
              <p className="text-xs text-slate-600">
                Dispatch this issue to an active municipal field technician.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Repair Staff Member
                </label>
                <select
                  required
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold text-slate-900"
                >
                  <option value="">-- Choose Field Staff --</option>
                  {staffUsers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.department}) - Badge: {s.badge}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                >
                  Dispatch Staff
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
