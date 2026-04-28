import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Package, Search, Truck, Heart,
  Droplets, UtensilsCrossed, HeartPulse, Home, BookOpen, Box,
} from 'lucide-react';
import { wards } from '../data/mockData';
import { useResourceStore } from '../store/resourceStore';
import type { Resource, ResourceCategory } from '../types';
import AddResourcePanel from '../components/panels/AddResourcePanel';
import DonateResourcePanel from '../components/panels/DonateResourcePanel';
import DispatchModal from '../components/modals/DispatchModal';
import ResourceDetailsPanel from '../components/panels/ResourceDetailsPanel';

// ─── Constants ────────────────────────────────────────────
const CATEGORIES: ResourceCategory[] = ['Food','Water','Medical','Shelter','Education','Other'];

const categoryIcons: Record<string, React.ReactNode> = {
  Food:      <UtensilsCrossed className="w-4 h-4" />,
  Water:     <Droplets className="w-4 h-4" />,
  Medical:   <HeartPulse className="w-4 h-4" />,
  Shelter:   <Home className="w-4 h-4" />,
  Education: <BookOpen className="w-4 h-4" />,
  Other:     <Box className="w-4 h-4" />,
};

const statusColors: Record<string, { text: string; bg: string; border: string }> = {
  Available: { text: '#4AAF85', bg: '#101F18', border: '#4AAF8540' },
  Reserved:  { text: '#C9A84C', bg: '#1A1A10', border: '#C9A84C40' },
  Dispatched:{ text: '#6C63FF', bg: '#1A1A2E', border: '#6C63FF40' },
  Depleted:  { text: '#E05555', bg: '#1F1010', border: '#E0555540' },
};

