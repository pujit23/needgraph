import { create } from 'zustand';
import type {
  Resource, Donation, DispatchLog,
  ResourceCategory, ResourceStatus, ResourceUnit,
  ResourceCondition, DonorType, DispatchPriority,
} from '../types';

// ─── Initial Mock Data ────────────────────────────────────
const INITIAL_RESOURCES: Resource[] = [
  { id:'r-1',  name:'Rice & Grain Packs',      category:'Food',      quantity:450,  unit:'KG',      status:'Available',  ngoName:'Hyderabad Food Bank',    wardId:12, wardName:'Ward 12 - Charminar',  isDonated:false, dispatchLogs:[], createdAt:'2026-01-10T08:00:00Z', storageLocation:'Community Hall, Ward 12' },
  { id:'r-2',  name:'Drinking Water Cans',     category:'Water',     quantity:800,  unit:'Liters',  status:'Available',  ngoName:'Clean Water Initiative', wardId:9,  wardName:'Ward 9 - Chandanagar', isDonated:false, dispatchLogs:[], createdAt:'2026-01-12T09:00:00Z', storageLocation:'Ward 9 Storage Hub' },
  { id:'r-3',  name:'First Aid Kits',          category:'Medical',   quantity:120,  unit:'Kits',    status:'Available',  ngoName:'MedRelief NGO',          wardId:7,  wardName:'Ward 7 - Kukatpally',  isDonated:false, dispatchLogs:[], createdAt:'2026-01-15T10:00:00Z' },
  { id:'r-4',  name:'Emergency Tents',         category:'Shelter',   quantity:40,   unit:'Units',   status:'Reserved',   ngoName:'Shelter Now India',      wardId:3,  wardName:'Ward 3 - Ameerpet',    isDonated:false, dispatchLogs:[], createdAt:'2026-01-18T11:00:00Z' },
  { id:'r-5',  name:'School Supplies Box',     category:'Education', quantity:200,  unit:'Boxes',   status:'Available',  ngoName:'EduReach Foundation',    wardId:5,  wardName:'Ward 5 - Banjara Hills',isDonated:false, dispatchLogs:[], createdAt:'2026-01-20T08:00:00Z' },
  { id:'r-6',  name:'ORS & Medicine Packs',    category:'Medical',   quantity:300,  unit:'Packs',   status:'Dispatched', ngoName:'MedRelief NGO',          wardId:12, wardName:'Ward 12 - Charminar',  isDonated:false, dispatchLogs:[], createdAt:'2026-01-22T09:00:00Z' },
  { id:'r-7',  name:'Blankets & Clothing',     category:'Shelter',   quantity:175,  unit:'Sets',    status:'Available',  ngoName:'Compassion Trust',       wardId:2,  wardName:'Ward 2 - Begumpet',    isDonated:false, dispatchLogs:[], createdAt:'2026-01-25T10:00:00Z' },
  { id:'r-8',  name:'Fortified Biscuits',      category:'Food',      quantity:600,  unit:'Packs',   status:'Available',  ngoName:'Hyderabad Food Bank',    wardId:7,  wardName:'Ward 7 - Kukatpally',  isDonated:false, dispatchLogs:[], createdAt:'2026-02-01T08:00:00Z' },
  { id:'r-9',  name:'Water Purification Tabs', category:'Water',     quantity:1000, unit:'Tabs',    status:'Reserved',   ngoName:'Clean Water Initiative', wardId:15, wardName:'Ward 15 - Uppal',      isDonated:false, dispatchLogs:[], createdAt:'2026-02-05T09:00:00Z' },
  { id:'r-10', name:'Portable Solar Lamps',    category:'Other',     quantity:50,   unit:'Units',   status:'Available',  ngoName:'GreenAid Telangana',     wardId:11, wardName:'Ward 11 - Gachibowli', isDonated:false, dispatchLogs:[], createdAt:'2026-02-08T10:00:00Z' },
  { id:'r-11', name:'Nutrition Supplements',   category:'Medical',   quantity:80,   unit:'Bottles', status:'Depleted',   ngoName:'ChildFirst India',       wardId:12, wardName:'Ward 12 - Charminar',  isDonated:false, dispatchLogs:[], createdAt:'2026-02-10T11:00:00Z' },
  { id:'r-12', name:'Reading Books & Kits',    category:'Education', quantity:150,  unit:'Kits',    status:'Dispatched', ngoName:'EduReach Foundation',    wardId:3,  wardName:'Ward 3 - Ameerpet',    isDonated:false, dispatchLogs:[], createdAt:'2026-02-12T08:00:00Z' },
];

