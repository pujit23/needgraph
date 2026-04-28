import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Download, CheckCircle2, Loader2,
  Activity, ShieldCheck, Users, Heart,
  ChevronUp, ChevronDown, ChevronsUpDown,
  Search, Trophy,
} from 'lucide-react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Label,
} from 'recharts';
import { weeklyReports, wardPerformance, preventedCrises } from '../data/mockData';
import type { WardPerformance, ReportMetrics } from '../types';
import toast from 'react-hot-toast';
import { exportReportPdf } from '../utils/exportPdf';
import { exportReportExcel } from '../utils/exportExcel';
import { useTableSort } from '../hooks/useTableSort';

// ─── Types ────────────────────────────────────────────────
interface KpiCardData {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accentColor: string;
  change: string;
  positive: boolean;
}

// ─── Constants ────────────────────────────────────────────
const METRICS: ReportMetrics = {
  totalNeeds: 589,
  crisesPrevented: 6,
  volunteersDeployed: 124,
  peopleHelped: 4320,
};

const KPI_CARDS: KpiCardData[] = [
  {
    label: 'Total Needs Recorded',
    value: METRICS.totalNeeds.toLocaleString(),
    icon: <Activity className="w-5 h-5" />,
    accentColor: '#6C63FF',
    change: '+12% vs last period',
    positive: false, // more needs = bad
  },
  {
    label: 'Crises Prevented',
    value: METRICS.crisesPrevented,
    icon: <ShieldCheck className="w-5 h-5" />,
    accentColor: '#4AAF85',
    change: '+2 vs last period',
    positive: true,
  },
  {
    label: 'Volunteers Deployed',
    value: METRICS.volunteersDeployed,
    icon: <Users className="w-5 h-5" />,
    accentColor: '#D4A017',
    change: '+18% vs last period',
    positive: true,
  },
  {
    label: 'People Helped',
    value: METRICS.peopleHelped.toLocaleString(),
    icon: <Heart className="w-5 h-5" />,
    accentColor: '#5B8DEF',
    change: '+34% vs last period',
    positive: true,
  },
];

const SCORE_COLOR = (score: number) =>
  score >= 90 ? '#4AAF85' : score >= 80 ? '#D4A017' : '#E05555';

// ─── Sub-components ───────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1E1E2E] border border-[#2A2A40] text-[#F0F0F5] rounded-[6px] p-3 text-[12px] shadow-xl">
      <div className="font-semibold text-[#8A8A9A] mb-1.5">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-[2px]" style={{ backgroundColor: p.color }} />
          <span className="text-[#8A8A9A]">{p.name}:</span>
          <span className="font-bold">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

function KpiCard({ card, index }: { card: KpiCardData; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="bg-[#111118] border border-[#1E1E2E] rounded-[10px] overflow-hidden"
      style={{ borderTop: `3px solid ${card.accentColor}` }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <span className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium leading-tight max-w-[140px]">
            {card.label}
          </span>
          <span style={{ color: card.accentColor }} className="opacity-60 shrink-0 mt-0.5">
            {card.icon}
          </span>
        </div>
        <div className="text-[32px] font-bold text-[#F0F0F5] leading-none mb-3">
          {card.value}
        </div>
        <span
          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: card.positive ? 'rgba(74,175,133,0.12)' : 'rgba(224,85,85,0.12)',
            color: card.positive ? '#4AAF85' : '#E05555',
          }}
        >
          {card.positive ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {card.change}
        </span>
      </div>
    </motion.div>
  );
}

type WardSortKey = keyof WardPerformance;

function SortIcon({ column, sortKey, sortDir }: {
  column: WardSortKey;
  sortKey: WardSortKey;
  sortDir: 'asc' | 'desc';
}) {
  if (column !== sortKey) return <ChevronsUpDown className="w-3 h-3 text-[#2A2A40]" />;
  return sortDir === 'asc'
    ? <ChevronUp className="w-3 h-3 text-[#6C63FF]" />
    : <ChevronDown className="w-3 h-3 text-[#6C63FF]" />;
}