// ─── Page ─────────────────────────────────────────────────
export default function Resources() {
  // Panels/Modals state
  const [showAdd,     setShowAdd]     = useState(false);
  const [showDonate,  setShowDonate]  = useState(false);
  const [dispatchRes, setDispatchRes] = useState<Resource | null>(null);
  const [detailsRes,  setDetailsRes]  = useState<Resource | null>(null);

  // Filters
  const [search,    setSearch]    = useState('');
  const [catFilter, setCatFilter] = useState<'All' | ResourceCategory>('All');

  // Store
  const { resources, availableCount, dispatchedCount, reservedCount, depletedCount } = useResourceStore();

  const filtered = useMemo(() =>
    resources.filter(r => {
      if (catFilter !== 'All' && r.category !== catFilter) return false;
      const q = search.toLowerCase();
      if (q && !r.name.toLowerCase().includes(q) && !r.ngoName.toLowerCase().includes(q)) return false;
      return true;
    }),
  [resources, catFilter, search]);

  // KPI counts (reactive from store)
  const kpis = [
    { label: 'Total Items',  value: resources.length,   color: '#F0F0F5' },
    { label: 'Available',    value: availableCount(),    color: '#4AAF85' },
    { label: 'Dispatched',   value: dispatchedCount(),   color: '#6C63FF' },
    { label: 'Reserved',     value: reservedCount(),     color: '#C9A84C' },
  ];

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* Title row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[20px] font-semibold text-[#F0F0F5]">Resource Inventory</h1>
          <p className="text-[12px] text-[#55556A]">Track and dispatch crisis response resources across wards</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Donate button */}
          <button
            onClick={() => setShowDonate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-[6px] border border-[#6C63FF] text-[#6C63FF] text-[13px] font-medium hover:bg-[#6C63FF] hover:text-white transition-colors"
          >
            <Heart className="w-4 h-4" /> Donate
          </button>
          {/* Add Resource button */}
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-[6px] bg-[#6C63FF] text-white text-[13px] font-medium hover:bg-[#5a52d9] transition-colors"
          >
            <Package className="w-4 h-4" /> Add Resource
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#111118] border border-[#1E1E2E] rounded-[8px] p-[16px_20px]">
            <div className="text-[11px] text-[#55556A] uppercase tracking-[0.06em] mb-2">{k.label}</div>
            <div className="text-[26px] font-semibold" style={{ color: k.color }}>{k.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#55556A]" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search resources or NGOs…"
            className="w-full pl-9 pr-3 py-2 rounded-[6px] border border-[#1E1E2E] bg-[#111118] text-[13px] text-[#F0F0F5] placeholder-[#55556A] focus:border-[#6C63FF] transition-colors outline-none" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['All', ...CATEGORIES] as const).map(cat => (
            <button key={cat} onClick={() => setCatFilter(cat)}
              className={`px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-colors border flex items-center gap-1.5 ${
                catFilter === cat
                  ? 'bg-[#1E1E2E] text-[#F0F0F5] border-[#6C63FF]'
                  : 'bg-[#111118] border-[#1E1E2E] text-[#8A8A9A] hover:bg-[#1E1E2E]'}`}>
              {cat !== 'All' && categoryIcons[cat]}{cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((resource, i) => {
          const sc = statusColors[resource.status] || statusColors.Available;
          return (
            <motion.div key={resource.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-[#111118] border border-[#1E1E2E] rounded-[8px] p-5 hover:border-[#2A2A40] transition-colors flex flex-col">
              {/* Card header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-[6px] bg-[#1E1E2E] flex items-center justify-center text-[#8A8A9A] shrink-0">
                    {categoryIcons[resource.category] || <Box className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-[13px] font-semibold text-[#F0F0F5] truncate">{resource.name}</h3>
                      {resource.isDonated && (
                        <span title="Donated" style={{ fontSize:10, color:'#6C63FF' }}>💜</span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#55556A] truncate">{resource.ngoName}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-semibold border shrink-0 ml-2"
                  style={{ backgroundColor: sc.bg, color: sc.text, borderColor: sc.border }}>
                  {resource.status}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#0A0A0F] border border-[#1E1E2E] rounded-[4px] p-2.5 text-center">
                  <div className="text-[18px] font-semibold text-[#F0F0F5]">{resource.quantity}</div>
                  <div className="text-[10px] text-[#55556A] uppercase tracking-wider">{resource.unit}</div>
                </div>
                <div className="bg-[#0A0A0F] border border-[#1E1E2E] rounded-[4px] p-2.5 text-center">
                  <div className="text-[12px] font-medium text-[#8A8A9A] truncate">{resource.wardName.split(' - ')[0]}</div>
                  <div className="text-[10px] text-[#55556A] uppercase tracking-wider">Location</div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => setDispatchRes(resource)}
                  disabled={resource.status !== 'Available' || resource.quantity === 0}
                  className={`flex-1 py-1.5 rounded-[4px] text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    resource.status === 'Available' && resource.quantity > 0
                      ? 'bg-[#6C63FF] text-white hover:bg-[#5a52d9]'
                      : 'bg-[#1E1E2E] text-[#55556A] cursor-not-allowed'}`}>
                  <Truck className="w-3.5 h-3.5" /> Dispatch
                </button>
                <button onClick={() => setDetailsRes(resource)}
                  className="flex-1 py-1.5 rounded-[4px] border border-[#2A2A40] text-[#8A8A9A] text-[12px] font-medium hover:bg-[#1E1E2E] hover:text-[#F0F0F5] transition-colors">
                  Details
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="w-12 h-12 text-[#2A2A40] mb-4" />
          <p className="text-[15px] text-[#8A8A9A] mb-1">No resources found</p>
          <p className="text-[12px] text-[#55556A]">Try adjusting your search or filters</p>
        </div>
      )}

      {/* ── Panels / Modals ─────────────────────────── */}
      <AddResourcePanel    open={showAdd}    onClose={() => setShowAdd(false)} />
      <DonateResourcePanel open={showDonate} onClose={() => setShowDonate(false)} />
      <DispatchModal       resource={dispatchRes} onClose={() => setDispatchRes(null)} />
      <ResourceDetailsPanel resource={detailsRes} onClose={() => setDetailsRes(null)} />
    </div>
  );
}
