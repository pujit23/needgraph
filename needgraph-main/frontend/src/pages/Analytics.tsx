import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
  AreaChart, Area
} from 'recharts';
import { wards, needs } from '../data/mockData';
import { getSeverityColor, getNeedTypeIcon } from '../utils/helpers';
import type { NeedType } from '../types';

const HEATMAP_WEEKS = 13;
const needTypes: NeedType[] = [
  'Food Insecurity', 'School Dropout', 'Mental Health', 'Healthcare',
  'Domestic Violence', 'Unemployment', 'Water Scarcity', 'Child Malnutrition'
];
const needColors: Record<NeedType, string> = {
  'Food Insecurity': '#D85A30',
  'School Dropout': '#BA7517',
  'Mental Health': '#7F77DD',
  'Healthcare': '#3C3489',
  'Domestic Violence': '#6C5CE7',
  'Unemployment': '#5B8DEF',
  'Water Scarcity': '#0F6E56',
  'Child Malnutrition': '#E84393',
};

const CustomScatterTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-[#1E1E2E] border border-[#2A2A40] text-[#F0F0F5] rounded-md p-3 text-[12px] shadow-lg relative z-50">
      <div className="font-semibold text-[#8A8A9A] mb-1.5">{data.ward}</div>
      <div className="flex items-center gap-1.5 mb-1">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.fill }} />
        <span>Type: {data.needType}</span>
      </div>
      <div>Severity: <span className="font-semibold">{data.severity}</span></div>
      <div>Affected: <span className="font-semibold">{data.affectedCount}</span></div>
    </div>
  );
};

