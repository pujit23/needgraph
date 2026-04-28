import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Download, RefreshCcw, ArrowRight, Loader2, AlertTriangle, Users, Clock, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';
import { wards } from '../data/mockData';
import type { NeedType } from '../types';
import toast from 'react-hot-toast';
import ParticleCanvas from '../components/ParticleCanvas';

const needTypes: NeedType[] = [
  'Food Insecurity', 'School Dropout', 'Mental Health', 'Healthcare',
  'Domestic Violence', 'Unemployment', 'Water Scarcity', 'Child Malnutrition'
];

const needColors: Record<NeedType, string> = {
  'Food Insecurity': '#D85A30', 'School Dropout': '#BA7517', 'Mental Health': '#7F77DD', 'Healthcare': '#3C3489',
  'Domestic Violence': '#6C5CE7', 'Unemployment': '#5B8DEF', 'Water Scarcity': '#0F6E56', 'Child Malnutrition': '#E84393',
};

// Ward adjacency map for cascade spread
const wardAdjacency: Record<number, number[]> = {
  1: [2, 16, 17], 2: [1, 3, 6], 3: [2, 5, 6, 10], 4: [5, 10, 11],
  5: [3, 4, 6, 12], 6: [2, 3, 5], 7: [8, 9, 10, 19], 8: [7, 9, 11],
  9: [7, 8, 19], 10: [3, 4, 7, 11], 11: [4, 8, 10], 12: [5, 13, 14],
  13: [12, 14, 15], 14: [12, 13, 20], 15: [13, 16, 17], 16: [1, 15, 17],
  17: [1, 15, 16, 18], 18: [17, 19], 19: [7, 9, 18], 20: [14],
};

// Seeded random for deterministic results
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

interface CascadeWard {
  wardId: number;
  wardName: string;
  weekAffected: number;
  severity: number;
}

interface SimStats {
  peakSeverity: number;
  wardsAffected: number;
  estimatedPeople: number;
  recoveryWeeks: number;
}

function severityColor(s: number): string {
  if (s >= 80) return '#E05555';
  if (s >= 60) return '#D4874A';
  if (s >= 40) return '#C9A84C';
  return '#4AAF85';
}

function severityLabel(s: number): string {
  if (s >= 80) return 'Critical';
  if (s >= 60) return 'High';
  if (s >= 40) return 'Medium';
  return 'Low';
}

