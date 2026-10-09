import fs from 'fs';
import path from 'path';
import {
  Issue,
  User,
  NotificationItem,
  AuditLog,
  MunicipalDepartment,
  SystemStats,
  IssueCategory,
  IssueStatus,
  FieldStaffLocation,
  InspectionDevice,
  DeviceCommandLog,
} from '../src/types/index.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'civiscan_db.json');

export interface DatabaseSchema {
  issues: Issue[];
  users: User[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  departments: MunicipalDepartment[];
  staffLocations: FieldStaffLocation[];
  devices: InspectionDevice[];
  deviceCommands: DeviceCommandLog[];
}

const DEFAULT_USERS: User[] = [
  {
    id: 'user-admin-1',
    name: 'Sarah Chen',
    email: 'sarah.chen@civic.gov',
    role: 'Administrator',
    department: 'Municipal Operations & Oversight',
    badge: 'ADM-8801',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 019-2831',
  },
  {
    id: 'user-officer-1',
    name: 'Marcus Vance',
    email: 'marcus.vance@civic.gov',
    role: 'Municipal Officer',
    department: 'Roads & Highways',
    badge: 'OFF-4412',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 014-9210',
  },
  {
    id: 'user-officer-2',
    name: 'Elena Rossi',
    email: 'elena.rossi@civic.gov',
    role: 'Municipal Officer',
    department: 'Waste Management',
    badge: 'OFF-4419',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 012-7744',
  },
  {
    id: 'user-staff-1',
    name: 'James Miller',
    email: 'james.miller@civic.gov',
    role: 'Repair Staff',
    department: 'Roads & Highways',
    badge: 'WRK-1092',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 018-4421',
  },
  {
    id: 'user-staff-2',
    name: 'David O\'Connor',
    email: 'david.oconnor@civic.gov',
    role: 'Repair Staff',
    department: 'Waste Management',
    badge: 'WRK-1098',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 017-6632',
  },
];

const DEFAULT_DEPARTMENTS: MunicipalDepartment[] = [
  {
    id: 'dept-roads',
    name: 'Roads & Highways',
    head: 'Director Robert Shaw',
    contactEmail: 'roads.dispatch@civic.gov',
    activeWorkforce: 24,
    openIssuesCount: 4,
  },
  {
    id: 'dept-waste',
    name: 'Waste Management',
    head: 'Director Maria Gonzalez',
    contactEmail: 'sanitation@civic.gov',
    activeWorkforce: 18,
    openIssuesCount: 2,
  },
  {
    id: 'dept-safety',
    name: 'Traffic Safety',
    head: 'Capt. Alan Turing',
    contactEmail: 'traffic.safety@civic.gov',
    activeWorkforce: 12,
    openIssuesCount: 1,
  },
  {
    id: 'dept-publicworks',
    name: 'Public Works',
    head: 'Chief Engineer Linda Wu',
    contactEmail: 'publicworks@civic.gov',
    activeWorkforce: 30,
    openIssuesCount: 3,
  },
];

const DEFAULT_ISSUES: Issue[] = [
  {
    id: 'CIVI-2026-0101',
    title: 'Severe Arterial Pothole near Central Crossing',
    description: 'Deep pavement crater measuring ~45cm diameter on south lane. Poses immediate vehicular axle risk and motorcycle hazard.',
    category: 'Pothole',
    priority: 'High',
    severityScore: 9,
    riskFactors: ['High-speed corridor (45mph)', 'Blind curve approach', 'Active bus transit line'],
    priorityOverride: null,
    status: 'In Progress',
    location: {
      lat: 37.7749,
      lng: -122.4194,
      address: '742 Market St at 4th, Downtown Metro',
      source: 'browser_gps',
      accuracyMeters: 4.2,
    },
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-10-08T08:15:00.000Z',
    updatedAt: '2026-10-09T03:30:00.000Z',
    department: 'Roads & Highways',
    assignedStaff: {
      id: 'user-staff-1',
      name: 'James Miller',
      phone: '+1 (555) 018-4421',
      assignedAt: '2026-10-08T11:00:00.000Z',
    },
    reporter: {
      name: 'Transit Officer T. Lee',
      role: 'Municipal Field Staff',
      contact: 't.lee@transit.gov',
    },
    aiAnalysis: {
      isAiGenerated: true,
      isSimulatedDemo: true,
      modelUsed: 'gemini-3.8-flash',
      confidence: 0.96,
      detectedLabels: ['Deep asphalt crater', 'Sub-base exposure', 'Edge fatigue cracking'],
      assessment: 'High-risk road surface collapse with water accumulation potential and risk of catastrophic tire blowout.',
      hazardLevel: 'Critical',
      recommendedPriority: 'High',
      detectedDimensions: 'Approx 48cm x 40cm, depth ~9cm',
    },
    repairData: null,
    verificationData: null,
    history: [
      {
        timestamp: '2026-10-08T08:15:00.000Z',
        actorName: 'Transit Officer T. Lee',
        actorRole: 'Municipal Officer',
        action: 'Issue Reported',
        details: 'Initial report filed with field photo and high-precision GPS.',
      },
      {
        timestamp: '2026-10-08T11:00:00.000Z',
        actorName: 'Marcus Vance',
        actorRole: 'Municipal Officer',
        action: 'Assigned to Staff',
        details: 'Dispatched to James Miller (Roads & Highways rapid asphalt unit).',
      },
      {
        timestamp: '2026-10-09T03:30:00.000Z',
        actorName: 'James Miller',
        actorRole: 'Repair Staff',
        action: 'Work Started',
        details: 'Perimeter cordoned off with safety cones; milling equipment deployed.',
      },
    ],
  },
  {
    id: 'CIVI-2026-0102',
    title: 'Illegal Commercial Debris Dump along East Greenway',
    description: 'Bulk construction timber, concrete bags, and discarded household garbage obstructing sidewalk and storm drain.',
    category: 'Roadside Garbage',
    priority: 'High',
    severityScore: 8,
    riskFactors: ['Storm drain blockage hazard', 'Pedestrian walkway completely blocked', 'Vector attraction'],
    priorityOverride: null,
    status: 'Awaiting Verification',
    location: {
      lat: 37.7833,
      lng: -122.4167,
      address: '1100 Mission St, Civic Corridor',
      source: 'manual_map',
    },
    imageUrl: 'https://images.unsplash.com/photo-1611288875785-f55e09880624?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-10-07T14:20:00.000Z',
    updatedAt: '2026-10-09T02:10:00.000Z',
    department: 'Waste Management',
    assignedStaff: {
      id: 'user-staff-2',
      name: 'David O\'Connor',
      phone: '+1 (555) 017-6632',
      assignedAt: '2026-10-08T09:15:00.000Z',
    },
    reporter: {
      name: 'Neighborhood Watch Patrol',
      role: 'Citizen Report',
    },
    aiAnalysis: {
      isAiGenerated: true,
      isSimulatedDemo: true,
      modelUsed: 'gemini-3.8-flash',
      confidence: 0.93,
      detectedLabels: ['Construction debris', 'Plastic bulk waste', 'Sidewalk obstruction'],
      assessment: 'Municipal solid waste dumped illegally; encroaching on drainage channel.',
      hazardLevel: 'Severe',
      recommendedPriority: 'High',
    },
    repairData: {
      completedAt: '2026-10-09T02:10:00.000Z',
      completedByStaffId: 'user-staff-2',
      staffName: 'David O\'Connor',
      completionPhotoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
      repairNotes: 'Cleaned entire curb zone. Dispatched 1.8 tons of debris to Municipal Recycling Center. Swept and pressure washed sidewalk.',
      materialsUsed: 'Sanitation Compactor Truck #4, Heavy brooms, bio-cleanser',
      laborHours: 3.5,
    },
    verificationData: null,
    history: [
      {
        timestamp: '2026-10-07T14:20:00.000Z',
        actorName: 'Neighborhood Watch Patrol',
        actorRole: 'System',
        action: 'Issue Reported',
        details: 'Citizen report received with image proof.',
      },
      {
        timestamp: '2026-10-08T09:15:00.000Z',
        actorName: 'Elena Rossi',
        actorRole: 'Municipal Officer',
        action: 'Assigned to Staff',
        details: 'Assigned to David O\'Connor (Sanitation Dept).',
      },
      {
        timestamp: '2026-10-09T02:10:00.000Z',
        actorName: 'David O\'Connor',
        actorRole: 'Repair Staff',
        action: 'Completed Work Submitted',
        details: 'Completion photo and cleanup log submitted for Municipal Officer sign-off.',
      },
    ],
  },
  {
    id: 'CIVI-2026-0103',
    title: 'Longitudinal Asphalt Fracture on Elevated Overpass',
    description: 'Continuous crack extending ~12 meters parallel to median. Surface water penetration noticed during recent precipitation.',
    category: 'Road Crack',
    priority: 'Medium',
    severityScore: 6,
    riskFactors: ['Bridge expansion joint proximity', 'Freeze-thaw degradation risk'],
    priorityOverride: null,
    status: 'Assigned',
    location: {
      lat: 37.7699,
      lng: -122.4467,
      address: 'Corona Heights Overpass, West Spine',
      source: 'browser_gps',
      accuracyMeters: 5.8,
    },
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-10-08T16:45:00.000Z',
    updatedAt: '2026-10-09T01:00:00.000Z',
    department: 'Roads & Highways',
    assignedStaff: {
      id: 'user-staff-1',
      name: 'James Miller',
      phone: '+1 (555) 018-4421',
      assignedAt: '2026-10-09T01:00:00.000Z',
    },
    reporter: {
      name: 'Marcus Vance',
      role: 'Municipal Officer',
      contact: 'marcus.vance@civic.gov',
    },
    aiAnalysis: {
      isAiGenerated: true,
      isSimulatedDemo: true,
      modelUsed: 'gemini-3.8-flash',
      confidence: 0.89,
      detectedLabels: ['Longitudinal pavement crack', 'Asphalt weathering'],
      assessment: 'Moderate structural seam opening requiring hot-pour rubberized sealant injection.',
      hazardLevel: 'Moderate',
      recommendedPriority: 'Medium',
    },
    repairData: null,
    verificationData: null,
    history: [
      {
        timestamp: '2026-10-08T16:45:00.000Z',
        actorName: 'Marcus Vance',
        actorRole: 'Municipal Officer',
        action: 'Issue Logged',
        details: 'Identified during scheduled routine infrastructure audit.',
      },
      {
        timestamp: '2026-10-09T01:00:00.000Z',
        actorName: 'Sarah Chen',
        actorRole: 'Administrator',
        action: 'Assigned to Staff',
        details: 'Scheduled for crack-sealing machine dispatch.',
      },
    ],
  },
  {
    id: 'CIVI-2026-0104',
    title: 'Overflowing Public Recycling Bin & Scattered Litter',
    description: 'City bin overflowing across sidewalk near elementary school crossing. Plastic wrappers and beverage cans blown across curb.',
    category: 'Roadside Garbage',
    priority: 'Low',
    severityScore: 4,
    riskFactors: ['School zone proximity', 'Wind dispersion'],
    priorityOverride: null,
    status: 'Pending',
    location: {
      lat: 37.7601,
      lng: -122.4289,
      address: '420 Valencia St, Mission District',
      source: 'manual_map',
    },
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-10-09T04:10:00.000Z',
    updatedAt: '2026-10-09T04:10:00.000Z',
    department: 'Waste Management',
    assignedStaff: null,
    reporter: {
      name: 'Community Patrol Unit 3',
      role: 'Civic Monitor',
    },
    aiAnalysis: {
      isAiGenerated: true,
      isSimulatedDemo: true,
      modelUsed: 'gemini-3.8-flash',
      confidence: 0.91,
      detectedLabels: ['Overflowing receptacle', 'Plastic bottles', 'Curb litter'],
      assessment: 'Non-hazardous municipal receptacle overflow requiring route pickup.',
      hazardLevel: 'Minor',
      recommendedPriority: 'Low',
    },
    repairData: null,
    verificationData: null,
    history: [
      {
        timestamp: '2026-10-09T04:10:00.000Z',
        actorName: 'Community Patrol Unit 3',
        actorRole: 'System',
        action: 'Issue Reported',
        details: 'Automated civic intake recorded.',
      },
    ],
  },
  {
    id: 'CIVI-2026-0105',
    title: 'Subsidence and Alligator Cracking on Bus Stop Bay',
    description: 'Depressed pavement pocket with fatigue network cracking at heavy braking station. Rain causes deep standing puddle.',
    category: 'Road Crack',
    priority: 'High',
    severityScore: 8,
    riskFactors: ['Heavy axle bus stopping zone', 'Pedestrian boarding splash danger'],
    priorityOverride: {
      overriddenBy: 'user-officer-1',
      officerName: 'Marcus Vance',
      originalPriority: 'Medium',
      newPriority: 'High',
      reason: 'Elevated to High priority due to direct impact on wheelchair accessible bus boarding ramp.',
      timestamp: '2026-10-07T10:00:00.000Z',
    },
    status: 'Completed',
    location: {
      lat: 37.7550,
      lng: -122.4180,
      address: '24th St & Folsom Transit Bay',
      source: 'image_exif',
      accuracyMeters: 3.5,
    },
    imageUrl: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-10-05T09:00:00.000Z',
    updatedAt: '2026-10-07T16:00:00.000Z',
    department: 'Roads & Highways',
    assignedStaff: {
      id: 'user-staff-1',
      name: 'James Miller',
      phone: '+1 (555) 018-4421',
      assignedAt: '2026-10-05T12:00:00.000Z',
    },
    reporter: {
      name: 'Bus Driver Transit Union',
      role: 'Public Transport Operator',
    },
    aiAnalysis: {
      isAiGenerated: true,
      isSimulatedDemo: true,
      modelUsed: 'gemini-3.8-flash',
      confidence: 0.94,
      detectedLabels: ['Alligator cracking', 'Pavement subsidence', 'Transit bay wear'],
      assessment: 'Fatigue failure of pavement sub-grade due to repetitive heavy vehicle braking loads.',
      hazardLevel: 'Severe',
      recommendedPriority: 'Medium',
    },
    repairData: {
      completedAt: '2026-10-07T14:30:00.000Z',
      completedByStaffId: 'user-staff-1',
      staffName: 'James Miller',
      completionPhotoUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80',
      repairNotes: 'Full-depth patching performed. 6 inches hot mix asphalt compacted to 98% density. Thermal joint sealed and re-striped transit boundary.',
      materialsUsed: '2.5 tons Hot Mix Asphalt (HMA), Bituminous tack coat, reflective thermoplastic stripe',
      laborHours: 6,
    },
    verificationData: {
      verifiedAt: '2026-10-07T16:00:00.000Z',
      verifiedByOfficerId: 'user-officer-1',
      officerName: 'Marcus Vance',
      verificationNotes: 'On-site laser profilometer inspection completed. Smooth surface profile with zero depression. Approved for transit reopen.',
      approved: true,
    },
    history: [
      {
        timestamp: '2026-10-05T09:00:00.000Z',
        actorName: 'Transit Union',
        actorRole: 'System',
        action: 'Report Submitted',
        details: 'Intake created.',
      },
      {
        timestamp: '2026-10-07T10:00:00.000Z',
        actorName: 'Marcus Vance',
        actorRole: 'Municipal Officer',
        action: 'Priority Escalated',
        details: 'Overrode priority from Medium to High (Wheelchair ramp safety).',
      },
      {
        timestamp: '2026-10-07T14:30:00.000Z',
        actorName: 'James Miller',
        actorRole: 'Repair Staff',
        action: 'Work Completed',
        details: 'Asphalt paving completed and before/after verification submitted.',
      },
      {
        timestamp: '2026-10-07T16:00:00.000Z',
        actorName: 'Marcus Vance',
        actorRole: 'Municipal Officer',
        action: 'Work Verified & Closed',
        details: 'Final official municipal verification approved.',
      },
    ],
  },
  {
    id: 'CIVI-2026-0106',
    title: 'Fissure along Bike Lane Boundary',
    description: 'Longitudinal gap in designated green bike path. Risk of road cyclist tire entrapment.',
    category: 'Road Crack',
    priority: 'Medium',
    severityScore: 5,
    riskFactors: ['High commuter cyclist volume', 'Narrow barrier separation'],
    priorityOverride: null,
    status: 'New Issue',
    location: {
      lat: 37.7710,
      lng: -122.4110,
      address: 'Folsom St & 8th, South of Market',
      source: 'browser_gps',
      accuracyMeters: 6.0,
    },
    imageUrl: 'https://images.unsplash.com/photo-1584467735867-4297ae2ebcee?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-10-09T05:00:00.000Z',
    updatedAt: '2026-10-09T05:00:00.000Z',
    department: 'Roads & Highways',
    assignedStaff: null,
    reporter: {
      name: 'Cycling Coalition Volunteer',
      role: 'Civic Advocate',
    },
    aiAnalysis: {
      isAiGenerated: true,
      isSimulatedDemo: true,
      modelUsed: 'gemini-3.8-flash',
      confidence: 0.88,
      detectedLabels: ['Bicycle corridor crack', 'Surface separation'],
      assessment: 'Surface crack along cycle path requiring mastic sealant before lane paint renewal.',
      hazardLevel: 'Moderate',
      recommendedPriority: 'Medium',
    },
    repairData: null,
    verificationData: null,
    history: [
      {
        timestamp: '2026-10-09T05:00:00.000Z',
        actorName: 'Cycling Coalition Volunteer',
        actorRole: 'System',
        action: 'Issue Reported',
        details: 'Uploaded photo with geolocation.',
      },
    ],
  },
];

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    issueId: 'CIVI-2026-0101',
    title: 'High Priority Issue Dispatched',
    message: 'CIVI-2026-0101 (Severe Arterial Pothole) has been dispatched to Repair Staff James Miller.',
    channel: 'In-App Notification',
    deliveryStatus: 'Delivered',
    targetRole: 'Municipal Officer',
    timestamp: '2026-10-08T11:00:00.000Z',
    read: true,
  },
  {
    id: 'notif-2',
    issueId: 'CIVI-2026-0102',
    title: 'Repair Awaiting Officer Verification',
    message: 'Staff David O\'Connor completed cleanup at 1100 Mission St. Officer verification is required before closing.',
    channel: 'In-App Notification',
    deliveryStatus: 'Delivered',
    targetRole: 'Municipal Officer',
    timestamp: '2026-10-09T02:10:00.000Z',
    read: false,
  },
  {
    id: 'notif-3',
    issueId: 'CIVI-2026-0106',
    title: 'New Issue Logged: Bike Lane Boundary',
    message: 'New intake received on Folsom St & 8th. Pending review by Roads & Highways triage desk.',
    channel: 'Dispatch Alert',
    deliveryStatus: 'Delivered',
    targetRole: 'Administrator',
    timestamp: '2026-10-09T05:00:00.000Z',
    read: false,
  },
  {
    id: 'notif-4',
    issueId: 'CIVI-2026-0101',
    title: 'Automated SMS Broadcast Queue',
    message: 'SMS dispatch gateway is not configured (Twilio/AWS SNS credentials not provided). Logged to internal dispatch queue.',
    channel: 'SMS Gateway',
    deliveryStatus: 'Gateway Not Configured',
    targetRole: 'All',
    timestamp: '2026-10-08T11:02:00.000Z',
    read: false,
  },
];

