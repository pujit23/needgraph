import { create } from 'zustand';
import type { Need, Alert, Prediction, Volunteer, UrgencyLevel, Task, TaskStatus, SubmittedNeed, NeedType } from '../types';
import {
  needs as mockNeeds,
  alerts as mockAlerts,
  predictions as mockPredictions,
  volunteers as mockVolunteers,
} from '../data/mockData';

// ─── NEEDS STORE ────────────────────────────────────────
interface NeedsState {
  needs: Need[];
  selectedWard: number | null;
  dateRange: [Date, Date];
  addNeed: (need: Need) => void;
  setSelectedWard: (wardId: number | null) => void;
  setDateRange: (range: [Date, Date]) => void;
  getActiveNeeds: () => Need[];
  getNeedsByWard: (wardId: number) => Need[];
  getTotalActive: () => number;
}

export const useNeedsStore = create<NeedsState>((set, get) => ({
  needs: mockNeeds,
  selectedWard: null,
  dateRange: [new Date(Date.now() - 30 * 86400000), new Date()],
  addNeed: (need) => set((state) => ({ needs: [need, ...state.needs] })),
  setSelectedWard: (wardId) => set({ selectedWard: wardId }),
  setDateRange: (range) => set({ dateRange: range }),
  getActiveNeeds: () => get().needs.filter((n) => n.status === 'Active'),
  getNeedsByWard: (wardId) => get().needs.filter((n) => n.wardId === wardId),
  getTotalActive: () => get().needs.filter((n) => n.status === 'Active').length,
}));

// ─── ALERTS STORE ───────────────────────────────────────
interface AlertsState {
  alerts: Alert[];
  filter: UrgencyLevel | 'All';
  addAlert: (alert: Alert) => void;
  setFilter: (filter: UrgencyLevel | 'All') => void;
  resolveAlert: (id: string) => void;
  assignVolunteer: (alertId: string, volunteerName: string) => void;
  getCriticalCount: () => number;
}

export const useAlertsStore = create<AlertsState>((set, get) => ({
  alerts: mockAlerts,
  filter: 'All',
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
  setFilter: (filter) => set({ filter }),
  resolveAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, status: 'Resolved' as const } : a)),
    })),
  assignVolunteer: (alertId, volunteerName) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, status: 'Assigned' as const, assignedVolunteer: volunteerName } : a
      ),
    })),
  getCriticalCount: () => get().alerts.filter((a) => a.urgency === 'Critical' && a.status !== 'Resolved').length,
}));

// ─── PREDICTIONS STORE ──────────────────────────────────
interface PredictionsState {
  predictions: Prediction[];
  addPrediction: (prediction: Prediction) => void;
}

export const usePredictionsStore = create<PredictionsState>((set) => ({
  predictions: mockPredictions,
  addPrediction: (prediction) =>
    set((state) => ({ predictions: [prediction, ...state.predictions] })),
}));

// ─── VOLUNTEERS STORE ───────────────────────────────────
interface VolunteersState {
  volunteers: Volunteer[];
  selectedVolunteer: Volunteer | null;
  searchQuery: string;
  filterSkill: string;
  filterStatus: string;
  addVolunteer: (vol: Volunteer) => void;
  setSelectedVolunteer: (vol: Volunteer | null) => void;
  updateVolunteerStatus: (id: string, status: Volunteer['status']) => void;
  setSearchQuery: (query: string) => void;
  setFilterSkill: (skill: string) => void;
  setFilterStatus: (status: string) => void;
  getDeployedCount: () => number;
  getFilteredVolunteers: () => Volunteer[];
}

