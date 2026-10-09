import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Shield,
  UserCheck,
  Wrench,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { currentUser, users, switchUser, setCurrentPage } = useApp();
  const [customEmail, setCustomEmail] = useState('');
  const [customPassword, setCustomPassword] = useState('');

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = users.find((u) => u.email.toLowerCase() === customEmail.toLowerCase());
    if (matched) {
      switchUser(matched.id);
      setCurrentPage('dashboard');
    } else {
      // Default fallback
      alert(`User with email "${customEmail}" not found in current municipal directory. Please choose one of the official staff profiles below.`);
    }
  };

  const handleRoleSelect = (userId: string) => {
    switchUser(userId);
    setCurrentPage('dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700">
          <Shield className="h-3.5 w-3.5" />
          <span>Role-Based Access Control (RBAC)</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Municipal Operations Portal Sign-In
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Access CIVISCAN infrastructure operations according to your assigned municipal authority.
        </p>
      </div>

      {/* Role Profile Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Administrator */}
        {users
          .filter((u) => u.role === 'Administrator')
          .map((u) => (
            <div
              key={u.id}
              className={`rounded-2xl border p-6 transition-all bg-white shadow-xs hover:shadow-md flex flex-col justify-between ${
                currentUser.id === u.id ? 'border-purple-500 ring-2 ring-purple-100' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="rounded-full bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 border border-purple-200">
                    Administrator
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{u.badge}</span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="h-12 w-12 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{u.name}</h3>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-3">
                  <p className="font-semibold text-slate-700">Permitted Operations:</p>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500">
                    <li>Full system oversight & triage</li>
                    <li>Priority level overrides</li>
                    <li>Work verification & close-out</li>
                    <li>Audit trail & configuration</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => handleRoleSelect(u.id)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-700 transition-colors shadow-xs"
              >
                <span>Sign In as Administrator</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

        {/* Municipal Officer */}
        {users
          .filter((u) => u.role === 'Municipal Officer')
          .slice(0, 1)
          .map((u) => (
            <div
              key={u.id}
              className={`rounded-2xl border p-6 transition-all bg-white shadow-xs hover:shadow-md flex flex-col justify-between ${
                currentUser.id === u.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="rounded-full bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 border border-blue-200">
                    Municipal Officer
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{u.badge}</span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="h-12 w-12 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{u.name}</h3>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-3">
                  <p className="font-semibold text-slate-700">Permitted Operations:</p>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500">
                    <li>Review incoming reports & AI scans</li>
                    <li>Assign tasks to repair technicians</li>
                    <li>Official priority adjustment</li>
                    <li>Inspect & verify completed repairs</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => handleRoleSelect(u.id)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs"
              >
                <span>Sign In as Officer</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

        {/* Repair Staff */}
        {users
          .filter((u) => u.role === 'Repair Staff')
          .slice(0, 1)
          .map((u) => (
            <div
              key={u.id}
              className={`rounded-2xl border p-6 transition-all bg-white shadow-xs hover:shadow-md flex flex-col justify-between ${
                currentUser.id === u.id ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 border border-emerald-200">
                    Repair Staff (Field)
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{u.badge}</span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="h-12 w-12 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{u.name}</h3>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-3">
                  <p className="font-semibold text-slate-700">Permitted Operations:</p>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500">
                    <li>View assigned dispatch queue</li>
                    <li>Update status to "In Progress"</li>
                    <li>Upload repair completion photos</li>
                    <li>Submit field logs for officer verification</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => handleRoleSelect(u.id)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <span>Sign In as Repair Staff</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
      </div>

      {/* Manual Email Login Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 max-w-md mx-auto shadow-xs">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
          <Lock className="h-4 w-4 text-slate-500" />
          Direct Municipal Directory Login
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Authenticate using official civic email credentials.
        </p>

        <form onSubmit={handleCustomLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Municipal Email
            </label>
            <input
              type="email"
              required
              placeholder="e.g. marcus.vance@civic.gov"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Secure Password / Token
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={customPassword}
              onChange={(e) => setCustomPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            Authenticate & Open Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};
