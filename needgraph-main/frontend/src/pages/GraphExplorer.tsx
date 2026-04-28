import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactFlow, {
  Background, Controls, Handle, Position,
  MarkerType,
} from 'reactflow';
import type { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { X, Filter, Eye, EyeOff, Users, Zap } from 'lucide-react';
import { graphEdges, needs, trendData, wards } from '../data/mockData';
import { getSeverityColor } from '../utils/helpers';
import type { NeedType } from '../types';

const needTypes: NeedType[] = [
  'Food Insecurity', 'School Dropout', 'Mental Health', 'Healthcare',
  'Domestic Violence', 'Unemployment', 'Water Scarcity', 'Child Malnutrition'
];

const nodePositions: Record<NeedType, { x: number; y: number }> = {
  'Food Insecurity': { x: 340, y: 60 },
  'School Dropout': { x: 100, y: 240 },
  'Mental Health': { x: 340, y: 420 },
  'Healthcare': { x: 580, y: 420 },
  'Domestic Violence': { x: 100, y: 420 },
  'Unemployment': { x: 60, y: 60 },
  'Water Scarcity': { x: 620, y: 60 },
  'Child Malnutrition': { x: 580, y: 240 },
};

// FIX 3: Unique color identity for each node
const nodeColorMap: Record<string, string> = {
  'Unemployment': '#f97316',
  'Food Insecurity': '#ef4444',
  'Water Scarcity': '#3b82f6',
  'School Dropout': '#eab308',
  'Child Malnutrition': '#ec4899',
  'Domestic Violence': '#f43f5e',
  'Mental Health': '#a855f7',
  'Healthcare': '#10b981',
  // Predicted nodes
  'Crime Rate': '#06b6d4',
  'Migration Crisis': '#06b6d4',
  'Infrastructure Collapse': '#06b6d4',
};

const interventions: Record<NeedType, { action: string; impact: number }[]> = {
  'Food Insecurity': [
    { action: 'Deploy food kit distribution', impact: 78 },
    { action: 'Establish community kitchen', impact: 65 },
    { action: 'Ration card enrollment drive', impact: 52 },
  ],
  'School Dropout': [
    { action: 'Education sponsorship program', impact: 72 },
    { action: 'After-school study centers', impact: 61 },
    { action: 'Parent awareness workshops', impact: 45 },
  ],
  'Mental Health': [
    { action: 'Mobile counseling unit deployment', impact: 68 },
    { action: 'Peer support group formation', impact: 55 },
    { action: 'Stress management workshops', impact: 42 },
  ],
  'Healthcare': [
    { action: 'Mobile health camp setup', impact: 75 },
    { action: 'Weekly doctor visits', impact: 63 },
    { action: 'Health awareness campaign', impact: 48 },
  ],
  'Domestic Violence': [
    { action: 'Safe house counselor deployment', impact: 70 },
    { action: 'Legal aid workshops', impact: 58 },
    { action: 'Community mediation program', impact: 44 },
  ],
  'Unemployment': [
    { action: 'Vocational training program', impact: 74 },
    { action: 'Micro-loan scheme', impact: 62 },
    { action: 'Job placement drives', impact: 51 },
  ],
  'Water Scarcity': [
    { action: 'Water tanker supply coordination', impact: 80 },
    { action: 'Bore well repair program', impact: 67 },
    { action: 'Water purification systems', impact: 55 },
  ],
  'Child Malnutrition': [
    { action: 'Nutritional supplement distribution', impact: 76 },
    { action: 'Mid-day meal enhancement', impact: 64 },
    { action: 'Maternal nutrition education', impact: 50 },
  ],
};

// FIX 3: Redesigned node with unique colors and better contrast
function CustomNode({ data, selected }: { data: any, selected: boolean }) {
  const nodeColor = nodeColorMap[data.label] || '#6C63FF';
  const isPredicted = data.predicted;

  return (
    <div
      className="flex flex-col items-center justify-center transition-all rounded-lg"
      style={{
        width: 130,
        padding: '14px 16px',
        backgroundColor: isPredicted ? 'rgba(6,182,212,0.08)' : `${nodeColor}12`,
        border: selected
          ? `2px solid #6C63FF`
          : `2px solid ${isPredicted ? '#06b6d4' : nodeColor}`,
        borderStyle: isPredicted ? 'dashed' : 'solid',
        opacity: isPredicted ? 0.85 : 1,
        boxShadow: isPredicted
          ? '0 0 15px rgba(6,182,212,0.25)'
          : `0 0 12px ${nodeColor}18`,
        borderRadius: '10px',
        position: 'relative',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />

      {/* PREDICTED badge */}
      {isPredicted && (
        <div style={{
          position: 'absolute', top: -8, right: -4,
          background: '#06b6d4', color: '#0f172a',
          fontSize: '8px', fontWeight: 700, letterSpacing: '0.08em',
          padding: '2px 6px', borderRadius: '4px',
        }}>
          PREDICTED
        </div>
      )}

      <div
        className="text-center mb-1.5 font-semibold uppercase"
        style={{ fontSize: '10px', color: '#F0F0F5', letterSpacing: '1px' }}
      >
        {data.label}
      </div>
      <div
        className="font-bold"
        style={{
          fontSize: '26px', color: nodeColor,
          textShadow: `0 0 12px ${nodeColor}50`,
        }}
      >
        {data.score}
      </div>
      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
        {data.wardCount} wards
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}

// Memoize nodeTypes outside component to avoid React Flow warning
const nodeTypes = { custom: CustomNode };

const shortIds: Record<NeedType, string> = {
  'Food Insecurity': 'food',
  'School Dropout': 'dropout',
  'Mental Health': 'mental',
  'Healthcare': 'health',
  'Domestic Violence': 'domestic',
  'Unemployment': 'unemploy',
  'Water Scarcity': 'water',
  'Child Malnutrition': 'malnut',
};

const shortIdToNeedType: Record<string, NeedType> = {
  food: 'Food Insecurity',
  dropout: 'School Dropout',
  mental: 'Mental Health',
  health: 'Healthcare',
  domestic: 'Domestic Violence',
  unemploy: 'Unemployment',
  water: 'Water Scarcity',
  malnut: 'Child Malnutrition',
};

// FIX 5: Edge styling by strength
function getEdgeStyle(label: string) {
  const strong = ['directly causes'];
  const medium = ['causes', 'contributes to', 'triggers'];
  if (strong.includes(label)) {
    return { stroke: '#ef4444', strokeWidth: 3 };
  }
  if (medium.includes(label)) {
    return { stroke: '#f59e0b', strokeWidth: 2 };
  }
  // weak: worsens, leads to, increases need
  return { stroke: '#64748b', strokeWidth: 1.5, strokeDasharray: '6 3' };
}

export default function GraphExplorer() {
  const [selectedNode, setSelectedNode] = useState<NeedType | null>(null);
  const [showEdgeLabels, setShowEdgeLabels] = useState(true);
  const [showPredicted, setShowPredicted] = useState(false);
  const [wardFilter, setWardFilter] = useState('All');

  const nodeData = useMemo(() => {
    return needTypes.map((nt) => {
      const typeNeeds = needs.filter(n => n.needType === nt && n.status === 'Active');
      const avgScore = typeNeeds.length > 0
        ? Math.round(typeNeeds.reduce((s, n) => s + n.severity, 0) / typeNeeds.length)
        : 30;
      const wardCount = new Set(typeNeeds.map(n => n.wardId)).size;
      return { needType: nt, score: avgScore, wardCount };
    });
  }, []);

  // FIX 1 & 2: Build nodes and edges dynamically based on toggle state
  const { flowNodes, flowEdges } = useMemo(() => {
    // Base nodes
    const baseNodes: Node[] = needTypes.map((nt) => {
      const nd = nodeData.find(n => n.needType === nt);
      return {
        id: shortIds[nt],
        type: 'custom',
        position: nodePositions[nt],
        data: {
          label: nt,
          score: nd?.score ?? 30,
          wardCount: nd?.wardCount ?? 0,
          predicted: false,
        },
      };
    });

    // FIX 2: Predicted nodes
    const predictedNodes: Node[] = showPredicted ? [
      {
        id: 'crime', type: 'custom',
        position: { x: -100, y: 240 },
        data: { label: 'Crime Rate', score: 45, wardCount: 3, predicted: true },
      },
      {
        id: 'migration', type: 'custom',
        position: { x: 340, y: 600 },
        data: { label: 'Migration Crisis', score: 38, wardCount: 2, predicted: true },
      },
      {
        id: 'infra', type: 'custom',
        position: { x: 760, y: 240 },
        data: { label: 'Infrastructure Collapse', score: 42, wardCount: 4, predicted: true },
      },
    ] : [];

    // Base edges with FIX 5 styling
    const baseEdges: Edge[] = [
      { id:'e1', source:'food',     target:'dropout',  label:'causes' },
      { id:'e2', source:'food',     target:'malnut',   label:'directly causes' },
      { id:'e3', source:'dropout',  target:'mental',   label:'leads to' },
      { id:'e4', source:'unemploy', target:'food',     label:'causes' },
      { id:'e5', source:'domestic', target:'mental',   label:'worsens' },
      { id:'e6', source:'water',    target:'health',   label:'triggers' },
      { id:'e7', source:'malnut',   target:'health',   label:'increases need' },
      { id:'e8', source:'unemploy', target:'domestic',  label:'triggers' },
      { id:'e9', source:'malnut',   target:'dropout',  label:'contributes to' },
    ].map(e => ({
      ...e,
      // FIX 1: conditionally show label
      label: showEdgeLabels ? e.label : undefined,
      markerEnd: { type: MarkerType.ArrowClosed, color: getEdgeStyle(e.label).stroke },
      style: getEdgeStyle(e.label),
      labelStyle: { fill: '#e2e8f0', fontSize: 9, fontWeight: 500 },
      labelBgStyle: { fill: '#1e293b', stroke: '#475569', strokeWidth: 1, rx: 4, ry: 4 },
      labelBgPadding: [4, 6] as [number, number],
    }));

    // FIX 2: Predicted edges (dashed cyan)
    const predictedEdges: Edge[] = showPredicted ? [
      { id: 'ep1', source: 'unemploy', target: 'crime', label: 'may cause' },
      { id: 'ep2', source: 'domestic', target: 'crime', label: 'contributes to' },
      { id: 'ep3', source: 'food',     target: 'migration', label: 'may trigger' },
      { id: 'ep4', source: 'mental',   target: 'migration', label: 'leads to' },
      { id: 'ep5', source: 'water',    target: 'infra', label: 'worsens' },
      { id: 'ep6', source: 'health',   target: 'infra', label: 'contributes to' },
    ].map(e => ({
      ...e,
      label: showEdgeLabels ? e.label : undefined,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
      style: { stroke: '#06b6d4', strokeWidth: 1.5, strokeDasharray: '5 5' },
      labelStyle: { fill: '#06b6d4', fontSize: 9, fontWeight: 500 },
      labelBgStyle: { fill: '#0c2a33', stroke: '#06b6d4', strokeWidth: 1, rx: 4, ry: 4 },
      labelBgPadding: [4, 6] as [number, number],
    })) : [];

    return {
      flowNodes: [...baseNodes, ...predictedNodes],
      flowEdges: [...baseEdges, ...predictedEdges],
    };
  }, [nodeData, showEdgeLabels, showPredicted]);

  const onNodeClick = useCallback((_: any, node: Node) => {
    const nt = shortIdToNeedType[node.id];
    if (nt) setSelectedNode(nt);
  }, []);

  const getHistoricalData = (needType: NeedType) => {
    const keyMap: Record<NeedType, keyof typeof trendData[0]> = {
      'Food Insecurity': 'foodInsecurity',
      'School Dropout': 'schoolDropout',
      'Mental Health': 'mentalHealth',
      'Healthcare': 'healthcare',
      'Domestic Violence': 'domesticViolence',
      'Unemployment': 'unemployment',
      'Water Scarcity': 'waterScarcity',
      'Child Malnutrition': 'childMalnutrition',
    };
    return trendData.map(d => ({ date: d.date, score: d[keyMap[needType]] as number }));
  };

  const selectedData = selectedNode ? nodeData.find(n => n.needType === selectedNode) : null;
  const affectedWards = selectedNode
    ? [...new Set(needs.filter(n => n.needType === selectedNode && n.status === 'Active').map(n => n.wardName))]
    : [];

  // FIX 6: Legend data
  const legendItems = [
    ...needTypes.map(nt => ({ label: nt, color: nodeColorMap[nt] })),
    ...(showPredicted ? [
      { label: 'Crime Rate', color: '#06b6d4' },
      { label: 'Migration Crisis', color: '#06b6d4' },
      { label: 'Infra Collapse', color: '#06b6d4' },
    ] : []),
  ];

  return (
    <div className="w-full h-full flex relative overflow-hidden">
      {/* Left sidebar */}
      <div className="w-64 h-full bg-[#111118] border-r border-[#1E1E2E] p-6 z-10 flex flex-col overflow-y-auto shrink-0">
        <h3 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium mb-6 flex items-center gap-2">
          <Filter className="w-3.5 h-3.5" /> Controls
        </h3>

        <div className="space-y-5">
          <div>
            <label className="text-[12px] text-[#8A8A9A] mb-1.5 block">Ward Filter</label>
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="w-full bg-[#0A0A0F] text-[#F0F0F5] text-[13px] px-3 py-1.5 rounded-[4px] border border-[#1E1E2E]"
            >
              <option>All Wards</option>
              {wards.map(w => <option key={w.id}>{w.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[12px] text-[#8A8A9A] mb-1.5 block">Time Filter</label>
            <select className="w-full bg-[#0A0A0F] text-[#F0F0F5] text-[13px] px-3 py-1.5 rounded-[4px] border border-[#1E1E2E]">
              <option>Current</option>
              <option>1 week ago</option>
              <option>1 month ago</option>
            </select>
          </div>

          <button
            onClick={() => setShowPredicted(!showPredicted)}
            className="w-full flex items-center gap-2 text-[13px] px-3 py-1.5 rounded-[4px] border transition-colors"
            style={{
              borderColor: showPredicted ? '#06b6d4' : '#1E1E2E',
              backgroundColor: showPredicted ? 'rgba(6,182,212,0.1)' : 'transparent',
              color: showPredicted ? '#06b6d4' : '#F0F0F5',
            }}
          >
            {showPredicted ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            Predicted Nodes
          </button>

          <button
            onClick={() => setShowEdgeLabels(!showEdgeLabels)}
            className="w-full flex items-center gap-2 text-[13px] px-3 py-1.5 rounded-[4px] border transition-colors"
            style={{
              borderColor: showEdgeLabels ? '#6C63FF' : '#1E1E2E',
              backgroundColor: showEdgeLabels ? 'rgba(108,99,255,0.1)' : 'transparent',
              color: showEdgeLabels ? '#a5b4fc' : '#F0F0F5',
            }}
          >
            {showEdgeLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            Edge Labels
          </button>
        </div>
      </div>

      {/* FIX 4: Graph area with enhanced background */}
      <div
        className="flex-1 h-full relative"
        style={{
          background: `
            radial-gradient(ellipse at 50% 50%, rgba(108,99,255,0.06) 0%, transparent 60%),
            #0f172a
          `,
        }}
      >
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          style={{ background: 'transparent' }}
        >
          <Background
            color="#334155"
            gap={30}
            size={1}
          />
          <Controls position="bottom-right" className="bg-[#1e293b] border-[#475569] fill-[#F0F0F5]" />
        </ReactFlow>

        {/* FIX 6: Color Legend */}
        <div
          style={{
            position: 'absolute', bottom: 16, left: 16, zIndex: 10,
            background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(8px)',
            border: '1px solid #334155', borderRadius: '8px',
            padding: '10px 14px', maxWidth: '180px',
          }}
        >
          <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px', fontWeight: 600 }}>
            Legend
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {legendItems.map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  backgroundColor: item.color, flexShrink: 0,
                  boxShadow: `0 0 4px ${item.color}60`,
                }} />
                <span style={{ fontSize: '10px', color: '#cbd5e1' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedNode && selectedData && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="absolute right-0 top-0 bottom-0 w-96 bg-[#111118] border-l border-[#1E1E2E] overflow-y-auto z-20"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[18px] font-semibold text-[#F0F0F5]">{selectedNode}</h3>
                <button onClick={() => setSelectedNode(null)} className="p-1.5 hover:bg-[#1E1E2E] rounded text-[#8A8A9A] hover:text-[#F0F0F5]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-[#0A0A0F] border border-[#1E1E2E] rounded-[8px] p-4 mb-6 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-[#55556A] uppercase tracking-[0.06em]">Current Score</div>
                  <div className="text-[32px] font-semibold" style={{ color: nodeColorMap[selectedNode] || getSeverityColor(selectedData.score) }}>
                    {selectedData.score}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-[#55556A] uppercase tracking-[0.06em]">Wards Affected</div>
                  <div className="text-[24px] font-semibold text-[#F0F0F5]">{selectedData.wardCount}</div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium mb-4">Score History — 30 Days</h4>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={getHistoricalData(selectedNode)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#55556A' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#55556A' }} tickLine={false} axisLine={false} />
                    <RechartsTooltip
                      contentStyle={{ fontSize: '12px', background: '#1E1E2E', color: '#F0F0F5', border: '1px solid #2A2A40' }}
                    />
                    <Line type="monotone" dataKey="score" stroke={nodeColorMap[selectedNode] || getSeverityColor(selectedData.score)} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mb-6">
                <h4 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium mb-3">Affected Wards</h4>
                <div className="flex flex-wrap gap-2">
                  {affectedWards.map((w, i) => (
                    <span key={i} className="px-2 py-1 text-[12px] rounded border border-[#2A2A40] bg-[#0A0A0F] text-[#8A8A9A]">
                      {w.split(' - ')[0]}
                    </span>
                  ))}
                  {affectedWards.length === 0 && (
                    <span className="text-[13px] text-[#55556A]">No active wards</span>
                  )}
                </div>
              </div>

              <div className="mb-6 bg-[#1F1010] border border-[#E05555]/30 rounded-[8px] p-4">
                <h4 className="text-[12px] font-medium text-[#E05555] mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Cascade Prediction
                </h4>
                <p className="text-[13px] text-[#F0F0F5] leading-relaxed">
                  If this reaches score 85 → triggers <span className="font-semibold text-white">{graphEdges.find(e => e.source === selectedNode)?.target || 'related crises'}</span> within 18 days
                </p>
              </div>

              <div className="mb-6">
                <h4 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium mb-3">Recommended Interventions</h4>
                <div className="space-y-2">
                  {interventions[selectedNode].map((inv, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-[6px] bg-[#0A0A0F] border border-[#1E1E2E]">
                      <span className="text-[13px] text-[#8A8A9A]">{inv.action}</span>
                      <span className="text-[13px] font-semibold text-[#4AAF85]">{inv.impact}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full py-[10px] rounded-[6px] bg-[#6C63FF] text-white text-[14px] font-medium hover:bg-[#5a52d9] transition-colors flex items-center justify-center gap-2">
                <Users className="w-4 h-4" /> Assign Volunteers
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
