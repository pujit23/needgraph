import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import {
  LayoutDashboard, Map, GitBranch, Users, Bell,
  BarChart2, PlusCircle, Settings, Network,
  Zap, Building2, TrendingUp, Search, Command, X, CheckSquare, Home,
  Package, LogOut
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { label: 'Home',            path: '/',                icon: Home },
  { label: 'Dashboard',       path: '/dashboard',       icon: LayoutDashboard },
  { label: 'Need Map',        path: '/dashboard/map',   icon: Map },
  { label: 'Graph Explorer',  path: '/graph',           icon: GitBranch },
  { label: 'Volunteers',      path: '/volunteers',      icon: Users },
  { label: 'Alerts',          path: '/alerts',          icon: Bell },
  { label: 'Analytics',       path: '/analytics',       icon: TrendingUp },
  { label: 'Crisis Simulator',path: '/simulator',       icon: Zap },
  { label: 'NGO Directory',   path: '/ngo-directory',   icon: Building2 },
  { label: 'Resources',       path: '/resources',       icon: Package },
  { label: 'Reports',         path: '/reports',         icon: BarChart2 },
  { label: 'Submit Need',     path: '/submit',          icon: PlusCircle },
  { label: 'Settings',        path: '/settings',        icon: Settings },
]

const recentNotifications = [
  { id: 1, title: 'Critical Alert', desc: 'Food scarcity in Ward 12 reached threshold.', time: '2m ago', type: 'critical' },
  { id: 2, title: 'Prediction Updated', desc: 'School dropout risk increased in Ward 4.', time: '15m ago', type: 'warning' },
  { id: 3, title: 'Volunteer Deployed', desc: 'Rahul assigned to Medical need in Ward 2.', time: '1h ago', type: 'success' },
]

