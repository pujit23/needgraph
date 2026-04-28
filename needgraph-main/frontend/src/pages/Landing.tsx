import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const CRISES = [
  "Food scarcity in high-risk zones",
  "Medical supply shortage in Sector 4",
  "Rising flood levels near riverbanks",
  "Power grid failure in downtown area",
  "Spike in respiratory illness reports"
];

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [crisisIndex, setCrisisIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCrisisIndex((prev) => (prev + 1) % CRISES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-page-root">
      {/* Navbar */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
        <div className="container nav-content">
          <Link to="/" className="nav-brand">
            <div className="nav-brand-icon"></div>
            NeedGraph
          </Link>
          <div className="nav-links">
            <Link to="/" className="active">Home</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/submit">Submit Need</Link>
            <Link to="/graph">Graph Explorer</Link>
            <Link to="/alerts">Alerts</Link>
          </div>
          <Link to="/dashboard" className="btn btn-nav">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="hero">
        <div className="hero-bg-blob"></div>
        <div className="container hero-content">
          <div className="hero-scenario">
            <div className="scenario-dot"></div>
            <span key={crisisIndex} className="crisis-text">{CRISES[crisisIndex]}</span>
          </div>
          <h1>
            Stop Reacting. <br />
            <span className="highlight">Start Predicting.</span>
          </h1>
          <p className="hero-desc">
            The world's first causal intelligence platform for community crises. 
            Forecasting the future of social needs before they peak.
          </p>
          <div className="hero-cta">
            <Link to="/dashboard" className="btn btn-primary">Explore Dashboard &rarr;</Link>
            <Link to="/submit" className="btn btn-outline">Submit a Report</Link>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-num">120+</div>
              <div className="label">NGOS CONNECTED</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">89%</div>
              <div className="label">PREDICTION ACCURACY</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">14d</div>
              <div className="label">EARLY WARNING</div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="comparison-section">
        <div className="container">
          <div className="section-header">
            <h2>Traditional vs Predictive</h2>
            <p>How NeedGraph transforms community resilience</p>
          </div>

          <div className="comparison-grid">
            {/* Before */}
            <div className="comp-card before">
              <div className="label comp-label" style={{ color: 'var(--lp-red)' }}>MANUAL RESPONSE</div>
              <ul className="comp-list">
                <li>
                  <div className="bullet"></div>
                  Data scattered in informal WhatsApp groups
                </li>
                <li>
                  <div className="bullet"></div>
                  Reacting only after crisis reaches peak
                </li>
                <li>
                  <div className="bullet"></div>
                  Duplicated efforts between disconnected NGOs
                </li>
                <li>
                  <div className="bullet"></div>
                  Zero visibility into causal cascading risks
                </li>
              </ul>
            </div>

            {/* After */}
            <div className="comp-card after">
              <div className="label comp-label" style={{ color: 'var(--lp-green)' }}>AI-POWERED ACTION</div>
              <ul className="comp-list">
                <li>
                  <div className="bullet"></div>
                  Centralized, structured real-time data feed
                </li>
                <li>
                  <div className="bullet"></div>
                  AI predicts crises weeks in advance
                </li>
                <li>
                  <div className="bullet"></div>
                  Coordinated deployment of shared resources
                </li>
                <li>
                  <div className="bullet"></div>
                  Clear causal graphs of interconnected needs
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="workflow-section">
        <div className="container">
          <div className="section-header">
            <h2>The Intelligence Workflow</h2>
          </div>

          <div className="workflow-container">
            <div className="workflow-line"></div>
            
            <div className="workflow-step">
              <div className="step-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
              </div>
              <h3 className="step-title">Report</h3>
              <p className="step-desc">Voice/Text feed from volunteers</p>
            </div>

            <div className="workflow-step">
              <div className="step-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
              </div>
              <h3 className="step-title">Extract</h3>
              <p className="step-desc">AI structures unstructured data</p>
            </div>

            <div className="workflow-step">
              <div className="step-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
              </div>
              <h3 className="step-title">Map</h3>
              <p className="step-desc">Analyze causal relationships</p>
            </div>

            <div className="workflow-step">
              <div className="step-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.48 12H2"/></svg>
              </div>
              <h3 className="step-title">Predict</h3>
              <p className="step-desc">Forecast cascading social risks</p>
            </div>

            <div className="workflow-step">
              <div className="step-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3 className="step-title">Act</h3>
              <p className="step-desc">Coordinate resource deployment</p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="footer-cta">
        <div className="footer-cta-bg"></div>
        <div className="container footer-cta-content">
          <h2>Ready to predict <br /> the future?</h2>
          <Link to="/dashboard" className="btn btn-primary">Get Access Now &rarr;</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-left">
            <span className="footer-brand">NeedGraph</span>
            <span className="footer-copyright">© 2026 Predictive Intelligence Systems</span>
          </div>
          <div className="footer-links">
            <a href="#">Documentation</a>
            <a href="#">Privacy</a>
            <a href="#">API Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
