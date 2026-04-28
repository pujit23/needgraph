import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, MapPin, Tag, AlertTriangle, Users, FileText, Mic,
  User, Phone, Loader2, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSubmittedNeedsStore } from '../store';
import { getSeverityColor } from '../utils/helpers';
import type { NeedType } from '../types';

// ─── Props ────────────────────────────────────────────────
interface Props {
  open: boolean;
  onClose: () => void;
  onSubmitAnother: () => void;
  // Summary data from the Submit page
  needType: string;
  severityScore: number;
  peopleAffected: number;
  description: string;
  transcript?: string;
  locationAddress: string;
  locationLat: number;
  locationLng: number;
}

// ─── Sub-components ───────────────────────────────────────
function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{ color: '#55556A', marginTop: 1, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color: '#55556A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: 13, color: '#F0F0F5' }}>{value}</div>
      </div>
    </div>
  );
}

function InputField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 500, color: '#8A8A9A' }}>{label}</label>
      {children}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#E05555' }}>
          <AlertCircle size={11} /> {error}
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────
export default function ConfirmSubmitModal({
  open, onClose, onSubmitAnother,
  needType, severityScore, peopleAffected, description,
  transcript, locationAddress, locationLat, locationLng,
}: Props) {
  const navigate = useNavigate();
  const { submitNeed } = useSubmittedNeedsStore();

  const [submitterName, setSubmitterName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [nameError, setNameError] = useState('');
  const [contactError, setContactError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceId, setReferenceId] = useState('');

  const severityColor = getSeverityColor(severityScore);

  const validate = () => {
    let valid = true;
    if (!submitterName.trim()) { setNameError('Name is required'); valid = false; }
    else setNameError('');
    if (!contactNumber.trim()) { setContactError('Contact number is required'); valid = false; }
    else setContactError('');
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const refId = await submitNeed({
        needType: needType as NeedType,
        severityScore,
        peopleAffected,
        description,
        location: { address: locationAddress, lat: locationLat, lng: locationLng },
        audioTranscript: transcript || undefined,
        submitterName: submitterName.trim(),
        contactNumber: contactNumber.trim(),
      });
      setReferenceId(refId);
      toast.success('✅ Need submitted — visible on map and dashboard', {
        style: { background: '#111118', color: '#4AAF85', border: '1px solid #1E1E2E' },
        duration: 4000,
      });
    } catch {
      toast.error('Submission failed. Please try again.', {
        style: { background: '#111118', color: '#E05555', border: '1px solid #1E1E2E' },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setSubmitterName('');
    setContactNumber('');
    setNameError('');
    setContactError('');
    setReferenceId('');
    onClose();
  };

  const handleSubmitAnother = () => {
    setSubmitterName('');
    setContactNumber('');
    setNameError('');
    setContactError('');
    setReferenceId('');
    onSubmitAnother();
    onClose();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px 9px 36px',
    background: '#111118',
    border: '1px solid #1E1E2E',
    borderRadius: 6,
    color: '#F0F0F5',
    fontSize: 12,
    outline: 'none',
    boxSizing: 'border-box',
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

          {/* Panel */}
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
              padding: '24px',
              borderBottom: '1px solid #1E1E2E',
              background: '#111118',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              position: 'sticky', top: 0, zIndex: 10,
            }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#F0F0F5', margin: 0 }}>
                  Confirm &amp; Submit Need
                </h2>
                <p style={{ fontSize: 12, color: '#55556A', marginTop: 4 }}>
                  Review your report before submitting
                </p>
              </div>
              <button
                onClick={handleClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#55556A', padding: 4, borderRadius: 6, display: 'flex' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* ── Success Screen ─────────────────────────── */}
            {referenceId ? (
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 20, padding: 32, textAlign: 'center',
              }}>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                >
                  <CheckCircle2 size={64} color="#4AAF85" />
                </motion.div>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#F0F0F5', margin: 0 }}>
                    Need Submitted Successfully!
                  </p>
                  <p style={{ fontSize: 13, color: '#8A8A9A', marginTop: 8 }}>
                    Your report is now visible on the Need Map and Dashboard.
                  </p>
                </div>
                <div style={{
                  background: '#1E1E2E', border: '1px solid #2A2A40',
                  borderRadius: 8, padding: '10px 20px',
                  fontFamily: 'monospace', fontSize: 14, color: '#6C63FF', fontWeight: 600,
                  letterSpacing: '0.05em',
                }}>
                  Reference ID: #{referenceId}
                </div>
                <div style={{ display: 'flex', gap: 12, width: '100%', marginTop: 8 }}>
                  <button
                    onClick={handleSubmitAnother}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 6,
                      border: '1px solid #1E1E2E', background: 'transparent',
                      color: '#8A8A9A', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    }}
                  >
                    Submit Another
                  </button>
                  <button
                    onClick={() => { handleClose(); navigate('/'); }}
                    style={{
                      flex: 2, padding: '10px 0', borderRadius: 6, border: 'none',
                      background: '#6C63FF', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    View on Dashboard
                  </button>
                </div>
              </div>
            ) : (
              /* ── Form ────────────────────────────────────── */
              <form onSubmit={handleSubmit} style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Section: Summary */}
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: '#55556A', textTransform: 'uppercase', borderBottom: '1px solid #1E1E2E', paddingBottom: 8 }}>
                  Report Summary
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <SummaryRow icon={<MapPin size={14} />} label="Location" value={locationAddress || `${locationLat.toFixed(4)}, ${locationLng.toFixed(4)}`} />
                  <SummaryRow icon={<Tag size={14} />} label="Need Type" value={needType || <span style={{ color: '#55556A' }}>Not specified</span>} />
                  <SummaryRow
                    icon={<AlertTriangle size={14} />}
                    label="Severity Score"
                    value={
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontWeight: 700, color: severityColor }}>{severityScore}/100</span>
                        <span style={{ flex: 1, height: 4, background: '#1E1E2E', borderRadius: 2, overflow: 'hidden', maxWidth: 120, display: 'inline-block' }}>
                          <span style={{ display: 'block', height: '100%', width: `${severityScore}%`, background: severityColor, borderRadius: 2 }} />
                        </span>
                      </span>
                    }
                  />
                  <SummaryRow icon={<Users size={14} />} label="People Affected" value={peopleAffected.toLocaleString()} />
                  {description && (
                    <SummaryRow
                      icon={<FileText size={14} />}
                      label="Description"
                      value={<span style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{description}</span>}
                    />
                  )}
                  {transcript && (
                    <SummaryRow
                      icon={<Mic size={14} />}
                      label="Voice Transcript"
                      value={<em style={{ color: '#8A8A9A', fontSize: 12 }}>&ldquo;{transcript}&rdquo;</em>}
                    />
                  )}
                </div>

                {/* Section: Submitter */}
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: '#55556A', textTransform: 'uppercase', borderBottom: '1px solid #1E1E2E', paddingBottom: 8 }}>
                  Your Details
                </div>

                <InputField label="Submitter Name *" error={nameError}>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#55556A', display: 'flex' }}>
                      <User size={14} />
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={submitterName}
                      onChange={(e) => { setSubmitterName(e.target.value); setNameError(''); }}
                      style={inputStyle}
                    />
                  </div>
                </InputField>

                <InputField label="Contact Number *" error={contactError}>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#55556A', display: 'flex' }}>
                      <Phone size={14} />
                    </span>
                    <input
                      type="tel"
                      placeholder="+91 9000000000"
                      value={contactNumber}
                      onChange={(e) => { setContactNumber(e.target.value); setContactError(''); }}
                      style={inputStyle}
                    />
                  </div>
                </InputField>

                {/* Footer */}
                <div style={{ display: 'flex', gap: 12, marginTop: 8, paddingTop: 16, borderTop: '1px solid #1E1E2E' }}>
                  <button
                    type="button"
                    onClick={handleClose}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 6,
                      border: '1px solid #1E1E2E', background: 'transparent',
                      color: '#8A8A9A', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      flex: 2, padding: '10px 0', borderRadius: 6, border: 'none',
                      background: isSubmitting ? '#5a52d9' : '#6C63FF',
                      color: '#fff', fontSize: 13, fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                  >
                    {isSubmitting ? (
                      <><Loader2 size={15} className="animate-spin" /> Submitting…</>
                    ) : 'Submit Need'}
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