export default function CrisisSimulator() {
  const [triggerType, setTriggerType] = useState<NeedType>('Food Insecurity');
  const [triggerWard, setTriggerWard] = useState<string>(wards[0]?.name || 'Ward 1');
  const [severity, setSeverity] = useState(80);
  const [speed, setSpeed] = useState('Medium');
  const [horizon, setHorizon] = useState('8 weeks');
  const [intervention, setIntervention] = useState('Full');
  const [isLoading, setIsLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const totalWeeks = parseInt(horizon.split(' ')[0]) || 8;
  const startingWard = wards.find(w => w.name === triggerWard) || wards[0];

  // Generate deterministic simulation data
  const simData = useMemo(() => {
    if (!hasRun) return null;

    const seed = triggerType.length * 100 + severity + startingWard.id * 7 +
      (speed === 'Fast' ? 300 : speed === 'Medium' ? 200 : 100) +
      totalWeeks * 13 + (intervention === 'Full' ? 50 : intervention === 'Minimal' ? 25 : 0);

    const speedMult = speed === 'Fast' ? 1.6 : speed === 'Medium' ? 1.0 : 0.5;
    const intFactor = intervention === 'Full' ? 0.15 : intervention === 'Minimal' ? 0.55 : 1.0;

    // Severity over time chart data
    const chartData: { week: string; noIntervention: number; withIntervention: number }[] = [];
    for (let w = 0; w <= totalWeeks; w++) {
      const growth = w * speedMult * (severity / 50);
      const noise = seededRandom(seed + w * 17) * 8 - 4;
      const noInt = Math.min(100, Math.max(0, Math.round(severity * 0.4 + growth * 5 + noise)));
      const decay = intervention === 'Full' ? Math.max(0, w - 2) * 3 : 0;
      const withInt = Math.min(100, Math.max(0, Math.round((severity * 0.4 + growth * 5 * intFactor + noise * 0.5) - decay)));
      chartData.push({ week: `W${w}`, noIntervention: noInt, withIntervention: withInt });
    }

    // Cascade spread
    const cascadeWards: CascadeWard[] = [
      { wardId: startingWard.id, wardName: startingWard.name, weekAffected: 0, severity }
    ];
    const affected = new Set<number>([startingWard.id]);
    const maxSpread = speed === 'Fast' ? 3 : speed === 'Medium' ? 2 : 1;

    for (let w = 1; w <= totalWeeks; w++) {
      const newlyAffected: number[] = [];
      const currentAffected = [...affected];
      for (const wid of currentAffected) {
        const neighbors = wardAdjacency[wid] || [];
        for (const nid of neighbors) {
          if (!affected.has(nid) && !newlyAffected.includes(nid) && newlyAffected.length < maxSpread) {
            const spreadChance = seededRandom(seed + w * 31 + nid * 13);
            const threshold = intervention === 'Full' ? 0.7 : intervention === 'Minimal' ? 0.4 : 0.2;
            if (spreadChance > threshold) {
              const wardObj = wards.find(wd => wd.id === nid);
              if (wardObj) {
                const sev = Math.max(20, Math.round(severity * (0.4 + seededRandom(seed + nid) * 0.3) * (intervention === 'Full' ? 0.5 : 1)));
                cascadeWards.push({ wardId: nid, wardName: wardObj.name, weekAffected: w, severity: sev });
                newlyAffected.push(nid);
              }
            }
          }
        }
      }
      newlyAffected.forEach(id => affected.add(id));
    }

    // Stats
    const peakSeverity = Math.max(...chartData.map(d => d.noIntervention));
    const wardsAffected = cascadeWards.length;
    const peoplePerWard = 800 + seededRandom(seed + 999) * 400;
    const estimatedPeople = Math.round(wardsAffected * peoplePerWard * (severity / 100));
    const recoveryWeeks = intervention === 'Full'
      ? Math.round(totalWeeks * 0.6 + 1)
      : intervention === 'Minimal'
        ? Math.round(totalWeeks * 1.2 + 2)
        : Math.round(totalWeeks * 2 + 4);

    const stats: SimStats = { peakSeverity, wardsAffected, estimatedPeople, recoveryWeeks };

    return { chartData, cascadeWards, stats };
  }, [hasRun, triggerType, severity, startingWard, speed, totalWeeks, intervention]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isPlaying && currentWeek < totalWeeks) {
      timer = setTimeout(() => setCurrentWeek(w => w + 1), 600);
    } else if (currentWeek >= totalWeeks) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentWeek, totalWeeks]);

  const handleRun = useCallback(() => {
    setIsLoading(true);
    setHasRun(false);
    setCurrentWeek(0);
    setIsPlaying(false);
    setTimeout(() => {
      setIsLoading(false);
      setHasRun(true);
      setCurrentWeek(0);
      setIsPlaying(true);
    }, 1500);
  }, []);

  const handleReset = useCallback(() => {
    setHasRun(false);
    setIsLoading(false);
    setCurrentWeek(0);
    setIsPlaying(false);
  }, []);

  const visibleCascade = simData?.cascadeWards.filter(c => c.weekAffected <= currentWeek) || [];

  return (
    <div className="flex h-full w-full overflow-hidden relative bg-[#0A0A0F]">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="auth-blob auth-blob-1 opacity-20" />
        <div className="auth-blob auth-blob-2 opacity-20" />
        <ParticleCanvas />
      </div>

      {/* Left Panel */}
      <div className="w-[400px] flex-shrink-0 bg-[#0D0D14]/90 backdrop-blur-md border-r border-[#1E1E2E] flex flex-col h-full relative z-10">
        <div className="p-6 border-b border-[#1E1E2E] shrink-0">
          <h1 className="text-[20px] font-semibold text-[#F0F0F5]">Crisis Simulator</h1>
          <p className="text-[12px] text-[#55556A]">Simulate how a need cascade affects the community</p>
        </div>

        <div className="p-6 space-y-8 flex-1 overflow-y-auto min-h-0">
          <div className="space-y-4">
            <h2 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium border-b border-[#1E1E2E] pb-2">Trigger Event</h2>
            <div>
              <label className="block text-[12px] text-[#8A8A9A] mb-1.5">Need Type</label>
              <select value={triggerType} onChange={e => setTriggerType(e.target.value as NeedType)} className="w-full bg-[#0A0A0F] text-[#F0F0F5] text-[13px] px-3 py-2 rounded-[6px] border border-[#1E1E2E]">
                {needTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] text-[#8A8A9A] mb-1.5">Starting Ward</label>
              <select value={triggerWard} onChange={e => setTriggerWard(e.target.value)} className="w-full bg-[#0A0A0F] text-[#F0F0F5] text-[13px] px-3 py-2 rounded-[6px] border border-[#1E1E2E]">
                {wards.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="block text-[12px] text-[#8A8A9A]">Initial Severity</label>
                <span className="text-[12px] font-semibold" style={{ color: severityColor(severity) }}>{severity}/100</span>
              </div>
              <input type="range" min="0" max="100" value={severity} onChange={e => setSeverity(parseInt(e.target.value))} className="w-full accent-[#6C63FF] cursor-pointer" />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium border-b border-[#1E1E2E] pb-2">Simulation Parameters</h2>
            {[
              { label: 'Cascade Speed', options: ['Slow', 'Medium', 'Fast'], value: speed, set: setSpeed },
              { label: 'Time Horizon', options: ['2 weeks', '4 weeks', '8 weeks'], value: horizon, set: setHorizon },
              { label: 'Intervention Level', options: ['None', 'Minimal', 'Full'], value: intervention, set: setIntervention },
            ].map(({ label, options, value, set }) => (
              <div key={label}>
                <label className="block text-[12px] text-[#8A8A9A] mb-1.5">{label}</label>
                <div className="flex gap-2">
                  {options.map(s => (
                    <button key={s} onClick={() => set(s)} className={`flex-1 py-1.5 text-[12px] rounded-[4px] border transition-colors ${value === s ? 'bg-[#1E1E2E] text-[#F0F0F5] border-[#6C63FF]' : 'bg-[#0A0A0F] text-[#8A8A9A] border-[#1E1E2E]'}`}>{s}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-[#1E1E2E] space-y-3 bg-[#0A0A0F] shrink-0">
          <button onClick={handleRun} disabled={isLoading} className="w-full py-3 rounded-[6px] bg-[#6C63FF] text-white text-[14px] font-medium flex justify-center items-center gap-2 hover:bg-[#5a52d9] transition-colors shadow-[0_0_15px_rgba(108,99,255,0.3)] disabled:opacity-50">
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Simulating...</> : <>Run Simulation <ArrowRight className="w-4 h-4" /></>}
          </button>
          <button onClick={handleReset} className="w-full py-2 rounded-[6px] border border-[#2A2A40] text-[#8A8A9A] text-[13px] font-medium flex justify-center items-center gap-2 hover:bg-[#1E1E2E] hover:text-[#F0F0F5] transition-colors">
            <RefreshCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-transparent flex flex-col h-full overflow-y-auto relative z-10">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 text-[#6C63FF] animate-spin" />
              <p className="text-[15px] text-[#8A8A9A]">Running simulation...</p>
              <div className="w-48 h-1.5 bg-[#1E1E2E] rounded-full overflow-hidden">
                <motion.div className="h-full bg-[#6C63FF] rounded-full" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 1.5, ease: 'easeInOut' }} />
              </div>
            </motion.div>
          ) : !hasRun ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center text-[#55556A]">
              <RefreshCcw className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-[15px]">Configure parameters and click Run Simulation</p>
            </motion.div>
          ) : simData ? (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-8 space-y-6 max-w-[1200px] mx-auto w-full">

              {/* Progress Bar */}
              <div className="bg-[#111118]/80 backdrop-blur-md border border-[#1E1E2E] p-4 rounded-[8px] shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-medium text-[#F0F0F5]">Week {currentWeek} of {totalWeeks}</span>
                  <button onClick={() => setIsPlaying(!isPlaying)} className="p-1.5 rounded bg-[#1E1E2E] text-[#F0F0F5] hover:bg-[#2A2A40]">
                    {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4 text-[#4AAF85]" />}
                  </button>
                </div>
                <div className="h-2 w-full bg-[#1E1E2E] rounded-full overflow-hidden">
                  <div className="h-full bg-[#6C63FF] transition-all duration-500" style={{ width: `${(currentWeek / totalWeeks) * 100}%` }} />
                </div>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: AlertTriangle, label: 'Peak Severity', value: `${simData.stats.peakSeverity}/100`, color: severityColor(simData.stats.peakSeverity), bg: simData.stats.peakSeverity >= 80 ? '#1F1010' : '#111118' },
                  { icon: MapPin, label: 'Wards Affected', value: `${visibleCascade.length} / ${simData.stats.wardsAffected}`, color: '#6C63FF', bg: '#111118' },
                  { icon: Users, label: 'People Impacted', value: simData.stats.estimatedPeople.toLocaleString(), color: '#D4874A', bg: '#18150F' },
                  { icon: Clock, label: 'Recovery Time', value: `~${simData.stats.recoveryWeeks} weeks`, color: '#4AAF85', bg: '#0F1A15' },
                ].map((stat, i) => (
                  <motion.div key={stat.label} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.1 }}
                    className="backdrop-blur-md border p-4 rounded-[8px] shadow-lg" style={{ background: `${stat.bg}/80`, borderColor: `${stat.color}30` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                      <span className="text-[11px] uppercase tracking-widest opacity-80" style={{ color: stat.color }}>{stat.label}</span>
                    </div>
                    <div className="text-[22px] font-semibold" style={{ color: stat.color }}>{stat.value}</div>
                  </motion.div>
                ))}
              </div>

              {/* Severity Chart */}
              <div className="bg-[#111118]/80 backdrop-blur-md border border-[#1E1E2E] rounded-[8px] p-5 shadow-xl">
                <h3 className="text-[12px] text-[#55556A] uppercase tracking-[0.08em] font-medium mb-1">Need Severity Over Time</h3>
                <p className="text-[11px] text-[#44445A] mb-5">{triggerType} in {triggerWard}</p>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={simData.chartData.slice(0, currentWeek + 1)}>
                    <defs>
                      <linearGradient id="noIntGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E05555" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#E05555" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="intGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4AAF85" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4AAF85" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#55556A' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#55556A' }} />
                    <Tooltip contentStyle={{ background: '#111118', border: '1px solid #1E1E2E', borderRadius: '6px', fontSize: '12px' }} />
                    <ReferenceLine y={80} stroke="#E0555540" strokeDasharray="3 3" label={{ value: 'Critical', position: 'right', fill: '#E0555560', fontSize: 10 }} />
                    <ReferenceLine y={60} stroke="#D4874A30" strokeDasharray="3 3" />
                    <Area type="monotone" dataKey="noIntervention" stroke="#E05555" strokeWidth={2.5} fill="url(#noIntGrad)" name="No Intervention" dot={false} />
                    <Area type="monotone" dataKey="withIntervention" stroke="#4AAF85" strokeWidth={2.5} fill="url(#intGrad)" name={`${intervention} Intervention`} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Cascade Spread */}
              <div className="bg-[#111118]/80 backdrop-blur-md border border-[#1E1E2E] rounded-[8px] p-5 shadow-xl">
                <h3 className="text-[12px] text-[#55556A] uppercase tracking-[0.08em] font-medium mb-4">Cascade Spread Timeline</h3>
                <div className="space-y-2">
                  {visibleCascade.map((cw, i) => (
                    <motion.div key={cw.wardId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-[6px] border border-[#1E1E2E] bg-[#0A0A0F]/60">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: `${severityColor(cw.severity)}20`, color: severityColor(cw.severity) }}>
                        W{cw.weekAffected}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] text-[#F0F0F5] font-medium truncate">{cw.wardName}</div>
                        <div className="text-[11px] text-[#55556A]">{cw.weekAffected === 0 ? 'Origin point' : `Spread at week ${cw.weekAffected}`}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-[#1E1E2E] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${cw.severity}%`, background: severityColor(cw.severity) }} />
                        </div>
                        <span className="text-[11px] font-medium w-16 text-right" style={{ color: severityColor(cw.severity) }}>{severityLabel(cw.severity)}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="flex items-center justify-between bg-[#111118]/80 backdrop-blur-md border border-[#1E1E2E] p-5 rounded-[8px] shadow-xl">
                <div>
                  <div className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium mb-1">Recommended First Action</div>
                  <div className="text-[15px] font-medium text-[#F0F0F5]">Deploy {triggerType.toLowerCase()} resources to {triggerWard} immediately</div>
                </div>
                <button onClick={() => toast.success('Simulation report exported')} className="flex items-center gap-2 px-4 py-2 bg-transparent border border-[#2A2A40] text-[#8A8A9A] rounded-[4px] text-[13px] hover:text-[#F0F0F5] transition-colors">
                  <Download className="w-4 h-4" /> Export
                </button>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
