import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Building2, MapPin, Calendar, Info, Truck, Heart } from 'lucide-react';
import type { Resource } from '../../types';

const STATUS_COLORS: Record<string,string> = { Available:'#4AAF85', Reserved:'#C9A84C', Dispatched:'#6C63FF', Depleted:'#E05555' };
const PRI_COLORS: Record<string,string> = { Normal:'#4AAF85', Urgent:'#D4874A', Critical:'#E05555' };

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return value ? (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'8px 0', borderBottom:'1px solid #1E1E2E' }}>
      <span style={{ fontSize:12, color:'#55556A', flexShrink:0, minWidth:120 }}>{label}</span>
      <span style={{ fontSize:12, color:'#F0F0F5', fontWeight:500, textAlign:'right', maxWidth:260 }}>{value}</span>
    </div>
  ) : null;
}

interface Props { resource: Resource | null; onClose: () => void; }

export default function ResourceDetailsPanel({ resource, onClose }: Props) {
  const [tab, setTab] = useState<'details'|'history'>('details');

  const TabBtn = ({ id, label }: { id:'details'|'history'; label:string }) => (
    <button onClick={()=>setTab(id)}
      style={{ flex:1, padding:'10px 0', border:'none', background:'none', cursor:'pointer', fontSize:13, fontWeight:600,
        color: tab===id ? '#6C63FF' : '#55556A',
        borderBottom: tab===id ? '2px solid #6C63FF' : '2px solid transparent' }}>
      {label}
    </button>
  );

  return (
    <AnimatePresence>
      {!!resource && (
        <>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}
            style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(4px)'}}/>
          <motion.div initial={{opacity:0,x:80}} animate={{opacity:1,x:0}} exit={{opacity:0,x:80}}
            transition={{type:'spring',stiffness:300,damping:30}}
            style={{position:'fixed',right:0,top:0,bottom:0,zIndex:1001,width:'100%',maxWidth:520,
              background:'#0A0A0F',borderLeft:'1px solid #1E1E2E',display:'flex',flexDirection:'column'}}>

            {/* Header */}
            <div style={{padding:24,borderBottom:'1px solid #1E1E2E',background:'#111118',display:'flex',alignItems:'flex-start',justifyContent:'space-between',position:'sticky',top:0,zIndex:10}}>
              <div style={{flex:1,minWidth:0,marginRight:12}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                  <Package size={15} color="#6C63FF"/>
                  <h2 style={{fontSize:15,fontWeight:700,color:'#F0F0F5',margin:0,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{resource.name}</h2>
                  {resource.isDonated && <span style={{fontSize:10,padding:'2px 7px',borderRadius:20,background:'rgba(108,99,255,0.15)',color:'#6C63FF',border:'1px solid rgba(108,99,255,0.3)',flexShrink:0}}>💜 Donated</span>}
                </div>
                <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,
                  color:STATUS_COLORS[resource.status]||'#8A8A9A',
                  border:`1px solid ${STATUS_COLORS[resource.status]||'#8A8A9A'}`,
                  background:`${STATUS_COLORS[resource.status]||'#8A8A9A'}18`}}>
                  {resource.status}
                </span>
              </div>
              <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:'#55556A',padding:6,borderRadius:6,display:'flex',flexShrink:0}}><X size={18}/></button>
            </div>

            {/* Tabs */}
            <div style={{display:'flex',borderBottom:'1px solid #1E1E2E',background:'#111118'}}>
              <TabBtn id="details" label="📋 Details"/>
              <TabBtn id="history" label={`🚚 Dispatch History (${resource.dispatchLogs.length})`}/>
            </div>

            {/* Content */}
            <div style={{flex:1,overflowY:'auto',padding:24}}>

              {tab==='details' && (
                <div style={{display:'flex',flexDirection:'column',gap:0}}>
                  {/* Category/Quantity badge row */}
                  <div style={{display:'flex',gap:10,marginBottom:20}}>
                    {[
                      { label:resource.category, color:'#6C63FF' },
                      { label:`${resource.quantity} ${resource.unit}`, color:'#4AAF85' },
                    ].map(b=>(
                      <span key={b.label} style={{fontSize:12,fontWeight:600,padding:'4px 12px',borderRadius:20,
                        color:b.color,border:`1px solid ${b.color}40`,background:`${b.color}15`}}>
                        {b.label}
                      </span>
                    ))}
                  </div>

                  {/* Field rows */}
                  <Row label="NGO / Org" value={<span style={{display:'flex',alignItems:'center',gap:4}}><Building2 size={12} color="#55556A"/>{resource.ngoName}</span>}/>
                  <Row label="Contact Person" value={resource.contactPerson}/>
                  <Row label="Contact Number" value={resource.contactNumber}/>
                  <Row label="Ward" value={resource.wardName}/>
                  <Row label="Storage Location" value={resource.storageLocation && <span style={{display:'flex',alignItems:'center',gap:4}}><MapPin size={12} color="#55556A"/>{resource.storageLocation}</span>}/>
                  <Row label="Expiry Date" value={resource.expiryDate && <span style={{display:'flex',alignItems:'center',gap:4}}><Calendar size={12} color="#55556A"/>{new Date(resource.expiryDate).toLocaleDateString()}</span>}/>
                  <Row label="Description" value={resource.description}/>
                  <Row label="Internal Notes" value={resource.notes && <span style={{display:'flex',alignItems:'center',gap:4}}><Info size={12} color="#55556A"/>{resource.notes}</span>}/>
                  <Row label="Added On" value={new Date(resource.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}/>

                  {/* Donor section */}
                  {resource.isDonated && (
                    <div style={{marginTop:20,padding:16,background:'rgba(108,99,255,0.08)',border:'1px solid rgba(108,99,255,0.2)',borderRadius:8}}>
                      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10,fontSize:12,fontWeight:700,color:'#6C63FF'}}>
                        <Heart size={13}/> Donation Info
                      </div>
                      <Row label="Donor" value={resource.donorName}/>
                      <Row label="Condition" value={resource.donorCondition}/>
                    </div>
                  )}
                </div>
              )}

              {tab==='history' && (
                resource.dispatchLogs.length === 0 ? (
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 0',gap:12,color:'#55556A'}}>
                    <Truck size={32} color="#2A2A40"/>
                    <p style={{fontSize:14,margin:0,color:'#8A8A9A'}}>No dispatches yet</p>
                    <p style={{fontSize:12,margin:0}}>Dispatch this resource to see the history here.</p>
                  </div>
                ) : (
                  <div style={{display:'flex',flexDirection:'column',gap:10}}>
                    {resource.dispatchLogs.map((log, i) => (
                      <div key={log.id} style={{background:'#111118',border:'1px solid #1E1E2E',borderRadius:8,padding:14}}>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                          <span style={{fontSize:12,fontWeight:600,color:'#F0F0F5'}}>#{i+1} · {log.dispatchedTo}</span>
                          <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,
                            color:PRI_COLORS[log.priority]||'#4AAF85',
                            border:`1px solid ${PRI_COLORS[log.priority]||'#4AAF85'}50`,
                            background:`${PRI_COLORS[log.priority]||'#4AAF85'}15`}}>
                            {log.priority}
                          </span>
                        </div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                          {[
                            ['Quantity', `${log.quantity} ${resource.unit}`],
                            ['Volunteer', log.volunteer],
                            ['Date/Time', new Date(log.dateTime).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})],
                            ['Vehicle', log.vehicle||'—'],
                          ].map(([k,v])=>(
                            <div key={k}>
                              <div style={{fontSize:10,color:'#55556A',marginBottom:2}}>{k}</div>
                              <div style={{fontSize:12,color:'#F0F0F5'}}>{v}</div>
                            </div>
                          ))}
                        </div>
                        {log.notes && <div style={{marginTop:8,fontSize:11,color:'#8A8A9A',fontStyle:'italic'}}>"{log.notes}"</div>}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
