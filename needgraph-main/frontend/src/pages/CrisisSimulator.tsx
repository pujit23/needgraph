import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Download, RefreshCcw, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { wards, wardRiskLevels } from '../data/mockData';
import type { NeedType, UrgencyLevel } from '../types';
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

export default function CrisisSimulator() {
  const [triggerType, setTriggerType] = useState<NeedType>('Food Insecurity');
  const [triggerWard, setTriggerWard] = useState<string>(wards[0]?.name || 'Ward 1');
  const [severity, setSeverity] = useState(80);
  
  const [speed, setSpeed] = useState('Medium');
  const [horizon, setHorizon] = useState('8 weeks');
  const [intervention, setIntervention] = useState('Full');
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const totalWeeks = parseInt(horizon.split(' ')[0]) || 8;

  // Generate mock simulation data
  const { dataNoInt, dataInt } = useMemo(() => {
    let d1 = [], d2 = [];
    for (let w = 0; w <= totalWeeks; w++) {
      let row1: any = { week: `W${w}` };
      let row2: any = { week: `W${w}` };
      needTypes.forEach(t => {
        const base = t === triggerType ? severity : 20;
        const multiplier = w * (speed === 'Fast' ? 1.5 : speed === 'Medium' ? 1.0 : 0.6);
        
        // No intervention grows exponentially
        row1[t] = Math.min(100, Math.floor(base + multiplier * (Math.random() * 8 + 2)));
        
        // With intervention flattens
        const intFactor = intervention === 'Full' ? 0.2 : intervention === 'Minimal' ? 0.6 : 1.0;
        row2[t] = Math.min(100, Math.floor(base + (multiplier * intFactor) * (Math.random() * 8 + 2)));
      });
      d1.push(row1);
      d2.push(row2);
    }
    return { dataNoInt: d1, dataInt: d2 };
  }, [triggerType, severity, speed, horizon, intervention]);

  useEffect(() => {
    let timer: any;
    if (isPlaying && currentWeek < totalWeeks) {
      timer = setTimeout(() => setCurrentWeek(w => w + 1), 500);
    } else if (currentWeek >= totalWeeks) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentWeek, totalWeeks]);

  const handleRun = () => {
    setHasRun(true);
    setCurrentWeek(0);
    setIsPlaying(true);
  };

  const handleReset = () => {
    setHasRun(false);
    setCurrentWeek(0);
    setIsPlaying(false);
  };

  return (
    <div className="flex h-full w-full overflow-hidden relative bg-[#0A0A0F]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="auth-blob auth-blob-1 opacity-20" />
        <div className="auth-blob auth-blob-2 opacity-20" />
        <ParticleCanvas />
      </div>

      {/* Left Panel - Controls */}
      <div className="w-[400px] flex-shrink-0 bg-[#0D0D14]/90 backdrop-blur-md border-r border-[#1E1E2E] flex flex-col h-full relative z-10">
        <div className="p-6 border-b border-[#1E1E2E] shrink-0">
          <h1 className="text-[20px] font-semibold text-[#F0F0F5]">Crisis Simulator</h1>
          <p className="text-[12px] text-[#55556A]">Simulate how a need cascade affects the community</p>
        </div>

        <div className="p-6 space-y-8 flex-1 overflow-y-auto min-h-0">
          {/* Section 1 */}
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
                <span className="text-[12px] font-semibold" style={{ color: severity >= 80 ? '#E05555' : severity >= 60 ? '#D4874A' : '#4AAF85' }}>{severity}/100</span>
              </div>
              <input type="range" min="0" max="100" value={severity} onChange={e => setSeverity(parseInt(e.target.value))} className="w-full accent-[#6C63FF] cursor-pointer" />
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-4">
            <h2 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium border-b border-[#1E1E2E] pb-2">Simulation Parameters</h2>
            
            <div>
              <label className="block text-[12px] text-[#8A8A9A] mb-1.5">Cascade Speed</label>
              <div className="flex gap-2">
                {['Slow', 'Medium', 'Fast'].map(s => (
                  <button key={s} onClick={() => setSpeed(s)} className={`flex-1 py-1.5 text-[12px] rounded-[4px] border transition-colors ${speed === s ? 'bg-[#1E1E2E] text-[#F0F0F5] border-[#6C63FF]' : 'bg-[#0A0A0F] text-[#8A8A9A] border-[#1E1E2E]'}`}>{s}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[12px] text-[#8A8A9A] mb-1.5">Time Horizon</label>
              <div className="flex gap-2">
                {['2 weeks', '4 weeks', '8 weeks'].map(s => (
                  <button key={s} onClick={() => setHorizon(s)} className={`flex-1 py-1.5 text-[12px] rounded-[4px] border transition-colors ${horizon === s ? 'bg-[#1E1E2E] text-[#F0F0F5] border-[#6C63FF]' : 'bg-[#0A0A0F] text-[#8A8A9A] border-[#1E1E2E]'}`}>{s}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[12px] text-[#8A8A9A] mb-1.5">Intervention Level</label>
              <div className="flex gap-2">
                {['None', 'Minimal', 'Full'].map(s => (
                  <button key={s} onClick={() => setIntervention(s)} className={`flex-1 py-1.5 text-[12px] rounded-[4px] border transition-colors ${intervention === s ? 'bg-[#1E1E2E] text-[#F0F0F5] border-[#6C63FF]' : 'bg-[#0A0A0F] text-[#8A8A9A] border-[#1E1E2E]'}`}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[#1E1E2E] space-y-3 bg-[#0A0A0F] shrink-0">
          <button onClick={handleRun} className="w-full py-3 rounded-[6px] bg-[#6C63FF] text-white text-[14px] font-medium flex justify-center items-center gap-2 hover:bg-[#5a52d9] transition-colors shadow-[0_0_15px_rgba(108,99,255,0.3)]">
            Run Simulation <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={handleReset} className="w-full py-2 rounded-[6px] border border-[#2A2A40] text-[#8A8A9A] text-[13px] font-medium flex justify-center items-center gap-2 hover:bg-[#1E1E2E] hover:text-[#F0F0F5] transition-colors">
            <RefreshCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Right Panel - Output */}
      <div className="flex-1 bg-transparent flex flex-col h-full overflow-y-auto relative z-10">
        {!hasRun ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#55556A]">
            <RefreshCcw className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-[15px]">Configure parameters and click Run Simulation</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-8 space-y-8 max-w-[1200px] mx-auto w-full">
            {/* Timeline Bar */}
            <div className="bg-[#111118]/80 backdrop-blur-md border border-[#1E1E2E] p-4 rounded-[8px] flex flex-col shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-medium text-[#F0F0F5]">Simulation Progress: Week {currentWeek} of {totalWeeks}</span>
                <button onClick={() => setIsPlaying(!isPlaying)} className="p-1.5 rounded bg-[#1E1E2E] text-[#F0F0F5] hover:bg-[#2A2A40]">
                  {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4 text-[#4AAF85]" />}
                </button>
              </div>
              <div className="h-2 w-full bg-[#1E1E2E] rounded-full overflow-hidden">
                <div className="h-full bg-[#6C63FF] transition-all duration-500 ease-linear" style={{ width: `${(currentWeek / totalWeeks) * 100}%` }} />
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[
                { title: 'Without Intervention', data: dataNoInt },
                { title: `With ${intervention} Intervention`, data: dataInt }
              ].map((chart, i) => (
                <div key={i} className="bg-[#111118]/80 backdrop-blur-md border border-[#1E1E2E] rounded-[8px] p-5 shadow-xl">
                  <h3 className="text-[12px] text-[#55556A] uppercase tracking-[0.08em] font-medium mb-6">{chart.title}</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chart.data.slice(0, currentWeek + 1)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
                      <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#55556A' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#55556A' }} />
                      <Tooltip contentStyle={{ background: '#111118', border: '1px solid #1E1E2E', borderRadius: '6px' }} />
                      {needTypes.map(t => (
                        <Line key={t} type="monotone" dataKey={t} stroke={needColors[t]} strokeWidth={t === triggerType ? 3 : 1.5} dot={false} isAnimationActive={false} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>

            {/* Bottom Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-[#1F1010]/80 backdrop-blur-md border border-[#E05555]/30 p-4 rounded-[8px] shadow-lg">
                <div className="text-[11px] text-[#E05555] opacity-80 uppercase tracking-widest mb-1.5">At Risk (No Action)</div>
                <div className="text-[24px] font-semibold text-[#E05555]">2,847</div>
              </motion.div>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-[#1A201A]/80 backdrop-blur-md border border-[#4AAF85]/30 p-4 rounded-[8px] shadow-lg">
                <div className="text-[11px] text-[#4AAF85] opacity-80 uppercase tracking-widest mb-1.5">At Risk (w/ Action)</div>
                <div className="text-[24px] font-semibold text-[#4AAF85]">891</div>
              </motion.div>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-[#111118]/80 backdrop-blur-md border border-[#1E1E2E] p-4 rounded-[8px] shadow-lg">
                <div className="text-[11px] text-[#55556A] uppercase tracking-widest mb-1.5">Lives Protected</div>
                <div className="text-[24px] font-semibold text-[#6C63FF]">1,956</div>
              </motion.div>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-[#111118]/80 backdrop-blur-md border border-[#1E1E2E] p-4 rounded-[8px] shadow-lg">
                <div className="text-[11px] text-[#55556A] uppercase tracking-widest mb-1.5">Cost of Inaction</div>
                <div className="text-[24px] font-semibold text-[#C9A84C]">₹1.2 Cr</div>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex items-center justify-between bg-[#111118]/80 backdrop-blur-md border border-[#1E1E2E] p-5 rounded-[8px] shadow-xl">
              <div>
                <div className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium mb-1">Recommended First Action</div>
                <div className="text-[15px] font-medium text-[#F0F0F5]">Deploy {triggerType.toLowerCase()} resources to {triggerWard} immediately</div>
              </div>
              <button onClick={() => toast.success('Simulation report exported to PDF')} className="flex items-center gap-2 px-4 py-2 bg-transparent border border-[#2A2A40] text-[#8A8A9A] rounded-[4px] text-[13px] hover:text-[#F0F0F5] transition-colors">
                <Download className="w-4 h-4" /> Export Report
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