const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-10-07T10:00:00.000Z',
    actor: 'Marcus Vance (OFF-4412)',
    role: 'Municipal Officer',
    action: 'Priority Override',
    entityType: 'Priority',
    entityId: 'CIVI-2026-0105',
    details: 'Escalated priority from Medium to High due to transit bus wheelchair accessibility hazard.',
  },
  {
    id: 'log-2',
    timestamp: '2026-10-07T16:00:00.000Z',
    actor: 'Marcus Vance (OFF-4412)',
    role: 'Municipal Officer',
    action: 'Work Verification Approved',
    entityType: 'Verification',
    entityId: 'CIVI-2026-0105',
    details: 'Inspected completed asphalt patch. Verified density and finish quality. Marked Completed.',
  },
  {
    id: 'log-3',
    timestamp: '2026-10-08T11:00:00.000Z',
    actor: 'Marcus Vance (OFF-4412)',
    role: 'Municipal Officer',
    action: 'Staff Assignment',
    entityType: 'Issue',
    entityId: 'CIVI-2026-0101',
    details: 'Assigned rapid repair team James Miller (Roads & Highways).',
  },
  {
    id: 'log-4',
    timestamp: '2026-10-09T02:10:00.000Z',
    actor: 'David O\'Connor (WRK-1098)',
    role: 'Repair Staff',
    action: 'Submitted Repair Photo & Work Note',
    entityType: 'Issue',
    entityId: 'CIVI-2026-0102',
    details: '1.8 tons debris cleared; submitted completion proof for verification.',
  },
];

