import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Circle, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { wards, needs } from '../data/mockData';
import { getNeedTypeIcon, getSeverityColor, formatTimeAgo } from '../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { X, GitCompare } from 'lucide-react';
import { useSubmittedNeedsStore } from '../store';

export default function NeedMap() {
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterNeedType, setFilterNeedType] = useState('All');
  const { submittedNeeds } = useSubmittedNeedsStore();
  
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [wardA, setWardA] = useState('Ward 1');
  const [wardB, setWardB] = useState('Ward 12');

  const wardDetails = useMemo(() => {
    return wards.map(ward => {
      const wardNeeds = needs.filter(n => n.wardId === ward.id && (n.status === 'Active' || n.status === 'Assigned'));
      const maxSeverity = wardNeeds.length > 0 ? Math.max(...wardNeeds.map(n => n.severity)) : 0;
      
      let urgency = 'Low';
      if (maxSeverity >= 80) urgency = 'Critical';
      else if (maxSeverity >= 60) urgency = 'High';
      else if (maxSeverity >= 40) urgency = 'Medium';
      
      const severityLower = urgency.toLowerCase();
      
      return {
        ...ward,
        wardNeeds: wardNeeds.sort((a, b) => b.severity - a.severity).slice(0, 3), // Top 3
        maxSeverity,
        urgency,
        severityLower,
        totalAffected: wardNeeds.reduce((sum, n) => sum + n.affectedCount, 0),
      };
    });
  }, []);

  const filteredWards = wardDetails.filter(w => {
    if (w.maxSeverity === 0) return false;
    if (filterSeverity === 'Critical' && w.urgency !== 'Critical') return false;
    if (filterSeverity === 'High' && w.urgency !== 'High' && w.urgency !== 'Critical') return false;
    if (filterNeedType !== 'All' && !w.wardNeeds.some(n => n.needType === filterNeedType)) return false;
    return true;
  });

  const getMockTrend = (wardName: string) => {
    // Generate deterministic but random-looking data based on ward string length/chars
    const seed = wardName.length + (wardName.charCodeAt(0) || 0);
    return Array.from({ length: 30 }).map((_, i) => ({
      day: i + 1,
      severity: Math.min(100, Math.max(10, 40 + Math.sin(i * 0.3 + seed) * 30 + Math.random() * 20))
    }));
  };

  const trendA = useMemo(() => getMockTrend(wardA), [wardA]);
  const trendB = useMemo(() => getMockTrend(wardB), [wardB]);

  return (
    <div className="flex flex-col h-full bg-[#111118] border border-[#1E1E2E] rounded-[8px] overflow-hidden relative page-animate">
      <div className="p-4 border-b border-[#1E1E2E] bg-[#0A0A0F] flex items-center justify-between shadow-sm z-10">
        <h3 className="text-[12px] text-[#F0F0F5] uppercase tracking-[0.08em] font-semibold">Live Geospatial Need Map</h3>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCompareOpen(true)}
            className="flex items-center gap-2 bg-[#1A1A2E] hover:bg-[#2A2A40] text-[#6C63FF] px-3 py-1.5 rounded-[4px] text-[12px] font-medium border border-[#2A2A40] transition-colors"
          >
            <GitCompare className="w-3.5 h-3.5" /> Compare Wards
          </button>

          <select 
            value={filterSeverity} 
            onChange={e => setFilterSeverity(e.target.value)}
            className="bg-[#111118] border border-[#1E1E2E] text-[#8A8A9A] px-3 py-1.5 rounded-[4px] text-[12px] outline-none"
          >
            <option value="All">All Severity</option>
            <option value="Critical">Critical Only</option>
            <option value="High">High Risk & Above</option>
          </select>
          
          <select 
            value={filterNeedType} 
            onChange={e => setFilterNeedType(e.target.value)}
            className="bg-[#111118] border border-[#1E1E2E] text-[#8A8A9A] px-3 py-1.5 rounded-[4px] text-[12px] outline-none"
          >
            <option value="All">All Need Types</option>
            <option value="Food Insecurity">Food Insecurity</option>
            <option value="Healthcare">Healthcare</option>
            <option value="School Dropout">School Dropout</option>
          </select>
        </div>
      </div>

      <div className="flex-1 relative map-container-wrapper rounded-none border-x-0 border-b-0 m-0 z-0">
        <MapContainer center={[17.3850, 78.4867]} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={true}>
          <TileLayer 
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          {filteredWards.map((ward) => {
            const pathOptions = {
              fillColor: ward.severityLower === 'critical' ? '#E05555' :
                         ward.severityLower === 'high'     ? '#D4874A' :
                         ward.severityLower === 'medium'   ? '#C9A84C' : '#4AAF85',
              color: ward.severityLower === 'critical' ? '#C03030' :
                     ward.severityLower === 'high'     ? '#B06020' :
                     ward.severityLower === 'medium'   ? '#A08030' : '#2A9060',
              weight: 2,
              fillOpacity: 0.75,
              className: ward.severityLower === 'critical' ? 'pulse-critical' : ''
            };

            return (
              <Circle
                key={ward.id}
                center={[ward.lat, ward.lng]}
                radius={Math.max(8, ward.totalAffected / 40) * 10}
                pathOptions={pathOptions}
              >
                <Tooltip permanent direction="top" className="text-[10px] font-bold bg-transparent border-none text-white shadow-none">{ward.name.split(' - ')[0]}</Tooltip>
                <Popup className="dark-popup min-w-[240px]">
                  <div className="font-sans text-[#F0F0F5]">
                    <div className="font-bold text-[14px] mb-1">{ward.name}</div>
                    <div className="text-[11px] text-[#E05555] font-semibold mb-3 tracking-wide">
                      MAX SEVERITY: {ward.maxSeverity}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="text-[10px] text-[#8A8A9A] uppercase tracking-wider">Top Needs</div>
                      {ward.wardNeeds.map((need, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[12px] bg-[#1A1A2E] px-2 py-1.5 rounded">
                          <span className="flex items-center gap-1.5">
                            {getNeedTypeIcon(need.needType)} {need.needType}
                          </span>
                          <span className="font-bold" style={{
                            color: need.severity >= 80 ? '#E05555' : need.severity >= 60 ? '#D4874A' : '#4AAF85'
                          }}>{need.severity}</span>
                        </div>
                      ))}
                    </div>
                    
                    {ward.wardNeeds[0]?.needType === 'Food Insecurity' && (
                      <div className="mb-4 bg-[#1F1010] p-2 border border-[#E05555]/30 rounded-[4px]">
                        <div className="text-[10px] font-bold text-[#E05555] mb-0.5">CASCADE PREDICTION</div>
                        <div className="text-[11px] text-[#F0F0F5]">Leads to Child Malnutrition (88% conf)</div>
                      </div>
                    )}
                    
                    <button className="w-full bg-[#6C63FF] hover:bg-[#5a52d9] transition-colors text-white py-2 rounded-[4px] text-[12px] font-medium">
                      Dispatch Volunteers
                    </button>
                  </div>
                </Popup>
              </Circle>
            );
          })}

          {/* ── Live Submitted Need Pins ────────────── */}
          {submittedNeeds.map((sn) => {
            const sevColor = getSeverityColor(sn.severityScore);
            const borderColor = sn.severityScore >= 70 ? '#C03030' : sn.severityScore >= 40 ? '#B06020' : '#2A9060';
            return (
              <CircleMarker
                key={sn.id}
                center={[sn.location.lat, sn.location.lng]}
                radius={6 + Math.min(sn.peopleAffected / 100, 6)}
                pathOptions={{
                  fillColor: sevColor,
                  color: borderColor,
                  weight: 2.5,
                  fillOpacity: 0.9,
                  className: sn.severityScore >= 70 ? 'pulse-critical' : '',
                }}
              >
                <Tooltip permanent direction="top" className="text-[10px] font-bold bg-transparent border-none text-white shadow-none">{sn.location.ward.split(' - ')[0]}</Tooltip>
                <Popup className="dark-popup min-w-[260px]">
                  <div className="font-sans text-[#F0F0F5]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[16px]">{getNeedTypeIcon(sn.needType)}</span>
                      <span className="font-bold text-[14px]">{sn.needType}</span>
                      <span
                        className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border"
                        style={{ color: sevColor, borderColor: sevColor, background: `${sevColor}22` }}
                      >
                        {sn.urgency.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-1.5 mb-3 text-[12px]">
                      <div className="flex justify-between">
                        <span className="text-[#8A8A9A]">Severity</span>
                        <span className="font-bold" style={{ color: sevColor }}>{sn.severityScore}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8A8A9A]">People Affected</span>
                        <span className="font-medium text-[#F0F0F5]">{sn.peopleAffected.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8A8A9A]">Location</span>
                        <span className="font-medium text-[#F0F0F5] text-right max-w-[140px] truncate">{sn.location.ward.split(' - ')[0]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8A8A9A]">Submitted by</span>
                        <span className="font-medium text-[#F0F0F5]">{sn.submitterName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8A8A9A]">Time</span>
                        <span className="text-[#55556A]">{formatTimeAgo(sn.submittedAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1E1E2E] text-[#4AAF85] border border-[#4AAF85]/30 uppercase">
                        {sn.status}
                      </span>
                      <span className="text-[10px] text-[#55556A] font-mono">{sn.referenceId}</span>
                    </div>

                    <button className="w-full bg-[#6C63FF] hover:bg-[#5a52d9] transition-colors text-white py-2 rounded-[4px] text-[12px] font-medium">
                      Assign Volunteer
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
        
        {/* Legend */}
        <div className="absolute bottom-6 left-6 z-[1000] bg-[#111118] border border-[#1E1E2E] p-3 rounded-[6px] shadow-xl">
          <div className="text-[10px] text-[#8A8A9A] uppercase tracking-wider mb-2 font-medium">Severity Scale</div>
          <div className="space-y-2 text-[12px] text-[#F0F0F5]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#E05555] inline-block shadow-[0_0_8px_rgba(224,85,85,0.5)] border border-[#C03030]"></span> Critical (&ge; 80)
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#D4874A] inline-block border border-[#B06020]"></span> High (60-79)
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#C9A84C] inline-block border border-[#A08030]"></span> Medium (40-59)
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#4AAF85] inline-block border border-[#2A9060]"></span> Low (&lt; 40)
            </div>
          </div>
        </div>
      </div>

      {/* Feature 5: Ward Compare Panel */}
      <AnimatePresence>
        {isCompareOpen && (
          <motion.div 
            initial={{ y: 320 }}
            animate={{ y: 0 }}
            exit={{ y: 320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 h-[320px] bg-[#111118] border-t border-[#1E1E2E] z-[2000] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E1E2E] bg-[#0A0A0F]">
              <div className="flex items-center gap-2 text-[#F0F0F5] font-semibold text-[15px]">
                <GitCompare className="w-4 h-4 text-[#6C63FF]" /> Ward Comparison Tool
              </div>
              <button onClick={() => setIsCompareOpen(false)} className="text-[#8A8A9A] hover:text-[#F0F0F5]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 grid grid-cols-3 divide-x divide-[#1E1E2E] overflow-hidden">
              <div className="col-span-2 flex flex-col bg-[#0A0A0F]">
                <div className="grid grid-cols-[1.5fr_1fr_40px_1fr] bg-[#111118] border-b border-[#1E1E2E]">
                  <div className="p-3 text-[11px] font-medium text-[#55556A] uppercase tracking-wider">Metric</div>
                  <div className="p-3">
                    <select value={wardA} onChange={e => setWardA(e.target.value)} className="bg-[#0A0A0F] border border-[#2A2A40] text-[#F0F0F5] px-2 py-1 rounded-[4px] text-[12px] w-full outline-none focus:border-[#6C63FF]">
                      {wards.map(w => <option key={`A_${w.id}`} value={w.name.split(' - ')[0]}>{w.name.split(' - ')[0]}</option>)}
                    </select>
                  </div>
                  <div className="p-3 flex items-center justify-center text-[#55556A] text-[11px]">VS</div>
                  <div className="p-3">
                    <select value={wardB} onChange={e => setWardB(e.target.value)} className="bg-[#0A0A0F] border border-[#2A2A40] text-[#F0F0F5] px-2 py-1 rounded-[4px] text-[12px] w-full outline-none focus:border-[#6C63FF]">
                      {wards.map(w => <option key={`B_${w.id}`} value={w.name.split(' - ')[0]}>{w.name.split(' - ')[0]}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {[
                    { m: 'Total needs', a: 12, b: 7, type: 'num', inv: false },
                    { m: 'Avg severity', a: 78, b: 52, type: 'num', inv: false },
                    { m: 'People affected', a: 1240, b: 670, type: 'num', inv: false },
                    { m: 'Volunteers', a: 8, b: 14, type: 'num', inv: true },
                    { m: 'Top need', a: 'Food Insecurity', b: 'School Dropout', type: 'str' },
                    { m: 'Risk trend', a: '↑ Rising', b: '→ Stable', type: 'str' },
                  ].map((row, i) => (
                    <div key={i} className="grid grid-cols-[1.5fr_1fr_40px_1fr] border-b border-[#1E1E2E] hover:bg-[#111118] transition-colors">
                      <div className="px-3 py-2.5 text-[12px] text-[#8A8A9A]">{row.m}</div>
                      <div className="px-3 py-2.5 text-[13px] font-medium text-[#F0F0F5]">{row.a}</div>
                      <div className="px-3 py-2.5 flex items-center justify-center text-[12px] font-bold text-[#55556A]">
                        {row.type === 'num' ? (row.a > row.b ? (row.inv ? '<' : '>') : (row.a < row.b ? (row.inv ? '>' : '<') : '=')) : ''}
                      </div>
                      <div className="px-3 py-2.5 text-[13px] font-medium text-[#F0F0F5]">{row.b}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-1 bg-[#111118] p-4 flex flex-col">
                <div className="text-[11px] font-medium text-[#55556A] uppercase tracking-wider mb-2">30-Day Trends</div>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
                      <XAxis dataKey="day" tick={false} axisLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#55556A' }} axisLine={false} tickLine={false} />
                      <RechartsTooltip contentStyle={{ background: '#1E1E2E', border: '1px solid #2A2A40', borderRadius: '4px', fontSize: '12px' }} />
                      <Line data={trendA} dataKey="severity" name={wardA} stroke="#E05555" strokeWidth={2} dot={false} isAnimationActive={false} />
                      <Line data={trendB} dataKey="severity" name={wardB} stroke="#6C63FF" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <button className="w-full mt-4 py-2 bg-[#6C63FF] hover:bg-[#5a52d9] transition-colors text-white rounded-[6px] text-[13px] font-medium">
                  Deploy Resources to {wardA}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
