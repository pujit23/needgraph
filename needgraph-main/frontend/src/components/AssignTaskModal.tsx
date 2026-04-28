import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CheckCircle2, AlertCircle, ChevronDown,
  ClipboardList, MapPin, Calendar, Clock, AlignLeft, Flag,
} from 'lucide-react';
import { useTasksStore } from '../store';
import { wards } from '../data/mockData';
import type { Volunteer, Task, TaskType, TaskPriority } from '../types';

// ─── Constants ──────────────────────────────────────────
const TASK_TYPES: TaskType[] = [
  'Health Camp', 'Survey', 'Education Drive', 'Legal Workshop',
  'Food Distribution', 'Counselling Session', 'Water Relief',
  'Emergency Response', 'Community Outreach', 'Other',
];

const PRIORITIES: { label: TaskPriority; color: string }[] = [
  { label: 'Low', color: '#4AAF85' },
  { label: 'Medium', color: '#D4A017' },
  { label: 'High', color: '#D4874A' },
  { label: 'Critical', color: '#E05555' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  volunteer: Volunteer | null;
}

interface FormData {
  title: string;
  ward: string;
  taskType: TaskType;
  date: string;
  estimatedHours: string;
  description: string;
  priority: TaskPriority;
}

const EMPTY_FORM: FormData = {
  title: '', ward: '', taskType: 'Health Camp',
  date: '', estimatedHours: '', description: '', priority: 'Medium',
};

/**
 * AssignTaskModal — modal to create and assign a task to a specific volunteer.
 * On submit, dispatches to useTasksStore, auto-updating the volunteer's status to Deployed.
 */
export default function AssignTaskModal({ open, onClose, volunteer }: Props) {
  const { addTask } = useTasksStore();
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!form.title.trim()) errs.title = 'Task title is required';
    if (!form.ward.trim()) errs.ward = 'Ward / Location is required';
    if (!form.date) errs.date = 'Date is required';
    if (!form.estimatedHours || isNaN(Number(form.estimatedHours)) || Number(form.estimatedHours) <= 0)
      errs.estimatedHours = 'Enter valid hours (> 0)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !volunteer) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: form.title.trim(),
      ward: form.ward.trim(),
      taskType: form.taskType,
      date: form.date,
      estimatedHours: Number(form.estimatedHours),
      description: form.description.trim(),
      priority: form.priority,
      status: 'Assigned',
      volunteerId: volunteer.id,
      createdAt: new Date().toISOString(),
    };

    addTask(newTask);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm(EMPTY_FORM);
      onClose();
    }, 1500);
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitted(false);
    onClose();
  };

  if (!volunteer) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            }}
          />

          {/* Modal — right-side slide-in panel (same as AddVolunteerModal) */}
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed', right: 0, top: 0, bottom: 0, zIndex: 1001,
              width: '100%', maxWidth: 520,
              background: '#0A0A0F',
              borderLeft: '1px solid #1E1E2E',
              display: 'flex', flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '24px', borderBottom: '1px solid #1E1E2E',
              background: '#111118', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              position: 'sticky', top: 0, zIndex: 10,
            }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: '#F0F0F5', margin: 0 }}>Assign Task</h2>
                <p style={{ fontSize: 12, color: '#55556A', marginTop: 3, margin: 0 }}>
                  Assigning to <span style={{ color: '#6C63FF', fontWeight: 600 }}>{volunteer.name}</span>
                </p>
              </div>
              <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#55556A', padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            {submitted ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 }}>
                <CheckCircle2 size={56} color="#4AAF85" />
                <p style={{ fontSize: 16, fontWeight: 600, color: '#F0F0F5' }}>Task Assigned!</p>
                <p style={{ fontSize: 13, color: '#8A8A9A' }}>
                  {volunteer.name} is now marked as <span style={{ color: '#6C63FF' }}>Deployed</span>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Task Title */}
                <Field label="Task Title *" error={errors.title}>
                  <InputRow icon={<ClipboardList size={14} />}>
                    <input
                      type="text" placeholder="e.g. Health checkup camp at Ward 7"
                      value={form.title} onChange={(e) => update('title', e.target.value)}
                      style={inputStyle}
                    />
                  </InputRow>
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {/* Ward */}
                  <Field label="Ward / Location *" error={errors.ward}>
                    <InputRow icon={<MapPin size={14} />}>
                      <select
                        value={form.ward}
                        onChange={(e) => update('ward', e.target.value)}
                        style={{ ...inputStyle, paddingRight: 28 }}
                      >
                        <option value="">Select ward…</option>
                        {wards.map((w) => (
                          <option key={w.id} value={w.name}>{w.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#55556A', pointerEvents: 'none' }} />
                    </InputRow>
                  </Field>

                  {/* Task Type */}
                  <Field label="Task Type *">
                    <InputRow icon={<ClipboardList size={14} />}>
                      <select
                        value={form.taskType}
                        onChange={(e) => update('taskType', e.target.value as TaskType)}
                        style={{ ...inputStyle, paddingRight: 28 }}
                      >
                        {TASK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#55556A', pointerEvents: 'none' }} />
                    </InputRow>
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {/* Date */}
                  <Field label="Date & Time *" error={errors.date}>
                    <InputRow icon={<Calendar size={14} />}>
                      <input
                        type="datetime-local"
                        value={form.date}
                        onChange={(e) => update('date', e.target.value)}
                        style={inputStyle}
                      />
                    </InputRow>
                  </Field>

                  {/* Hours */}
                  <Field label="Estimated Hours *" error={errors.estimatedHours}>
                    <InputRow icon={<Clock size={14} />}>
                      <input
                        type="number" min="1" max="24" placeholder="e.g. 4"
                        value={form.estimatedHours} onChange={(e) => update('estimatedHours', e.target.value)}
                        style={inputStyle}
                      />
                    </InputRow>
                  </Field>
                </div>

                {/* Priority */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 500, color: '#8A8A9A' }}>Priority Level *</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {PRIORITIES.map(({ label, color }) => {
                      const selected = form.priority === label;
                      return (
                        <button
                          key={label} type="button"
                          onClick={() => update('priority', label)}
                          style={{
                            flex: 1, padding: '7px 0', borderRadius: 6, fontSize: 11, fontWeight: 600,
                            cursor: 'pointer', transition: 'all 0.15s',
                            border: `1px solid ${selected ? color : '#1E1E2E'}`,
                            background: selected ? `${color}22` : '#111118',
                            color: selected ? color : '#55556A',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                          }}
                        >
                          <Flag size={10} /> {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <Field label="Description / Notes">
                  <InputRow icon={<AlignLeft size={14} />}>
                    <textarea
                      placeholder="Provide any additional context or instructions…"
                      value={form.description} onChange={(e) => update('description', e.target.value)}
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical', paddingTop: 10, paddingBottom: 10 }}
                    />
                  </InputRow>
                </Field>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 12, paddingTop: 8, borderTop: '1px solid #1E1E2E' }}>
                  <button
                    type="button" onClick={handleClose}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 6, border: '1px solid #1E1E2E',
                      background: 'transparent', color: '#8A8A9A', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 2, padding: '10px 0', borderRadius: 6, border: 'none',
                      background: 'linear-gradient(135deg, #6C63FF, #9C63FF)',
                      color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Assign Task
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Sub-components ───────────────────────────────────────
function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 500, color: '#8A8A9A' }}>{label}</label>
      {children}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#E05555' }}>
          <AlertCircle size={11} /> {error}
        </div>
      )}
    </div>
  );
}

function InputRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <span style={{ position: 'absolute', left: 10, color: '#55556A', display: 'flex', pointerEvents: 'none', zIndex: 1 }}>{icon}</span>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px 9px 32px',
  background: '#111118', border: '1px solid #1E1E2E',
  borderRadius: 6, color: '#F0F0F5', fontSize: 12,
  outline: 'none', appearance: 'none',
};
