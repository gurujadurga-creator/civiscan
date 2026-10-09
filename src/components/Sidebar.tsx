import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Home,
  LayoutDashboard,
  Camera,
  AlertTriangle,
  Map,
  ShieldAlert,
  ClipboardList,
  CheckCircle2,
  BarChart3,
  Bell,
  SunMedium,
  Settings,
  LogIn,
  Layers,
  X,
  Navigation,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentPage, setCurrentPage, stats, notifications, currentUser } = useApp();

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const navItems = [
    { id: 'home', label: 'Public Home', icon: Home, section: 'Public' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Overview', badge: stats?.totalIssues },
    { id: 'upload', label: 'Upload & Detect', icon: Camera, section: 'Intake', highlight: true },
    { id: 'issues', label: 'All Issues', icon: Layers, section: 'Municipal Ops', badge: stats?.totalIssues },
    { id: 'map', label: 'Map View', icon: Map, section: 'Municipal Ops' },
    { id: 'priority', label: 'Priority Management', icon: ShieldAlert, section: 'Municipal Ops', badge: stats?.highPriority, badgeColor: 'bg-red-500 text-white' },
    { id: 'tasks', label: 'Assigned Tasks', icon: ClipboardList, section: 'Field Ops', badge: stats?.assignedIssues },
    { id: 'live-location', label: 'Live Location & Device Management', icon: Navigation, section: 'Field Ops' },
    { id: 'completed', label: 'Completed History', icon: CheckCircle2, section: 'Field Ops', badge: stats?.completedIssues, badgeColor: 'bg-emerald-600 text-white' },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, section: 'Intelligence' },
    { id: 'notifications', label: 'Notifications', icon: Bell, section: 'Intelligence', badge: unreadNotifs > 0 ? unreadNotifs : undefined, badgeColor: 'bg-amber-500 text-white' },
    { id: 'future-scope', label: 'Solar & Future Scope', icon: SunMedium, section: 'Innovation' },
    { id: 'settings', label: 'Settings & Audit', icon: Settings, section: 'System' },
    { id: 'login', label: 'Switch Role / Login', icon: LogIn, section: 'System' },
  ];

  const handleSelect = (id: string) => {
    setCurrentPage(id);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
              CS
            </div>
            <span className="font-bold text-slate-900">CIVISCAN</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            const prevItem = navItems[idx - 1];
            const isNewSection = !prevItem || prevItem.section !== item.section;

            return (
              <React.Fragment key={item.id}>
                {isNewSection && (
                  <div className="pt-3 pb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {item.section}
                  </div>
                )}
                <button
                  onClick={() => handleSelect(item.id)}
                  className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : item.highlight
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4.5 w-4.5 transition-transform group-hover:scale-105 ${
                        isActive ? 'text-white' : item.highlight ? 'text-blue-600' : 'text-slate-500'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badgeColor || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Active Role Footer */}
        <div className="border-t border-slate-200 p-3 bg-slate-50">
          <div className="rounded-lg border border-slate-200 bg-white p-2.5">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Current Session
            </div>
            <div className="mt-1 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                <p className="text-[11px] text-blue-600 font-medium">{currentUser.role}</p>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="System Online" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
