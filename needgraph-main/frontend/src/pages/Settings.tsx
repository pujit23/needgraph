import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { profile } = useAuth();
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [predictions, setPredictions] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [defaultWard, setDefaultWard] = useState('All');
  const [defaultTime, setDefaultTime] = useState('30d');

  const initials = profile?.displayName
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || 'U';

  const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    coordinator: 'Volunteer Coordinator',
    ngo_admin: 'NGO Admin',
    volunteer: 'Volunteer',
    field_worker: 'Field Worker',
    read_only: 'Read Only'
  };

  return (
    <div className="p-6 space-y-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-[#F0F0F5]">Settings & Preferences</h1>
        <button className="bg-[#6C63FF] text-white text-[14px] px-5 py-2 rounded-md font-medium hover:bg-[#5a52d9] transition-colors" onClick={() => toast.success('Settings saved successfully')}>
          Save Changes
        </button>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="bg-[#111118] border border-[#1E1E2E] rounded-[8px] p-[20px_24px]">
           <h2 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium mb-6">Profile Settings</h2>
           
           <div className="flex items-start gap-6">
             <div className="w-20 h-20 bg-[#1E1E2E] rounded-[8px] flex items-center justify-center text-[24px] font-semibold text-[#F0F0F5] shrink-0 overflow-hidden">
               {profile?.photoURL ? (
                 <img src={profile.photoURL} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 initials
               )}
             </div>
             <div className="space-y-4 flex-1">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-[12px] text-[#8A8A9A] mb-1.5">Full Name</label>
                   <input type="text" defaultValue={profile?.displayName || ''} className="w-full bg-[#0A0A0F] border border-[#1E1E2E] text-[#F0F0F5] px-3 py-2 rounded-[6px] text-[13px]" />
                 </div>
                 <div>
                   <label className="block text-[12px] text-[#8A8A9A] mb-1.5">Role</label>
                   <input type="text" disabled value={profile?.role ? roleLabels[profile.role] || profile.role : ''} className="w-full bg-[#0A0A0F] border border-[#1E1E2E] text-[#8A8A9A] px-3 py-2 rounded-[6px] text-[13px] opacity-70 cursor-not-allowed" />
                 </div>
               </div>
               <div>
                  <label className="block text-[12px] text-[#8A8A9A] mb-1.5">Primary Ward Assignment</label>
                  <select className="w-full bg-[#0A0A0F] border border-[#1E1E2E] text-[#F0F0F5] px-3 py-2 rounded-[6px] text-[13px]">
                    <option>All Wards (Super Admin)</option>
                    {Array.from({ length: 20 }, (_, i) => <option key={i}>Ward {i+1}</option>)}
                  </select>
               </div>
             </div>
           </div>
        </div>

        {/* Notifications */}
        <div className="bg-[#111118] border border-[#1E1E2E] rounded-[8px] p-[20px_24px]">
           <h2 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium mb-6">Notification Preferences</h2>
           
           <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-[#1E1E2E]">
                 <div>
                   <div className="text-[14px] font-medium text-[#F0F0F5]">Critical Alerts</div>
                   <div className="text-[12px] text-[#8A8A9A]">Get SMS and push notifications for urgent crises.</div>
                 </div>
                 <button onClick={() => setCriticalAlerts(!criticalAlerts)} className={`w-11 h-6 rounded-full transition-colors relative ${criticalAlerts ? 'bg-[#6C63FF]' : 'bg-[#1E1E2E]'}`}>
                   <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${criticalAlerts ? 'left-6' : 'left-1'}`} />
                 </button>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-[#1E1E2E]">
                 <div>
                   <div className="text-[14px] font-medium text-[#F0F0F5]">AI Predictions</div>
                   <div className="text-[12px] text-[#8A8A9A]">Receive warnings when cascading issues are predicted.</div>
                 </div>
                 <button onClick={() => setPredictions(!predictions)} className={`w-11 h-6 rounded-full transition-colors relative ${predictions ? 'bg-[#6C63FF]' : 'bg-[#1E1E2E]'}`}>
                   <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${predictions ? 'left-6' : 'left-1'}`} />
                 </button>
              </div>
              <div className="flex items-center justify-between">
                 <div>
                   <div className="text-[14px] font-medium text-[#F0F0F5]">Weekly Digest</div>
                   <div className="text-[12px] text-[#8A8A9A]">Receive a weekly email summarizing ward performance.</div>
                 </div>
                 <button onClick={() => setWeeklyReport(!weeklyReport)} className={`w-11 h-6 rounded-full transition-colors relative ${weeklyReport ? 'bg-[#6C63FF]' : 'bg-[#1E1E2E]'}`}>
                   <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${weeklyReport ? 'left-6' : 'left-1'}`} />
                 </button>
              </div>
           </div>
        </div>

        {/* Display & Data Details */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[#111118] border border-[#1E1E2E] rounded-[8px] p-[20px_24px]">
             <h2 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium mb-6">Display</h2>
             <div className="flex items-center justify-between">
                <div>
                  <div className="text-[14px] font-medium text-[#F0F0F5]">Dark Mode</div>
                  <div className="text-[12px] text-[#8A8A9A]">Required for command center.</div>
                </div>
                <button onClick={() => setDarkMode(!darkMode)} className={`w-11 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-[#6C63FF]' : 'bg-[#1E1E2E]'}`}>
                   <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${darkMode ? 'left-6' : 'left-1'}`} />
                 </button>
             </div>
          </div>
          <div className="bg-[#111118] border border-[#1E1E2E] rounded-[8px] p-[20px_24px]">
             <h2 className="text-[11px] text-[#55556A] uppercase tracking-[0.08em] font-medium mb-6">Data Defaults</h2>
             <div className="space-y-4">
                <div>
                  <label className="block text-[12px] text-[#8A8A9A] mb-1.5">Default Time Range</label>
                  <select value={defaultTime} onChange={e => setDefaultTime(e.target.value)} className="w-full bg-[#0A0A0F] border border-[#1E1E2E] text-[#F0F0F5] px-3 py-2 rounded-[6px] text-[13px]">
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                  </select>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