// ─── Add Resource Payload ─────────────────────────────────
export interface AddResourcePayload {
  name: string;
  category: ResourceCategory;
  quantity: number;
  unit: ResourceUnit;
  description?: string;
  ngoName: string;
  contactPerson?: string;
  contactNumber?: string;
  wardId: number;
  wardName: string;
  storageLocation?: string;
  status: ResourceStatus;
  expiryDate?: string;
  notes?: string;
}

// ─── Donate Payload ───────────────────────────────────────
export interface DonateResourcePayload {
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
  wardId: number;
  wardName: string;
}

// ─── Dispatch Payload ─────────────────────────────────────
export interface DispatchPayload {
  dispatchedTo: string;
  quantity: number;
  volunteer: string;
  dateTime: string;
  vehicle?: string;
  notes?: string;
  priority: DispatchPriority;
}

// ─── Store State ──────────────────────────────────────────
interface ResourceStoreState {
  resources: Resource[];
  donations: Donation[];

  // Actions
  addResource:     (payload: AddResourcePayload)              => void;
  donateResource:  (payload: DonateResourcePayload)           => void;
  dispatchResource:(id: string, dispatch: DispatchPayload)    => void;

  // Selectors
  availableCount:  () => number;
  dispatchedCount: () => number;
  reservedCount:   () => number;
  depletedCount:   () => number;
}

export const useResourceStore = create<ResourceStoreState>((set, get) => ({
  resources: INITIAL_RESOURCES,
  donations: [],

  // ── Add Resource ────────────────────────────────────────
  addResource: (payload) => {
    const newResource: Resource = {
      id: `r-${Date.now()}`,
      ...payload,
      isDonated: false,
      dispatchLogs: [],
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ resources: [newResource, ...s.resources] }));
  },

  // ── Donate Resource ─────────────────────────────────────
  donateResource: (payload) => {
    const ts = Date.now();
    // Create a Donation record
    const donation: Donation = {
      id: `don-${ts}`,
      donorName:          payload.donorName,
      donorEmail:         payload.donorEmail,
      donorPhone:         payload.donorPhone,
      donorType:          payload.donorType,
      orgName:            payload.orgName,
      resourceName:       payload.resourceName,
      category:           payload.category,
      quantity:           payload.quantity,
      unit:               payload.unit,
      condition:          payload.condition,
      description:        payload.description,
      pickupDate:         payload.pickupDate,
      pickupAddress:      payload.pickupAddress,
      deliveryPreference: payload.deliveryPreference,
      targetWard:         payload.targetWard,
      createdAt:          new Date(ts).toISOString(),
    };
    // Also create a Resource card with isDonated = true
    const newResource: Resource = {
      id: `r-${ts}`,
      name:          payload.resourceName,
      category:      payload.category,
      quantity:      payload.quantity,
      unit:          payload.unit,
      description:   payload.description,
      ngoName:       payload.donorType === 'Organization' && payload.orgName
                       ? payload.orgName
                       : payload.donorName,
      wardId:        payload.wardId,
      wardName:      payload.wardName,
      status:        'Available',
      isDonated:     true,
      donorName:     payload.donorName,
      donorCondition:payload.condition,
      dispatchLogs:  [],
      createdAt:     new Date(ts).toISOString(),
    };
    set((s) => ({
      donations: [donation, ...s.donations],
      resources: [newResource, ...s.resources],
    }));
  },

  // ── Dispatch Resource ───────────────────────────────────
  dispatchResource: (id, dispatch) => {
    const log: DispatchLog = {
      id: `dl-${Date.now()}`,
      ...dispatch,
    };
    set((s) => ({
      resources: s.resources.map((r) => {
        if (r.id !== id) return r;
        const remaining = Math.max(0, r.quantity - dispatch.quantity);
        return {
          ...r,
          quantity:     remaining,
          status:       (remaining === 0 ? 'Dispatched' : r.status) as ResourceStatus,
          dispatchLogs: [log, ...r.dispatchLogs],
        };
      }),
    }));
  },

  // ── Selectors ───────────────────────────────────────────
  availableCount:  () => get().resources.filter((r) => r.status === 'Available').length,
  dispatchedCount: () => get().resources.filter((r) => r.status === 'Dispatched').length,
  reservedCount:   () => get().resources.filter((r) => r.status === 'Reserved').length,
  depletedCount:   () => get().resources.filter((r) => r.status === 'Depleted').length,
}));