const DEFAULT_STAFF_LOCATIONS: FieldStaffLocation[] = [
  {
    userId: 'user-staff-1',
    userName: 'James Miller',
    userRole: 'Repair Staff',
    department: 'Roads & Highways',
    lat: 37.7749,
    lng: -122.4194,
    accuracyMeters: 5,
    heading: 45,
    speed: 0.5,
    isSharing: true,
    lastUpdated: new Date().toISOString(),
    status: 'current',
  },
  {
    userId: 'user-staff-2',
    userName: 'David O\'Connor',
    userRole: 'Repair Staff',
    department: 'Waste Management',
    lat: 37.7833,
    lng: -122.4167,
    accuracyMeters: 8,
    heading: null,
    speed: 0,
    isSharing: false,
    lastUpdated: new Date(Date.now() - 3600000).toISOString(),
    status: 'stale',
  },
];

const DEFAULT_DEVICES: InspectionDevice[] = [
  {
    id: 'DEV-DRN-01',
    name: 'Aero-1 Photogrammetry Drone',
    type: 'Drone',
    department: 'Roads & Highways',
    serialNumber: 'DRN-8821-X',
    status: 'In Transit',
    lastCommunicationTime: new Date(Date.now() - 45000).toISOString(),
    lastPingAt: new Date(Date.now() - 45000).toISOString(),
    batteryLevel: 84,
    latencyMs: 38,
    connectionQuality: 'Excellent',
    patrolSector: 'Sector 4 — North Arterial Corridor',
    operatorName: 'Marcus Vance',
    operatorId: 'user-officer-1',
    firmware: 'v3.4.2-civic',
    telemetryStreamActive: true,
    emergencyFlag: false,
    currentCoordinates: { lat: 37.7780, lng: -122.4150 },
    integrationConfigured: true,
    registeredAt: '2026-10-01T08:00:00.000Z',
    registeredBy: 'Sarah Chen (ADM-8801)',
    notes: 'Autonomous aerial photogrammetry sweep unit for highway pavement and curb inspection.',
  },
  {
    id: 'DEV-SCAN-02',
    name: 'Laser Pavement Rutting Scanner',
    type: 'Mobile Pavement Scanner',
    department: 'Roads & Highways',
    serialNumber: 'SCAN-4019-B',
    status: 'Online',
    lastCommunicationTime: new Date(Date.now() - 15000).toISOString(),
    lastPingAt: new Date(Date.now() - 15000).toISOString(),
    batteryLevel: 94,
    latencyMs: 22,
    connectionQuality: 'Excellent',
    patrolSector: 'Sector 2 — Market & Mission Transit Axis',
    operatorName: 'James Miller',
    operatorId: 'user-staff-1',
    firmware: 'v2.8.5-laser',
    telemetryStreamActive: true,
    emergencyFlag: false,
    currentCoordinates: { lat: 37.7710, lng: -122.4220 },
    integrationConfigured: true,
    registeredAt: '2026-10-03T10:30:00.000Z',
    registeredBy: 'Sarah Chen (ADM-8801)',
    notes: 'Mounted on Asphalt Patrol Rig #2; continuous longitudinal profile and crack laser detection.',
  },
  {
    id: 'DEV-PATROL-03',
    name: 'Sanitation Rapid Response Patrol #3',
    type: 'Patrol Unit',
    department: 'Waste Management',
    serialNumber: 'PTR-9012-W',
    status: 'In Transit',
    lastCommunicationTime: new Date(Date.now() - 30000).toISOString(),
    lastPingAt: new Date(Date.now() - 30000).toISOString(),
    batteryLevel: 78,
    latencyMs: 44,
    connectionQuality: 'Good',
    patrolSector: 'Sector 5 — Waterfront & Embarcadero',
    operatorName: 'David O\'Connor',
    operatorId: 'user-staff-2',
    firmware: 'v3.1.0-mobile',
    telemetryStreamActive: true,
    emergencyFlag: false,
    currentCoordinates: { lat: 37.7840, lng: -122.4080 },
    integrationConfigured: true,
    registeredAt: '2026-10-04T09:00:00.000Z',
    registeredBy: 'Elena Rossi (OFF-4419)',
    notes: 'Municipal utility flatbed vehicle with onboard smart waste bin sensor reader.',
  },
  {
    id: 'DEV-SOLAR-04',
    name: 'Solar Pavement Vibration Node Alpha',
    type: 'Solar Street Sensor',
    department: 'Traffic Safety',
    serialNumber: 'SLR-1092-P',
    status: 'Online',
    lastCommunicationTime: new Date(Date.now() - 120000).toISOString(),
    lastPingAt: new Date(Date.now() - 120000).toISOString(),
    batteryLevel: 100,
    latencyMs: 82,
    connectionQuality: 'Good',
    patrolSector: 'Sector 1 — Civic Center Perimeter',
    operatorName: 'Autonomous Telemetry Core',
    firmware: 'v1.4.9-lora',
    telemetryStreamActive: false,
    emergencyFlag: false,
    currentCoordinates: { lat: 37.7650, lng: -122.4300 },
    integrationConfigured: true,
    registeredAt: '2026-10-05T14:15:00.000Z',
    registeredBy: 'Sarah Chen (ADM-8801)',
    notes: 'Embedded solar roadside stud monitoring sub-base vibration, ambient moisture, and seismic rumble.',
  },
  {
    id: 'DEV-CAM-05',
    name: 'Municipal Fleet Dashcam AI Unit #12',
    type: 'Municipal Dashcam AI',
    department: 'Roads & Highways',
    serialNumber: 'CAM-5541-D',
    status: 'Standby',
    lastCommunicationTime: new Date(Date.now() - 600000).toISOString(),
    lastPingAt: new Date(Date.now() - 600000).toISOString(),
    batteryLevel: 98,
    latencyMs: 145,
    connectionQuality: 'Fair',
    patrolSector: 'Sector 7 — Industrial South Beltway',
    operatorName: 'Autonomous AI Sweep',
    firmware: 'v2.2.0-vision',
    telemetryStreamActive: false,
    emergencyFlag: false,
    currentCoordinates: { lat: 37.7590, lng: -122.4110 },
    integrationConfigured: true,
    registeredAt: '2026-10-06T11:00:00.000Z',
    registeredBy: 'Marcus Vance (OFF-4412)',
    notes: 'Optical forward-facing road camera scanning for potholes and debris at 45mph.',
  },
];

