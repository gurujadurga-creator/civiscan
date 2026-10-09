import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Bell,
  Shield,
  User as UserIcon,
  ChevronDown,
  Sparkles,
  MapPin,
  Menu,
} from 'lucide-react';

export const Navbar: React.FC<{ onToggleSidebar?: () => void }> = ({ onToggleSidebar }) => {
  const {
    currentUser,
    users,
    switchUser,
    setCurrentPage,
    currentPage,
    notifications,
    systemHealth,
  } = useApp();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          onClick={() => setCurrentPage('home')}
          className="flex items-center gap-2.5 text-left focus:outline-hidden"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-xs">
            <span className="text-base tracking-wider">CS</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">CIVISCAN</span>
              <span className="hidden sm:inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200">
                MUNICIPAL AI
              </span>
            </div>
            <p className="text-[10px] text-slate-500 hidden md:block">
              Road Damage & Garbage Monitoring System
            </p>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {/* AI System Badge */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs">
          <Sparkles
            className={`h-3.5 w-3.5 ${
              systemHealth?.aiVisionConfigured ? 'text-blue-600 animate-pulse' : 'text-amber-500'
            }`}
          />
          <span className="font-medium text-slate-700">
            {systemHealth?.aiVisionConfigured ? 'AI Vision: Active' : 'AI: Config Required / Demo Ready'}
          </span>
        </div>

        {/* Notifications button */}
        <button
          onClick={() => setCurrentPage('notifications')}
          className={`relative rounded-lg p-2 transition-colors ${
            currentPage === 'notifications'
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
          title="Municipal Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-xs">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Active Role Quick Switcher */}
        <div className="relative flex items-center">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 pr-3 shadow-xs">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-8 w-8 rounded-lg object-cover border border-slate-200"
            />
            <div className="hidden sm:block text-left text-xs leading-tight">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                {currentUser.name}
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    currentUser.role === 'Administrator'
                      ? 'bg-purple-100 text-purple-700'
                      : currentUser.role === 'Municipal Officer'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {currentUser.role}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">{currentUser.department}</div>
            </div>

            {/* Quick dropdown switch */}
            <select
              value={currentUser.id}
              onChange={(e) => switchUser(e.target.value)}
              className="ml-1 cursor-pointer rounded border-slate-200 bg-white py-1 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              title="Switch user role"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.role}: {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
