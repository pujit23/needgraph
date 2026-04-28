export type NeedType =
  | 'Food Insecurity'
  | 'School Dropout'
  | 'Mental Health'
  | 'Healthcare'
  | 'Domestic Violence'
  | 'Unemployment'
  | 'Water Scarcity'
  | 'Child Malnutrition';

export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type VolunteerStatus = 'Available' | 'Deployed' | 'Off-duty';
export type AlertStatus = 'Active' | 'Assigned' | 'Resolved';
export type TaskStatus = 'Assigned' | 'In Progress' | 'Completed' | 'Verified';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskType =
  | 'Health Camp'
  | 'Survey'
  | 'Education Drive'
  | 'Legal Workshop'
  | 'Food Distribution'
  | 'Counselling Session'
  | 'Water Relief'
  | 'Emergency Response'
  | 'Community Outreach'
  | 'Other';

export interface Task {
  id: string;
  title: string;
  ward: string;
  taskType: TaskType;
  date: string;
  estimatedHours: number;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  volunteerId: string;
  createdAt: string;
}

export interface Ward {
  id: number;
  name: string;
  lat: number;
  lng: number;
}

export interface Need {
  id: string;
  wardId: number;
  wardName: string;
  lat: number;
  lng: number;
  needType: NeedType;
  severity: number;
  affectedCount: number;
  urgency: UrgencyLevel;
  description: string;
  language: string;
  status: AlertStatus;
  createdAt: string;
  updatedAt: string;
  submittedBy?: string;
}

export interface Alert {
  id: string;
  needId: string;
  wardId: number;
  wardName: string;
  needType: NeedType;
  severity: number;
  affectedCount: number;
  urgency: UrgencyLevel;
  status: AlertStatus;
  detectedAt: string;
  assignedVolunteer?: string;
}

export interface Prediction {
  id: string;
  needType: NeedType;
  wardId: number;
  wardName: string;
  predictedSeverity: number;
  confidence: number;
  predictedDays: number;
  causalChain: CausalChainLink[];
  recommendedAction: string;
  estimatedImpact: number;
  createdAt: string;
}

export interface CausalChainLink {
  needType: NeedType;
  score: number;
  predicted?: boolean;
}

export interface Volunteer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  skills: string[];
  wardId: number;
  wardName: string;
  status: VolunteerStatus;
  tasksThisWeek: number;
  totalTasks: number;
  contact: string;
  joinedAt: string;
  assignments: VolunteerAssignment[];
  ngoName?: string;
  yearsExperience?: number;
  emergencyContact?: string;
  certificateUrl?: string;
  tasks?: Task[];
}

export interface VolunteerAssignment {
  id: string;
  date: string;
  wardName: string;
  task: string;
  hours: number;
  outcome: string;
}

export interface GraphNode {
  needType: NeedType;
  urgencyScore: number;
  wardCount: number;
  color: string;
}

export interface GraphEdge {
  source: NeedType;
  target: NeedType;
  relationship: string;
  weight: number;
}

export interface TrendDataPoint {
  date: string;
  foodInsecurity: number;
  schoolDropout: number;
  mentalHealth: number;
  healthcare: number;
  domesticViolence: number;
  unemployment: number;
  waterScarcity: number;
  childMalnutrition: number;
}

export interface WardNeedData {
  ward: string;
  score: number;
  severity: UrgencyLevel;
}

export interface VolunteerDeploymentData {
  date: string;
  volunteers: number;
  needs: number;
}

export interface NeedDistribution {
  name: string;
  value: number;
  color: string;
}

export interface ReportMetrics {
  totalNeeds: number;
  crisesPrevented: number;
  volunteersDeployed: number;
  peopleHelped: number;
}

export interface WeeklyReport {
  week: string;
  recorded: number;
  resolved: number;
}

export interface WardPerformance {
  ward: string;
  recorded: number;
  resolved: number;
  avgResolutionTime: string;
  volunteersDeployed: number;
  outcomeScore: number;
}

export interface PreventedCrisis {
  id: string;
  predictedNeed: NeedType;
  ward: string;
  predictedDate: string;
  intervention: string;
  outcome: string;
  peopleProtected: number;
}

// ─── Submitted Need (live, user-submitted via Submit Need page) ──────────────
export interface SubmittedNeedLocation {
  address: string;
  lat: number;
  lng: number;
  ward: string;
}

export interface SubmittedNeed {
  id: string;
  referenceId: string;          // "NG-[timestamp]"
  needType: NeedType;
  severityScore: number;
  peopleAffected: number;
  description: string;
  location: SubmittedNeedLocation;
  audioTranscript?: string;
  submitterName: string;
  contactNumber: string;
  submittedAt: string;          // ISO string
  status: 'open' | 'in-progress' | 'resolved';
  urgency: UrgencyLevel;        // derived from severityScore
}

// ─── Resource / Inventory ─────────────────────────────────
export type ResourceCategory = 'Food' | 'Water' | 'Medical' | 'Shelter' | 'Education' | 'Other';
export type ResourceStatus   = 'Available' | 'Reserved' | 'Dispatched' | 'Depleted';
export type ResourceUnit     = 'KG' | 'Liters' | 'Units' | 'Kits' | 'Boxes' | 'Packs' | 'Sets' | 'Bottles' | 'Tabs' | 'Other';
export type DispatchPriority = 'Normal' | 'Urgent' | 'Critical';
export type DonorType        = 'Individual' | 'Organization';
export type ResourceCondition = 'New' | 'Good Condition' | 'Usable';

export interface DispatchLog {
  id: string;
  dispatchedTo: string;       // ward / need label
  quantity: number;
  volunteer: string;
  dateTime: string;           // ISO
  vehicle?: string;
  notes?: string;
  priority: DispatchPriority;
}

export interface Resource {
  id: string;
  name: string;
  category: ResourceCategory;
  quantity: number;           // current available quantity
  unit: ResourceUnit;
  description?: string;
  ngoName: string;
  contactPerson?: string;
  contactNumber?: string;
  wardId: number;
  wardName: string;
  storageLocation?: string;
  status: ResourceStatus;
  expiryDate?: string;        // ISO date string
  notes?: string;
  isDonated: boolean;
  donorName?: string;
  donorCondition?: ResourceCondition;
  dispatchLogs: DispatchLog[];
  createdAt: string;          // ISO
}

export interface Donation {
  id: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  donorType: DonorType;
  orgName?: string;
  resourceName: string;
  category: ResourceCategory;
  quantity: number;
  unit: ResourceUnit;
  condition: ResourceCondition;
  description?: string;
  pickupDate: string;
  pickupAddress: string;
  deliveryPreference: 'drop-off' | 'pickup';
  targetWard?: string;
  createdAt: string;
}
