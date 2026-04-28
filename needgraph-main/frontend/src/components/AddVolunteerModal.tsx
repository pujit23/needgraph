import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Mail, Phone, MapPin, Briefcase,
  Upload, AlertCircle, CheckCircle2, ChevronDown
} from 'lucide-react';
import { useVolunteersStore } from '../store';
import { wards } from '../data/mockData';
import type { Volunteer, VolunteerStatus } from '../types';

// ─── Constants ──────────────────────────────────────────
const SKILLS_LIST = [
  'Medical', 'First Aid', 'Healthcare', 'Education', 'Tutoring',
  'Youth Mentoring', 'Counselling', 'Mental Health', 'Crisis Support',
  'Food Distribution', 'Logistics', 'Community Outreach', 'Legal Aid',
  'Women Safety', 'Child Welfare', 'Data Collection',
  'Water Management', 'Sanitation', 'Community Health', 'Technical',
];

const STATUS_OPTIONS: VolunteerStatus[] = ['Available', 'Off-duty', 'Deployed'];

interface Props {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  wardId: number;
  skills: string[];
  status: VolunteerStatus;
  ngoName: string;
  certificateFile: File | null;
  yearsExperience: string;
  emergencyContact: string;
}

const EMPTY_FORM: FormData = {
  name: '', email: '', phone: '', wardId: 1,
  skills: [], status: 'Available', ngoName: '',
  certificateFile: null, yearsExperience: '', emergencyContact: '',
};

/**
 * AddVolunteerModal — full-form modal to register a new volunteer.
 * On submit, dispatches to useVolunteersStore and reactively updates the list.
 */