// ─── Main Page ────────────────────────────────────────────
export default function Reports() {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [wardSearch, setWardSearch] = useState('');

  // Filter ward data by search
  const filteredWards = useMemo(
    () => wardPerformance.filter((w) =>
      w.ward.toLowerCase().includes(wardSearch.toLowerCase())
    ),
    [wardSearch],
  );

  // Sortable table
  const { sorted: sortedWards, sortKey, sortDir, toggleSort } = useTableSort<WardPerformance>(
    filteredWards,
    'outcomeScore',
    'desc',
  );

  // Highest score ward
  const topWard = useMemo(
    () => wardPerformance.reduce((best, w) => w.outcomeScore > best.outcomeScore ? w : best),
    [],
  );

  const handlePdfExport = async () => {
    setPdfLoading(true);
    try {
      await exportReportPdf('report-content');
      toast.success('PDF downloaded successfully');
    } catch (err) {
      console.error(err);
      toast.error('PDF export failed. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleExcelExport = () => {
    try {
      exportReportExcel(METRICS, wardPerformance);
      toast.success('Excel report downloaded');
    } catch (err) {
      console.error(err);
      toast.error('Excel export failed. Please try again.');
    }
  };

  const thClass =
    'text-[11px] font-medium text-[#55556A] uppercase tracking-[0.06em] px-5 py-3 select-none cursor-pointer hover:text-[#8A8A9A] transition-colors whitespace-nowrap';

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[#F0F0F5]">Reports</h1>
          <p className="text-[12px] text-[#55556A] mt-0.5">Monthly summary and performance analytics</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 rounded-[6px] border border-[#1E1E2E] bg-[#111118] text-[13px]">
            <Calendar className="w-4 h-4 text-[#55556A]" />
            <span className="text-[#8A8A9A]">Jan 2026 — Apr 2026</span>
          </div>
          <div className="flex gap-2">
            <button
              id="pdf-export-btn"
              onClick={handlePdfExport}
              disabled={pdfLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] bg-[#6C63FF] text-white text-[13px] font-medium hover:bg-[#5a52d9] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pdfLoading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Download className="w-4 h-4" />}
              PDF
            </button>
            <button
              id="xlsx-export-btn"
              onClick={handleExcelExport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[6px] border border-[#2A2A40] bg-transparent text-[#8A8A9A] text-[13px] font-medium hover:text-[#F0F0F5] hover:border-[#6C63FF] transition-colors"
            >
              <Download className="w-4 h-4" />
              XLSX
            </button>
          </div>
        </div>
      </div>

      {/* ── Capturable report area ─────────────────────── */}
      <div id="report-content" className="space-y-6">

        {/* ── KPI Cards ────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {KPI_CARDS.map((card, i) => <KpiCard key={i} card={card} index={i} />)}
        </div>

        {/* ── Chart ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="bg-[#111118] rounded-[10px] border border-[#1E1E2E] p-6"
        >
          <div className="mb-6">
            <h3 className="text-[13px] font-semibold text-[#F0F0F5]">Needs Recorded vs Resolved</h3>
            <p className="text-[11px] text-[#55556A] mt-1">12-week overview — Jan 2026 to Apr 2026</p>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={weeklyReports} margin={{ top: 8, right: 8, bottom: 32, left: 32 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: '#55556A' }}
                tickLine={false}
                axisLine={false}
              >
                <Label value="Weeks" position="insideBottom" offset={-18} fill="#55556A" fontSize={11} />
              </XAxis>
              <YAxis
                tick={{ fontSize: 11, fill: '#55556A' }}
                tickLine={false}
                axisLine={false}
              >
                <Label value="Count" angle={-90} position="insideLeft" offset={-16} fill="#55556A" fontSize={11} />
              </YAxis>
              <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(108,99,255,0.06)' }} />
              <Legend
                wrapperStyle={{ fontSize: '12px', color: '#8A8A9A', paddingTop: 12 }}
                iconType="circle"
                iconSize={8}
              />
              <Bar dataKey="recorded" name="Needs Recorded" fill="#2A2A40" radius={[3, 3, 0, 0]} barSize={22} />
              <Line
                type="monotone"
                dataKey="resolved"
                name="Needs Resolved"
                stroke="#6C63FF"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#111118', stroke: '#6C63FF', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#6C63FF' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ── Ward Performance Table ────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-[#111118] rounded-[10px] border border-[#1E1E2E] overflow-hidden"
        >
          {/* Table header */}
          <div className="px-5 py-4 border-b border-[#1E1E2E] bg-[#0A0A0F] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-[13px] font-semibold text-[#F0F0F5]">Ward Performance</h3>
              <p className="text-[11px] text-[#55556A] mt-0.5">{sortedWards.length} wards · click headers to sort</p>
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#55556A]" />
              <input
                value={wardSearch}
                onChange={(e) => setWardSearch(e.target.value)}
                placeholder="Filter by ward…"
                className="pl-8 pr-3 py-1.5 text-[12px] rounded-[6px] border border-[#1E1E2E] bg-[#111118] text-[#F0F0F5] placeholder-[#55556A] focus:border-[#6C63FF] outline-none w-44 transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-[#1E1E2E] bg-[#0D0D15]">
                  {(
                    [
                      { key: 'ward',               label: 'Ward' },
                      { key: 'recorded',           label: 'Recorded' },
                      { key: 'resolved',           label: 'Resolved' },
                      { key: 'avgResolutionTime',  label: 'Avg Resolution' },
                      { key: 'volunteersDeployed', label: 'Volunteers' },
                      { key: 'outcomeScore',       label: 'Score' },
                    ] as { key: WardSortKey; label: string }[]
                  ).map(({ key, label }) => (
                    <th
                      key={key}
                      className={thClass}
                      onClick={() => toggleSort(key)}
                    >
                      <span className="flex items-center gap-1">
                        {label}
                        <SortIcon column={key} sortKey={sortKey} sortDir={sortDir} />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedWards.map((wp, i) => {
                  const isTop = wp.ward === topWard.ward;
                  const scoreColor = SCORE_COLOR(wp.outcomeScore);
                  const rowBg = i % 2 === 0 ? 'bg-[#0A0A0F]' : 'bg-[#0D0D14]';
                  return (
                    <tr
                      key={wp.ward}
                      className={`border-b border-[#1E1E2E] ${rowBg} hover:bg-[#1E1E2E] transition-colors`}
                    >
                      {/* Ward name + trophy */}
                      <td className="px-5 py-3.5 text-[13px] font-semibold text-[#F0F0F5] whitespace-nowrap">
                        <span className="flex items-center gap-2">
                          {isTop && <Trophy className="w-3.5 h-3.5 text-[#D4A017] shrink-0" />}
                          {wp.ward}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-[#8A8A9A]">{wp.recorded}</td>
                      <td className="px-5 py-3.5 text-[13px] text-[#8A8A9A]">{wp.resolved}</td>
                      <td className="px-5 py-3.5 text-[13px] text-[#55556A] whitespace-nowrap">{wp.avgResolutionTime}</td>
                      <td className="px-5 py-3.5 text-[13px] text-[#8A8A9A]">{wp.volunteersDeployed}</td>
                      {/* Score with wider progress bar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-1.5 bg-[#1E1E2E] rounded-full overflow-hidden shrink-0">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${wp.outcomeScore}%`, backgroundColor: scoreColor }}
                            />
                          </div>
                          <span
                            className="text-[12px] font-bold tabular-nums"
                            style={{ color: scoreColor }}
                          >
                            {wp.outcomeScore}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ── Cascade Prevention Tracker ───────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          className="bg-[#111118] rounded-[10px] border border-[#1E1E2E] overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-[#1E1E2E] bg-[#0A0A0F]">
            <h3 className="text-[13px] font-semibold text-[#F0F0F5]">Cascade Prevention Tracker</h3>
            <p className="text-[11px] text-[#55556A] mt-0.5">Crises averted through early intervention</p>
          </div>
          <div className="divide-y divide-[#1E1E2E]">
            {preventedCrises.map((pc) => (
              <div key={pc.id} className="px-5 py-4 hover:bg-[#1E1E2E] transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4AAF85] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-[13px] text-[#F0F0F5]">{pc.predictedNeed}</span>
                      <span className="text-[#8A8A9A] text-[12px] ml-2">in {pc.ward}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#55556A] whitespace-nowrap ml-4">{pc.predictedDate}</span>
                </div>
                <p className="text-[13px] text-[#8A8A9A] mb-1.5 ml-6">{pc.intervention}</p>
                <div className="flex items-center gap-4 ml-6">
                  <span className="text-[11px] font-semibold text-[#4AAF85]">✓ {pc.outcome}</span>
                  <span className="text-[11px] text-[#55556A]">{pc.peopleProtected} people protected</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>{/* end #report-content */}
    </div>
  );
}
