import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle, ChevronDown, ChevronUp, UserPlus, CheckCircle2,
  Clock, ArrowRight, Shield, Filter, Zap, LayoutList
} from 'lucide-react';
import { alerts as mockAlerts, predictions as mockPredictions } from '../data/mockData';
import { getUrgencyColor, formatTimeAgo, getSeverityColor } from '../utils/helpers';
import toast from 'react-hot-toast';
import type { UrgencyLevel } from '../types';

export default function Alerts() {
  const [tab, setTab] = useState<'alerts' | 'predictions' | 'timeline'>('alerts');
  const [filter, setFilter] = useState<UrgencyLevel | 'All'>('All');
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  const filteredAlerts = filter === 'All' ? mockAlerts : mockAlerts.filter(a => a.urgency === filter);

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      <div>
        <h1 className="text-[20px] font-semibold text-[#F0F0F5]">Alerts & Predictions</h1>
        <p className="text-[12px] text-[#55556A]">Monitor active alerts and AI-predicted future crises</p>
      </div>

      <div className="flex gap-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-[6px] p-1 w-fit">
        {[
          { key: 'alerts' as const, label: 'Active Alerts', count: mockAlerts.length },
          { key: 'predictions' as const, label: 'Predictions', count: mockPredictions.length },
          { key: 'timeline' as const, label: 'Crisis Timeline', count: mockAlerts.length + mockPredictions.length },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-[4px] text-[13px] font-medium transition-colors flex items-center gap-2 ${
              tab === t.key
                ? 'bg-[#1E1E2E] text-[#F0F0F5]'
                : 'text-[#8A8A9A] hover:text-[#F0F0F5]'
            }`}
          >
            {t.label}
            <span className="px-1.5 py-0.5 rounded-[4px] text-[10px] bg-[#111118] border border-[#2A2A40] text-[#8A8A9A]">
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {tab === 'alerts' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-[#55556A]" />
            {(['All', 'Critical', 'High', 'Medium', 'Low'] as (UrgencyLevel | 'All')[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-[4px] text-[12px] font-medium transition-colors border ${
                  filter === f
                    ? 'bg-[#1E1E2E] text-[#F0F0F5] border-[#2A2A40]'
                    : 'bg-[#111118] border-[#1E1E2E] text-[#8A8A9A] hover:bg-[#1E1E2E]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="bg-[#111118] border border-[#1E1E2E] rounded-[8px] p-6 relative">
            <div className="absolute top-0 bottom-0 left-[34px] w-px bg-[#1E1E2E]" />
            <div className="space-y-6">
              {filteredAlerts.map((alert) => (
                <div key={alert.id} className="relative pl-12 group cursor-pointer" onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}>
                  {/* Timeline Dot */}
                  <div className="absolute left-[29px] top-1.5 w-[11px] h-[11px] rounded-full border-[2.5px] border-[#111118] z-10 transition-transform group-hover:scale-125" style={{ backgroundColor: getUrgencyColor(alert.urgency) }} />
                  
                  {/* Content Card */}
                  <div className={`bg-[#0A0A0F] border transition-colors rounded-[8px] p-4 ${expandedAlert === alert.id ? 'border-[#6C63FF]' : 'border-[#1E1E2E] group-hover:border-[#2A2A40]'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-semibold border" style={{ backgroundColor: '#1F1010', color: getUrgencyColor(alert.urgency), borderColor: `${getUrgencyColor(alert.urgency)}40` }}>
                            {alert.urgency}
                          </span>
                          <span className="text-[14px] font-semibold text-[#F0F0F5]">{alert.needType}</span>
                        </div>
                        <div className="text-[12px] text-[#8A8A9A]">{alert.wardName} • {formatTimeAgo(alert.detectedAt)}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-[11px] text-[#55556A] uppercase tracking-wider mb-0.5">Severity</div>
                          <div className="text-[14px] font-bold" style={{ color: getSeverityColor(alert.severity) }}>{alert.severity}/100</div>
                        </div>
                        <div className="flex items-center gap-2 border-l border-[#1E1E2E] pl-4">
                          <button onClick={(e) => { e.stopPropagation(); toast.success('Volunteer assigned'); }} className="p-1.5 rounded-[4px] bg-[#111118] border border-[#2A2A40] hover:bg-[#1E1E2E] text-[#8A8A9A] transition-colors" title="Assign Volunteer">
                            <UserPlus className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); toast.success('Resolved'); }} className="p-1.5 rounded-[4px] bg-[#111118] border border-[#2A2A40] hover:bg-[#1E1E2E] text-[#4AAF85] transition-colors" title="Mark Resolved">
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {expandedAlert === alert.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ overflow: 'hidden' }} className="mt-4 pt-4 border-t border-[#1E1E2E] grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.08em] text-[#55556A] mb-1">Impact</div>
                          <p className="text-[13px] text-[#8A8A9A]">{alert.affectedCount} people currently affected by this situation.</p>
                        </div>
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.08em] text-[#55556A] mb-1">Cascade Risk</div>
                          <div className="flex items-center gap-1.5 text-[13px]">
                            <span className="text-[#8A8A9A]">{alert.needType}</span>
                            <ArrowRight className="w-3 h-3 text-[#55556A]" />
                            <span className="text-[#E05555]">Related Crisis</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.08em] text-[#55556A] mb-1">Assignment</div>
                          <p className="text-[13px] text-[#8A8A9A]">{alert.assignedVolunteer ? `Assigned to ${alert.assignedVolunteer}` : 'Not yet assigned'}</p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {tab === 'predictions' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockPredictions.map((pred, i) => (
            <motion.div
              key={pred.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#111118] rounded-[8px] border border-[#1E1E2E] overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-[#1E1E2E] flex items-start justify-between bg-[#0A0A0F]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4" style={{ color: getSeverityColor(pred.predictedSeverity) }} />
                    <span className="font-semibold text-[14px] text-[#F0F0F5]">{pred.needType}</span>
                  </div>
                  <div className="text-[12px] text-[#8A8A9A]">{pred.wardName}</div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#1F1010] border border-[#E05555]/30">
                  <Clock className="w-3 h-3 text-[#E05555]" />
                  <span className="text-[11px] font-medium text-[#E05555]">{pred.predictedDays} days</span>
                </div>
              </div>

              <div className="p-5 space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] uppercase tracking-[0.08em] text-[#55556A]">Confidence</span>
                    <span className="text-[12px] font-semibold text-[#8A8A9A]">{pred.confidence}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1E1E2E] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#6C63FF]"
                      style={{ width: `${pred.confidence}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="text-[11px] uppercase tracking-[0.08em] text-[#55556A] mb-2">Causal Chain</div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {pred.causalChain.map((link, j) => (
                      <div key={j} className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-1 rounded-[4px] text-[11px] font-medium border`}
                          style={{
                            backgroundColor: link.predicted ? 'transparent' : '#1F1010',
                            borderColor: link.predicted ? '#2A2A40' : `${getSeverityColor(link.score)}40`,
                            color: link.predicted ? '#8A8A9A' : getSeverityColor(link.score),
                            borderStyle: link.predicted ? 'dashed' : 'solid'
                          }}
                        >
                          {link.needType} ({link.score})
                        </span>
                        {j < pred.causalChain.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-[#2A2A40]" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#101F18] border border-[#4AAF85]/30 rounded-[6px] p-3">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-[#4AAF85] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[12px] text-[#8A8A9A]">{pred.recommendedAction}</div>
                      <div className="text-[12px] font-semibold text-[#4AAF85] mt-1">
                        → {pred.estimatedImpact}% chance of prevention
                      </div>
                    </div>
                  </div>
                </div>

                <button className="w-full py-2 rounded-[6px] bg-[#6C63FF] text-white text-[13px] font-medium hover:bg-[#5a52d9] transition-colors flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" /> Take Action
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {tab === 'timeline' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[800px] mx-auto bg-[#111118] border border-[#1E1E2E] rounded-[8px] p-6">
          <div className="flex items-center gap-2 mb-8 text-[#55556A]">
            <LayoutList className="w-5 h-5" />
            <h3 className="font-medium text-[14px]">Historical Timeline</h3>
          </div>
          <div className="relative border-l border-[#1E1E2E] ml-4 space-y-8">
            {[...mockAlerts].sort((a,b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()).map(alert => (
              <div key={`tl-${alert.id}`} className="relative pl-6">
                <div className="absolute w-3 h-3 bg-[#E05555] rounded-full -left-[6.5px] top-1 border-[3px] border-[#111118]" />
                <div className="text-[11px] text-[#55556A] mb-1">{formatTimeAgo(alert.detectedAt)}</div>
                <div className="text-[13px] font-medium text-[#F0F0F5]">{alert.needType} in {alert.wardName}</div>
                <div className="text-[12px] text-[#8A8A9A] mt-1">Severity: {alert.severity} / 100 • Status: {alert.status}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
