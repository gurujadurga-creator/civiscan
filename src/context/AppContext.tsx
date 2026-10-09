import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Issue,
  User,
  NotificationItem,
  SystemStats,
  IssuePriority,
  IssueStatus,
  FieldStaffLocation,
  InspectionDevice,
  DeviceCommandLog,
} from '../types/index.ts';

interface AppContextType {
  currentUser: User;
  users: User[];
  switchUser: (userId: string) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  issues: Issue[];
  stats: SystemStats | null;
  notifications: NotificationItem[];
  systemHealth: { aiVisionConfigured: boolean; model: string } | null;
  selectedIssue: Issue | null;
  setSelectedIssue: (issue: Issue | null) => void;
  isLoading: boolean;
  error: string | null;
  fetchIssues: (filters?: Record<string, string>) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  overridePriority: (id: string, priority: IssuePriority, reason: string) => Promise<boolean>;
  updateStatus: (
    id: string,
    status: IssueStatus,
    details?: string,
    repairData?: any,
    verificationData?: any
  ) => Promise<boolean>;
  assignIssue: (id: string, staffId: string, department?: string) => Promise<boolean>;
  createNewIssue: (data: Partial<Issue>) => Promise<Issue | null>;
  markNotificationRead: (id: string) => Promise<void>;
  resetDatabase: () => Promise<void>;

  // Live Location & Device Management
  staffLocations: FieldStaffLocation[];
  fetchStaffLocations: () => Promise<void>;
  isSharingLocation: boolean;
  startLocationSharing: () => Promise<boolean>;
  stopLocationSharing: () => Promise<boolean>;
  devices: InspectionDevice[];
  fetchDevices: () => Promise<void>;
  registerDevice: (deviceData: Partial<InspectionDevice>) => Promise<InspectionDevice | null>;
  updateDevice: (id: string, updates: Partial<InspectionDevice>) => Promise<boolean>;
  deactivateDevice: (id: string) => Promise<boolean>;
  issueDeviceCommand: (
    deviceId: string,
    command: DeviceCommandLog['command'],
    isDemo: boolean
  ) => Promise<{ success: boolean; message: string }>;
  pingDevice: (id: string) => Promise<{ success: boolean; latencyMs?: number; message?: string }>;
  toggleTelemetry: (id: string) => Promise<boolean>;
  assignSector: (id: string, sector: string) => Promise<boolean>;
  toggleEmergency: (id: string, active: boolean) => Promise<boolean>;
  deviceCommands: DeviceCommandLog[];
  fetchDeviceCommands: () => Promise<void>;
}

