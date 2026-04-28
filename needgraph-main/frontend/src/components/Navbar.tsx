import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/submit', label: 'Submit Need' },
    { to: '/graph', label: 'Graph Explorer' },
    { to: '/alerts', label: 'Alerts' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 h-16 border-b ${
      scrolled 
        ? 'bg-[#030305]/80 backdrop-blur-md border-white/10' 
        : 'bg-transparent border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto w-full h-full px-6 flex items-center justify-between relative">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-5 h-5 bg-gradient-to-br from-[#6C63FF] to-[#00F2FE] rounded-sm group-hover:rotate-12 transition-transform duration-300 shadow-[0_0_10px_rgba(108,99,255,0.5)]"></div>
          <span className="text-white font-bold text-[17px] tracking-tight">NeedGraph</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-[13px] font-medium tracking-wide transition-all duration-200 relative group py-1 ${
                location.pathname === link.to
                  ? 'text-white'
                  : 'text-[#A0A0B0] hover:text-white'
              }`}
            >
              {link.label}
              <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#6C63FF] transform origin-left transition-transform duration-300 ${
                location.pathname === link.to ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`} />
            </Link>
          ))}
        </div>

        <div className="hidden md:block">
          <Link
            to="/dashboard"
            className="bg-[#6C63FF] text-white text-[13px] px-6 py-2.5 rounded-full font-semibold hover:bg-[#5a52d9] transition-all duration-300 shadow-[0_4px_15px_rgba(108,99,255,0.3)] hover:shadow-[0_4px_20px_rgba(108,99,255,0.5)] active:scale-95"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden nav-cta p-2 text-[#8A8A9A] hover:text-[#F0F0F5]"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-16 left-0 right-0 bg-[#0A0A0F]/95 backdrop-blur-xl border-b border-white/10 z-40"
          >
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block text-[18px] font-medium ${
                    location.pathname === link.to ? 'text-white' : 'text-[#A0A0B0]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="block w-full py-4 bg-[#6C63FF] text-white text-[16px] text-center rounded-xl font-bold shadow-lg"
              >
                Open Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
