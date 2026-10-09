import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  MapPin,
  Filter,
  Navigation,
  Eye,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Radio,
  Compass,
  Search,
  PlusCircle,
  Crosshair,
  Maximize2,
  Volume2,
  Trash2,
  Activity,
  Flame,
} from 'lucide-react';
import { Issue } from '../types/index.ts';

// Helper: Haversine distance in meters
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export const MapView: React.FC = () => {
  const { issues, setSelectedIssue, setCurrentPage } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const userAccuracyCircleRef = useRef<any>(null);
  const droppedPinMarkerRef = useRef<any>(null);
  const baseLayersRef = useRef<{ [key: string]: any }>({});

  // Filter States
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPinIssue, setSelectedPinIssue] = useState<Issue | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'mapped' | 'unmapped'>('mapped');

  // Map Basemap layer
  const [activeBaseLayer, setActiveBaseLayer] = useState<'streets' | 'satellite' | 'dark'>('streets');

  // GPS Tracking States
  const [isGpsTracking, setIsGpsTracking] = useState(false);
  const [followUserGps, setFollowUserGps] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    heading: number | null;
    speed: number | null;
    timestamp: number;
  } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const gpsWatchIdRef = useRef<number | null>(null);

  // Drop Pin / Report at location mode
  const [dropPinMode, setDropPinMode] = useState(false);
  const [droppedPoint, setDroppedPoint] = useState<{ lat: number; lng: number } | null>(null);

  // Filter issues
  const filteredIssues = useMemo(() => {
    return issues.filter((i) => {
      if (categoryFilter !== 'all' && i.category !== categoryFilter) return false;
      if (priorityFilter !== 'all' && i.priority !== priorityFilter) return false;
      if (statusFilter !== 'all' && i.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = i.title.toLowerCase().includes(q);
        const matchesId = i.id.toLowerCase().includes(q);
        const matchesAddress = i.location?.address?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesId && !matchesAddress) return false;
      }
      return true;
    });
  }, [issues, categoryFilter, priorityFilter, statusFilter, searchQuery]);

  const mappedIssues = useMemo(() => {
    return filteredIssues.filter(
      (i) => i.location?.lat != null && i.location?.lng != null && !isNaN(i.location.lat) && !isNaN(i.location.lng)
    );
  }, [filteredIssues]);

  const unmappedIssues = useMemo(() => {
    return filteredIssues.filter(
      (i) => i.location?.lat == null || i.location?.lng == null || isNaN(i.location.lat) || isNaN(i.location.lng)
    );
  }, [filteredIssues]);

  // Compute nearest hazard to user if GPS is available
  const nearestHazard = useMemo(() => {
    if (!userLocation || mappedIssues.length === 0) return null;

    let closest: { issue: Issue; distance: number } | null = null;
    for (const issue of mappedIssues) {
      if (issue.location.lat != null && issue.location.lng != null) {
        const dist = getDistanceMeters(userLocation.lat, userLocation.lng, issue.location.lat, issue.location.lng);
        if (!closest || dist < closest.distance) {
          closest = { issue, distance: dist };
        }
      }
    }
    return closest;
  }, [userLocation, mappedIssues]);

  // Initialize Map
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (!mapContainerRef.current) return;
      if (leafletMapRef.current) return;

      try {
        const L = (await import('leaflet')).default;
        if (!isMounted || !mapContainerRef.current) return;

        // Center on first valid issue or default civic coords
        const firstValid = issues.find((i) => i.location?.lat != null && i.location?.lng != null);
        const initialLat = firstValid?.location.lat ?? 37.7749;
        const initialLng = firstValid?.location.lng ?? -122.4194;

        const map = L.map(mapContainerRef.current, {
          zoomControl: true,
        }).setView([initialLat, initialLng], 13);

        // Tile layers
        const streetsLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        });

        const satelliteLayer = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 19,
          }
        );

        const darkLayer = L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            maxZoom: 19,
          }
        );

        streetsLayer.addTo(map);

        baseLayersRef.current = {
          streets: streetsLayer,
          satellite: satelliteLayer,
          dark: darkLayer,
        };

        const markersLayer = L.layerGroup().addTo(map);
        leafletMapRef.current = map;
        markersLayerRef.current = markersLayer;

        // Map Click handling for "Drop Pin" mode
        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          setDroppedPoint({ lat, lng });

          if (droppedPinMarkerRef.current) {
            droppedPinMarkerRef.current.setLatLng([lat, lng]);
          } else {
            const dropIcon = L.divIcon({
              className: 'custom-dropped-pin',
              html: `
                <div style="background-color: #7c3aed; width: 34px; height: 34px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.6); display: flex; align-items: center; justify-content: center; color: #ffffff;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
              `,
              iconSize: [34, 34],
              iconAnchor: [17, 17],
            });
            droppedPinMarkerRef.current = L.marker([lat, lng], { icon: dropIcon }).addTo(map);
          }

          const popupHtml = `
            <div style="font-family: inherit; font-size: 12px; padding: 4px; min-width: 180px;">
              <div style="font-weight: 700; color: #0f172a; margin-bottom: 2px;">Selected Geotag Point</div>
              <div style="color: #64748b; font-family: monospace; font-size: 11px;">${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
              <button id="report-here-btn" style="margin-top: 8px; width: 100%; background: #2563eb; color: #ffffff; border: none; border-radius: 6px; padding: 6px 10px; font-weight: 600; font-size: 11px; cursor: pointer;">
                + Report Hazard Here
              </button>
            </div>
          `;
          droppedPinMarkerRef.current.bindPopup(popupHtml).openPopup();

          setTimeout(() => {
            const btn = document.getElementById('report-here-btn');
            if (btn) {
              btn.onclick = () => {
                sessionStorage.setItem('civiscan_prefill_lat', lat.toString());
                sessionStorage.setItem('civiscan_prefill_lng', lng.toString());
                setCurrentPage('upload');
              };
            }
          }, 100);
        });
      } catch (err) {
        console.error('Error initializing Leaflet map:', err);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (gpsWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
      }
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [issues, setCurrentPage]);

  // Switch Base Layer (Street, Satellite, Dark)
  useEffect(() => {
    if (!leafletMapRef.current || !baseLayersRef.current) return;
    const map = leafletMapRef.current;
    const layers = baseLayersRef.current;

    Object.values(layers).forEach((layer) => {
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });

    if (layers[activeBaseLayer]) {
      layers[activeBaseLayer].addTo(map);
    }
  }, [activeBaseLayer]);

  // Update Markers when issues or filters change
  useEffect(() => {
    const updateMarkers = async () => {
      if (!leafletMapRef.current || !markersLayerRef.current) return;
      const L = (await import('leaflet')).default;

      markersLayerRef.current.clearLayers();

      mappedIssues.forEach((issue) => {
        const isCompleted = issue.status === 'Completed';
        let pinBg = '#2563eb'; // Blue
        let symbol = '🕳️';

        if (isCompleted) {
          pinBg = '#16a34a'; // Green
          symbol = '✓';
        } else if (issue.category === 'Pothole') {
          pinBg = issue.priority === 'High' ? '#dc2626' : '#ea580c';
          symbol = '🕳️';
        } else if (issue.category === 'Road Crack') {
          pinBg = issue.priority === 'High' ? '#b91c1c' : '#d97706';
          symbol = '⚡';
        } else if (issue.category === 'Roadside Garbage') {
          pinBg = '#9333ea'; // Purple
          symbol = '🗑️';
        }

        const icon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div style="background-color: ${pinBg}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: bold; font-size: 13px; cursor: pointer; transition: transform 0.15s ease;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
              ${symbol}
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const marker = L.marker([issue.location.lat!, issue.location.lng!], { icon });

        // Popup content
        const popupDiv = document.createElement('div');
        popupDiv.className = 'p-1 font-sans text-xs max-w-xs';
        popupDiv.innerHTML = `
          <div style="display:flex; flex-direction:column; gap:6px;">
            ${issue.imageUrl ? `<img src="${issue.imageUrl}" style="width:100%; height:95px; object-fit:cover; border-radius:6px; border:1px solid #e2e8f0;" />` : ''}
            <div style="font-weight:700; color:#0f172a; font-size:12px; line-height:1.2;">${issue.title}</div>
            <div style="color:#64748b; font-size:11px; display:flex; align-items:center; gap:3px;">
              <span>📍</span> <span>${issue.location.address || 'Roadway'}</span>
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:4px; font-weight:700; font-size:10px;">
              <span style="background:#f1f5f9; padding:2px 6px; border-radius:4px; color:#334155;">${issue.category}</span>
              <span style="background:${issue.priority === 'High' ? '#fee2e2' : '#fef3c7'}; color:${issue.priority === 'High' ? '#b91c1c' : '#b45309'}; padding:2px 6px; border-radius:4px;">${issue.priority} Priority</span>
              <span style="background:${issue.status === 'Completed' ? '#dcfce7' : '#e0e7ff'}; color:${issue.status === 'Completed' ? '#166534' : '#3730a3'}; padding:2px 6px; border-radius:4px;">${issue.status}</span>
            </div>
            <div style="margin-top:2px; font-size:10px; color:#475569;">
              Severity Score: <b>${issue.severityScore || 5}/10</b> • Dept: <b>${issue.department}</b>
            </div>
            <div style="display:flex; gap:6px; margin-top:4px;">
              <button id="inspect-btn-${issue.id}" style="flex:1; background:#2563eb; color:white; border:none; padding:6px; border-radius:6px; font-weight:700; cursor:pointer;">
                Inspect Details
              </button>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${issue.location.lat},${issue.location.lng}" target="_blank" rel="noopener noreferrer" style="background:#f1f5f9; color:#334155; border:1px solid #cbd5e1; padding:6px 8px; border-radius:6px; text-decoration:none; font-weight:600; display:flex; align-items:center; justify-content:center;">
                Directions ↗
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupDiv);

        marker.on('popupopen', () => {
          setSelectedPinIssue(issue);
          const btn = document.getElementById(`inspect-btn-${issue.id}`);
          if (btn) {
            btn.onclick = () => {
              setSelectedIssue(issue);
            };
          }
        });

        marker.addTo(markersLayerRef.current);
      });
    };

    updateMarkers();
  }, [mappedIssues, setSelectedIssue]);

  // Live GPS Tracking Handler
  const toggleGpsTracking = async () => {
    if (!navigator.geolocation) {
      alert('Browser Geolocation is not supported on your device.');
      return;
    }

    const L = (await import('leaflet')).default;

    if (isGpsTracking) {
      // Stop tracking
      if (gpsWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        gpsWatchIdRef.current = null;
      }
      if (userMarkerRef.current && leafletMapRef.current) {
        leafletMapRef.current.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
      if (userAccuracyCircleRef.current && leafletMapRef.current) {
        leafletMapRef.current.removeLayer(userAccuracyCircleRef.current);
        userAccuracyCircleRef.current = null;
      }
      setIsGpsTracking(false);
      setGpsError(null);
    } else {
      // Start tracking
      setIsGpsTracking(true);
      setGpsError('Acquiring high-accuracy GPS signal...');

      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy, heading, speed } = pos.coords;
          setUserLocation({
            lat: latitude,
            lng: longitude,
            accuracy: Math.round(accuracy),
            heading: heading ?? null,
            speed: speed ? Math.round(speed * 3.6) : null, // convert m/s to km/h
            timestamp: pos.timestamp,
          });
          setGpsError(null);

          if (!leafletMapRef.current) return;
          const map = leafletMapRef.current;

          // Render / Update User Marker with pulsating radar
          if (!userMarkerRef.current) {
            const userPulseIcon = L.divIcon({
              className: 'custom-user-gps-marker',
              html: `
                <div style="position: relative; width: 24px; height: 24px;">
                  <div style="position: absolute; width: 24px; height: 24px; background: rgba(37, 99, 235, 0.35); border-radius: 50%; animation: pulse-ring 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;"></div>
                  <div style="position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; background: #2563eb; border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>
                </div>
                <style>
                  @keyframes pulse-ring {
                    0% { transform: scale(0.95); opacity: 0.8; }
                    50% { transform: scale(2.2); opacity: 0.2; }
                    100% { transform: scale(2.5); opacity: 0; }
                  }
                </style>
              `,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            });

            userMarkerRef.current = L.marker([latitude, longitude], { icon: userPulseIcon }).addTo(map);
            userMarkerRef.current.bindPopup(`
              <div style="font-family: inherit; font-size: 11px;">
                <b>Your Live Location</b><br/>
                Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}<br/>
                Accuracy: ±${Math.round(accuracy)}m
              </div>
            `);

            userAccuracyCircleRef.current = L.circle([latitude, longitude], {
              radius: accuracy,
              color: '#2563eb',
              fillColor: '#3b82f6',
              fillOpacity: 0.12,
              weight: 1.5,
            }).addTo(map);

            if (followUserGps) {
              map.setView([latitude, longitude], 15);
            }
          } else {
            userMarkerRef.current.setLatLng([latitude, longitude]);
            if (userAccuracyCircleRef.current) {
              userAccuracyCircleRef.current.setLatLng([latitude, longitude]);
              userAccuracyCircleRef.current.setRadius(accuracy);
            }
            if (followUserGps) {
              map.panTo([latitude, longitude]);
            }
          }
        },
        (err) => {
          setGpsError(`GPS Notice: ${err.message}`);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );

      gpsWatchIdRef.current = watchId;
    }
  };

  const handleCenterOnUser = () => {
    if (userLocation && leafletMapRef.current) {
      leafletMapRef.current.setView([userLocation.lat, userLocation.lng], 16);
      return;
    }

    if (!navigator.geolocation || !leafletMapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        leafletMapRef.current.setView([pos.coords.latitude, pos.coords.longitude], 16);
      },
      (err) => alert('Unable to retrieve location: ' + err.message)
    );
  };

  const handleFocusIssue = (issue: Issue) => {
    if (leafletMapRef.current && issue.location.lat != null && issue.location.lng != null) {
      leafletMapRef.current.setView([issue.location.lat, issue.location.lng], 16);
      setSelectedPinIssue(issue);
    }
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Page Header & Live GPS Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Radio className="h-6 w-6 text-blue-600 animate-pulse" />
            CIVISCAN GIS Interactive Map & Live GPS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time geospatial tracking of road surface hazards, potholes, cracks, and roadside garbage hotspots.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Live GPS Tracker Toggle */}
          <button
            onClick={toggleGpsTracking}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-xs shrink-0 ${
              isGpsTracking
                ? 'bg-blue-600 text-white hover:bg-blue-700 ring-2 ring-blue-300'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Activity className={`h-4 w-4 ${isGpsTracking ? 'animate-spin' : 'text-blue-600'}`} />
            <span>{isGpsTracking ? 'Live GPS Active' : 'Enable Live GPS Tracking'}</span>
          </button>

          <button
            onClick={handleCenterOnUser}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs shrink-0"
            title="Center map on my position"
          >
            <Crosshair className="h-4 w-4 text-blue-600" />
            <span>Center on Me</span>
          </button>

          <button
            onClick={() => setCurrentPage('upload')}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-2xs shrink-0"
          >
            <PlusCircle className="h-4 w-4 text-emerald-400" />
            <span>New Report</span>
          </button>
        </div>
      </div>

      {/* Live GPS Telemetry Bar (Visible when active) */}
      {isGpsTracking && (
        <div className="rounded-2xl border border-blue-200 bg-linear-to-r from-blue-50 via-white to-blue-50/50 p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-blue-600 animate-ping shrink-0" />
            <div className="space-y-0.5">
              <div className="font-bold text-blue-950 flex items-center gap-2">
                <span>GPS Telemetry Streaming</span>
                {userLocation && (
                  <span className="font-mono text-[11px] text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded font-semibold">
                    {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)} (±{userLocation.accuracy}m)
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500">
                {userLocation?.speed != null ? `Speed: ${userLocation.speed} km/h • ` : ''}
                {userLocation?.heading != null ? `Heading: ${Math.round(userLocation.heading)}° • ` : ''}
                High-precision continuous satellite positioning
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {nearestHazard && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                <span>
                  Nearest Hazard: <b>{Math.round(nearestHazard.distance)}m away</b> ({nearestHazard.issue.category})
                </span>
              </div>
            )}

            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={followUserGps}
                onChange={(e) => setFollowUserGps(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
              />
              <span>Follow Movement</span>
            </label>
          </div>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search address, ID, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Category Dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700"
        >
          <option value="all">All Categories ({issues.length})</option>
          <option value="Pothole">🕳️ Potholes Only</option>
          <option value="Road Crack">⚡ Road Cracks Only</option>
          <option value="Roadside Garbage">🗑️ Roadside Garbage Only</option>
        </select>

        {/* Priority Dropdown */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700"
        >
          <option value="all">All Priorities</option>
          <option value="High">🔴 High Priority</option>
          <option value="Medium">🟠 Medium Priority</option>
          <option value="Low">🔵 Low Priority</option>
        </select>

        {/* Status Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700"
        >
          <option value="all">All Statuses</option>
          <option value="New Issue">New Issue</option>
          <option value="In Progress">In Progress</option>
          <option value="Awaiting Verification">Awaiting Verification</option>
          <option value="Completed">🟢 Completed</option>
        </select>

        {/* Basemap Switcher Buttons */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          <button
            onClick={() => setActiveBaseLayer('streets')}
            className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
              activeBaseLayer === 'streets' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Streets
          </button>
          <button
            onClick={() => setActiveBaseLayer('satellite')}
            className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
              activeBaseLayer === 'satellite' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setActiveBaseLayer('dark')}
            className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
              activeBaseLayer === 'dark' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Dark Mode
          </button>
        </div>
      </div>

      {/* Main Map + Side Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Leaflet Map Canvas */}
        <div className="lg:col-span-3 rounded-2xl border border-slate-200 overflow-hidden shadow-xs relative h-[600px] bg-slate-100">
          <div ref={mapContainerRef} className="h-full w-full z-0" />

          {/* Map Floating Tip */}
          <div className="absolute top-3 left-12 z-1000 bg-white/90 backdrop-blur-xs border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] text-slate-700 shadow-sm flex items-center gap-2">
            <span className="font-bold text-blue-600">Tip:</span>
            <span>Click any marker to inspect, or click on the road to drop a report pin.</span>
          </div>

          {/* Quick Stats on Map Corner */}
          <div className="absolute bottom-4 left-4 z-1000 bg-slate-950/85 backdrop-blur-xs border border-slate-800 text-white rounded-xl p-2.5 text-[11px] space-y-1 shadow-lg pointer-events-none sm:pointer-events-auto">
            <div className="font-bold text-slate-200 uppercase tracking-wider text-[9px]">Map Summary</div>
            <div className="flex items-center gap-3">
              <span>📍 <b>{mappedIssues.length}</b> Mapped</span>
              <span className="text-red-400">🔴 <b>{mappedIssues.filter(i => i.priority === 'High' && i.status !== 'Completed').length}</b> Critical</span>
              <span className="text-emerald-400">✓ <b>{mappedIssues.filter(i => i.status === 'Completed').length}</b> Resolved</span>
            </div>
          </div>
        </div>

        {/* Sidebar: Jump-to List & Nearest Inspection Details */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col h-[600px]">
          <div className="flex items-center gap-1 border-b border-slate-100 pb-2 mb-3">
            <button
              onClick={() => setSidebarTab('mapped')}
              className={`flex-1 text-xs font-bold py-1.5 px-2 rounded-lg transition-colors ${
                sidebarTab === 'mapped' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Mapped ({mappedIssues.length})
            </button>
            <button
              onClick={() => setSidebarTab('unmapped')}
              className={`flex-1 text-xs font-bold py-1.5 px-2 rounded-lg transition-colors ${
                sidebarTab === 'unmapped' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              No GPS ({unmappedIssues.length})
            </button>
          </div>

          {/* Issues List with Distance from User if GPS active */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {(sidebarTab === 'mapped' ? mappedIssues : unmappedIssues).length === 0 ? (
              <div className="text-center py-10 px-3">
                <MapPin className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-semibold">
                  {sidebarTab === 'mapped' ? 'No issues matching current filters.' : 'All issues currently have GPS coordinates.'}
                </p>
              </div>
            ) : (
              (sidebarTab === 'mapped' ? mappedIssues : unmappedIssues).map((issue) => {
                const distMeters =
                  userLocation && issue.location.lat != null && issue.location.lng != null
                    ? getDistanceMeters(userLocation.lat, userLocation.lng, issue.location.lat, issue.location.lng)
                    : null;

                return (
                  <div
                    key={issue.id}
                    onClick={() => sidebarTab === 'mapped' && handleFocusIssue(issue)}
                    className={`rounded-xl border p-3 transition-all hover:bg-slate-50 cursor-pointer ${
                      selectedPinIssue?.id === issue.id
                        ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-200'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] font-bold text-blue-700">
                        {issue.id}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          issue.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : issue.priority === 'High'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {issue.status === 'Completed' ? 'Completed' : `${issue.priority} Priority`}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 truncate">{issue.title}</h4>

                    <p className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                      {issue.location.lat != null && issue.location.lng != null
                        ? issue.location.address
                        : 'Location Not Geotagged'}
                    </p>

                    {distMeters !== null && (
                      <div className="mt-1 text-[10px] font-bold text-blue-600 flex items-center gap-1">
                        <Navigation className="h-2.5 w-2.5" />
                        <span>
                          {distMeters < 1000
                            ? `${Math.round(distMeters)}m from your current position`
                            : `${(distMeters / 1000).toFixed(1)}km from your current position`}
                        </span>
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-slate-100">
                      <span className="text-[10px] font-medium text-slate-500">
                        {issue.category} • {issue.severityScore || 5}/10
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIssue(issue);
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
                      >
                        Inspect Full Details →
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
