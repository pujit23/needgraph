import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Phone, Mail, MapPin, X, ExternalLink, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { wards, wardCoords } from '../data/mockData';
import CollaborateModal from '../components/CollaborateModal';

const mockNGOs = [
  { id: 1, name: 'Aashray Foundation', focus: ['Food', 'Child Welfare'], wards: [12, 7, 3], volunteers: 45, resolved: 82, status: 'Active',
    contact: '+91 98765 43210', email: 'hello@aashray.org', desc: 'Providing basic nutrition and shelter for street children.' },
  { id: 2, name: 'Sanjivani Health', focus: ['Healthcare', 'Women Safety'], wards: [5, 9, 2], volunteers: 32, resolved: 64, status: 'Active',
    contact: '+91 98765 43211', email: 'care@sanjivani.in', desc: 'Mobile health clinics focused on maternal health.' },
  { id: 3, name: 'Vidya Vikas Trust', focus: ['Education', 'Child Welfare'], wards: [1, 4, 15], volunteers: 28, resolved: 41, status: 'Active',
    contact: '+91 98765 43212', email: 'edu@vidyavikas.org', desc: 'Bridging the education gap for out-of-school children.' },
  { id: 4, name: 'Jal Suraksha Abhiyan', focus: ['Water', 'Sanitation'], wards: [11, 16, 20], volunteers: 15, resolved: 29, status: 'Active',
    contact: '+91 98765 43213', email: 'water@jalsuraksha.org', desc: 'Ensuring clean drinking water access in slums.' },
  { id: 5, name: 'Nari Shakti Collective', focus: ['Women Safety', 'Legal Aid'], wards: [12, 7, 8], volunteers: 52, resolved: 110, status: 'Active',
    contact: '+91 98765 43214', email: 'support@narishakti.in', desc: 'Legal and emotional support for domestic violence survivors.' },
  { id: 6, name: 'Kisan Rahat Samiti', focus: ['Food', 'Livelihood'], wards: [19, 20], volunteers: 18, resolved: 22, status: 'Inactive',
    contact: '+91 98765 43215', email: 'rahat@kisan.org', desc: 'Supporting migrant farmers and rural poor.' },
  { id: 7, name: 'Mental Health India', focus: ['Mental Health', 'Healthcare'], wards: [3, 5, 6], volunteers: 40, resolved: 95, status: 'Active',
    contact: '+91 98765 43216', email: 'help@mhi.org', desc: 'Free counseling services and suicide prevention.' },
  { id: 8, name: 'Yuva Skill Center', focus: ['Livelihood', 'Education'], wards: [8, 9, 10], volunteers: 25, resolved: 53, status: 'Active',
    contact: '+91 98765 43217', email: 'skills@yuva.in', desc: 'Vocational training for unemployed youth.' },
  { id: 9, name: 'Annabrahma Trust', focus: ['Food'], wards: [12, 13, 14], volunteers: 60, resolved: 150, status: 'Active',
    contact: '+91 98765 43218', email: 'feed@annabrahma.org', desc: 'Running daily community kitchens.' },
  { id: 10, name: 'Swaastha Mission', focus: ['Healthcare'], wards: [1, 2, 17], volunteers: 22, resolved: 48, status: 'Active',
    contact: '+91 98765 43219', email: 'mission@swaastha.in', desc: 'Primary healthcare centers for urban poor.' },
  { id: 11, name: 'Udaan Foundation', focus: ['Education'], wards: [4, 5], volunteers: 12, resolved: 18, status: 'Inactive',
    contact: '+91 98765 43220', email: 'fly@udaan.org', desc: 'After-school tutoring.' },
  { id: 12, name: 'Clean City Initiative', focus: ['Sanitation', 'Water'], wards: [7, 18], volunteers: 35, resolved: 76, status: 'Active',
    contact: '+91 98765 43221', email: 'clean@city.in', desc: 'Community cleanliness and disease prevention.' },
  { id: 13, name: 'Safe Haven Homes', focus: ['Child Welfare', 'Housing'], wards: [15, 16], volunteers: 10, resolved: 12, status: 'Active',
    contact: '+91 98765 43222', email: 'home@safehaven.org', desc: 'Orphanage and foster care support.' },
  { id: 14, name: 'Disha Guidance', focus: ['Mental Health', 'Livelihood'], wards: [3, 9, 11], volunteers: 20, resolved: 33, status: 'Active',
    contact: '+91 98765 43223', email: 'guide@disha.in', desc: 'Career counseling and mental health support.' },
  { id: 15, name: 'Aarogya Seva', focus: ['Healthcare', 'Child Welfare'], wards: [6, 10, 12], volunteers: 48, resolved: 105, status: 'Active',
    contact: '+91 98765 43224', email: 'seva@aarogya.org', desc: 'Pediatric care and vaccination drives.' },
];

