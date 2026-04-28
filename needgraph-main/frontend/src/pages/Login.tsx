import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ParticleCanvas from '../components/ParticleCanvas';
import './AuthPages.css';



export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setError(''); setLoading(true);
    try { await login(email, password); navigate(from, { replace: true }); }
    catch (err: any) { setError(err.code==='auth/invalid-credential'?'Invalid email or password':err.code==='auth/too-many-requests'?'Too many attempts. Try later.':err.message||'Login failed'); }
    finally { setLoading(false); }
  };

  const google = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setError(''); setLoading(true);
    try { await loginWithGoogle(); navigate(from, { replace: true }); }
    catch (err: any) { 
      if (err.code?.startsWith('auth/')) {
        setError('No account found. Please create an account first.');
      } else {
        setError('Google login failed. Please try again.');
      }
    }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page" id="login-page">
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
            Welcome<br/>Back.
          </motion.h1>
          <motion.p className="auth-tagline" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.5}}>
            Sign in to access your crisis intelligence command center. Predict. Coordinate. Act.
          </motion.p>
          <motion.div className="auth-stats" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.7}}>
            <div><div className="auth-stat-val">120+</div><div className="auth-stat-lbl">NGOs Connected</div></div>
            <div><div className="auth-stat-val">89%</div><div className="auth-stat-lbl">Prediction Accuracy</div></div>
            <div><div className="auth-stat-val">14d</div><div className="auth-stat-lbl">Early Warning</div></div>
          </motion.div>
        </div>
      </motion.div>

      {/* RIGHT */}
      <div className="auth-right">
        <motion.div className="auth-card-wrap" initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} transition={{delay:.3}}>
          <div className="auth-card">
            <h2 className="auth-card-title">Sign In</h2>
            <p className="auth-card-sub">Enter your credentials to continue</p>

            {error && (
              <div className="auth-error" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle className="auth-error-icon" style={{ margin: 0 }} />
                  <span>{error}</span>
                </div>
                {error === 'No account found. Please create an account first.' && (
                  <div style={{ marginTop: '8px', marginLeft: '28px' }}>
                    <Link to="/register" style={{ color: 'inherit', textDecoration: 'underline', fontWeight: 600 }}>
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={submit}>
              <div className="auth-field">
                <label className="auth-label">Email Address</label>
                <div className="auth-input-wrap">
                  <Mail className="auth-input-icon" />
                  <input id="login-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="auth-input" />
                </div>
              </div>
              <div className="auth-field">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrap">
                  <Lock className="auth-input-icon" />
                  <input id="login-password" type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" className="auth-input auth-input-pw" />
                  <button type="button" onClick={()=>setShowPw(!showPw)} className="auth-pw-toggle">
                    {showPw ? <EyeOff className="auth-pw-icon" /> : <Eye className="auth-pw-icon" />}
                  </button>
                </div>
              </div>
              <button id="login-submit" type="submit" disabled={loading} className="auth-submit">
                {loading ? <span className="auth-spinner" /> : <><LogIn style={{width:16,height:16}} /> Sign In</>}
              </button>
            </form>

            <div className="auth-divider"><div className="auth-divider-line" /><span className="auth-divider-text">OR</span><div className="auth-divider-line" /></div>

            <button id="login-google" type="button" onClick={google} disabled={loading} className="auth-google">
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>
          </div>
          <div className="auth-footer-link">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="auth-link">Create one</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