const DEFAULT_USER: User = {
  id: 'user-officer-1',
  name: 'Marcus Vance',
  email: 'marcus.vance@civic.gov',
  role: 'Municipal Officer',
  department: 'Roads & Highways',
  badge: 'OFF-4412',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  phone: '+1 (555) 014-9210',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USER);
  const [users, setUsers] = useState<User[]>([]);
  const [issues, setIssues] = useState<Issue[]>(() => {
    try {
      const cached = localStorage.getItem('civiscan_issues_cache');
      if (cached) return JSON.parse(cached);
    } catch {}
    return [];
  });
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [systemHealth, setSystemHealth] = useState<{ aiVisionConfigured: boolean; model: string } | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Live Location & Devices State
  const [staffLocations, setStaffLocations] = useState<FieldStaffLocation[]>([]);
  const [isSharingLocation, setIsSharingLocation] = useState<boolean>(false);
  const [devices, setDevices] = useState<InspectionDevice[]>([]);
  const [deviceCommands, setDeviceCommands] = useState<DeviceCommandLog[]>([]);
  const locationWatchIdRef = useRef<number | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setSystemHealth({
          aiVisionConfigured: data.aiVisionConfigured,
          model: data.model,
        });
      }
    } catch (e) {
      console.warn('Health check failed:', e);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        // If current user is not in list yet, retain or match
        const found = data.find((u: User) => u.id === currentUser.id);
        if (found) setCurrentUser(found);
      }
    } catch (e) {
      console.warn('Error fetching users:', e);
    }
  }, [currentUser.id]);

  const fetchIssues = useCallback(async (filters?: Record<string, string>) => {
    try {
      setIsLoading(true);
      const query = new URLSearchParams(filters || {}).toString();
      const res = await fetch(`/api/issues${query ? `?${query}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        setIssues(data);
        try {
          localStorage.setItem('civiscan_issues_cache', JSON.stringify(data));
        } catch {}
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load issues');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.warn('Error fetching stats:', e);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.warn('Error fetching notifications:', e);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    fetchUsers();
    fetchIssues();
    fetchStats();
    fetchNotifications();
  }, [fetchHealth, fetchUsers, fetchIssues, fetchStats, fetchNotifications]);

  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const overridePriority = async (id: string, priority: IssuePriority, reason: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/issues/${id}/priority`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priority,
          officerId: currentUser.id,
          officerName: currentUser.name,
          officerRole: currentUser.role,
          reason,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to override priority');
        return false;
      }

      await fetchIssues();
      await fetchStats();
      await fetchNotifications();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const updateStatus = async (
    id: string,
    status: IssueStatus,
    details?: string,
    repairData?: any,
    verificationData?: any
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/issues/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          details,
          repairData,
          verificationData,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to update status');
        return false;
      }

      const updated = await res.json();
      if (selectedIssue && selectedIssue.id === id) {
        setSelectedIssue(updated);
      }

      await fetchIssues();
      await fetchStats();
      await fetchNotifications();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const assignIssue = async (id: string, staffId: string, department?: string): Promise<boolean> => {
    try {
      const staffMember = users.find((u) => u.id === staffId);
      if (!staffMember) return false;

      const res = await fetch(`/api/issues/${id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: staffMember.id,
          staffName: staffMember.name,
          staffPhone: staffMember.phone,
          assignerName: currentUser.name,
          assignerRole: currentUser.role,
          department: department || staffMember.department,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to assign issue');
        return false;
      }

      await fetchIssues();
      await fetchStats();
      await fetchNotifications();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const createNewIssue = async (data: Partial<Issue>): Promise<Issue | null> => {
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          reporter: {
            name: currentUser.name,
            role: currentUser.role,
            contact: currentUser.email,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create issue');
      }

      const created = await res.json();
      await fetchIssues();
      await fetchStats();
      await fetchNotifications();
      return created;
    } catch (e: any) {
      alert(e.message || 'Error creating issue');
      return null;
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (e) {
      console.warn(e);
    }
  };

  const fetchStaffLocations = useCallback(async () => {
    // Only authorized administrators and municipal officers can view
    if (currentUser.role !== 'Administrator' && currentUser.role !== 'Municipal Officer') {
      setStaffLocations([]);
      return;
    }
    try {
      const res = await fetch(`/api/locations/staff?role=${encodeURIComponent(currentUser.role)}`, {
        headers: { 'x-user-role': currentUser.role },
      });
      if (res.ok) {
        const data = await res.json();
        setStaffLocations(data);
      }
    } catch (e) {
      console.warn('Error fetching staff locations:', e);
    }
  }, [currentUser.role]);

  const fetchDevices = useCallback(async () => {
    try {
      const res = await fetch('/api/devices');
      if (res.ok) {
        const data = await res.json();
        setDevices(data);
      }
    } catch (e) {
      console.warn('Error fetching devices:', e);
    }
  }, []);

  const fetchDeviceCommands = useCallback(async () => {
    try {
      const res = await fetch('/api/devices/commands');
      if (res.ok) {
        const data = await res.json();
        setDeviceCommands(data);
      }
    } catch (e) {
      console.warn('Error fetching device commands:', e);
    }
  }, []);

  // Periodic polling for staff locations and devices
  useEffect(() => {
    fetchStaffLocations();
    fetchDevices();
    fetchDeviceCommands();
    const interval = setInterval(() => {
      fetchStaffLocations();
      fetchDevices();
    }, 12000);
    return () => clearInterval(interval);
  }, [fetchStaffLocations, fetchDevices, fetchDeviceCommands]);

  const startLocationSharing = async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      alert('Browser geolocation is not supported on this device.');
      return false;
    }

    return new Promise((resolve) => {
      // Request explicit browser permission
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setIsSharingLocation(true);
          const { latitude, longitude, accuracy, heading, speed } = position.coords;

          try {
            await fetch('/api/locations/share', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: currentUser.id,
                userName: currentUser.name,
                userRole: currentUser.role,
                department: currentUser.department,
                lat: latitude,
                lng: longitude,
                accuracyMeters: Math.round(accuracy),
                heading: heading || null,
                speed: speed || null,
              }),
            });
            await fetchStaffLocations();
          } catch (err) {
            console.error('Failed to post initial location:', err);
          }

          // Start active watch
          if (locationWatchIdRef.current !== null) {
            navigator.geolocation.clearWatch(locationWatchIdRef.current);
          }

          locationWatchIdRef.current = navigator.geolocation.watchPosition(
            async (pos) => {
              try {
                await fetch('/api/locations/share', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId: currentUser.id,
                    userName: currentUser.name,
                    userRole: currentUser.role,
                    department: currentUser.department,
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    accuracyMeters: Math.round(pos.coords.accuracy),
                    heading: pos.coords.heading || null,
                    speed: pos.coords.speed || null,
                  }),
                });
              } catch (e) {
                console.warn('Location watch update error:', e);
              }
            },
            (watchErr) => {
              console.warn('Location watch error or permission revoked:', watchErr.message);
              stopLocationSharing();
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
          );

          resolve(true);
        },
        (error) => {
          alert(`Location access denied or unavailable: ${error.message}`);
          setIsSharingLocation(false);
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const stopLocationSharing = async (): Promise<boolean> => {
    if (locationWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(locationWatchIdRef.current);
      locationWatchIdRef.current = null;
    }
    setIsSharingLocation(false);

    try {
      await fetch('/api/locations/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          actorName: currentUser.name,
          actorRole: currentUser.role,
        }),
      });
      await fetchStaffLocations();
      return true;
    } catch (e) {
      console.warn('Error stopping location sharing:', e);
      return false;
    }
  };

  // Clean up location watch on unmount
  useEffect(() => {
    return () => {
      if (locationWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(locationWatchIdRef.current);
      }
    };
  }, []);

  const registerDevice = async (deviceData: Partial<InspectionDevice>): Promise<InspectionDevice | null> => {
    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...deviceData,
          actorName: currentUser.name,
          actorRole: currentUser.role,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to register device');
        return null;
      }

      const created = await res.json();
      await fetchDevices();
      return created;
    } catch (e: any) {
      alert(e?.message || 'Error registering device');
      return null;
    }
  };

  const updateDevice = async (id: string, updates: Partial<InspectionDevice>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/devices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          actorName: currentUser.name,
          actorRole: currentUser.role,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to update device');
        return false;
      }

      await fetchDevices();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const deactivateDevice = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/devices/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorName: currentUser.name,
          actorRole: currentUser.role,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to deactivate device');
        return false;
      }

      await fetchDevices();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const issueDeviceCommand = async (
    deviceId: string,
    command: DeviceCommandLog['command'],
    isDemo: boolean
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`/api/devices/${deviceId}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command,
          isDemo,
          actorName: currentUser.name,
          actorRole: currentUser.role,
        }),
      });

      const data = await res.json();
      await fetchDevices();
      await fetchDeviceCommands();

      if (!res.ok && !isDemo) {
        return {
          success: false,
          message: data.message || data.error || 'Command execution failed on remote hardware.',
        };
      }

      return {
        success: Boolean(data.success),
        message: data.message || 'Command executed.',
      };
    } catch (e: any) {
      return {
        success: false,
        message: 'Network error communicating with device: ' + e?.message,
      };
    }
  };

  const pingDevice = async (id: string): Promise<{ success: boolean; latencyMs?: number; message?: string }> => {
    try {
      const res = await fetch(`/api/devices/${id}/ping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorName: currentUser.name,
          actorRole: currentUser.role,
        }),
      });
      const data = await res.json();
      await fetchDevices();
      await fetchDeviceCommands();
      return {
        success: res.ok,
        latencyMs: data.latencyMs,
        message: data.message || `Ping confirmed (${data.latencyMs || 24}ms latency)`,
      };
    } catch (e: any) {
      return { success: false, message: e?.message || 'Ping failed' };
    }
  };

  const toggleTelemetry = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/devices/${id}/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorName: currentUser.name,
          actorRole: currentUser.role,
        }),
      });
      await fetchDevices();
      await fetchDeviceCommands();
      return res.ok;
    } catch {
      return false;
    }
  };

  const assignSector = async (id: string, sector: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/devices/${id}/sector`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sector,
          actorName: currentUser.name,
          actorRole: currentUser.role,
        }),
      });
      await fetchDevices();
      await fetchDeviceCommands();
      return res.ok;
    } catch {
      return false;
    }
  };

  const toggleEmergency = async (id: string, active: boolean): Promise<boolean> => {
    try {
      const res = await fetch(`/api/devices/${id}/emergency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          active,
          actorName: currentUser.name,
          actorRole: currentUser.role,
        }),
      });
      await fetchDevices();
      await fetchDeviceCommands();
      await fetchNotifications();
      return res.ok;
    } catch {
      return false;
    }
  };

  const resetDatabase = async () => {
    try {
      await fetch('/api/reset-demo-data', { method: 'POST' });
      await fetchIssues();
      await fetchStats();
      await fetchNotifications();
      await fetchStaffLocations();
      await fetchDevices();
      await fetchDeviceCommands();
      alert('CIVISCAN database re-seeded successfully!');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        switchUser,
        currentPage,
        setCurrentPage,
        issues,
        stats,
        notifications,
        systemHealth,
        selectedIssue,
        setSelectedIssue,
        isLoading,
        error,
        fetchIssues,
        fetchStats,
        fetchNotifications,
        overridePriority,
        updateStatus,
        assignIssue,
        createNewIssue,
        markNotificationRead,
        resetDatabase,
        staffLocations,
        fetchStaffLocations,
        isSharingLocation,
        startLocationSharing,
        stopLocationSharing,
        devices,
        fetchDevices,
        registerDevice,
        updateDevice,
        deactivateDevice,
        issueDeviceCommand,
        pingDevice,
        toggleTelemetry,
        assignSector,
        toggleEmergency,
        deviceCommands,
        fetchDeviceCommands,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
