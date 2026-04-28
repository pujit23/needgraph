import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, Phone, MapPin, Award, CheckCircle2, Circle, Clock } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { MapContainer, TileLayer, Circle as LeafCircle, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { wards } from '../data/mockData';
import { useVolunteersStore, useTasksStore } from '../store';
import type { Volunteer, Task, TaskStatus } from '../types';
import AddVolunteerModal from '../components/AddVolunteerModal';
import AssignTaskModal from '../components/AssignTaskModal';

const defaultIcon = L.icon({ iconUrl: markerIconUrl, shadowUrl: markerShadowUrl, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = defaultIcon;

const allSkills = ['Medical', 'First Aid', 'Healthcare', 'Education', 'Tutoring', 'Youth Mentoring',
  'Counselling', 'Mental Health', 'Crisis Support', 'Food Distribution', 'Logistics',
  'Community Outreach', 'Legal Aid', 'Women Safety', 'Child Welfare', 'Data Collection',
  'Water Management', 'Sanitation', 'Community Health'];
const uniqueSkills = [...new Set(allSkills)].sort();

const statusColors = {
  Available: { text: '#4AAF85', bg: '#101F18', border: '#4AAF8540' },
  Deployed: { text: '#F0F0F5', bg: '#1A1A2E', border: '#6C63FF' },
  'Off-duty': { text: '#8A8A9A', bg: '#111118', border: '#2A2A40' },
};

const taskStatusConfig: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  'Assigned': { label: 'Assigned', color: '#6C63FF', bg: 'rgba(108,99,255,0.12)' },
  'In Progress': { label: 'In Progress', color: '#D4A017', bg: 'rgba(212,160,23,0.12)' },
  'Completed': { label: 'Completed', color: '#4AAF85', bg: 'rgba(74,175,133,0.12)' },
  'Verified': { label: 'Verified', color: '#5B8DEF', bg: 'rgba(91,141,239,0.12)' },
};

const priorityColors: Record<string, string> = {
  Low: '#4AAF85', Medium: '#D4A017', High: '#D4874A', Critical: '#E05555',
};

function getSkillRadarData(volunteer: Volunteer) {
  const skillCategories = ['Medical', 'Education', 'Counselling', 'Logistics', 'Legal', 'Technical'];
  return skillCategories.map(cat => ({
    skill: cat,
    score: volunteer.skills.some(s =>
      s.toLowerCase().includes(cat.toLowerCase()) ||
      (cat === 'Technical' && ['Data Collection', 'Water Management', 'Sanitation'].includes(s)) ||
      (cat === 'Logistics' && ['Food Distribution', 'Logistics', 'Community Outreach'].includes(s))
    ) ? 70 + Math.random() * 30 : 20 + Math.random() * 30,
  }));
}

function getMockActivity(id: number | string) {
  const numId = typeof id === 'string' ? id.charCodeAt(0) + id.length : id;
  return Array.from({ length: 14 }).map((_, i) => ({ day: i, activity: Math.floor(Math.abs(Math.sin((numId * 13) + i)) * 10) }));
}

// ─── Task List Panel ──────────────────────────────────────
function TaskPanel({ volunteer }: { volunteer: Volunteer }) {
  const { getTasksForVolunteer, updateTaskStatus, getCompletionPercentage } = useTasksStore();
  const [taskFilter, setTaskFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Completed'>('All');

  const allTasks = getTasksForVolunteer(volunteer.id);
  const pct = getCompletionPercentage(volunteer.id);

  const filtered = allTasks.filter(t => {
    if (taskFilter === 'All') return true;
    if (taskFilter === 'Pending') return t.status === 'Assigned';
    if (taskFilter === 'In Progress') return t.status === 'In Progress';
    if (taskFilter === 'Completed') return t.status === 'Completed' || t.status === 'Verified';
    return true;
  });

  const handleMarkComplete = (task: Task) => {
    if (task.status === 'Assigned') updateTaskStatus(task.id, 'In Progress');
    else if (task.status === 'In Progress') updateTaskStatus(task.id, 'Completed');
    else if (task.status === 'Completed') updateTaskStatus(task.id, 'Verified');
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h4 style={{ fontSize: 11, color: '#55556A', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, margin: 0 }}>
          Assigned Tasks ({allTasks.length})
        </h4>
        {allTasks.length > 0 && (
          <span style={{ fontSize: 11, color: '#8A8A9A' }}>{pct}% complete</span>
        )}
      </div>

      {/* Progress bar */}
      {allTasks.length > 0 && (
        <div style={{ marginBottom: 12, height: 4, background: '#1E1E2E', borderRadius: 2, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ height: '100%', background: 'linear-gradient(90deg, #6C63FF, #4AAF85)', borderRadius: 2 }}
          />
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {(['All', 'Pending', 'In Progress', 'Completed'] as const).map(f => (
          <button
            key={f} onClick={() => setTaskFilter(f)}
            style={{
              padding: '4px 10px', borderRadius: 100, fontSize: 10, fontWeight: 600, cursor: 'pointer',
              border: `1px solid ${taskFilter === f ? '#6C63FF' : '#1E1E2E'}`,
              background: taskFilter === f ? 'rgba(108,99,255,0.12)' : 'transparent',
              color: taskFilter === f ? '#6C63FF' : '#55556A',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#55556A', fontSize: 12 }}>
          {allTasks.length === 0 ? 'No tasks assigned yet. Click "Assign to Task" below.' : 'No tasks match this filter.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(task => {
            const cfg = taskStatusConfig[task.status];
            const canAdvance = task.status !== 'Verified';
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: '#0A0A0F', border: '1px solid #1E1E2E',
                  borderRadius: 8, padding: '12px 14px',
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                }}
              >
                {/* Complete toggle */}
                <button
                  onClick={() => handleMarkComplete(task)}
                  title={canAdvance ? 'Advance status' : 'Verified'}
                  style={{ background: 'none', border: 'none', cursor: canAdvance ? 'pointer' : 'default', padding: 0, marginTop: 2, color: cfg.color, flexShrink: 0 }}
                >
                  {task.status === 'Completed' || task.status === 'Verified'
                    ? <CheckCircle2 size={16} />
                    : <Circle size={16} />}
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#F0F0F5' }}>{task.title}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 100, background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 100, background: `${priorityColors[task.priority]}22`, color: priorityColors[task.priority] }}>
                      {task.priority}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: '#55556A', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <MapPin size={10} /> {task.ward}
                    </span>
                    <span style={{ fontSize: 11, color: '#55556A', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Clock size={10} /> {task.estimatedHours}h · {task.taskType}
                    </span>
                  </div>
                  {task.description && (
                    <p style={{ fontSize: 11, color: '#8A8A9A', marginTop: 4, margin: '4px 0 0' }}>{task.description}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function Volunteers() {
  const { volunteers, getFilteredVolunteers, selectedVolunteer, setSelectedVolunteer,
    searchQuery, setSearchQuery, filterSkill, setFilterSkill, filterStatus, setFilterStatus } = useVolunteersStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  const filtered = getFilteredVolunteers();

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      <AddVolunteerModal open={showAddModal} onClose={() => setShowAddModal(false)} />
      <AssignTaskModal open={showTaskModal} onClose={() => setShowTaskModal(false)} volunteer={selectedVolunteer} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-[#F0F0F5]">Volunteer Management</h1>
          <p className="text-[12px] text-[#55556A]">{volunteers.length} registered volunteers</p>
        </div>
        <button
          id="add-volunteer-btn"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-[6px] bg-[#6C63FF] text-white text-[14px] font-medium hover:bg-[#5a52d9] transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Add Volunteer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: 'calc(100vh - 200px)' }}>
        {/* LEFT: Volunteer List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#111118] rounded-[8px] border border-[#1E1E2E] p-4 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#55556A]" />
              <input
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search volunteers..."
                className="w-full pl-9 pr-3 py-2 rounded-[6px] border border-[#1E1E2E] bg-[#0A0A0F] text-[13px] text-[#F0F0F5] placeholder-[#55556A] focus:border-[#2A2A40]"
              />
            </div>
            <div className="flex gap-2">
              <select value={filterSkill} onChange={(e) => setFilterSkill(e.target.value)} className="flex-1 text-[12px] px-2 py-1.5 rounded-[4px] border border-[#1E1E2E] bg-[#0A0A0F] text-[#F0F0F5]">
                <option value="All">All Skills</option>
                {uniqueSkills.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="flex-1 text-[12px] px-2 py-1.5 rounded-[4px] border border-[#1E1E2E] bg-[#0A0A0F] text-[#F0F0F5]">
                <option value="All">All Status</option>
                <option value="Available">Available</option>
                <option value="Deployed">Deployed</option>
                <option value="Off-duty">Off-duty</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 alert-feed">
            {filtered.map((vol) => (
              <motion.div
                key={vol.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={() => setSelectedVolunteer(vol)}
                className={`bg-[#111118] rounded-[6px] border p-4 cursor-pointer transition-colors ${selectedVolunteer?.id === vol.id ? 'border-[#6C63FF]' : 'border-[#1E1E2E] hover:border-[#2A2A40]'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[6px] bg-[#1E1E2E] flex items-center justify-center text-[#F0F0F5] text-[14px] font-semibold shrink-0">
                    {vol.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[13px] text-[#F0F0F5] truncate">{vol.name}</div>
                    <div className="text-[11px] text-[#8A8A9A]">{vol.wardName.split(' - ')[1]}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border" style={{ backgroundColor: statusColors[vol.status].bg, color: statusColors[vol.status].text, borderColor: statusColors[vol.status].border }}>
                      {vol.status}
                    </span>
                    <span className="text-[11px] text-[#55556A]">{vol.tasksThisWeek} tasks</span>
                  </div>
                </div>
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {vol.skills.slice(0, 3).map((skill, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-[4px] bg-[#0A0A0F] border border-[#1E1E2E] text-[#8A8A9A]">{skill}</span>
                  ))}
                </div>
                <div className="mt-3 h-8 w-full border-t border-[#1E1E2E] pt-2 pointer-events-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getMockActivity(vol.id)}>
                      <Area type="monotone" dataKey="activity" stroke={statusColors[vol.status].text} fill={statusColors[vol.status].text} fillOpacity={0.1} strokeWidth={1} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* RIGHT: Detail Panel */}
        <div className="lg:col-span-2">
          {selectedVolunteer ? (
            <motion.div key={selectedVolunteer.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#111118] rounded-[8px] border border-[#1E1E2E] overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 180px)' }}>
              {/* Profile header */}
              <div className="bg-[#0A0A0F] border-b border-[#1E1E2E] px-6 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-[8px] bg-[#1E1E2E] flex items-center justify-center text-[#F0F0F5] text-[20px] font-semibold">
                    {selectedVolunteer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-[18px] font-semibold text-[#F0F0F5]">{selectedVolunteer.name}</h2>
                    <div className="flex items-center gap-3 text-[#8A8A9A] text-[12px] mt-1 flex-wrap">
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#55556A]" />{selectedVolunteer.contact}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#55556A]" />{selectedVolunteer.wardName.split(' - ')[1]}</span>
                      {selectedVolunteer.ngoName && <span className="text-[#6C63FF]">{selectedVolunteer.ngoName}</span>}
                      {selectedVolunteer.yearsExperience !== undefined && <span>{selectedVolunteer.yearsExperience}y exp</span>}
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-1 rounded-[4px] border" style={{ backgroundColor: statusColors[selectedVolunteer.status].bg, color: statusColors[selectedVolunteer.status].text, borderColor: statusColors[selectedVolunteer.status].border }}>
                    {selectedVolunteer.status}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="border border-[#1E1E2E] p-4 rounded-[6px] bg-[#0A0A0F]">
                    <div className="text-[24px] font-semibold text-[#F0F0F5]">{selectedVolunteer.tasksThisWeek}</div>
                    <div className="text-[11px] text-[#55556A] uppercase tracking-[0.06em] mt-1">This Week</div>
                  </div>
                  <div className="border border-[#1E1E2E] p-4 rounded-[6px] bg-[#0A0A0F]">
                    <div className="text-[24px] font-semibold text-[#F0F0F5]">{selectedVolunteer.totalTasks}</div>
                    <div className="text-[11px] text-[#55556A] uppercase tracking-[0.06em] mt-1">Total Tasks</div>
                  </div>
                  <div className="border border-[#1E1E2E] p-4 rounded-[6px] bg-[#0A0A0F]">
                    <div className="text-[24px] font-semibold text-[#4AAF85]">
                      {selectedVolunteer.assignments.reduce((s, a) => s + a.hours, 0)}h
                    </div>
                    <div className="text-[11px] text-[#55556A] uppercase tracking-[0.06em] mt-1">Total Hours</div>
                  </div>
                </div>

                {/* Skills Radar */}
                <div>
                  <h4 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium mb-4">Skills Assessment</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={getSkillRadarData(selectedVolunteer)}>
                      <PolarGrid stroke="#1E1E2E" />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: '#8A8A9A', fontSize: 11 }} />
                      <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                      <Radar dataKey="score" stroke="#6C63FF" fill="#6C63FF" fillOpacity={0.1} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Live Task Panel */}
                <TaskPanel volunteer={selectedVolunteer} />

                {/* Assignment History */}
                <div>
                  <h4 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium mb-4">Assignment History</h4>
                  <div className="border border-[#1E1E2E] rounded-[6px] overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#0A0A0F] border-b border-[#1E1E2E]">
                          <th className="text-[11px] font-medium text-[#55556A] uppercase tracking-[0.06em] px-4 py-3">Date</th>
                          <th className="text-[11px] font-medium text-[#55556A] uppercase tracking-[0.06em] px-4 py-3">Ward</th>
                          <th className="text-[11px] font-medium text-[#55556A] uppercase tracking-[0.06em] px-4 py-3">Task</th>
                          <th className="text-[11px] font-medium text-[#55556A] uppercase tracking-[0.06em] px-4 py-3">Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedVolunteer.assignments.map((a) => (
                          <tr key={a.id} className="border-b border-[#1E1E2E] bg-[#111118]">
                            <td className="px-4 py-3 text-[12px] text-[#8A8A9A]">{a.date}</td>
                            <td className="px-4 py-3 text-[12px] text-[#8A8A9A]">{a.wardName.split(' - ')[0]}</td>
                            <td className="px-4 py-3 text-[13px] text-[#F0F0F5]">{a.task}</td>
                            <td className="px-4 py-3 text-[12px] text-[#55556A]">{a.hours}h</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Assign to Task button */}
                <button
                  id="assign-task-btn"
                  onClick={() => setShowTaskModal(true)}
                  className="w-full py-[10px] rounded-[6px] text-white text-[14px] font-medium transition-colors"
                  style={{ background: 'linear-gradient(135deg, #6C63FF, #9C63FF)' }}
                >
                  Assign to Task
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center bg-[#111118] rounded-[8px] border border-[#1E1E2E]">
              <div className="text-center text-[#55556A]">
                <Award className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-[14px] font-medium text-[#8A8A9A]">Select a volunteer</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deployment Map */}
      <div className="bg-[#111118] rounded-[8px] border border-[#1E1E2E] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1E1E2E] bg-[#0A0A0F] flex items-center justify-between">
          <h3 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium">Deployment Map</h3>
        </div>
        <div className="h-[400px] map-container-wrapper m-4 relative">
          <MapContainer center={[17.3850, 78.4867]} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap contributors &copy; CARTO' />
            {wards.map(w => (
              <LeafCircle key={`heat-${w.id}`} center={[w.lat, w.lng]} radius={2000} pathOptions={{ fillColor: '#6C63FF', fillOpacity: 0.15, stroke: false }} />
            ))}
            {volunteers.filter(v => v.status === 'Deployed').map(vol => {
              const ward = wards.find(w => w.id === vol.wardId);
              if (!ward) return null;
              return (
                <CircleMarker key={vol.id} center={[ward.lat + (Math.random() - 0.5) * 0.015, ward.lng + (Math.random() - 0.5) * 0.015]} radius={Math.max(6, vol.tasksThisWeek * 2)} pathOptions={{ fillColor: '#6C63FF', color: '#111118', weight: 1.5, fillOpacity: 0.8 }}>
                  <Popup>
                    <div style={{ fontFamily: 'Inter, sans-serif', color: '#F0F0F5' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{vol.name}</div>
                      <div style={{ fontSize: 11, color: '#8A8A9A' }}>{vol.skills.join(', ')}</div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