export default function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile, logout } = useAuth()
  
  const [isCmdOpen, setIsCmdOpen] = useState(false)
  const [cmdSearch, setCmdSearch] = useState('')
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  // Handle Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsCmdOpen(true)
      }
      if (e.key === 'Escape') {
        setIsCmdOpen(false)
        setIsNotifOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false)
      }
    }
    if (isNotifOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isNotifOpen])

  const filteredNav = navItems.filter(n => n.label.toLowerCase().includes(cmdSearch.toLowerCase()))

  return (
    <div style={{ display:'flex', flexDirection: 'column', height:'100vh', width:'100vw', overflow:'hidden', background:'#0A0A0F' }}>
      {/* Top Navbar */}
      <header style={{
        height: 60, flexShrink: 0, background: '#0D0D14',
        borderBottom: '1px solid #1E1E2E', display: 'flex',
        alignItems: 'center', padding: '0 24px', zIndex: 50,
        width: '100%'
      }}>
        {/* Logo */}
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', marginRight: 40 }}>
          <div style={{ width:28, height:28, background:'#6C63FF', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Network size={16} color="white" />
          </div>
          <span style={{ fontSize:16, fontWeight:600, color:'#F0F0F5' }}>NeedGraph</span>
        </Link>

        {/* Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, overflowX: 'auto' }}>
          {navItems.map(item => {
            const active = location.pathname === item.path
            return (
              <Link key={item.path} to={item.path} style={{
                display:'flex', alignItems:'center', gap:8,
                padding:'8px 12px', borderRadius:6,
                textDecoration:'none', fontSize:13,
                color: active ? '#F0F0F5' : '#8A8A9A',
                background: active ? '#1A1A2E' : 'transparent',
                borderBottom: active ? '2px solid #6C63FF' : '2px solid transparent',
                transition:'all 0.15s',
                whiteSpace: 'nowrap'
              }}>
                <item.icon size={15} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginLeft: 20 }}>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="p-2 rounded-[6px] text-[#8A8A9A] hover:bg-[#111118] hover:text-[#E05555] transition-colors"
            title="Sign Out"
          >
            <LogOut size={15} />
          </button>
          <div style={{ textAlign: 'right' }} className="hidden sm:block">
            <div style={{ fontSize:13, fontWeight:500, color:'#F0F0F5' }}>{profile?.displayName || 'User'}</div>
          </div>
          <div style={{ width:32, height:32, borderRadius:'50%', background:'#1A1A2E', border:'1px solid #2A2A40', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:600, color:'#6C63FF' }}>
            {profile?.displayName ? profile.displayName.split(' ').map((n: string) => n[0]).join('') : 'U'}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:'#0A0A0F', position:'relative' }}>
        
        {/* Top Header */}
        <header style={{ height: 57, borderBottom: '1px solid #1E1E2E', display:'flex', alignItems:'center', justifyContent:'flex-end', padding:'0 24px', flexShrink:0, gap:16, background: '#0D0D14', zIndex: 40 }}>
          
          {/* Command Palette Trigger */}
          <button 
            onClick={() => setIsCmdOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-[#111118] border border-[#2A2A40] text-[#8A8A9A] text-[12px] hover:text-[#F0F0F5] hover:border-[#55556A] transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search...</span>
            <div className="flex items-center gap-0.5 ml-4">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </button>

          {/* Notification Trigger */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-[6px] text-[#8A8A9A] hover:bg-[#111118] hover:text-[#F0F0F5] transition-colors"
            >
              <Bell className="w-4 h-4" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E05555] border-2 border-[#0D0D14]"></div>
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {isNotifOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-[320px] bg-[#111118] border border-[#1E1E2E] rounded-[8px] shadow-2xl overflow-hidden z-[100]"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E1E2E] bg-[#0A0A0F]">
                    <span className="text-[13px] font-semibold text-[#F0F0F5]">Notifications</span>
                    <button className="text-[11px] text-[#6C63FF] hover:underline">Mark all read</button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {recentNotifications.map(n => (
                      <div key={n.id} className="p-4 border-b border-[#1E1E2E] hover:bg-[#1A1A2E]/50 cursor-pointer transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${n.type === 'critical' ? 'bg-[#E05555]' : n.type === 'warning' ? 'bg-[#D4874A]' : 'bg-[#4AAF85]'}`}></div>
                          <span className="text-[13px] font-medium text-[#F0F0F5]">{n.title}</span>
                        </div>
                        <p className="text-[12px] text-[#8A8A9A] pl-4">{n.desc}</p>
                        <div className="text-[10px] text-[#55556A] pl-4 mt-2">{n.time}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ flex:1, overflow:'hidden', position:'relative' }}>
          <Outlet />
        </div>
      </main>

      {/* Command Palette Overlay */}
      <AnimatePresence>
        {isCmdOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-[#0A0A0F]/80 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-[600px] bg-[#111118] border border-[#2A2A40] rounded-[12px] shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-4 border-b border-[#1E1E2E]">
                <Search className="w-5 h-5 text-[#8A8A9A]" />
                <input 
                  autoFocus
                  type="text"
                  placeholder="Type a command or search..."
                  value={cmdSearch}
                  onChange={e => setCmdSearch(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-[#F0F0F5] text-[15px] placeholder-[#55556A]"
                />
                <button onClick={() => setIsCmdOpen(false)} className="p-1 text-[#8A8A9A] hover:text-[#F0F0F5]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[340px] overflow-y-auto p-2">
                <div className="px-3 py-2 text-[11px] font-medium text-[#55556A] uppercase tracking-wider">Navigation</div>
                {filteredNav.map(item => (
                  <button 
                    key={item.path}
                    onClick={() => {
                      navigate(item.path)
                      setIsCmdOpen(false)
                      setCmdSearch('')
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[6px] hover:bg-[#1A1A2E] text-left transition-colors group"
                  >
                    <item.icon className="w-4 h-4 text-[#8A8A9A] group-hover:text-[#6C63FF]" />
                    <span className="text-[13px] text-[#F0F0F5]">{item.label}</span>
                  </button>
                ))}
                
                <div className="px-3 py-2 mt-2 text-[11px] font-medium text-[#55556A] uppercase tracking-wider">Quick Actions</div>
                <button 
                  onClick={() => {
                    navigate('/submit')
                    setIsCmdOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[6px] hover:bg-[#1A1A2E] text-left transition-colors group"
                >
                  <CheckSquare className="w-4 h-4 text-[#8A8A9A] group-hover:text-[#4AAF85]" />
                  <span className="text-[13px] text-[#F0F0F5]">Create New Field Report</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