export default function NGODirectory() {
  const [search, setSearch] = useState('');
  const [focusFilter, setFocusFilter] = useState('All');
  const [selectedNGO, setSelectedNGO] = useState<any>(null);
  const [collaboratingNGO, setCollaboratingNGO] = useState<any>(null);

  const filteredNGOs = useMemo(() => {
    return mockNGOs.filter(ngo => {
      const matchSearch = ngo.name.toLowerCase().includes(search.toLowerCase());
      const matchFocus = focusFilter === 'All' || ngo.focus.includes(focusFilter);
      return matchSearch && matchFocus;
    });
  }, [search, focusFilter]);

  const allFocusAreas = ['All', ...new Set(mockNGOs.flatMap(n => n.focus))].sort();

  // Mock performance data for chart
  const performanceData = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => ({
      month: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'][i],
      resolved: Math.floor(Math.random() * 30) + 10
    }));
  }, [selectedNGO]);

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#0A0A0F]">
      <div className="flex-1 flex flex-col h-full pl-6 overflow-hidden">
        {/* Top Bar */}
        <div className="pt-6 pb-4 pr-6 flex items-center justify-between gap-4 border-b border-[#1E1E2E]">
          <div>
            <h1 className="text-[20px] font-semibold text-[#F0F0F5]">NGO Directory</h1>
            <p className="text-[12px] text-[#55556A]">Discover and collaborate with local partner organizations</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#55556A]" />
              <input 
                type="text" 
                placeholder="Search NGOs..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-[#111118] border border-[#2A2A40] rounded-[6px] text-[13px] text-[#F0F0F5] w-[240px] focus:border-[#6C63FF] transition-colors outline-none"
              />
            </div>
            <select
              value={focusFilter}
              onChange={e => setFocusFilter(e.target.value)}
              className="px-3 py-2 bg-[#111118] border border-[#2A2A40] rounded-[6px] text-[13px] text-[#F0F0F5] outline-none hover:border-[#55556A] transition-colors"
            >
              {allFocusAreas.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto pr-6 py-6 page-animate">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredNGOs.map(ngo => (
              <div key={ngo.id} className="bg-[#111118] border border-[#1E1E2E] rounded-[8px] p-5 flex flex-col hover:border-[#2A2A40] transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-[15px] font-semibold text-[#F0F0F5] line-clamp-1">{ngo.name}</h3>
                  <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-medium ${ngo.status === 'Active' ? 'bg-[#101F18] text-[#4AAF85]' : 'bg-[#1E1E2E] text-[#8A8A9A]'}`}>
                    {ngo.status}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {ngo.focus.map((f, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-[#1A1A2E] text-[#6C63FF] text-[10px] rounded-[4px] border border-[#2A2A40] whitespace-nowrap">
                      {f}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-[12px] text-[#8A8A9A] mb-4">
                  <MapPin className="w-3.5 h-3.5 text-[#55556A]" />
                  <span>Wards: {ngo.wards.join(', ')}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-5">
                  <div className="bg-[#0A0A0F] border border-[#1E1E2E] rounded-[4px] p-2 text-center">
                    <div className="text-[16px] font-semibold text-[#F0F0F5]">{ngo.volunteers}</div>
                    <div className="text-[10px] text-[#55556A] uppercase tracking-wider">Vols</div>
                  </div>
                  <div className="bg-[#0A0A0F] border border-[#1E1E2E] rounded-[4px] p-2 text-center">
                    <div className="text-[16px] font-semibold text-[#F0F0F5]">{ngo.resolved}</div>
                    <div className="text-[10px] text-[#55556A] uppercase tracking-wider">Resolved</div>
                  </div>
                </div>

                <div className="mt-auto flex gap-2">
                  <button onClick={() => setSelectedNGO(ngo)} className="flex-1 py-1.5 rounded-[4px] border border-[#2A2A40] text-[#8A8A9A] text-[12px] font-medium hover:bg-[#1E1E2E] hover:text-[#F0F0F5] transition-colors">
                    View Profile
                  </button>
                  <button onClick={() => setCollaboratingNGO(ngo)} className="flex-1 py-1.5 rounded-[4px] bg-[#6C63FF] text-white text-[12px] font-medium hover:bg-[#5a52d9] transition-colors">
                    Collaborate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide-in Panel */}
      <AnimatePresence>
        {selectedNGO && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-[400px] bg-[#111118] border-l border-[#1E1E2E] flex flex-col h-full shadow-2xl relative z-10 flex-shrink-0"
          >
            <div className="p-5 border-b border-[#1E1E2E] flex justify-between items-start">
              <div>
                <h2 className="text-[18px] font-bold text-[#F0F0F5] mb-1">{selectedNGO.name}</h2>
                <div className="text-[12px] text-[#8A8A9A]">{selectedNGO.desc}</div>
              </div>
              <button onClick={() => setSelectedNGO(null)} className="p-1 rounded hover:bg-[#1E1E2E] text-[#8A8A9A] hover:text-[#F0F0F5]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Contact */}
              <div className="space-y-3 bg-[#0A0A0F] border border-[#1E1E2E] rounded-[6px] p-4">
                <div className="flex items-center gap-3 text-[13px] text-[#F0F0F5]">
                  <Phone className="w-4 h-4 text-[#6C63FF]" /> {selectedNGO.contact}
                </div>
                <div className="flex items-center gap-3 text-[13px] text-[#F0F0F5]">
                  <Mail className="w-4 h-4 text-[#6C63FF]" /> {selectedNGO.email}
                </div>
                <div className="flex items-center gap-3 text-[13px] text-[#6C63FF] hover:underline cursor-pointer">
                  <ExternalLink className="w-4 h-4" /> Visit Website
                </div>
              </div>

              {/* Resolution Rate Chart */}
              <div>
                <h3 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium mb-3">Resolution Rate (Monthly)</h3>
                <div className="h-[160px] bg-[#0A0A0F] border border-[#1E1E2E] rounded-[6px] p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#55556A' }} tickLine={false} axisLine={false} />
                      <YAxis tick={false} axisLine={false} />
                      <Tooltip cursor={{ fill: '#1E1E2E' }} contentStyle={{ backgroundColor: '#111118', border: '1px solid #2A2A40', fontSize: '11px' }} />
                      <Bar dataKey="resolved" fill="#4AAF85" radius={[2,2,0,0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Map */}
              <div>
                <h3 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium mb-3">Ward Coverage</h3>
                <div className="h-[200px] rounded-[6px] overflow-hidden border border-[#1E1E2E]">
                  <MapContainer center={[17.3850, 78.4867]} zoom={11} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                    {selectedNGO.wards.map((wardId: number) => {
                      const latlng = wardCoords[wardId];
                      const wardInfo = wards.find(w => w.id === wardId);
                      if (!latlng) return null;
                      return (
                        <Circle key={wardId} center={[latlng.lat, latlng.lng]} radius={1500} pathOptions={{ color: '#6C63FF', fillColor: '#6C63FF', fillOpacity: 0.2, weight: 1 }} />
                      );
                    })}
                  </MapContainer>
                </div>
              </div>

              {/* Active Needs Sample */}
              <div>
                <h3 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium mb-3">Active Engagements ({selectedNGO.focus[0]})</h3>
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-start gap-3 bg-[#0A0A0F] border border-[#1E1E2E] rounded-[6px] p-3">
                      <div className="w-1.5 h-1.5 bg-[#E05555] rounded-full mt-1.5"></div>
                      <div>
                        <div className="text-[13px] text-[#F0F0F5] mb-0.5">Critical {selectedNGO.focus[0]} Issue</div>
                        <div className="text-[11px] text-[#8A8A9A]">Ward {selectedNGO.wards[i % selectedNGO.wards.length]} • 2 vols deployed</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t border-[#1E1E2E] bg-[#0A0A0F]">
              <button onClick={() => setCollaboratingNGO(selectedNGO)} className="w-full py-2.5 bg-[#6C63FF] hover:bg-[#5a52d9] transition-colors rounded-[6px] text-white font-medium text-[13px]">
                Initiate Collaboration
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CollaborateModal 
        isOpen={!!collaboratingNGO} 
        onClose={() => setCollaboratingNGO(null)} 
        ngo={collaboratingNGO} 
      />
    </div>
  );
}
