import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Navigation,
  Radio,
  Cpu,
  Plane,
  Truck,
  SunMedium,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Plus,
  Battery,
  MapPin,
  RefreshCw,
  Power,
  Sliders,
  X,
  User,
  Building,
  Layers,
  Wifi,
  AlertOctagon,
  Activity,
  Compass,
  Check,
} from 'lucide-react';
import { InspectionDevice, DeviceCommandLog, FieldStaffLocation, Issue } from '../types/index.ts';

const MUNICIPAL_SECTORS = [
  'Sector 1 — Civic Center Core',
  'Sector 2 — Market & Mission Transit Axis',
  'Sector 3 — Waterfront & Embarcadero',
  'Sector 4 — North Arterial Corridor',
  'Sector 5 — West Sunset Boulevard',
  'Sector 6 — Industrial Ring',
  'Sector 7 — South Bayshore Beltway',
  'Sector 8 — Central Transit Terminal',
];

export const LiveLocationDeviceManagement: React.FC = () => {
  const {
    currentUser,
    staffLocations,
    fetchStaffLocations,
    isSharingLocation,
    startLocationSharing,
    stopLocationSharing,
    devices,
    fetchDevices,
    registerDevice,
    deactivateDevice,
    issueDeviceCommand,
    deviceCommands,
    fetchDeviceCommands,
    pingDevice,
    toggleTelemetry,
    assignSector,
    toggleEmergency,
    issues,
    setSelectedIssue,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'map_overview' | 'devices' | 'staff_tracking' | 'audit_log'>('map_overview');

  // Map layer toggles
  const [showDevicesLayer, setShowDevicesLayer] = useState(true);
  const [showStaffLayer, setShowStaffLayer] = useState(true);
  const [showIssuesLayer, setShowIssuesLayer] = useState(true);

  // Sector assignment modal state
  const [sectorModalDevice, setSectorModalDevice] = useState<InspectionDevice | null>(null);
  const [selectedSector, setSelectedSector] = useState(MUNICIPAL_SECTORS[0]);

  // Device registration modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState<InspectionDevice['type']>('Drone');
  const [newDeviceDept, setNewDeviceDept] = useState('Roads & Highways');
  const [newDeviceSerial, setNewDeviceSerial] = useState('');
  const [newDeviceSector, setNewDeviceSector] = useState(MUNICIPAL_SECTORS[0]);
  const [newDeviceNotes, setNewDeviceNotes] = useState('');

  // Action loading / feedback state
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [bannerNotice, setBannerNotice] = useState<{
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
  } | null>(null);

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const deviceLayerRef = useRef<any>(null);
  const staffLayerRef = useRef<any>(null);
  const issueLayerRef = useRef<any>(null);

  const isAdmin = currentUser.role === 'Administrator';
  const isOfficerOrAdmin = currentUser.role === 'Administrator' || currentUser.role === 'Municipal Officer';

  // Own location sharing toggle
  const handleToggleSharing = async () => {
    setActionLoadingId('toggle-sharing');
    if (isSharingLocation) {
      await stopLocationSharing();
      setBannerNotice({
        type: 'info',
        title: 'Location Sharing Stopped',
        message: 'Your browser geolocation is no longer transmitting coordinates to municipal dispatch.',
      });
    } else {
      const ok = await startLocationSharing();
      if (ok) {
        setBannerNotice({
          type: 'success',
          title: 'Live Location Sharing Active',
          message: 'Your high-accuracy GPS coordinates are now transmitting live to authorized municipal dispatchers.',
        });
      }
    }
    setActionLoadingId(null);
  };

  // Immediate Ping
  const handlePing = async (device: InspectionDevice) => {
    setActionLoadingId(`ping-${device.id}`);
    const res = await pingDevice(device.id);
    setActionLoadingId(null);
    if (res.success) {
      setBannerNotice({
        type: 'success',
        title: `Telemetry Ping Confirmed (${device.name})`,
        message: `Device acknowledged status ping with ${res.latencyMs || 24}ms latency. Coordinates updated.`,
      });
    } else {
      setBannerNotice({
        type: 'error',
        title: `Ping Failed (${device.name})`,
        message: res.message || 'Remote unit did not acknowledge ping.',
      });
    }
  };

  // Toggle Telemetry Stream
  const handleToggleTelemetry = async (device: InspectionDevice) => {
    setActionLoadingId(`telemetry-${device.id}`);
    const ok = await toggleTelemetry(device.id);
    setActionLoadingId(null);
    if (ok) {
      setBannerNotice({
        type: 'info',
        title: `Telemetry Stream Updated (${device.name})`,
        message: `High-frequency sensor telemetry stream is now ${device.telemetryStreamActive ? 'PAUSED' : 'ACTIVE (1Hz)'}.`,
      });
    }
  };

  // Assign Sector
  const handleAssignSectorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectorModalDevice) return;
    setActionLoadingId(`sector-${sectorModalDevice.id}`);
    const ok = await assignSector(sectorModalDevice.id, selectedSector);
    setActionLoadingId(null);
    if (ok) {
      setBannerNotice({
        type: 'success',
        title: `Patrol Sector Assigned (${sectorModalDevice.name})`,
        message: `Dispatched to [${selectedSector}]. Unit routing waypoints updated.`,
      });
      setSectorModalDevice(null);
    }
  };

  // Emergency Alert Toggle
  const handleToggleEmergency = async (device: InspectionDevice) => {
    const nextState = !device.emergencyFlag;
    const confirmMsg = nextState
      ? `ACTIVATE EMERGENCY HAZARD BEACON on ${device.name}? This dispatches high-priority alerts to all municipal officers.`
      : `Clear emergency hazard status on ${device.name}?`;

    if (!window.confirm(confirmMsg)) return;

    setActionLoadingId(`emergency-${device.id}`);
    const ok = await toggleEmergency(device.id, nextState);
    setActionLoadingId(null);
    if (ok) {
      setBannerNotice({
        type: nextState ? 'error' : 'success',
        title: nextState ? `EMERGENCY BEACON ACTIVATED (${device.name})` : `Emergency Cleared (${device.name})`,
        message: nextState
          ? 'Emergency distress signal active. Municipal dispatch desk alerted.'
          : 'Emergency status cleared. Hardware telemetry normal.',
      });
    }
  };

  // Device registration submit
  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName.trim()) {
      alert('Please enter a device name.');
      return;
    }

    const created = await registerDevice({
      name: newDeviceName,
      type: newDeviceType,
      department: newDeviceDept,
      serialNumber: newDeviceSerial || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      patrolSector: newDeviceSector,
      operatorName: currentUser.name,
      firmware: 'v3.5.0-civic',
      status: 'Online',
      batteryLevel: 100,
      notes: newDeviceNotes,
      currentCoordinates: {
        lat: Number((37.7749 + (Math.random() - 0.5) * 0.03).toFixed(6)),
        lng: Number((-122.4194 + (Math.random() - 0.5) * 0.03).toFixed(6)),
      },
    });

    if (created) {
      setShowRegisterModal(false);
      setNewDeviceName('');
      setNewDeviceSerial('');
      setNewDeviceNotes('');
      setBannerNotice({
        type: 'success',
        title: 'Device Registered Successfully',
        message: `Hardware unit ${created.name} (${created.id}) added to municipal fleet.`,
      });
    }
  };

  // Initialize unified Leaflet map
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (!mapContainerRef.current) return;
      if (leafletMapRef.current) return;

      try {
        const L = (await import('leaflet')).default;
        if (!isMounted || !mapContainerRef.current) return;

        const map = L.map(mapContainerRef.current).setView([37.7749, -122.4194], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        deviceLayerRef.current = L.layerGroup().addTo(map);
        staffLayerRef.current = L.layerGroup().addTo(map);
        issueLayerRef.current = L.layerGroup().addTo(map);

        leafletMapRef.current = map;
      } catch (err) {
        console.error('Error initializing telemetry map:', err);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update map layers dynamically
  useEffect(() => {
    const updateLayers = async () => {
      if (!leafletMapRef.current) return;
      const L = (await import('leaflet')).default;

      // 1. Devices Layer
      if (deviceLayerRef.current) {
        deviceLayerRef.current.clearLayers();
        if (showDevicesLayer) {
          devices.forEach((dev) => {
            if (!dev.currentCoordinates || dev.status === 'Deactivated') return;

            const isEmergency = dev.emergencyFlag;
            const statusColor = isEmergency
              ? '#dc2626'
              : dev.status === 'Online'
              ? '#10b981'
              : dev.status === 'In Transit'
              ? '#2563eb'
              : dev.status === 'Standby'
              ? '#64748b'
              : '#f59e0b';

            const iconHtml = `
              <div style="background-color:${statusColor}; width:32px; height:32px; border-radius:50%; border:3px solid white; box-shadow:0 4px 12px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center; color:white; font-size:12px; font-weight:bold; position:relative;">
                ${isEmergency ? '⚠️' : dev.type === 'Drone' ? '✈' : dev.type === 'Patrol Unit' ? '🚓' : '⚙'}
                ${dev.telemetryStreamActive ? '<span style="position:absolute; top:-2px; right:-2px; width:8px; height:8px; border-radius:50%; background:#38bdf8; border:1px solid white;"></span>' : ''}
              </div>
            `;

            const icon = L.divIcon({
              className: 'device-map-pin',
              html: iconHtml,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            });

            const marker = L.marker([dev.currentCoordinates.lat, dev.currentCoordinates.lng], { icon });
            marker.bindPopup(`
              <div style="font-family: inherit; font-size: 12px; padding: 4px; min-width: 210px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <b style="color:#0f172a; font-size:13px;">${dev.name}</b>
                  <span style="background:${statusColor}; color:white; padding:1px 6px; border-radius:4px; font-size:9px; font-weight:bold;">
                    ${isEmergency ? 'EMERGENCY' : dev.status}
                  </span>
                </div>
                <div style="color:#64748b; font-size:11px;">ID: ${dev.id} • ${dev.type}</div>
                <div style="margin-top:6px; font-size:11px; line-height:1.4;">
                  <div><b>Sector:</b> ${dev.patrolSector || 'Unassigned'}</div>
                  <div><b>Operator:</b> ${dev.operatorName || 'Autonomous'}</div>
                  <div><b>Battery:</b> ${dev.batteryLevel ?? 90}% • <b>Latency:</b> ${dev.latencyMs ?? 24}ms</div>
                  <div><b>Telemetry:</b> ${dev.telemetryStreamActive ? 'Streaming (1Hz)' : 'Standby'}</div>
                  <div><b>Last Ping:</b> ${new Date(dev.lastPingAt || dev.lastCommunicationTime).toLocaleTimeString()}</div>
                </div>
              </div>
            `);
            marker.addTo(deviceLayerRef.current);
          });
        }
      }

      // 2. Staff Layer
      if (staffLayerRef.current) {
        staffLayerRef.current.clearLayers();
        if (showStaffLayer && isOfficerOrAdmin) {
          staffLocations.forEach((staff) => {
            const isCurrent = staff.status === 'current';
            const color = !staff.isSharing ? '#94a3b8' : isCurrent ? '#10b981' : '#f59e0b';

            const iconHtml = `
              <div style="background-color:${color}; width:28px; height:28px; border-radius:50%; border:2px solid white; box-shadow:0 3px 8px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; color:white; font-size:11px; font-weight:bold;">
                ${staff.userName.charAt(0)}
              </div>
            `;

            const icon = L.divIcon({
              className: 'staff-map-pin',
              html: iconHtml,
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            });

            const marker = L.marker([staff.lat, staff.lng], { icon });

            // Accuracy circle if sharing
            if (staff.isSharing && staff.accuracyMeters) {
              L.circle([staff.lat, staff.lng], {
                radius: staff.accuracyMeters,
                color,
                fillColor: color,
                fillOpacity: 0.12,
                weight: 1,
              }).addTo(staffLayerRef.current);
            }

            marker.bindPopup(`
              <div style="font-family: inherit; font-size: 12px; padding: 4px;">
                <b style="color:#0f172a;">${staff.userName}</b>
                <div style="color:#64748b; font-size:11px;">${staff.userRole} • ${staff.department}</div>
                <div style="margin-top:4px; font-size:11px;">
                  Status: <b style="color:${color};">${staff.isSharing ? staff.status.toUpperCase() : 'SHARING OFF'}</b>
                  ${staff.accuracyMeters ? ` • ±${staff.accuracyMeters}m` : ''}
                </div>
                <div style="color:#94a3b8; font-size:10px; margin-top:2px;">
                  Last report: ${new Date(staff.lastUpdated).toLocaleTimeString()}
                </div>
              </div>
            `);
            marker.addTo(staffLayerRef.current);
          });
        }
      }

      // 3. Open Issues Layer
      if (issueLayerRef.current) {
        issueLayerRef.current.clearLayers();
        if (showIssuesLayer) {
          issues.forEach((iss) => {
            if (iss.location?.lat == null || iss.location?.lng == null) return;

            const isDone = iss.status === 'Completed';
            const color = isDone ? '#10b981' : iss.priority === 'High' ? '#ef4444' : iss.priority === 'Medium' ? '#f97316' : '#3b82f6';

            const icon = L.divIcon({
              className: 'issue-pin',
              html: `
                <div style="background-color:${color}; width:20px; height:20px; border-radius:4px; border:2px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; color:white; font-size:10px; font-weight:bold;">
                  !
                </div>
              `,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            });

            const marker = L.marker([iss.location.lat, iss.location.lng], { icon });
            marker.bindPopup(`
              <div style="font-family: inherit; font-size: 11px; padding: 2px; max-width: 200px;">
                <b style="color:#0f172a;">${iss.title}</b>
                <div style="color:#64748b; font-size:10px;">${iss.category} • ${iss.priority} Priority</div>
                <div style="color:#334155; font-size:10px; margin-top:2px;">Status: <b>${iss.status}</b></div>
                <div style="color:#64748b; font-size:10px;">${iss.location.address}</div>
                <button id="inspect-map-issue-${iss.id}" style="margin-top:6px; width:100%; background:#2563eb; color:white; border:none; padding:4px; border-radius:4px; font-weight:bold; cursor:pointer;">
                  Inspect Issue
                </button>
              </div>
            `);

            marker.on('popupopen', () => {
              const btn = document.getElementById(`inspect-map-issue-${iss.id}`);
              if (btn) {
                btn.onclick = () => setSelectedIssue(iss);
              }
            });

            marker.addTo(issueLayerRef.current);
          });
        }
      }
    };

    updateLayers();
  }, [devices, staffLocations, issues, showDevicesLayer, showStaffLayer, showIssuesLayer, isOfficerOrAdmin, setSelectedIssue]);

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <Navigation className="h-4 w-4" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Live Location & Device Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            Authorized municipal field telemetry, real-time GPS location sharing, drone patrol command integration, and defect hotspot layer mapping.
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex flex-wrap items-center rounded-xl bg-slate-100 p-1 text-xs font-bold border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveTab('map_overview')}
            className={`rounded-lg px-3.5 py-1.5 transition-all flex items-center gap-1.5 ${
              activeTab === 'map_overview' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="h-3.5 w-3.5 text-blue-600" />
            <span>Telemetry Map</span>
          </button>
          <button
            onClick={() => setActiveTab('devices')}
            className={`rounded-lg px-3.5 py-1.5 transition-all flex items-center gap-1.5 ${
              activeTab === 'devices' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="h-3.5 w-3.5 text-purple-600" />
            <span>Devices ({devices.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('staff_tracking')}
            className={`rounded-lg px-3.5 py-1.5 transition-all flex items-center gap-1.5 ${
              activeTab === 'staff_tracking' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="h-3.5 w-3.5 text-emerald-600" />
            <span>Field Team Sharing</span>
          </button>
          <button
            onClick={() => setActiveTab('audit_log')}
            className={`rounded-lg px-3.5 py-1.5 transition-all flex items-center gap-1.5 ${
              activeTab === 'audit_log' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-slate-600" />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Banner Feedback Notice */}
      {bannerNotice && (
        <div
          className={`rounded-xl p-3.5 text-xs flex items-start gap-3 border transition-all ${
            bannerNotice.type === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : bannerNotice.type === 'warning'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : bannerNotice.type === 'info'
              ? 'bg-blue-50 border-blue-300 text-blue-950'
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}
        >
          {bannerNotice.type === 'error' ? (
            <AlertOctagon className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          ) : bannerNotice.type === 'warning' ? (
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          ) : bannerNotice.type === 'info' ? (
            <Radio className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-bold">{bannerNotice.title}</p>
            <p className="mt-0.5 leading-relaxed">{bannerNotice.message}</p>
          </div>
          <button
            onClick={() => setBannerNotice(null)}
            className="text-slate-400 hover:text-slate-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* User's Location Sharing Control Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`h-3 w-3 rounded-full ${
                isSharingLocation ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
              }`}
            />
            <h3 className="text-sm font-bold text-slate-900">
              {isSharingLocation ? 'Field Personnel Location Sharing Active' : 'Location Sharing Currently Disabled'}
            </h3>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                isSharingLocation ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isSharingLocation ? 'Transmitting Live' : 'Offline'}
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            {isSharingLocation
              ? 'Your browser GPS coordinates are actively streaming to the municipal dispatch desk while this session is active. Location is only shared with authorized Officers.'
              : 'Start location sharing to transmit your field coordinates to dispatchers while inspecting potholes or clearing garbage on municipal routes.'}
          </p>
          <div className="text-[11px] text-slate-400 font-mono">
            Authenticated User: {currentUser.name} ({currentUser.role} • {currentUser.department}) • Badge: {currentUser.badge}
          </div>
        </div>

        <button
          onClick={handleToggleSharing}
          disabled={actionLoadingId === 'toggle-sharing'}
          className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs shrink-0 ${
            isSharingLocation
              ? 'bg-rose-600 text-white hover:bg-rose-700'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          <Power className="h-4 w-4" />
          <span>{isSharingLocation ? 'Stop Location Sharing' : 'Start Live Location Sharing'}</span>
        </button>
      </div>

      {/* TAB 1: Unified Telemetry Map */}
      {activeTab === 'map_overview' && (
        <div className="space-y-4">
          {/* Layer toggles & Map Controls */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-700">
              <Layers className="h-4 w-4 text-blue-600" />
              <span>Map Layer Overlays:</span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={showDevicesLayer}
                  onChange={(e) => setShowDevicesLayer(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                />
                <span>Field Devices & Patrols ({devices.filter((d) => d.currentCoordinates && d.status !== 'Deactivated').length})</span>
              </label>

              {isOfficerOrAdmin && (
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={showStaffLayer}
                    onChange={(e) => setShowStaffLayer(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                  />
                  <span>Field Personnel ({staffLocations.filter((s) => s.isSharing).length})</span>
                </label>
              )}

              <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={showIssuesLayer}
                  onChange={(e) => setShowIssuesLayer(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 h-3.5 w-3.5"
                />
                <span>Open Road Defect Issues ({issues.filter((i) => i.location?.lat != null).length})</span>
              </label>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => {
                  fetchDevices();
                  fetchStaffLocations();
                }}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Refresh Pins</span>
              </button>
            </div>
          </div>

          {/* Leaflet Container */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs relative bg-slate-100">
            <div ref={mapContainerRef} className="h-[520px] w-full" />
          </div>

          {/* Map Legend */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-bold text-slate-800">Map Legend:</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Online Device / Live Staff (&lt;2m)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Device In Transit
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Stale Telemetry (&gt;2m) / Standby
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-600 animate-pulse" /> Emergency Distress Beacon
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-blue-500 text-white font-bold text-[8px] flex items-center justify-center">!</span> Defect Issue Hotspot
              </span>
            </div>

            <div className="text-slate-400 font-mono text-[10px]">
              Civic GIS Coordinates: OpenStreetMap • WGS84 Datum
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Devices Management */}
      {activeTab === 'devices' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Authorized Municipal Hardware Fleet</h2>
              <p className="text-xs text-slate-500">
                Connected patrol units, photogrammetry drones, laser profilers, and road survey camera rigs.
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowRegisterModal(true)}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Register New Device</span>
              </button>
            )}
          </div>

          {/* Device Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => {
              const isDeactivated = device.status === 'Deactivated';
              const isEmergency = device.emergencyFlag;
              const Icon =
                device.type === 'Drone'
                  ? Plane
                  : device.type === 'Solar Street Sensor'
                  ? SunMedium
                  : device.type === 'Patrol Unit' || device.type === 'Road Survey Vehicle'
                  ? Truck
                  : Cpu;

              return (
                <div
                  key={device.id}
                  className={`rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all bg-white relative ${
                    isEmergency
                      ? 'border-rose-400 ring-2 ring-rose-200'
                      : isDeactivated
                      ? 'opacity-60 border-slate-200'
                      : 'border-slate-200 hover:shadow-md'
                  }`}
                >
                  {isEmergency && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider animate-pulse">
                      <AlertOctagon className="h-3 w-3" />
                      <span>EMERGENCY ALERT</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-start justify-between pr-8">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${
                          isEmergency ? 'bg-rose-100 text-rose-700' : 'bg-blue-50 text-blue-600'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm leading-tight">{device.name}</h3>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                            <span>{device.id}</span>
                            <span>•</span>
                            <span>{device.serialNumber}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                          device.status === 'Online'
                            ? 'bg-emerald-100 text-emerald-800'
                            : device.status === 'In Transit'
                            ? 'bg-blue-100 text-blue-800'
                            : device.status === 'Standby'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {device.status}
                      </span>
                      <span className="text-[10px] font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                        {device.firmware || 'v3.2.0'}
                      </span>
                      {device.telemetryStreamActive && (
                        <span className="text-[9px] font-bold bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Activity className="h-2.5 w-2.5 text-sky-600 animate-pulse" />
                          1Hz Live
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {device.notes || 'Municipal autonomous inspection hardware.'}
                    </p>

                    {/* Metadata Box */}
                    <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1.5 border border-slate-100">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Patrol Sector:</span>
                        <span className="font-semibold text-slate-800 text-right truncate max-w-[170px]" title={device.patrolSector}>
                          {device.patrolSector || 'Sector 1 — Civic Center Core'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Operator:</span>
                        <span className="font-semibold text-slate-800">{device.operatorName || 'Autonomous Dispatch'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Battery Level:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                (device.batteryLevel ?? 90) > 40 ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${device.batteryLevel ?? 90}%` }}
                            />
                          </div>
                          <span className="font-semibold text-slate-700 text-[11px]">
                            {device.batteryLevel ?? 90}%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Latency / Quality:</span>
                        <span className="font-semibold text-emerald-700 flex items-center gap-1 text-[11px]">
                          <Wifi className="h-3 w-3" />
                          {device.latencyMs ?? 28}ms ({device.connectionQuality || 'Excellent'})
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200">
                        <span>Last Ping:</span>
                        <span>{new Date(device.lastPingAt || device.lastCommunicationTime).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Remote Actions Toolbar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Remote Command Operations
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handlePing(device)}
                        disabled={isDeactivated || Boolean(actionLoadingId)}
                        className="rounded-lg border border-slate-300 bg-white py-1.5 px-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center gap-1 shadow-2xs"
                      >
                        <RefreshCw className="h-3 w-3 text-slate-500" />
                        <span>Ping / Refresh</span>
                      </button>

                      <button
                        onClick={() => handleToggleTelemetry(device)}
                        disabled={isDeactivated || Boolean(actionLoadingId)}
                        className={`rounded-lg py-1.5 px-2 text-[11px] font-bold transition-colors flex items-center justify-center gap-1 ${
                          device.telemetryStreamActive
                            ? 'bg-sky-100 text-sky-800 border border-sky-300'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Activity className="h-3 w-3 text-sky-600" />
                        <span>{device.telemetryStreamActive ? 'Pause Stream' : 'Stream 1Hz'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setSectorModalDevice(device);
                          setSelectedSector(device.patrolSector || MUNICIPAL_SECTORS[0]);
                        }}
                        disabled={isDeactivated || Boolean(actionLoadingId)}
                        className="rounded-lg border border-slate-300 bg-white py-1.5 px-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 flex items-center justify-center gap-1 shadow-2xs"
                      >
                        <Compass className="h-3 w-3 text-blue-600" />
                        <span>Assign Sector</span>
                      </button>

                      <button
                        onClick={() => handleToggleEmergency(device)}
                        disabled={isDeactivated || Boolean(actionLoadingId)}
                        className={`rounded-lg py-1.5 px-2 text-[11px] font-bold transition-colors flex items-center justify-center gap-1 ${
                          device.emergencyFlag
                            ? 'bg-rose-600 text-white hover:bg-rose-700'
                            : 'bg-rose-50 border border-rose-300 text-rose-800 hover:bg-rose-100'
                        }`}
                      >
                        <AlertOctagon className="h-3 w-3" />
                        <span>{device.emergencyFlag ? 'Clear Emergency' : 'Emergency Flag'}</span>
                      </button>
                    </div>

                    {/* Simulated Demonstration Button */}
                    <button
                      onClick={() => issueDeviceCommand(device.id, 'START_INSPECTION', true)}
                      disabled={isDeactivated || Boolean(actionLoadingId)}
                      className="w-full rounded-lg border border-amber-300 bg-amber-50/70 py-1.5 px-2 text-[11px] font-bold text-amber-900 hover:bg-amber-100 disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <Sliders className="h-3.5 w-3.5 text-amber-600" />
                      <span>Run Simulated Hardware Demo</span>
                    </button>

                    {isAdmin && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            if (window.confirm(`Deactivate hardware ${device.name}?`)) {
                              deactivateDevice(device.id);
                            }
                          }}
                          className="text-[10px] text-rose-600 hover:underline"
                        >
                          Deactivate Hardware
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Field Staff Tracking */}
      {activeTab === 'staff_tracking' && (
        <div className="space-y-6">
          {!isOfficerOrAdmin ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center space-y-3">
              <Shield className="h-10 w-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-base">Restricted Dispatch Oversight</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                As Repair Staff, your location is transmitted to dispatch when enabled. Viewing all personnel simultaneously is restricted to Municipal Officers and Administrators.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Municipal Field Personnel Roster</h3>
                  <p className="text-xs text-slate-500">Live position feeds with accuracy thresholds and stale status tracking.</p>
                </div>
                <button
                  onClick={fetchStaffLocations}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Refresh Telemetry</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staffLocations.map((staff) => (
                  <div
                    key={staff.userId}
                    className="rounded-xl border border-slate-200 p-4 space-y-2.5 bg-slate-50/60"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <User className="h-4 w-4 text-blue-600" />
                        {staff.userName}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded capitalize ${
                          !staff.isSharing
                            ? 'bg-slate-200 text-slate-600'
                            : staff.status === 'current'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {!staff.isSharing ? 'Sharing OFF' : staff.status === 'current' ? 'Live (<2m)' : 'Stale (>2m)'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <p>{staff.userRole} • {staff.department}</p>
                      <p className="font-mono text-[10px] text-slate-500">
                        {staff.lat.toFixed(5)}, {staff.lng.toFixed(5)}
                        {staff.accuracyMeters ? ` (Accuracy: ±${staff.accuracyMeters}m)` : ''}
                      </p>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-200">
                      <span>Last Ping: {new Date(staff.lastUpdated).toLocaleTimeString()}</span>
                      <span className="font-semibold text-slate-600">{staff.isSharing ? 'Active Feed' : 'Idle'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Audit Trail */}
      {activeTab === 'audit_log' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Remote Hardware & Telemetry Command Log</h3>
              <p className="text-xs text-slate-500">Tamper-evident audit trail of ping requests, sector reassignments, and emergency flags.</p>
            </div>
            <button
              onClick={fetchDeviceCommands}
              className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Refresh Log</span>
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {deviceCommands.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">No commands recorded yet.</p>
            ) : (
              deviceCommands.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{log.deviceName}</span>
                      <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 text-blue-700 font-bold">
                        {log.command}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          log.status === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'Simulated Demonstration'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{log.details}</p>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono shrink-0 sm:text-right">
                    <div>{new Date(log.issuedAt).toLocaleTimeString()}</div>
                    <div>By: {log.issuedBy}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Sector Assignment Modal */}
      {sectorModalDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleAssignSectorSubmit}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Compass className="h-5 w-5 text-blue-600" />
                Assign Patrol Sector Route
              </h3>
              <button
                type="button"
                onClick={() => setSectorModalDevice(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-600 mb-2">
                Select municipal patrol corridor for hardware unit <b>{sectorModalDevice.name}</b>:
              </p>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {MUNICIPAL_SECTORS.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setSelectedSector(sec)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                      selectedSector === sec
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{sec}</span>
                    {selectedSector === sec && <Check className="h-4 w-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSectorModalDevice(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={Boolean(actionLoadingId)}
                className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
              >
                Confirm Route Assignment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Register Device Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleRegisterDevice}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Register Municipal Hardware Unit</h3>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Device Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Aero-3 Photogrammetry Drone"
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hardware Type</label>
                <select
                  value={newDeviceType}
                  onChange={(e) => setNewDeviceType(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 font-semibold"
                >
                  <option value="Drone">Drone</option>
                  <option value="Patrol Unit">Patrol Unit</option>
                  <option value="Mobile Pavement Scanner">Laser Profiler</option>
                  <option value="Solar Street Sensor">Solar IoT Stud</option>
                  <option value="Municipal Dashcam AI">Vehicle AI Cam</option>
                  <option value="Road Survey Vehicle">Road Survey Van</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={newDeviceDept}
                  onChange={(e) => setNewDeviceDept(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900"
                >
                  <option value="Roads & Highways">Roads & Highways</option>
                  <option value="Waste Management">Waste Management</option>
                  <option value="Traffic Safety">Traffic Safety</option>
                  <option value="Public Works">Public Works</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Patrol Sector</label>
              <select
                value={newDeviceSector}
                onChange={(e) => setNewDeviceSector(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900"
              >
                {MUNICIPAL_SECTORS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Serial Number / Hardware UUID</label>
              <input
                type="text"
                placeholder="e.g. DRN-9912-US"
                value={newDeviceSerial}
                onChange={(e) => setNewDeviceSerial(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Deployment Notes</label>
              <textarea
                rows={2}
                placeholder="Operational purpose, mounting specs..."
                value={newDeviceNotes}
                onChange={(e) => setNewDeviceNotes(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
              >
                Register Hardware
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
