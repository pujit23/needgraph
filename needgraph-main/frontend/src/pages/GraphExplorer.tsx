import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactFlow, {
  Background, Controls, Handle, Position,
  useNodesState, useEdgesState, MarkerType,
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

function CustomNode({ data, selected }: { data: any, selected: boolean }) {
  const color = getSeverityColor(data.score);
  const size = 40 + (data.score / 100) * 50;

  return (
    <div
      className="flex flex-col items-center justify-center transition-colors"
      style={{
        width: size + 60,
        padding: '12px 16px',
        backgroundColor: '#111118',
        border: selected ? '2px solid #6C63FF' : `1px solid ${data.predicted ? '#1E1E2E' : '#2A2A40'}`,
        borderStyle: data.predicted ? 'dashed' : 'solid',
        opacity: data.predicted ? 0.7 : 1,
      }}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="text-[11px] font-medium text-center mb-1 text-[#F0F0F5] uppercase tracking-[0.06em]">{data.label}</div>
      <div className="text-[24px] font-semibold" style={{ color }}>{data.score}</div>
      <div className="text-[10px] text-[#55556A] mt-0.5">{data.wardCount} wards</div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}

const nodeTypes = { custom: CustomNode };

export default function GraphExplorer() {
  const [selectedNode, setSelectedNode] = useState<NeedType | null>(null);
  const [showEdgeLabels, setShowEdgeLabels] = useState(true);
  const [showPredicted, setShowPredicted] = useState(true);
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

  // Map short IDs used in edges back to full NeedType strings
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

  const initialNodes = needTypes.map((nt) => {
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

  const initialEdges = [
    { id:'e1', source:'food',     target:'dropout',  label:'causes',         markerEnd:{type:'ArrowClosed'}, style:{stroke:'#E05555',strokeWidth:2}, labelStyle:{fill:'#55556A',fontSize:10} },
    { id:'e2', source:'food',     target:'malnut',   label:'directly causes',markerEnd:{type:'ArrowClosed'}, style:{stroke:'#E05555',strokeWidth:2}, labelStyle:{fill:'#55556A',fontSize:10} },
    { id:'e3', source:'dropout',  target:'mental',   label:'leads to',       markerEnd:{type:'ArrowClosed'}, style:{stroke:'#D4874A',strokeWidth:1.5}, labelStyle:{fill:'#55556A',fontSize:10} },
    { id:'e4', source:'unemploy', target:'food',     label:'causes',         markerEnd:{type:'ArrowClosed'}, style:{stroke:'#C9A84C',strokeWidth:1.5}, labelStyle:{fill:'#55556A',fontSize:10} },
    { id:'e5', source:'domestic', target:'mental',   label:'worsens',        markerEnd:{type:'ArrowClosed'}, style:{stroke:'#D4874A',strokeWidth:1.5}, labelStyle:{fill:'#55556A',fontSize:10} },
    { id:'e6', source:'water',    target:'health',   label:'triggers',       markerEnd:{type:'ArrowClosed'}, style:{stroke:'#4AAF85',strokeWidth:1.5}, labelStyle:{fill:'#55556A',fontSize:10} },
    { id:'e7', source:'malnut',   target:'health',   label:'increases need', markerEnd:{type:'ArrowClosed'}, style:{stroke:'#C9A84C',strokeWidth:1.5}, labelStyle:{fill:'#55556A',fontSize:10} },
    { id:'e8', source:'unemploy', target:'domestic', label:'triggers',       markerEnd:{type:'ArrowClosed'}, style:{stroke:'#C9A84C',strokeWidth:1.5}, labelStyle:{fill:'#55556A',fontSize:10} },
    { id:'e9', source:'malnut',   target:'dropout',  label:'contributes to', markerEnd:{type:'ArrowClosed'}, style:{stroke:'#D4874A',strokeWidth:1.5}, labelStyle:{fill:'#55556A',fontSize:10} },
  ];

  const [nodes, _setNodes, onNodesChange] = useNodesState(initialNodes as Node[]);
  const [edges, _setEdges, onEdgesChange] = useEdgesState(initialEdges as Edge[]);

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

  return (
    <div className="w-full h-full flex relative overflow-hidden">
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
            className="w-full flex items-center gap-2 text-[13px] px-3 py-1.5 rounded-[4px] border border-[#1E1E2E] text-[#F0F0F5] hover:bg-[#1E1E2E] transition-colors"
          >
            {showPredicted ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            Predicted Nodes
          </button>

          <button
            onClick={() => setShowEdgeLabels(!showEdgeLabels)}
            className="w-full flex items-center gap-2 text-[13px] px-3 py-1.5 rounded-[4px] border border-[#1E1E2E] text-[#F0F0F5] hover:bg-[#1E1E2E] transition-colors"
          >
            {showEdgeLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            Edge Labels
          </button>
        </div>
      </div>

      <div className="flex-1 h-full bg-[#0A0A0F]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-[#0A0A0F]"
        >
          <Background color="#1E1E2E" gap={24} />
          <Controls position="bottom-right" className="bg-[#111118] border-[#1E1E2E] fill-[#F0F0F5]" />
        </ReactFlow>
      </div>

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
                  <div className="text-[32px] font-semibold" style={{ color: getSeverityColor(selectedData.score) }}>
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
                    <Line type="monotone" dataKey="score" stroke={getSeverityColor(selectedData.score)} strokeWidth={2} dot={false} />
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
                <p className="text-[13px] text-[#F0F0F5Leading-relaxed]">
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
