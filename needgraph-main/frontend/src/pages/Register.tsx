import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth, type UserRole } from '../contexts/AuthContext';
import { wards } from '../data/mockData';
import ParticleCanvas from '../components/ParticleCanvas';
import './AuthPages.css';

const ROLES: { value: UserRole; label: string; desc: string }[] = [
  { value: 'volunteer', label: 'Volunteer', desc: 'Field operations & task execution' },
  { value: 'field_worker', label: 'Field Worker', desc: 'Submit reports & collect data' },
  { value: 'coordinator', label: 'Coordinator', desc: 'Manage wards & deploy volunteers' },
  { value: 'ngo_admin', label: 'NGO Admin', desc: 'Manage your organization' },
];



export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    displayName: '', email: '', password: '', confirmPassword: '',
    role: 'volunteer' as UserRole, wardIds: [] as string[],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.displayName || !form.email || !form.password) { setError('Please fill in all required fields'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setError(''); setLoading(true);
    try { await register(form.email, form.password, form.displayName, form.role, form.wardIds); navigate('/dashboard', { replace: true }); }
    catch (err: any) { setError(err.code==='auth/email-already-in-use'?'An account with this email already exists':err.message||'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page" id="register-page">
      {/* LEFT */}
      <motion.div className="auth-left" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:.6}}>
        <div className="auth-left-blobs">
          <div className="auth-blob auth-blob-1" />
          <div className="auth-blob auth-blob-2" />
          <ParticleCanvas />
        </div>
        <div className="auth-left-content">
          <motion.div className="auth-logo" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.2}}>
            <div className="auth-logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <span className="auth-logo-text">NeedGraph</span>
          </motion.div>
          <motion.h1 className="auth-headline" initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:.35}}>
            Join<br/>NeedGraph.
          </motion.h1>
          <motion.p className="auth-tagline" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.5}}>
            Create your account and become part of the crisis intelligence network. Every report saves lives.
          </motion.p>
          <motion.div className="auth-stats" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.7}}>
            <div><div className="auth-stat-val">2.4K</div><div className="auth-stat-lbl">Active Volunteers</div></div>
            <div><div className="auth-stat-val">15</div><div className="auth-stat-lbl">Cities Covered</div></div>
            <div><div className="auth-stat-val">98%</div><div className="auth-stat-lbl">Response Rate</div></div>
          </motion.div>
        </div>
      </motion.div>

      {/* RIGHT */}
      <div className="auth-right">
        <motion.div className="auth-card-wrap auth-card-wide" initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} transition={{delay:.3}}>
          <div className="auth-card">
            <h2 className="auth-card-title">Create Account</h2>
            <p className="auth-card-sub">Start making an impact today</p>

            {error && <div className="auth-error"><AlertCircle className="auth-error-icon" />{error}</div>}

            <form onSubmit={submit}>
              <div className="auth-field">
                <label className="auth-label">Full Name *</label>
                <div className="auth-input-wrap">
                  <User className="auth-input-icon" />
                  <input id="reg-name" type="text" value={form.displayName} onChange={e=>set('displayName',e.target.value)} placeholder="Your full name" className="auth-input" />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">Email *</label>
                <div className="auth-input-wrap">
                  <Mail className="auth-input-icon" />
                  <input id="reg-email" type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@example.com" className="auth-input" />
                </div>
              </div>

              <div className="auth-row" style={{ marginBottom: '20px' }}>
                <div>
                  <label className="auth-label">Password *</label>
                  <div className="auth-input-wrap">
                    <Lock className="auth-input-icon" />
                    <input id="reg-pw" type="password" value={form.password} onChange={e=>set('password',e.target.value)} placeholder="••••••••" className="auth-input" />
                  </div>
                </div>
                <div>
                  <label className="auth-label">Confirm *</label>
                  <div className="auth-input-wrap">
                    <input id="reg-cpw" type="password" value={form.confirmPassword} onChange={e=>set('confirmPassword',e.target.value)} placeholder="••••••••" className="auth-input auth-input-no-icon" />
                  </div>
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">Role *</label>
                <div className="auth-role-grid">
                  {ROLES.map(r => (
                    <button key={r.value} type="button" onClick={()=>set('role',r.value)} className={`auth-role-btn ${form.role===r.value?'active':''}`}>
                      <div className="auth-role-label">{r.label}</div>
                      <div className="auth-role-desc">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">Ward Assignment (optional)</label>
                <select value="" onChange={e=>{if(e.target.value&&!form.wardIds.includes(e.target.value))set('wardIds',[...form.wardIds,e.target.value]);}} className="auth-select">
                  <option value="">Select wards...</option>
                  {wards.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                </select>
                {form.wardIds.length > 0 && (
                  <div className="auth-ward-tags">
                    {form.wardIds.map(w => (
                      <span key={w} onClick={()=>set('wardIds',form.wardIds.filter(x=>x!==w))} className="auth-ward-tag">
                        {w.split(' - ')[0]} ×
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button id="reg-submit" type="submit" disabled={loading} className="auth-submit">
                {loading ? <span className="auth-spinner" /> : <><UserPlus style={{width:16,height:16}} /> Create Account</>}
              </button>
            </form>
          </div>
          <div className="auth-footer-link">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign in</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
