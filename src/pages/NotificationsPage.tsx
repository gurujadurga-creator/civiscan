import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Smartphone,
  Mail,
  Shield,
  Eye,
  Check,
  Info,
} from 'lucide-react';
import { NotificationItem } from '../types/index.ts';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationRead, setSelectedIssue, issues } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [activePreview, setActivePreview] = useState<NotificationItem | null>(null);

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const handleInspectLinkedIssue = (issueId?: string) => {
    if (!issueId) return;
    const found = issues.find((i) => i.id === issueId);
    if (found) {
      setSelectedIssue(found);
    } else {
      alert(`Linked issue ${issueId} not found.`);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Municipal Dispatch & Notifications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time alerting queue with transparent channel delivery audit indicators.
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs font-bold border border-slate-200">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Alerts ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`rounded-lg px-3 py-1.5 transition-all ${
              filter === 'unread'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Unread Only ({notifications.filter((n) => !n.read).length})
          </button>
        </div>
      </div>

      {/* Gateway Status Disclosure */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3">
        <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Transparent Delivery Protocol Notice</p>
          <p className="text-amber-800 mt-0.5 leading-relaxed">
            In compliance with strict communication integrity, CIVISCAN accurately discloses delivery state. In-App notifications and Dispatch Alerts are delivered instantly. External SMS/Email dispatches indicate "Gateway Not Configured" until external provider credentials (Twilio/AWS SNS/SendGrid) are connected in Settings.
          </p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
            <Bell className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">No notifications in queue</p>
            <p className="text-xs text-slate-400 mt-1">
              You are all caught up with municipal dispatches and workflow status updates.
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border p-4 transition-all bg-white shadow-xs hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                !item.read ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    item.channel === 'SMS Gateway'
                      ? 'bg-amber-100 text-amber-700'
                      : item.channel === 'Dispatch Alert'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {item.channel === 'SMS Gateway' ? (
                    <Smartphone className="h-5 w-5" />
                  ) : item.channel === 'Dispatch Alert' ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : (
                    <Bell className="h-5 w-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                    {!item.read && (
                      <span className="h-2 w-2 rounded-full bg-blue-600" title="Unread" />
                    )}
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {item.channel}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                    <span>• Target: {item.targetRole}</span>
                    <span
                      className={`font-semibold ${
                        item.deliveryStatus === 'Delivered'
                          ? 'text-emerald-600'
                          : item.deliveryStatus === 'Gateway Not Configured'
                          ? 'text-amber-600'
                          : 'text-slate-500'
                      }`}
                    >
                      • Status: {item.deliveryStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {item.issueId && (
                  <button
                    onClick={() => handleInspectLinkedIssue(item.issueId)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
                  >
                    <Eye className="h-3.5 w-3.5 text-blue-600" />
                    <span>View Issue</span>
                  </button>
                )}

                {!item.read && (
                  <button
                    onClick={() => markNotificationRead(item.id)}
                    className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
                    title="Mark as read"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Mark Read</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