export const useVolunteersStore = create<VolunteersState>((set, get) => ({
  volunteers: mockVolunteers,
  selectedVolunteer: null,
  searchQuery: '',
  filterSkill: 'All',
  filterStatus: 'All',
  addVolunteer: (vol) =>
    set((state) => ({ volunteers: [vol, ...state.volunteers] })),
  setSelectedVolunteer: (vol) => set({ selectedVolunteer: vol }),
  updateVolunteerStatus: (id, status) =>
    set((state) => ({
      volunteers: state.volunteers.map((v) => (v.id === id ? { ...v, status } : v)),
      selectedVolunteer:
        state.selectedVolunteer?.id === id
          ? { ...state.selectedVolunteer, status }
          : state.selectedVolunteer,
    })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterSkill: (skill) => set({ filterSkill: skill }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  getDeployedCount: () => get().volunteers.filter((v) => v.status === 'Deployed').length,
  getFilteredVolunteers: () => {
    const { volunteers, searchQuery, filterSkill, filterStatus } = get();
    return volunteers.filter((v) => {
      const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSkill = filterSkill === 'All' || v.skills.includes(filterSkill);
      const matchesStatus = filterStatus === 'All' || v.status === filterStatus;
      return matchesSearch && matchesSkill && matchesStatus;
    });
  },
}));

// ─── TASKS STORE ────────────────────────────────────────
interface TasksState {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  removeTask: (taskId: string) => void;
  getTasksForVolunteer: (volunteerId: string) => Task[];
  getCompletionPercentage: (volunteerId: string) => number;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  addTask: (task) => {
    set((state) => ({ tasks: [task, ...state.tasks] }));
    // Auto-update volunteer status to Deployed when active task is assigned
    if (task.status === 'Assigned' || task.status === 'In Progress') {
      useVolunteersStore.getState().updateVolunteerStatus(task.volunteerId, 'Deployed');
    }
  },
  updateTaskStatus: (taskId, status) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
    }));
    // If task is completed/verified, check if volunteer has any remaining active tasks
    if (status === 'Completed' || status === 'Verified') {
      const { tasks } = get();
      const volunteerId = tasks.find((t) => t.id === taskId)?.volunteerId;
      if (volunteerId) {
        const hasActiveTask = tasks.some(
          (t) =>
            t.id !== taskId &&
            t.volunteerId === volunteerId &&
            (t.status === 'Assigned' || t.status === 'In Progress')
        );
        if (!hasActiveTask) {
          useVolunteersStore.getState().updateVolunteerStatus(volunteerId, 'Available');
        }
      }
    }
  },
  removeTask: (taskId) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== taskId) })),
  getTasksForVolunteer: (volunteerId) =>
    get().tasks.filter((t) => t.volunteerId === volunteerId),
  getCompletionPercentage: (volunteerId) => {
    const tasks = get().tasks.filter((t) => t.volunteerId === volunteerId);
    if (tasks.length === 0) return 0;
    const done = tasks.filter((t) => t.status === 'Completed' || t.status === 'Verified').length;
    return Math.round((done / tasks.length) * 100);
  },
}));

// ─── UI STORE ───────────────────────────────────────────
interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  darkMode: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
}));

// ─── SUBMITTED NEEDS STORE ──────────────────────────────
function deriveUrgency(score: number): UrgencyLevel {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

// Derive a ward label from lat/lng (simple bounding box approximation for Hyderabad)
function deriveWard(lat: number, lng: number): string {
  // Rough ward zones based on Hyderabad coordinates
  if (lat > 17.45 && lng < 78.42) return 'Ward 7 - Kukatpally';
  if (lat > 17.45) return 'Ward 1 - Secunderabad';
  if (lat < 17.37) return 'Ward 12 - Charminar';
  if (lng > 78.53) return 'Ward 15 - Uppal';
  if (lng < 78.38) return 'Ward 11 - Gachibowli';
  return 'Ward 5 - Banjara Hills';
}

interface SubmittedNeedsState {
  submittedNeeds: SubmittedNeed[];
  submitNeed: (payload: {
    needType: NeedType;
    severityScore: number;
    peopleAffected: number;
    description: string;
    location: { address: string; lat: number; lng: number };
    audioTranscript?: string;
    submitterName: string;
    contactNumber: string;
  }) => Promise<string>; // resolves with referenceId
  recentSubmissions: (n: number) => SubmittedNeed[];
}

export const useSubmittedNeedsStore = create<SubmittedNeedsState>((set, get) => ({
  submittedNeeds: [],

  submitNeed: async (payload) => {
    // Simulate a 1.2s API call (swap for real Firebase onCall when live)
    await new Promise((r) => setTimeout(r, 1200));

    const ts = Date.now();
    const referenceId = `NG-${ts}`;
    const ward = deriveWard(payload.location.lat, payload.location.lng);

    const newNeed: SubmittedNeed = {
      id: `submitted-${ts}`,
      referenceId,
      needType: payload.needType,
      severityScore: payload.severityScore,
      peopleAffected: payload.peopleAffected,
      description: payload.description,
      location: { ...payload.location, ward },
      audioTranscript: payload.audioTranscript,
      submitterName: payload.submitterName,
      contactNumber: payload.contactNumber,
      submittedAt: new Date(ts).toISOString(),
      status: 'open',
      urgency: deriveUrgency(payload.severityScore),
    };

    set((state) => ({ submittedNeeds: [newNeed, ...state.submittedNeeds] }));
    return referenceId;
  },

  recentSubmissions: (n) =>
    get().submittedNeeds.slice(0, n),
}));
