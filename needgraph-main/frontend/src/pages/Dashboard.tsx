import { useMemo, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Popup, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Settings2, Eye, EyeOff } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { wards, needs, alerts, trendData, volunteers } from '../data/mockData';
import { getUrgencyColor, getSeverityColor, formatTimeAgo, getNeedTypeIcon, getMarkerRadius } from '../utils/helpers';
import { useSubmittedNeedsStore } from '../store';


const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1E1E2E] border border-[#2A2A40] text-[#F0F0F5] rounded-md p-3 text-[12px] shadow-lg">
      <div className="font-semibold text-[#8A8A9A] mb-1.5">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span>{p.name}:</span>
          <span className="font-semibold text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const activeNeedsCount = needs.filter(n => n.status === 'Active').length;
  const criticalNeedsCount = needs.filter(n => n.severity >= 80).length;
  const activeVolunteersCount = volunteers.filter(v => v.status === 'Deployed').length;
  const resolvedNeedsCount = needs.filter(n => n.status === 'Resolved').length;

  const { submittedNeeds, recentSubmissions } = useSubmittedNeedsStore();
  const recent5 = recentSubmissions(5);

  const sparklineData = trendData.slice(-7);

  const [activeAlerts, setActiveAlerts] = useState(alerts);
  const [totalNeeds, setTotalNeeds] = useState(activeNeedsCount);
  const [isFlashing, setIsFlashing] = useState(false);

  // FEATURE 4: Real-Time Alert Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalNeeds(prev => prev + 1);
      setIsFlashing(true);
      
      const newAlert = {
        id: `alert-live-${Date.now()}`,
        needId: `need-live-${Date.now()}`,
        wardId: Math.floor(Math.random() * 20) + 1,
        wardName: `Ward ${Math.floor(Math.random() * 20) + 1} - Live`,
        needType: 'Food Insecurity' as any,
        severity: 95,
        affectedCount: 150,
        urgency: 'Critical' as any,
        status: 'Active' as any,
        detectedAt: new Date().toISOString(),
      };
      
      setActiveAlerts(prev => [newAlert, ...prev]);

      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
        setTimeout(() => ctx.close(), 500);
      } catch(e) { /* silent */ }
      
      setTimeout(() => setIsFlashing(false), 1000);
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  // FEATURE 10: Customizable Dashboard Layout
  const [isEditingLayout, setIsEditingLayout] = useState(false);
  const customizeRef = useRef<HTMLDivElement>(null);
  const [widgets, setWidgets] = useState({
    kpis: true,
    map: true,
    feed: true,
    trends: true,
    barchart: true,
  });

  const toggleWidget = (w: keyof typeof widgets) => setWidgets(prev => ({ ...prev, [w]: !prev[w] }));

  useEffect(() => {
    if (!isEditingLayout) return;
    const handler = (e: MouseEvent) => {
      if (customizeRef.current && !customizeRef.current.contains(e.target as Node)) {
        setIsEditingLayout(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isEditingLayout]);

  const wardDistribution = useMemo(() => {
    return wards.map(ward => {
      const wardNeeds = needs.filter(n => n.wardId === ward.id && n.status === 'Active');
      const critical = wardNeeds.filter(n => n.severity >= 80).length;
      const high = wardNeeds.filter(n => n.severity >= 60 && n.severity < 80).length;
      const total = wardNeeds.length;
      return { name: ward.name.split(' - ')[0], critical, high, total };
    }).sort((a, b) => b.total - a.total).slice(0, 8);
  }, []);

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between relative">
        <div>
          <h1 className="text-[20px] font-semibold text-[#F0F0F5]">Command Center</h1>
          <div className="text-[12px] text-[#55556A]">Last updated: just now</div>
        </div>
        <div ref={customizeRef} className="relative">
          <button 
            onClick={() => setIsEditingLayout(!isEditingLayout)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-colors border ${isEditingLayout ? 'bg-[#1E1E2E] text-[#F0F0F5] border-[#6C63FF]' : 'bg-[#111118] text-[#8A8A9A] border-[#1E1E2E] hover:text-[#F0F0F5]'}`}
          >
            <Settings2 className="w-4 h-4" /> Customize
          </button>

          <AnimatePresence>
            {isEditingLayout && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-full mt-2 w-[240px] bg-[#111118] border border-[#2A2A40] rounded-[6px] shadow-xl z-50 p-3"
              >
                <div className="text-[11px] font-medium text-[#55556A] uppercase tracking-[0.08em] mb-3 border-b border-[#1E1E2E] pb-2">Toggle Widgets</div>
                <div className="space-y-2">
                  {[
                    { id: 'kpis', label: 'Key Performance Indicators' },
                    { id: 'map', label: 'Live District Map' },
                    { id: 'feed', label: 'Priority Alerts' },
                    { id: 'trends', label: '30-Day Trends' },
                    { id: 'barchart', label: 'Needs By Ward' },
                  ].map(w => (
                    <button 
                      key={w.id}
                      onClick={() => toggleWidget(w.id as any)}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-[4px] hover:bg-[#1A1A2E] text-left transition-colors"
                    >
                      <span className={`text-[12px] ${widgets[w.id as keyof typeof widgets] ? 'text-[#F0F0F5]' : 'text-[#55556A]'}`}>{w.label}</span>
                      {widgets[w.id as keyof typeof widgets] ? <Eye className="w-3.5 h-3.5 text-[#4AAF85]" /> : <EyeOff className="w-3.5 h-3.5 text-[#55556A]" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {widgets.kpis && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'TOTAL ACTIVE NEEDS', value: totalNeeds + submittedNeeds.length, trend: '+12%', isNegative: true, dataKey: 'foodInsecurity', flashing: isFlashing },
          { label: 'CRITICAL ALERTS', value: criticalNeedsCount, trend: '+3%', isNegative: true, dataKey: 'healthcare' },
          { label: 'DEPLOYED VOLUNTEERS', value: activeVolunteersCount, trend: '+24%', isNegative: false, dataKey: 'schoolDropout' },
          { label: 'NEEDS RESOLVED', value: resolvedNeedsCount, trend: '+156', isNegative: false, dataKey: 'mentalHealth' },
        ].map((kpi, i) => (
          <div key={i} className={`bg-[#111118] border ${kpi.flashing ? 'border-[#4AAF85] shadow-[0_0_15px_rgba(74,175,133,0.3)] transition-all duration-300' : 'border-[#1E1E2E]'} rounded-[8px] p-[20px_24px]`}>
            <div className="text-[11px] text-[#55556A] uppercase tracking-[0.06em] mb-3">{kpi.label}</div>
            <div className="flex items-end justify-between">
              <div className="text-[28px] font-semibold text-[#F0F0F5] leading-none">{kpi.value}</div>
              <div
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  kpi.isNegative ? 'bg-[#1F1010] text-[#E05555]' : 'bg-[#101F18] text-[#4AAF85]'
                }`}
              >
                {kpi.trend}
              </div>
            </div>
            <div className="h-[30px] mt-4">
              <ResponsiveContainer width="100%" height={30}>
                <AreaChart data={sparklineData}>
                  <Area type="monotone" dataKey={kpi.dataKey} stroke="#6C63FF" fill="transparent" strokeWidth={2} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>)}

      {/* ── Recent Submissions ─────────────────────── */}
      {recent5.length > 0 && (
        <div className="bg-[#111118] border border-[#1E1E2E] rounded-[8px] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1E1E2E] bg-[#0A0A0F] flex items-center justify-between">
            <h3 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium">Recent Submissions</h3>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4AAF85] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4AAF85]"></span>
            </span>
          </div>
          <div className="divide-y divide-[#1E1E2E]">
            {recent5.map((sn) => {
              const sevColor = getSeverityColor(sn.severityScore);
              return (
                <motion.div
                  key={sn.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-[#1E1E2E] transition-colors"
                >
                  <span className="text-[18px] shrink-0">{getNeedTypeIcon(sn.needType)}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-medium text-[#F0F0F5]">{sn.needType}</span>
                    <span className="text-[12px] text-[#55556A] ml-2">{sn.location.ward.split(' - ')[0]}</span>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0"
                    style={{ color: sevColor, borderColor: sevColor, background: `${sevColor}18` }}
                  >
                    {sn.urgency.toUpperCase()} · {sn.severityScore}
                  </span>
                  <span className="text-[11px] text-[#55556A] shrink-0">{formatTimeAgo(sn.submittedAt)}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        {widgets.map && (
        <div className={`${widgets.feed ? 'lg:col-span-2' : 'lg:col-span-3'} bg-[#111118] border border-[#1E1E2E] rounded-[8px] overflow-hidden flex flex-col h-[500px]`}>
          <div className="p-4 border-b border-[#1E1E2E] flex justify-between items-center bg-[#111118]">
            <h3 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium">Live District Heat Map</h3>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E05555] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E05555]"></span>
            </span>
          </div>
          <div className="flex-1 bg-[#0A0A0F] map-container-wrapper m-4">
            <MapContainer center={[17.3850, 78.4867]} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false}>
              <TileLayer 
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              {needs.filter(n => n.status === 'Active' || n.status === 'Assigned').map((need) => {
                const ward = wards.find(w => w.id === need.wardId);
                if (!ward) return null;
                
                const severityLower = need.urgency.toLowerCase();
                const pathOptions = {
                  fillColor: severityLower === 'critical' ? '#E05555' :
                             severityLower === 'high'     ? '#D4874A' :
                             severityLower === 'medium'   ? '#C9A84C' : '#4AAF85',
                  color: severityLower === 'critical' ? '#C03030' :
                         severityLower === 'high'     ? '#B06020' :
                         severityLower === 'medium'   ? '#A08030' : '#2A9060',
                  weight: 2,
                  fillOpacity: 0.75,
                  className: severityLower === 'critical' ? 'pulse-critical' : ''
                };

                return (
                  <CircleMarker
                    key={need.id}
                    center={[ward.lat, ward.lng]}
                    radius={4 + Math.min(need.affectedCount / 100, 6)}
                    pathOptions={pathOptions}
                  >
                    <Tooltip permanent direction="top" className="text-[10px] font-bold bg-transparent border-none text-white shadow-none">{ward.name.split(' - ')[0]}</Tooltip>
                    <Popup className="dark-popup">
                      <div className="font-sans text-[#111118]">
                        <div className="font-bold flex items-center gap-1">
                          {getNeedTypeIcon(need.needType)} {need.needType}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{need.wardName}</div>
                        <div className="text-xs mt-1 font-semibold" style={{ color: getSeverityColor(need.severity) }}>
                          Severity: {need.severity}/100
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </div>)}

        {/* Live Needs Feed */}
        {widgets.feed && (
        <div className={`${widgets.map ? 'lg:col-span-1' : 'lg:col-span-3'} bg-[#111118] border border-[#1E1E2E] rounded-[8px] flex flex-col h-[500px]`}>
          <div className="p-4 border-b border-[#1E1E2E] flex justify-between items-center shrink-0">
            <h3 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium">Priority Alerts</h3>
          </div>
          <div className="overflow-y-auto flex-1 alert-feed p-2">
            {activeAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-[6px] flex flex-col p-[12px_16px]"
                style={{ borderLeftWidth: '2px', borderLeftColor: getUrgencyColor(alert.urgency) }}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <span className="text-[13px] font-medium text-[#F0F0F5]">
                    {getNeedTypeIcon(alert.needType)} {alert.needType}
                  </span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-[#1A1A1A]"
                    style={{ color: getUrgencyColor(alert.urgency), borderColor: getUrgencyColor(alert.urgency) }}
                  >
                    {alert.severity}
                  </span>
                </div>
                <div className="flex justify-between items-end text-[12px] text-[#55556A]">
                  <span className="truncate pr-2">{alert.wardName.split(' - ')[0]}</span>
                  <span className="shrink-0">{formatTimeAgo(alert.detectedAt)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {widgets.trends && (
        <div className={`${widgets.barchart ? 'col-span-1' : 'lg:col-span-2'} bg-[#111118] border border-[#1E1E2E] rounded-[8px] p-[20px_24px]`}>
          <h3 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium mb-6">30-Day Severity Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#55556A' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#55556A' }} tickLine={false} axisLine={false} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#8A8A9A' }} iconType="plainline" />
              <Area type="monotone" dataKey="foodInsecurity" name="Food Insecurity" stroke="#E05555" fill="transparent" strokeWidth={2} />
              <Area type="monotone" dataKey="schoolDropout" name="School Dropout" stroke="#D4874A" fill="transparent" strokeWidth={2} />
              <Area type="monotone" dataKey="healthcare" name="Healthcare" stroke="#6C63FF" fill="transparent" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>)}

        {widgets.barchart && (
        <div className={`${widgets.trends ? 'col-span-1' : 'lg:col-span-2'} bg-[#111118] border border-[#1E1E2E] rounded-[8px] p-[20px_24px]`}>
          <h3 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium mb-6">Needs By Ward (Top 8)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={wardDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#55556A' }} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#55556A' }} tickLine={false} axisLine={false} width={100} />
              <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#1E1E2E' }} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#8A8A9A' }} iconType="circle" />
              <Bar dataKey="critical" name="Critical Alert" stackId="a" fill="#E05555" barSize={12} />
              <Bar dataKey="high" name="High Priority" stackId="a" fill="#D4874A" barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>)}
      </div>
    </div>
  );
}
