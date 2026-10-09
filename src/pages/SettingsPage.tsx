import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Settings,
  Shield,
  Database,
  Key,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Building,
  User,
  FileText,
  Lock,
  Terminal,
  HelpCircle,
} from 'lucide-react';
import { AuditLog, MunicipalDepartment } from '../types/index.ts';

export const SettingsPage: React.FC = () => {
  const {
    currentUser,
    users,
    switchUser,
    systemHealth,
    resetDatabase,
  } = useApp();

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [departments, setDepartments] = useState<MunicipalDepartment[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingLogs(true);
        const [logsRes, deptsRes] = await Promise.all([
          fetch('/api/audit-logs'),
          fetch('/api/departments'),
        ]);
        if (logsRes.ok) setAuditLogs(await logsRes.json());
        if (deptsRes.ok) setDepartments(await deptsRes.json());
      } catch (e) {
        console.warn('Error loading settings data:', e);
      } finally {
        setIsLoadingLogs(false);
      }
    };
    fetchData();
  }, []);

  const handleResetData = async () => {
    if (
      window.confirm(
        'Are you sure you want to re-seed the CIVISCAN database with the initial municipal test dataset? This will restore sample issues and history.'
      )
    ) {
      await resetDatabase();
      const logsRes = await fetch('/api/audit-logs');
      if (logsRes.ok) setAuditLogs(await logsRes.json());
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          System Settings & Municipal Audit Directory
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Infrastructure configurations, gateway connectivity, role permissions, and tamper-evident audit trails.
        </p>
      </div>

      {/* Integration & Gateway Status Panel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Server className="h-5 w-5 text-blue-600" />
          Integration & External Gateway Status
        </h3>
        <p className="text-xs text-slate-500">
          Transparent monitoring of civic dependencies and required production credentials.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Gemini Vision */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Gemini Computer Vision</span>
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  systemHealth?.aiVisionConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
            </div>
            <p className="text-[11px] text-slate-600">
              {systemHealth?.aiVisionConfigured
                ? 'Model Connected: ' + systemHealth.model
                : 'Not configured (GEMINI_API_KEY required). Manual triage active.'}
            </p>
          </div>

          {/* Leaflet & OpenStreetMap */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">OpenStreetMap & GIS</span>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] text-slate-600">
              Active (OpenStreetMap raster tiles). No paid API keys required.
            </p>
          </div>

          {/* Persistent File Storage */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Database Storage</span>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] text-slate-600">
              Active: Persistent JSON storage (`./data/civiscan_db.json`).
            </p>
          </div>

          {/* SMS / Email Gateway */}
          <div className="rounded-xl border border-amber-200 p-4 bg-amber-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900">SMS / Email Gateways</span>
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            </div>
            <p className="text-[11px] text-amber-800">
              External Gateway Not Configured (Twilio / SendGrid). In-App dispatch active.
            </p>
          </div>
        </div>
      </div>

      {/* Municipal Departments Directory */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Building className="h-5 w-5 text-blue-600" />
          Configured Municipal Departments
        </h3>
        <p className="text-xs text-slate-500">
          Official city service bureaus responsible for dispatch triage and repair execution.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {departments.map((dept) => (
            <div key={dept.id} className="rounded-xl border border-slate-200 p-4 space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm">{dept.name}</h4>
              <p className="text-xs text-slate-600">{dept.head}</p>
              <div className="text-[11px] text-slate-500 font-mono">{dept.contactEmail}</div>
              <div className="pt-2 flex justify-between text-[11px] font-semibold text-slate-700 border-t border-slate-100">
                <span>Staff: {dept.activeWorkforce}</span>
                <span className="text-blue-600">Open Tasks: {dept.openIssuesCount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Switcher & Security Authority */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <User className="h-5 w-5 text-purple-600" />
          Active Session & Role Switcher
        </h3>
        <p className="text-xs text-slate-500">
          Switch between municipal personas to test role-based permissions and verification flows.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {users.map((u) => (
            <div
              key={u.id}
              onClick={() => switchUser(u.id)}
              className={`cursor-pointer rounded-xl border p-4 transition-all flex items-center gap-3 ${
                currentUser.id === u.id
                  ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <img
                src={u.avatar}
                alt=""
                className="h-10 w-10 rounded-full object-cover border border-slate-200"
              />
              <div className="overflow-hidden">
                <div className="font-bold text-xs text-slate-900 truncate">{u.name}</div>
                <div className="text-[11px] font-semibold text-blue-600">{u.role}</div>
                <div className="text-[10px] text-slate-400 font-mono">{u.badge}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tamper-Evident Audit Trail */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              Tamper-Evident Municipal Audit Logs
            </h3>
            <p className="text-xs text-slate-500">
              Immutable ledger of priority overrides, staff assignments, and officer verifications.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
            {auditLogs.length} Events
          </span>
        </div>

        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-blue-700">
                    {log.entityId}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">{log.details}</p>
                <div className="text-[10px] text-slate-400">
                  Actor: {log.actor} ({log.role})
                </div>
              </div>

              <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap self-start sm:self-center">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Setup, Deployment & Maintenance Guide */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Terminal className="h-5 w-5 text-slate-700" />
          Setup & Deployment Instructions
        </h3>
        <p className="text-xs text-slate-500">
          Easy deployment and operational instructions for municipal IT staff.
        </p>

        <div className="rounded-xl bg-slate-900 text-slate-200 p-4 font-mono text-xs space-y-2">
          <p className="text-emerald-400"># 1. Clone & Install Dependencies</p>
          <p className="text-slate-300">npm install</p>

          <p className="text-emerald-400 pt-2"># 2. Environment Variables (.env)</p>
          <p className="text-slate-300">GEMINI_API_KEY="your_api_key_here" # For real Computer Vision</p>
          <p className="text-slate-300">PORT=3000</p>

          <p className="text-emerald-400 pt-2"># 3. Development / Full-Stack Execution</p>
          <p className="text-slate-300">npm run dev # Starts server.ts with Vite middleware on port 3000</p>

          <p className="text-emerald-400 pt-2"># 4. Production Build & Deployment</p>
          <p className="text-slate-300">npm run build && npm start</p>
        </div>
      </div>

      {/* Database Reset Control */}
      <div className="rounded-2xl border border-red-200 bg-red-50/30 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Database className="h-4 w-4 text-red-600" />
            Reset & Re-Seed Municipal Database
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Reset database state back to standard demonstration dataset with pre-seeded issues, before/after photos, and audit logs.
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="rounded-xl border border-red-300 bg-white px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50 transition-colors shadow-2xs shrink-0"
        >
          Re-Seed Demo Data
        </button>
      </div>
    </div>
  );
};