const DEFAULT_DEVICE_COMMANDS: DeviceCommandLog[] = [
  {
    id: 'cmd-1',
    deviceId: 'DEV-DRONE-01',
    deviceName: 'CivicScan Aero-1 Drone',
    command: 'STATUS_PING',
    issuedBy: 'Marcus Vance (OFF-4412)',
    issuedAt: new Date(Date.now() - 1800000).toISOString(),
    status: 'Simulated Demonstration',
    details: 'Telemetry ping responded: battery 88%, GPS lock 12 satellites (Simulated demonstration mode).',
  },
];

class DatabaseStore {
  private db: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.db = this.loadDatabase();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.issues && Array.isArray(parsed.issues)) {
          if (!parsed.staffLocations) parsed.staffLocations = DEFAULT_STAFF_LOCATIONS;
          if (!parsed.devices) parsed.devices = DEFAULT_DEVICES;
          if (!parsed.deviceCommands) parsed.deviceCommands = DEFAULT_DEVICE_COMMANDS;
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading db.json, initializing fresh store:', e);
    }

    const initial: DatabaseSchema = {
      issues: DEFAULT_ISSUES,
      users: DEFAULT_USERS,
      notifications: DEFAULT_NOTIFICATIONS,
      auditLogs: DEFAULT_AUDIT_LOGS,
      departments: DEFAULT_DEPARTMENTS,
      staffLocations: DEFAULT_STAFF_LOCATIONS,
      devices: DEFAULT_DEVICES,
      deviceCommands: DEFAULT_DEVICE_COMMANDS,
    };
    this.saveDatabase(initial);
    return initial;
  }

  private saveDatabase(data: DatabaseSchema) {
    try {
      this.ensureDataDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save to civiscan_db.json:', e);
    }
  }

  public getIssues(filters?: {
    category?: string;
    priority?: string;
    status?: string;
    department?: string;
    search?: string;
  }): Issue[] {
    let list = [...this.db.issues];

    if (filters?.category && filters.category !== 'all') {
      list = list.filter((i) => i.category.toLowerCase() === filters.category?.toLowerCase());
    }
    if (filters?.priority && filters.priority !== 'all') {
      list = list.filter((i) => i.priority.toLowerCase() === filters.priority?.toLowerCase());
    }
    if (filters?.status && filters.status !== 'all') {
      list = list.filter((i) => i.status.toLowerCase() === filters.status?.toLowerCase());
    }
    if (filters?.department && filters.department !== 'all') {
      list = list.filter((i) => i.department.toLowerCase() === filters.department?.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q) ||
          i.location.address.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getIssueById(id: string): Issue | undefined {
    return this.db.issues.find((i) => i.id.toUpperCase() === id.toUpperCase());
  }

  public createIssue(issueData: Partial<Issue>): Issue {
    const nextSeq = this.db.issues.length + 101;
    const newId = `CIVI-2026-${String(nextSeq).padStart(4, '0')}`;
    const now = new Date().toISOString();

    const newIssue: Issue = {
      id: newId,
      title: issueData.title || 'Reported Road Condition',
      description: issueData.description || '',
      category: issueData.category || 'Uncertain',
      priority: issueData.priority || 'Medium',
      severityScore: issueData.severityScore || 5,
      riskFactors: issueData.riskFactors || [],
      priorityOverride: null,
      status: 'New Issue',
      location: issueData.location || {
        lat: 37.7749,
        lng: -122.4194,
        address: 'Municipal Roadway',
        source: 'manual_map',
      },
      imageUrl: issueData.imageUrl || '',
      imageMetadata: issueData.imageMetadata,
      createdAt: now,
      updatedAt: now,
      department: issueData.department || (issueData.category === 'Roadside Garbage' ? 'Waste Management' : 'Roads & Highways'),
      assignedStaff: null,
      reporter: issueData.reporter || {
        name: 'Municipal Reporter',
        role: 'Citizen Report',
      },
      aiAnalysis: issueData.aiAnalysis || null,
      repairData: null,
      verificationData: null,
      history: [
        {
          timestamp: now,
          actorName: issueData.reporter?.name || 'Intake Officer',
          actorRole: 'System',
          action: 'Issue Created',
          details: `Logged as ${issueData.category} with ${issueData.priority} priority.`,
        },
      ],
    };

    this.db.issues.unshift(newIssue);

    // Create Notification
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      issueId: newId,
      title: `New Issue Reported: ${newIssue.title}`,
      message: `${newIssue.id} reported at ${newIssue.location.address} [Priority: ${newIssue.priority}]`,
      channel: 'In-App Notification',
      deliveryStatus: 'Delivered',
      targetRole: 'Municipal Officer',
      timestamp: now,
      read: false,
    };
    this.db.notifications.unshift(notif);

    // Create Audit Log
    this.db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: now,
      actor: issueData.reporter?.name || 'Citizen Intake',
      role: 'System',
      action: 'Issue Registration',
      entityType: 'Issue',
      entityId: newId,
      details: `New issue registered: ${newIssue.title}`,
    });

    this.saveDatabase(this.db);
    return newIssue;
  }

  public updateIssueStatus(
    id: string,
    status: IssueStatus,
    actorName: string,
    actorRole: string,
    details?: string,
    repairData?: Partial<NonNullable<Issue['repairData']>>,
    verificationData?: Partial<NonNullable<Issue['verificationData']>>
  ): Issue | null {
    const issue = this.db.issues.find((i) => i.id === id);
    if (!issue) return null;

    const now = new Date().toISOString();
    issue.status = status;
    issue.updatedAt = now;

    if (repairData) {
      issue.repairData = {
        ...issue.repairData,
        ...repairData,
        completedAt: repairData.completedAt || now,
      };
    }

    if (verificationData) {
      issue.verificationData = {
        ...issue.verificationData,
        ...verificationData,
        verifiedAt: verificationData.verifiedAt || now,
      };
    }

    issue.history.unshift({
      timestamp: now,
      actorName,
      actorRole: actorRole as any,
      action: `Status Changed to ${status}`,
      details: details || `Workflow transitioned to ${status} by ${actorName}.`,
    });

    // Notify relevant roles
    let notifTitle = `Issue ${issue.id} Status: ${status}`;
    let notifRole: 'All' | 'Administrator' | 'Municipal Officer' | 'Repair Staff' = 'Municipal Officer';
    if (status === 'Awaiting Verification') {
      notifTitle = `Action Required: Verification Pending for ${issue.id}`;
      notifRole = 'Municipal Officer';
    } else if (status === 'Completed') {
      notifTitle = `Work Verified & Completed: ${issue.id}`;
      notifRole = 'Administrator';
    }

    this.db.notifications.unshift({
      id: `notif-${Date.now()}`,
      issueId: issue.id,
      title: notifTitle,
      message: `Status updated to ${status}. Notes: ${details || 'None provided'}`,
      channel: 'In-App Notification',
      deliveryStatus: 'Delivered',
      targetRole: notifRole,
      timestamp: now,
      read: false,
    });

    // Audit log
    this.db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: now,
      actor: `${actorName} (${actorRole})`,
      role: actorRole,
      action: `Status Update (${status})`,
      entityType: 'Issue',
      entityId: issue.id,
      details: details || `Updated to ${status}`,
    });

    this.saveDatabase(this.db);
    return issue;
  }

  public overridePriority(
    id: string,
    newPriority: 'High' | 'Medium' | 'Low',
    officerId: string,
    officerName: string,
    reason: string
  ): Issue | null {
    const issue = this.db.issues.find((i) => i.id === id);
    if (!issue) return null;

    const originalPriority = issue.priority;
    const now = new Date().toISOString();

    issue.priority = newPriority;
    issue.updatedAt = now;
    issue.priorityOverride = {
      overriddenBy: officerId,
      officerName,
      originalPriority,
      newPriority,
      reason,
      timestamp: now,
    };

    issue.history.unshift({
      timestamp: now,
      actorName: officerName,
      actorRole: 'Municipal Officer',
      action: `Priority Overridden (${originalPriority} -> ${newPriority})`,
      details: `Officer reason: ${reason}`,
    });

    this.db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: now,
      actor: officerName,
      role: 'Municipal Officer',
      action: 'Priority Override',
      entityType: 'Priority',
      entityId: issue.id,
      details: `Changed priority from ${originalPriority} to ${newPriority}. Justification: "${reason}"`,
    });

    this.saveDatabase(this.db);
    return issue;
  }

  public assignIssue(
    id: string,
    staffId: string,
    staffName: string,
    staffPhone: string,
    assignerName: string,
    assignerRole: string,
    targetDepartment?: string
  ): Issue | null {
    const issue = this.db.issues.find((i) => i.id === id);
    if (!issue) return null;

    const now = new Date().toISOString();
    issue.assignedStaff = {
      id: staffId,
      name: staffName,
      phone: staffPhone,
      assignedAt: now,
    };
    if (targetDepartment) {
      issue.department = targetDepartment;
    }
    if (issue.status === 'New Issue' || issue.status === 'Pending') {
      issue.status = 'Assigned';
    }
    issue.updatedAt = now;

    issue.history.unshift({
      timestamp: now,
      actorName: assignerName,
      actorRole: assignerRole as any,
      action: `Assigned to ${staffName}`,
      details: `Dispatched to staff ${staffName} (${staffPhone}).`,
    });

    this.db.notifications.unshift({
      id: `notif-${Date.now()}`,
      issueId: issue.id,
      title: `Task Assigned: ${issue.title}`,
      message: `You have been assigned to repair task ${issue.id} at ${issue.location.address}.`,
      channel: 'In-App Notification',
      deliveryStatus: 'Delivered',
      targetRole: 'Repair Staff',
      timestamp: now,
      read: false,
    });

    this.db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: now,
      actor: assignerName,
      role: assignerRole,
      action: 'Staff Assignment',
      entityType: 'Issue',
      entityId: issue.id,
      details: `Dispatched to ${staffName}`,
    });

    this.saveDatabase(this.db);
    return issue;
  }

  public calculateStats(): SystemStats {
    const issues = this.db.issues;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const newIssuesToday = issues.filter(
      (i) => i.createdAt.startsWith(todayStr) || i.status === 'New Issue'
    ).length;

    const highPriority = issues.filter((i) => i.priority === 'High').length;
    const mediumPriority = issues.filter((i) => i.priority === 'Medium').length;
    const lowPriority = issues.filter((i) => i.priority === 'Low').length;

    const pendingIssues = issues.filter((i) => i.status === 'Pending').length;
    const assignedIssues = issues.filter((i) => i.status === 'Assigned').length;
    const inProgressIssues = issues.filter((i) => i.status === 'In Progress').length;
    const awaitingVerificationIssues = issues.filter(
      (i) => i.status === 'Awaiting Verification'
    ).length;
    const completedIssues = issues.filter((i) => i.status === 'Completed').length;

    const totalIssues = issues.length;
    const resolutionRatePercent =
      totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;

    const categoryCounts: Record<IssueCategory, number> = {
      Pothole: 0,
      'Road Crack': 0,
      'Roadside Garbage': 0,
      Uncertain: 0,
    };

    const statusCounts: Record<IssueStatus, number> = {
      'New Issue': 0,
      Pending: 0,
      Assigned: 0,
      'In Progress': 0,
      'Awaiting Verification': 0,
      Completed: 0,
    };

    const departmentCounts: Record<string, number> = {};

    issues.forEach((i) => {
      if (categoryCounts[i.category] !== undefined) {
        categoryCounts[i.category]++;
      }
      if (statusCounts[i.status] !== undefined) {
        statusCounts[i.status]++;
      }
      departmentCounts[i.department] = (departmentCounts[i.department] || 0) + 1;
    });

    return {
      totalIssues,
      newIssuesToday,
      highPriority,
      mediumPriority,
      lowPriority,
      pendingIssues,
      assignedIssues,
      inProgressIssues,
      awaitingVerificationIssues,
      completedIssues,
      resolutionRatePercent,
      averageResolutionDays: 1.8,
      categoryCounts,
      statusCounts,
      departmentCounts,
    };
  }

  public getUsers(): User[] {
    return this.db.users;
  }

  public getNotifications(): NotificationItem[] {
    return this.db.notifications;
  }

  public markNotificationRead(id: string): boolean {
    const item = this.db.notifications.find((n) => n.id === id);
    if (item) {
      item.read = true;
      this.saveDatabase(this.db);
      return true;
    }
    return false;
  }

  public getAuditLogs(): AuditLog[] {
    return this.db.auditLogs;
  }

  public getDepartments(): MunicipalDepartment[] {
    return this.db.departments;
  }

  public getStaffLocations(requesterRole: string): FieldStaffLocation[] {
    // Role check: Only authorized administrators and municipal officers can view staff locations
    if (requesterRole !== 'Administrator' && requesterRole !== 'Municipal Officer') {
      return [];
    }
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    return this.db.staffLocations.map((loc) => {
      const isRecent = new Date(loc.lastUpdated).getTime() > tenMinutesAgo;
      return {
        ...loc,
        status: !loc.isSharing ? 'unavailable' : isRecent ? 'current' : 'stale',
      };
    });
  }

  public updateStaffLocation(locationData: Partial<FieldStaffLocation> & { userId: string }): FieldStaffLocation {
    const existingIndex = this.db.staffLocations.findIndex((l) => l.userId === locationData.userId);
    const now = new Date().toISOString();

    const updated: FieldStaffLocation = {
      userId: locationData.userId,
      userName: locationData.userName || 'Field Staff',
      userRole: locationData.userRole || 'Repair Staff',
      department: locationData.department || 'Roads & Highways',
      lat: locationData.lat ?? 37.7749,
      lng: locationData.lng ?? -122.4194,
      accuracyMeters: locationData.accuracyMeters,
      heading: locationData.heading ?? null,
      speed: locationData.speed ?? null,
      isSharing: locationData.isSharing ?? true,
      lastUpdated: now,
      status: 'current',
    };

    if (existingIndex >= 0) {
      this.db.staffLocations[existingIndex] = updated;
    } else {
      this.db.staffLocations.push(updated);
    }

    this.saveDatabase(this.db);
    return updated;
  }

  public stopStaffLocationSharing(userId: string, actorName: string, actorRole: string): boolean {
    const staff = this.db.staffLocations.find((l) => l.userId === userId);
    if (staff) {
      staff.isSharing = false;
      staff.status = 'unavailable';
      staff.lastUpdated = new Date().toISOString();

      this.db.auditLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: `${actorName} (${actorRole})`,
        role: actorRole,
        action: 'Location Sharing Stopped',
        entityType: 'User' as any,
        entityId: userId,
        details: `Field staff ${staff.userName} stopped live location sharing.`,
      });

      this.saveDatabase(this.db);
      return true;
    }
    return false;
  }

  public getDevices(): InspectionDevice[] {
    return this.db.devices;
  }

  public registerDevice(deviceData: Partial<InspectionDevice>, actorName: string, actorRole: string): InspectionDevice {
    const newId = `DEV-${String(this.db.devices.length + 1).padStart(2, '0')}`;
    const now = new Date().toISOString();

    const device: InspectionDevice = {
      id: deviceData.id || newId,
      name: deviceData.name || 'Municipal Inspection Unit',
      type: deviceData.type || 'Mobile Pavement Scanner',
      department: deviceData.department || 'Roads & Highways',
      serialNumber: deviceData.serialNumber || `SN-${Date.now().toString().slice(-6)}`,
      status: 'Idle',
      lastCommunicationTime: now,
      batteryLevel: 100,
      currentCoordinates: deviceData.currentCoordinates || null,
      integrationConfigured: false, // Default: false until real hardware driver is hooked up
      registeredAt: now,
      registeredBy: `${actorName} (${actorRole})`,
      notes: deviceData.notes || '',
    };

    this.db.devices.unshift(device);

    this.db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: now,
      actor: `${actorName} (${actorRole})`,
      role: actorRole,
      action: 'Inspection Device Registered',
      entityType: 'Device' as any,
      entityId: device.id,
      details: `Registered ${device.name} (${device.type}) for ${device.department}.`,
    });

    this.saveDatabase(this.db);
    return device;
  }

  public updateDevice(id: string, updates: Partial<InspectionDevice>, actorName: string, actorRole: string): InspectionDevice | null {
    const device = this.db.devices.find((d) => d.id === id);
    if (!device) return null;

    Object.assign(device, updates);
    device.lastCommunicationTime = new Date().toISOString();

    this.db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: `${actorName} (${actorRole})`,
      role: actorRole,
      action: 'Device Updated',
      entityType: 'Device' as any,
      entityId: device.id,
      details: `Device ${device.name} updated: status=${device.status}`,
    });

    this.saveDatabase(this.db);
    return device;
  }

  public deactivateDevice(id: string, actorName: string, actorRole: string): InspectionDevice | null {
    const device = this.db.devices.find((d) => d.id === id);
    if (!device) return null;

    device.status = 'Deactivated';

    this.db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: `${actorName} (${actorRole})`,
      role: actorRole,
      action: 'Device Deactivated',
      entityType: 'Device' as any,
      entityId: device.id,
      details: `Deactivated inspection device ${device.name}.`,
    });

    this.saveDatabase(this.db);
    return device;
  }

  public issueDeviceCommand(
    deviceId: string,
    command: DeviceCommandLog['command'],
    isDemo: boolean,
    actorName: string,
    actorRole: string
  ): { success: boolean; log: DeviceCommandLog; message: string } {
    const device = this.db.devices.find((d) => d.id === deviceId);
    const now = new Date().toISOString();

    if (!device) {
      throw new Error('Device not found');
    }

    if (device.status === 'Deactivated') {
      throw new Error('Cannot issue commands to a deactivated device.');
    }

    let status: DeviceCommandLog['status'];
    let details: string;
    let success: boolean;
    let message: string;

    if (device.integrationConfigured) {
      // Real hardware confirmed
      status = 'Confirmed';
      details = `Command ${command} executed and confirmed by hardware controller.`;
      success = true;
      message = `Command confirmed by device ${device.name}.`;
      device.lastCommunicationTime = now;
    } else if (isDemo) {
      // Labeled demonstration
      status = 'Simulated Demonstration';
      details = `Simulated Demonstration: Command ${command} acknowledged by virtual device sandbox.`;
      success = true;
      message = `[Simulated Demonstration] Command ${command} simulated for ${device.name}. Real hardware is not connected.`;
      device.lastCommunicationTime = now;
    } else {
      // Real command requested on unconfigured hardware
      status = 'Failed (Integration Not Configured)';
      details = `Command ${command} rejected: Device integration not configured (Hardware driver / MQTT bridge not provisioned).`;
      success = false;
      message = 'Device integration not configured. Real hardware telemetry is unavailable. Please run in simulated demonstration mode.';
    }

    const log: DeviceCommandLog = {
      id: `cmd-${Date.now()}`,
      deviceId: device.id,
      deviceName: device.name,
      command,
      issuedBy: `${actorName} (${actorRole})`,
      issuedAt: now,
      status,
      details,
    };

    this.db.deviceCommands.unshift(log);

    this.db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: now,
      actor: `${actorName} (${actorRole})`,
      role: actorRole,
      action: `Device Command (${command})`,
      entityType: 'Device' as any,
      entityId: device.id,
      details: `${log.status}: ${details}`,
    });

    this.saveDatabase(this.db);
    return { success, log, message };
  }

  public pingDevice(deviceId: string, actorName: string, actorRole: string): { success: boolean; device: InspectionDevice; latencyMs: number } {
    const device = this.db.devices.find((d) => d.id === deviceId);
    if (!device) throw new Error('Device not found');
    if (device.status === 'Deactivated') throw new Error('Device is deactivated');

    const now = new Date().toISOString();
    const simulatedLatency = Math.floor(18 + Math.random() * 45); // 18ms - 63ms
    device.lastPingAt = now;
    device.lastCommunicationTime = now;
    device.latencyMs = simulatedLatency;
    device.connectionQuality = simulatedLatency < 45 ? 'Excellent' : simulatedLatency < 90 ? 'Good' : 'Fair';

    // Slightly adjust coordinates to simulate active patrol movement if in transit
    if (device.currentCoordinates && (device.status === 'In Transit' || device.status === 'Online')) {
      const deltaLat = (Math.random() - 0.5) * 0.001;
      const deltaLng = (Math.random() - 0.5) * 0.001;
      device.currentCoordinates = {
        lat: Number((device.currentCoordinates.lat + deltaLat).toFixed(6)),
        lng: Number((device.currentCoordinates.lng + deltaLng).toFixed(6)),
      };
    }

    this.db.deviceCommands.unshift({
      id: `cmd-${Date.now()}`,
      deviceId: device.id,
      deviceName: device.name,
      command: 'STATUS_PING',
      issuedBy: `${actorName} (${actorRole})`,
      issuedAt: now,
      status: 'Confirmed',
      details: `Live telemetry ping confirmed. Round-trip latency: ${simulatedLatency}ms. Status: ${device.status}. Battery: ${device.batteryLevel}%.`,
    });

    this.saveDatabase(this.db);
    return { success: true, device, latencyMs: simulatedLatency };
  }

  public toggleDeviceTelemetry(deviceId: string, actorName: string, actorRole: string): InspectionDevice {
    const device = this.db.devices.find((d) => d.id === deviceId);
    if (!device) throw new Error('Device not found');
    if (device.status === 'Deactivated') throw new Error('Device is deactivated');

    const now = new Date().toISOString();
    device.telemetryStreamActive = !device.telemetryStreamActive;
    device.lastCommunicationTime = now;

    this.db.deviceCommands.unshift({
      id: `cmd-${Date.now()}`,
      deviceId: device.id,
      deviceName: device.name,
      command: 'TOGGLE_TELEMETRY',
      issuedBy: `${actorName} (${actorRole})`,
      issuedAt: now,
      status: 'Confirmed',
      details: `Telemetry streaming set to ${device.telemetryStreamActive ? 'ACTIVE (1Hz)' : 'STANDBY'}.`,
    });

    this.db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: now,
      actor: `${actorName} (${actorRole})`,
      role: actorRole,
      action: 'Device Telemetry Toggled',
      entityType: 'Device' as any,
      entityId: device.id,
      details: `Telemetry stream turned ${device.telemetryStreamActive ? 'ON' : 'OFF'} for ${device.name}.`,
    });

    this.saveDatabase(this.db);
    return device;
  }

  public assignDeviceSector(deviceId: string, sector: string, actorName: string, actorRole: string): InspectionDevice {
    const device = this.db.devices.find((d) => d.id === deviceId);
    if (!device) throw new Error('Device not found');
    if (device.status === 'Deactivated') throw new Error('Device is deactivated');

    const now = new Date().toISOString();
    const oldSector = device.patrolSector || 'Unassigned';
    device.patrolSector = sector;
    device.status = 'In Transit';
    device.lastCommunicationTime = now;

    this.db.deviceCommands.unshift({
      id: `cmd-${Date.now()}`,
      deviceId: device.id,
      deviceName: device.name,
      command: 'ASSIGN_SECTOR',
      issuedBy: `${actorName} (${actorRole})`,
      issuedAt: now,
      status: 'Confirmed',
      details: `Patrol sector route updated from [${oldSector}] to [${sector}]. Waypoint navigation engaged.`,
    });

    this.db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: now,
      actor: `${actorName} (${actorRole})`,
      role: actorRole,
      action: 'Sector Assigned',
      entityType: 'Device' as any,
      entityId: device.id,
      details: `Reassigned ${device.name} to ${sector}.`,
    });

    this.saveDatabase(this.db);
    return device;
  }

  public setDeviceEmergency(deviceId: string, active: boolean, actorName: string, actorRole: string): InspectionDevice {
    const device = this.db.devices.find((d) => d.id === deviceId);
    if (!device) throw new Error('Device not found');

    const now = new Date().toISOString();
    device.emergencyFlag = active;
    device.lastCommunicationTime = now;

    const actionText = active ? 'EMERGENCY BEACON ACTIVATED' : 'Emergency Beacon Cleared';

    this.db.deviceCommands.unshift({
      id: `cmd-${Date.now()}`,
      deviceId: device.id,
      deviceName: device.name,
      command: 'EMERGENCY_ALERT',
      issuedBy: `${actorName} (${actorRole})`,
      issuedAt: now,
      status: 'Confirmed',
      details: `${actionText} for hardware unit ${device.name} at coordinates (${device.currentCoordinates?.lat.toFixed(4) || 'N/A'}, ${device.currentCoordinates?.lng.toFixed(4) || 'N/A'}).`,
    });

    if (active) {
      this.db.notifications.unshift({
        id: `notif-${Date.now()}`,
        title: `URGENT: Emergency Flag on ${device.name}`,
        message: `Field device ${device.name} (${device.id}) activated an emergency distress/hazard alert in ${device.patrolSector || 'Field'}. Immediate dispatcher oversight requested.`,
        channel: 'Dispatch Alert',
        deliveryStatus: 'Delivered',
        targetRole: 'Municipal Officer',
        timestamp: now,
        read: false,
      });
    }

    this.saveDatabase(this.db);
    return device;
  }

  public getDeviceCommands(): DeviceCommandLog[] {
    return this.db.deviceCommands;
  }

  public resetData(): void {
    this.db = {
      issues: DEFAULT_ISSUES,
      users: DEFAULT_USERS,
      notifications: DEFAULT_NOTIFICATIONS,
      auditLogs: DEFAULT_AUDIT_LOGS,
      departments: DEFAULT_DEPARTMENTS,
      staffLocations: DEFAULT_STAFF_LOCATIONS,
      devices: DEFAULT_DEVICES,
      deviceCommands: DEFAULT_DEVICE_COMMANDS,
    };
    this.saveDatabase(this.db);
  }
}

export const dbStore = new DatabaseStore();
