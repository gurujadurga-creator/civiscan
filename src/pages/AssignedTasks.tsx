import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  ClipboardList,
  Wrench,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  Upload,
  User,
  AlertTriangle,
  Building,
} from 'lucide-react';
import { Issue } from '../types/index.ts';

export const AssignedTasks: React.FC = () => {
  const {
    issues,
    currentUser,
    setSelectedIssue,
    updateStatus,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'my_tasks' | 'all_assigned'>('my_tasks');
  const [activeTaskToComplete, setActiveTaskToComplete] = useState<Issue | null>(null);

  // Completion Form State
  const [repairNotes, setRepairNotes] = useState('');
  const [materialsUsed, setMaterialsUsed] = useState('');
  const [laborHours, setLaborHours] = useState('3.0');
  const [completionPhoto, setCompletionPhoto] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter tasks
  const myTasks = issues.filter(
    (i) =>
      i.assignedStaff?.id === currentUser.id &&
      i.status !== 'Completed'
  );

  const allAssignedTasks = issues.filter(
    (i) =>
      Boolean(i.assignedStaff) &&
      i.status !== 'Completed'
  );

  const displayedTasks = activeTab === 'my_tasks' ? myTasks : allAssignedTasks;

  const handleStartWork = async (issue: Issue) => {
    await updateStatus(issue.id, 'In Progress', `Field repair begun by technician ${currentUser.name}.`);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCompletionPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTaskToComplete) return;

    if (!repairNotes.trim()) {
      alert('Please describe repair actions and materials applied.');
      return;
    }

    setIsSubmitting(true);
    const ok = await updateStatus(
      activeTaskToComplete.id,
      'Awaiting Verification',
      `Field remediation completed by ${currentUser.name}. Proof submitted for officer inspection.`,
      {
        completedAt: new Date().toISOString(),
        completedByStaffId: currentUser.id,
        staffName: currentUser.name,
        completionPhotoUrl:
          completionPhoto ||
          'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
        repairNotes,
        materialsUsed: materialsUsed || 'Standard cold mix asphalt & binder',
        laborHours: parseFloat(laborHours) || 2,
      }
    );
    setIsSubmitting(false);

    if (ok) {
      alert(`Task ${activeTaskToComplete.id} marked as "Awaiting Verification". Municipal Officer notified for inspection!`);
      setActiveTaskToComplete(null);
      setRepairNotes('');
      setMaterialsUsed('');
      setCompletionPhoto('');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Field Operations: Assigned Repair Tasks
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Task dispatch queue for municipal road maintenance crews and sanitation teams.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs font-bold border border-slate-200">
          <button
            onClick={() => setActiveTab('my_tasks')}
            className={`rounded-lg px-3.5 py-1.5 transition-all ${
              activeTab === 'my_tasks'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            My Assigned Queue ({myTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('all_assigned')}
            className={`rounded-lg px-3.5 py-1.5 transition-all ${
              activeTab === 'all_assigned'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All City Crews ({allAssignedTasks.length})
          </button>
        </div>
      </div>

      {/* Notice about Current User */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-blue-600" />
          <span>
            Operating as: <b>{currentUser.name}</b> ({currentUser.role} - {currentUser.department})
          </span>
        </div>
        <span className="font-mono text-slate-500">Badge: {currentUser.badge}</span>
      </div>

      {/* Task Cards Grid */}
      {displayedTasks.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          <ClipboardList className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">No active assigned tasks</p>
          <p className="text-xs text-slate-400 mt-1">
            {activeTab === 'my_tasks'
              ? 'You have no pending tasks assigned in your field queue. Check "All City Crews" or triage new reports.'
              : 'There are currently no assigned issues awaiting repair across city departments.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedTasks.map((task) => (
            <div
              key={task.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-blue-700">{task.id}</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        task.priority === 'High'
                          ? 'bg-red-100 text-red-700'
                          : task.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        task.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : task.status === 'Awaiting Verification'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>

                {/* Photo Thumbnail */}
                <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-100 mb-3 border border-slate-200">
                  <img src={task.imageUrl} alt="" className="h-full w-full object-cover" />
                  <span className="absolute bottom-1.5 left-1.5 bg-slate-900/80 text-white text-[10px] font-medium px-2 py-0.5 rounded">
                    {task.category}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">{task.title}</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{task.location.address}</span>
                </p>

                <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 space-y-1 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned To:</span>
                    <span className="font-bold text-slate-800">
                      {task.assignedStaff ? task.assignedStaff.name : 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-medium text-slate-700">{task.department}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                {task.status === 'Assigned' && (
                  <button
                    onClick={() => handleStartWork(task)}
                    className="flex-1 rounded-xl bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-2xs"
                  >
                    Start Work
                  </button>
                )}

                {task.status === 'In Progress' && (
                  <button
                    onClick={() => setActiveTaskToComplete(task)}
                    className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Submit Work Proof</span>
                  </button>
                )}

                {task.status === 'Awaiting Verification' && (
                  <span className="flex-1 text-center py-2 text-xs font-bold text-purple-700 bg-purple-50 rounded-xl border border-purple-200">
                    Awaiting Officer Review
                  </span>
                )}

                <button
                  onClick={() => setSelectedIssue(task)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  title="Inspect full details"
                >
                  Inspect
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completion Proof Submission Modal */}
      {activeTaskToComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleSubmitCompletion}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Submit Field Completion Proof
                </h3>
                <span className="text-xs font-mono text-blue-700">
                  {activeTaskToComplete.id} - {activeTaskToComplete.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTaskToComplete(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Submit photo verification and remediation details. An official Municipal Officer must review this submission before closing the issue.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Remediation Field Notes *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe patch depth, compaction rating, debris cubic yards removed, or asphalt cure time..."
                value={repairNotes}
                onChange={(e) => setRepairNotes(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Materials Used
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1.8 tons Hot Mix Asphalt"
                  value={materialsUsed}
                  onChange={(e) => setMaterialsUsed(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Labor Hours Spent
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={laborHours}
                  onChange={(e) => setLaborHours(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Remediation Completion Photo *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {completionPhoto && (
                <img
                  src={completionPhoto}
                  alt="Proof preview"
                  className="mt-2 h-24 w-36 object-cover rounded-md border border-slate-200"
                />
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTaskToComplete(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
              >
                Submit for Officer Sign-off
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