export default function AddVolunteerModal({ open, onClose }: Props) {
  const { addVolunteer } = useVolunteersStore();
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const toggleSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
    setErrors((prev) => ({ ...prev, skills: undefined }));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    if (form.skills.length === 0) errs.skills = 'Select at least one skill';
    if (!form.emergencyContact.trim()) errs.emergencyContact = 'Emergency contact is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const ward = wards.find((w) => w.id === form.wardId) ?? wards[0];
    const newVolunteer: Volunteer = {
      id: `vol-${Date.now()}`,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      contact: form.phone.trim(),
      skills: form.skills,
      wardId: ward.id,
      wardName: ward.name,
      status: form.status,
      tasksThisWeek: 0,
      totalTasks: 0,
      joinedAt: new Date().toISOString(),
      assignments: [],
      ngoName: form.ngoName.trim() || undefined,
      yearsExperience: form.yearsExperience ? parseInt(form.yearsExperience) : undefined,
      emergencyContact: form.emergencyContact.trim(),
      certificateUrl: form.certificateFile ? form.certificateFile.name : undefined,
    };

    addVolunteer(newVolunteer);
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

          {/* Modal */}
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
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#F0F0F5', margin: 0 }}>Add Volunteer</h2>
                <p style={{ fontSize: 12, color: '#55556A', marginTop: 4 }}>Register a new volunteer to the platform</p>
              </div>
              <button onClick={handleClose} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#55556A', padding: 4, borderRadius: 6,
                display: 'flex', alignItems: 'center',
              }}>
                <X size={18} />
              </button>
            </div>

            {/* Success State */}
            {submitted ? (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32,
              }}>
                <CheckCircle2 size={56} color="#4AAF85" />
                <p style={{ fontSize: 16, fontWeight: 600, color: '#F0F0F5' }}>Volunteer Registered!</p>
                <p style={{ fontSize: 13, color: '#8A8A9A' }}>They now appear in the volunteer list.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Section: Personal Info */}
                <SectionLabel label="Personal Information" />

                <Field label="Full Name *" error={errors.name}>
                  <InputRow icon={<User size={14} />}>
                    <input
                      type="text" placeholder="e.g. Priya Sharma"
                      value={form.name} onChange={(e) => update('name', e.target.value)}
                      style={inputStyle}
                    />
                  </InputRow>
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Email *" error={errors.email}>
                    <InputRow icon={<Mail size={14} />}>
                      <input
                        type="email" placeholder="you@example.com"
                        value={form.email} onChange={(e) => update('email', e.target.value)}
                        style={inputStyle}
                      />
                    </InputRow>
                  </Field>
                  <Field label="Phone *" error={errors.phone}>
                    <InputRow icon={<Phone size={14} />}>
                      <input
                        type="tel" placeholder="+91 9000000000"
                        value={form.phone} onChange={(e) => update('phone', e.target.value)}
                        style={inputStyle}
                      />
                    </InputRow>
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Ward / Area *">
                    <InputRow icon={<MapPin size={14} />}>
                      <select
                        value={form.wardId}
                        onChange={(e) => update('wardId', parseInt(e.target.value))}
                        style={{ ...inputStyle, paddingRight: 28 }}
                      >
                        {wards.map((w) => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#55556A', pointerEvents: 'none' }} />
                    </InputRow>
                  </Field>
                  <Field label="Availability">
                    <InputRow icon={<Briefcase size={14} />}>
                      <select
                        value={form.status}
                        onChange={(e) => update('status', e.target.value as VolunteerStatus)}
                        style={{ ...inputStyle, paddingRight: 28 }}
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#55556A', pointerEvents: 'none' }} />
                    </InputRow>
                  </Field>
                </div>

                {/* Section: NGO */}
                <SectionLabel label="Organization" />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="NGO Name">
                    <input
                      type="text" placeholder="Organization name"
                      value={form.ngoName} onChange={(e) => update('ngoName', e.target.value)}
                      style={{ ...inputStyle, padding: '9px 12px' }}
                    />
                  </Field>
                  <Field label="Years of Experience">
                    <input
                      type="number" min="0" max="50" placeholder="e.g. 3"
                      value={form.yearsExperience} onChange={(e) => update('yearsExperience', e.target.value)}
                      style={{ ...inputStyle, padding: '9px 12px' }}
                    />
                  </Field>
                </div>

                {/* Certificate Upload */}
                <Field label="NGO Certificate (PDF / Image)">
                  <div
                    onClick={() => fileRef.current?.click()}
                    style={{
                      border: '1px dashed #2A2A40', borderRadius: 6, padding: '12px 16px',
                      cursor: 'pointer', textAlign: 'center', background: '#111118',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    <Upload size={16} color="#6C63FF" style={{ margin: '0 auto 6px' }} />
                    <p style={{ fontSize: 12, color: form.certificateFile ? '#4AAF85' : '#55556A', margin: 0 }}>
                      {form.certificateFile ? form.certificateFile.name : 'Click to upload certificate'}
                    </p>
                  </div>
                  <input
                    ref={fileRef} type="file" accept=".pdf,image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => update('certificateFile', e.target.files?.[0] ?? null)}
                  />
                </Field>

                {/* Section: Skills */}
                <SectionLabel label="Skills *" />
                {errors.skills && <ErrorMsg msg={errors.skills} />}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {SKILLS_LIST.map((skill) => {
                    const selected = form.skills.includes(skill);
                    return (
                      <button
                        key={skill} type="button"
                        onClick={() => toggleSkill(skill)}
                        style={{
                          padding: '5px 10px', borderRadius: 100, fontSize: 11, fontWeight: 500,
                          cursor: 'pointer', transition: 'all 0.15s',
                          border: selected ? '1px solid #6C63FF' : '1px solid #1E1E2E',
                          background: selected ? 'rgba(108,99,255,0.15)' : '#111118',
                          color: selected ? '#6C63FF' : '#8A8A9A',
                        }}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>

                {/* Emergency Contact */}
                <SectionLabel label="Emergency" />
                <Field label="Emergency Contact *" error={errors.emergencyContact}>
                  <InputRow icon={<Phone size={14} />}>
                    <input
                      type="text" placeholder="Name & phone of emergency contact"
                      value={form.emergencyContact} onChange={(e) => update('emergencyContact', e.target.value)}
                      style={inputStyle}
                    />
                  </InputRow>
                </Field>

                {/* Submit */}
                <div style={{ display: 'flex', gap: 12, marginTop: 8, paddingTop: 16, borderTop: '1px solid #1E1E2E' }}>
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
                      background: '#6C63FF', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Register Volunteer
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
function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: '#55556A', textTransform: 'uppercase', borderBottom: '1px solid #1E1E2E', paddingBottom: 8 }}>
      {label}
    </div>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 500, color: '#8A8A9A' }}>{label}</label>
      {children}
      {error && <ErrorMsg msg={error} />}
    </div>
  );
}

function InputRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <span style={{ position: 'absolute', left: 10, color: '#55556A', display: 'flex', pointerEvents: 'none' }}>{icon}</span>
      {children}
    </div>
  );
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#E05555' }}>
      <AlertCircle size={11} /> {msg}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px 9px 32px',
  background: '#111118', border: '1px solid #1E1E2E',
  borderRadius: 6, color: '#F0F0F5', fontSize: 12,
  outline: 'none', appearance: 'none',
};
