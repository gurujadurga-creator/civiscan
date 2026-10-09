export type IssueCategory = 'Pothole' | 'Road Crack' | 'Roadside Garbage' | 'Uncertain';
export type IssuePriority = 'High' | 'Medium' | 'Low';
export type IssueStatus =
  | 'New Issue'
  | 'Pending'
  | 'Assigned'
  | 'In Progress'
  | 'Awaiting Verification'
  | 'Completed';

export type UserRole = 'Administrator' | 'Municipal Officer' | 'Repair Staff';

export interface LocationData {
  lat?: number | null;
  lng?: number | null;
  address: string;
  source: 'browser_gps' | 'image_exif' | 'manual_map' | 'manual_coordinates' | 'none';
  accuracyMeters?: number;
  verificationStatus?:
    | 'Unverified'
    | 'Officer Verified'
    | 'System GPS Verified'
    | 'Image EXIF Verified'
    | 'Manual Map Pin'
    | 'Manual Coordinates'
    | 'Location Not Provided';
  updatedAt?: string;
}

export interface FieldStaffLocation {
  userId: string;
  userName: string;
  userRole: UserRole;
  department: string;
  lat: number;
  lng: number;
  accuracyMeters?: number;
  heading?: number | null;
  speed?: number | null;
  isSharing: boolean;
  lastUpdated: string;
  status: 'current' | 'stale' | 'unavailable';
}

export type DeviceStatus = 'Online' | 'In Transit' | 'Standby' | 'Offline' | 'Active' | 'Idle' | 'Deactivated';

export interface InspectionDevice {
  id: string;
  name: string;
  type:
    | 'Drone'
    | 'Mobile Pavement Scanner'
    | 'Solar Street Sensor'
    | 'Municipal Dashcam AI'
    | 'Road Survey Vehicle'
    | 'Patrol Unit';
  department: string;
  serialNumber: string;
  status: DeviceStatus;
  lastCommunicationTime: string;
  batteryLevel?: number;
  latencyMs?: number;
  connectionQuality?: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  patrolSector?: string;
  operatorName?: string;
  operatorId?: string;
  firmware?: string;
  lastPingAt?: string;
  telemetryStreamActive?: boolean;
  emergencyFlag?: boolean;
  currentCoordinates?: { lat: number; lng: number } | null;
  integrationConfigured: boolean;
  registeredAt: string;
  registeredBy: string;
  notes?: string;
}

export interface DeviceCommandLog {
  id: string;
  deviceId: string;
  deviceName: string;
  command:
    | 'STATUS_PING'
    | 'TOGGLE_TELEMETRY'
    | 'ASSIGN_SECTOR'
    | 'EMERGENCY_ALERT'
    | 'START_INSPECTION'
    | 'RETURN_TO_BASE'
    | 'CALIBRATE_SENSORS';
  issuedBy: string;
  issuedAt: string;
  status: 'Failed (Integration Not Configured)' | 'Confirmed' | 'Simulated Demonstration';
  details: string;
}

export interface PriorityOverride {
  overriddenBy: string;
  officerName: string;
  originalPriority: IssuePriority;
  newPriority: IssuePriority;
  reason: string;
  timestamp: string;
}

export interface HistoryEvent {
  timestamp: string;
  actorName: string;
  actorRole: UserRole | 'System';
  action: string;
  details: string;
}

export interface AIAnalysisResult {
  isAiGenerated: boolean;
  isSimulatedDemo?: boolean;
  modelUsed?: string;
  confidence?: number;
  detectedLabels?: string[];
  assessment?: string;
  hazardLevel?: 'Critical' | 'Severe' | 'Moderate' | 'Minor';
  recommendedPriority?: IssuePriority;
  detectedDimensions?: string;
  environmentalNotes?: string;
}

export interface RepairData {
  completedAt?: string;
  completedByStaffId?: string;
  staffName?: string;
  completionPhotoUrl?: string;
  repairNotes?: string;
  materialsUsed?: string;
  laborHours?: number;
}

export interface VerificationData {
  verifiedAt?: string;
  verifiedByOfficerId?: string;
  officerName?: string;
  verificationNotes?: string;
  approved?: boolean;
}

export interface Issue {
  id: string; // e.g. CIVI-2026-0101
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  severityScore: number; // 1-10
  riskFactors: string[];
  priorityOverride?: PriorityOverride | null;
  status: IssueStatus;
  location: LocationData;
  imageUrl: string;
  imageMetadata?: {
    fileName?: string;
    fileSize?: string;
    format?: string;
    exifLocation?: { lat: number; lng: number };
  };
  createdAt: string;
  updatedAt: string;
  department: string;
  assignedStaff?: {
    id: string;
    name: string;
    phone: string;
    assignedAt: string;
  } | null;
  reporter: {
    name: string;
    role: string;
    contact?: string;
  };
  aiAnalysis?: AIAnalysisResult | null;
  repairData?: RepairData | null;
  verificationData?: VerificationData | null;
  history: HistoryEvent[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  badge: string;
  avatar: string;
  phone?: string;
}

export interface NotificationItem {
  id: string;
  issueId?: string;
  title: string;
  message: string;
  channel: 'In-App Notification' | 'Dispatch Alert' | 'SMS Gateway' | 'Email Digest';
  deliveryStatus: 'Delivered' | 'Pending Dispatch' | 'Gateway Not Configured' | 'Read';
  targetRole: 'All' | UserRole;
  timestamp: string;
  read: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  entityType: 'Issue' | 'User' | 'Priority' | 'Verification';
  entityId: string;
  details: string;
}

export interface MunicipalDepartment {
  id: string;
  name: string;
  head: string;
  contactEmail: string;
  activeWorkforce: number;
  openIssuesCount: number;
}

export interface SystemStats {
  totalIssues: number;
  newIssuesToday: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  pendingIssues: number;
  assignedIssues: number;
  inProgressIssues: number;
  awaitingVerificationIssues: number;
  completedIssues: number;
  resolutionRatePercent: number;
  averageResolutionDays: number;
  categoryCounts: Record<IssueCategory, number>;
  statusCounts: Record<IssueStatus, number>;
  departmentCounts: Record<string, number>;
}