export default function Analytics() {
  const [selectedWard, setSelectedWard] = useState('Ward 12');

  // Heatmap Data (Mocked 90 days)
  const [heatmapData] = useState(() => {
    return Array.from({ length: HEATMAP_WEEKS * 7 }).map((_, i) => {
      const submissions = Math.floor(Math.random() * 8);
      let color = '#0A0A0F';
      if (submissions > 5) color = '#4AAF85';
      else if (submissions > 2) color = '#2A4A2A';
      else if (submissions > 0) color = '#1A2A1A';
      return { day: i, submissions, color, topType: needTypes[Math.floor(Math.random() * 8)] };
    });
  });

  // Scatter Plot Data
  const scatterData = useMemo(() => {
    return needs.map((n) => ({
      x: n.severity,
      y: n.affectedCount,
      z: n.severity >= 80 ? 400 : n.severity >= 60 ? 250 : 100, // Dot size
      ward: n.wardName.split(' - ')[0],
      needType: n.needType,
      fill: needColors[n.needType] || '#6C63FF'
    }));
  }, []);

  // Radar Chart Data
  const [radarData] = useState(() => {
    return [
      { subject: 'Food Security', A: Math.floor(Math.random() * 100), B: Math.floor(Math.random() * 100), fullMark: 100 },
      { subject: 'Education', A: Math.floor(Math.random() * 100), B: Math.floor(Math.random() * 100), fullMark: 100 },
      { subject: 'Mental Health', A: Math.floor(Math.random() * 100), B: Math.floor(Math.random() * 100), fullMark: 100 },
      { subject: 'Healthcare', A: Math.floor(Math.random() * 100), B: Math.floor(Math.random() * 100), fullMark: 100 },
      { subject: 'Economy', A: Math.floor(Math.random() * 100), B: Math.floor(Math.random() * 100), fullMark: 100 },
      { subject: 'Water Access', A: Math.floor(Math.random() * 100), B: Math.floor(Math.random() * 100), fullMark: 100 },
    ];
  });

  // Stacked Area Chart Data (12 weeks)
  const [stackedData] = useState(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const data: any = { week: `W${i + 1}` };
      needTypes.forEach(t => {
        data[t] = Math.floor(Math.random() * 30) + 10;
      });
      return data;
    });
  });

  // Correlation Matrix Data
  const [correlationData] = useState(() => {
    const grid: number[][] = [];
    for (let i = 0; i < 8; i++) {
      grid[i] = [];
      for (let j = 0; j < 8; j++) {
        if (i === j) grid[i][j] = 1.0;
        else if (j < i) grid[i][j] = grid[j][i];
        else grid[i][j] = parseFloat(Math.max(0, Math.random() - 0.2).toFixed(2));
      }
    }
    return grid;
  });

  const getMatrixColor = (val: number) => {
    if (val === 0) return '#0A0A0F';
    // Interpolate between #0A0A0F, #6C63FF (0.5), #E05555 (1.0)
    if (val < 0.5) return `rgba(108, 99, 255, ${val * 2})`;
    return `rgba(224, 85, 85, ${(val - 0.5) * 2})`;
  };

  // Funnel Data
  const funnelStages = [
    { label: 'Needs Detected', count: 847, width: '100%', pct: '100%' },
    { label: 'Needs Scored', count: 831, width: '98%', pct: '98%' },
    { label: 'Alerts Generated', count: 124, width: '15%', pct: '15%' },
    { label: 'Volunteers Deployed', count: 89, width: '10%', pct: '71%' },
    { label: 'Crises Prevented', count: 67, width: '8%', pct: '75%' },
  ];

  return (
    <div className="p-6 space-y-6 page-animate pb-12 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-[#F0F0F5]">Analytics</h1>
        <div className="text-[12px] text-[#55556A]">Advanced multidimensional insights</div>
      </div>

      {/* ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111118] border border-[#1E1E2E] rounded-[8px] p-[20px_24px]">
          <h3 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium mb-6">Need Submissions — Last 90 Days</h3>
          <div className="flex bg-[#0A0A0F] border border-[#1E1E2E] rounded-[8px] p-4 overflow-x-auto gap-1">
            {Array.from({ length: HEATMAP_WEEKS }).map((_, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, dayIndex) => {
                  const dayData = heatmapData[weekIndex * 7 + dayIndex];
                  return (
                    <div
                      key={dayIndex}
                      title={`Submissions: ${dayData.submissions} | Top Type: ${dayData.topType}`}
                      className="w-4 h-4 rounded-[2px] transition-transform hover:scale-125 cursor-pointer"
                      style={{ backgroundColor: dayData.color }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4 text-[11px] text-[#55556A] justify-end">
             Less
             <div className="w-3 h-3 rounded-[2px] bg-[#0A0A0F]"></div>
             <div className="w-3 h-3 rounded-[2px] bg-[#1A2A1A]"></div>
             <div className="w-3 h-3 rounded-[2px] bg-[#2A4A2A]"></div>
             <div className="w-3 h-3 rounded-[2px] bg-[#4AAF85]"></div>
             More
          </div>
        </div>

        <div className="bg-[#111118] border border-[#1E1E2E] rounded-[8px] p-[20px_24px]">
          <h3 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium mb-6">Severity vs People Affected</h3>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" />
              <XAxis dataKey="x" type="number" name="Severity" tick={{ fontSize: 11, fill: '#55556A' }} domain={[0, 100]} />
              <YAxis dataKey="y" type="number" name="Affected" tick={{ fontSize: 11, fill: '#55556A' }} domain={[0, 500]} />
              <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomScatterTooltip />} />
              <Scatter data={scatterData} shape="circle" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111118] border border-[#1E1E2E] rounded-[8px] p-[20px_24px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium">Ward Vulnerability Profile</h3>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="bg-[#0A0A0F] text-[#F0F0F5] text-[12px] px-2 py-1 rounded-[4px] border border-[#1E1E2E]"
            >
               {wards.map((w: any) => <option key={w.id} value={w.name.split(' - ')[0]}>{w.name.split(' - ')[0]}</option>)}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#2A2A40" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#8A8A9A', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Current Month" dataKey="A" stroke="#E05555" fill="#E05555" fillOpacity={0.6} />
              <Radar name="Last Month" dataKey="B" stroke="#55556A" fill="#55556A" fillOpacity={0.3} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#8A8A9A' }} />
              <RechartsTooltip contentStyle={{ backgroundColor: '#1E1E2E', border: '1px solid #2A2A40', color: '#F0F0F5', fontSize: '12px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#111118] border border-[#1E1E2E] rounded-[8px] p-[20px_24px] flex flex-col">
          <h3 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium mb-8">Crisis Prevention Pipeline</h3>
          <div className="flex-1 flex flex-col justify-center gap-4">
            {funnelStages.map((stage, i) => (
              <div key={i} className="w-full flex items-center justify-center relative h-10">
                <div 
                  className="absolute h-full rounded-[4px] flex items-center justify-between px-4 transition-all"
                  style={{ 
                    width: stage.width, 
                    backgroundColor: i === 0 ? '#1A1A2E' : i === 1 ? '#2A2A40' : i === 2 ? '#C9A84C' : i === 3 ? '#6C63FF' : '#4AAF85',
                    zIndex: 10
                  }}
                >
                  <span className="text-[12px] font-semibold text-white drop-shadow-md">{stage.label}</span>
                  <div className="text-right">
                    <span className="text-[14px] font-bold text-white drop-shadow-md">{stage.count}</span>
                    <span className="text-[10px] text-white/70 ml-2">{stage.pct}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111118] border border-[#1E1E2E] rounded-[8px] p-[20px_24px]">
          <h3 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium mb-6">Need Volume by Category — 12 Weeks</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stackedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#55556A' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#55556A' }} tickLine={false} axisLine={false} />
              <RechartsTooltip contentStyle={{ backgroundColor: '#1E1E2E', border: '1px solid #2A2A40', color: '#F0F0F5', fontSize: '11px' }} />
              {needTypes.map((type) => (
                <Area key={type} type="monotone" dataKey={type} stackId="1" stroke={needColors[type]} fill={needColors[type]} strokeWidth={1} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#111118] border border-[#1E1E2E] rounded-[8px] p-[20px_24px]">
          <h3 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium mb-6">Need Type Correlation Strength</h3>
          <div className="w-full aspect-square max-w-[360px] mx-auto grid grid-cols-8 grid-rows-8 gap-0.5">
            {correlationData.map((row, i) => (
              row.map((val, j) => (
                <div
                  key={`${i}-${j}`}
                  className="w-full h-full flex items-center justify-center text-[10px] font-medium text-white/80 cursor-pointer hover:border border-white/50"
                  style={{ backgroundColor: getMatrixColor(val) }}
                  title={`${needTypes[i]} vs ${needTypes[j]}: ${val}`}
                >
                  {val > 0.3 ? val : ''}
                </div>
              ))
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-6 justify-center">
            {needTypes.map((type, i) => (
              <div key={type} className="flex items-center gap-1.5 text-[10px] text-[#8A8A9A]">
                <span className="w-4 h-4 font-bold flex items-center justify-center text-[#55556A]">{i + 1}</span> {type.split(' ')[0]}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
