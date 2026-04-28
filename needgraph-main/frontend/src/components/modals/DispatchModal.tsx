import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Truck, AlertTriangle, AlertCircle, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useResourceStore, type DispatchPayload } from '../../store/resourceStore';
import type { Resource, DispatchPriority } from '../../types';
import { volunteers } from '../../data/mockData';

const MOCK_NEEDS = [
  { label:'Food Insecurity · Ward 12', severity:'Critical', people:340 },
  { label:'Water Scarcity · Ward 9',   severity:'High',     people:310 },
  { label:'Healthcare · Ward 5',       severity:'High',     people:230 },
  { label:'Mental Health · Ward 3',    severity:'Critical', people:180 },
  { label:'School Dropout · Ward 7',   severity:'High',     people:120 },
];
const SEV_COLOR: Record<string,string> = { Critical:'#E05555', High:'#D4874A', Medium:'#C9A84C', Low:'#4AAF85' };
const PRI_COLORS: Record<DispatchPriority,string> = { Normal:'#4AAF85', Urgent:'#D4874A', Critical:'#E05555' };

interface Props { resource: Resource | null; onClose: () => void; }

export default function DispatchModal({ resource, onClose }: Props) {
  const { dispatchResource } = useResourceStore();
  const [dispatchTo, setDispatchTo]   = useState(MOCK_NEEDS[0].label);
  const [quantity, setQuantity]       = useState(1);
  const [volunteer, setVolunteer]     = useState('');
  const [dateTime, setDateTime]       = useState('');
  const [vehicle, setVehicle]         = useState('');
  const [notes, setNotes]             = useState('');
  const [priority, setPriority]       = useState<DispatchPriority>('Normal');
  const [errors, setErrors]           = useState<Record<string,string>>({});
  const [busy, setBusy]               = useState(false);

  // Reset on open
  useEffect(() => {
    if (resource) {
      setQuantity(Math.min(1, resource.quantity));
      setDispatchTo(MOCK_NEEDS[0].label);
      setVolunteer('');
      setDateTime(new Date().toISOString().slice(0,16));
      setVehicle(''); setNotes('');
      setPriority('Normal'); setErrors({});
    }
  }, [resource]);

  if (!resource) return null;

  const maxQty    = resource.quantity;
  const remaining = Math.max(0, maxQty - quantity);
  const fullyDispatched = remaining === 0;

  const validate = () => {
    const e: Record<string,string> = {};
    if (quantity < 1)        e.quantity = 'Must be ≥ 1';
    if (quantity > maxQty)   e.quantity = `Max available is ${maxQty}`;
    if (!dispatchTo)         e.dispatchTo = 'Select a destination';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setBusy(true);
    await new Promise(r => setTimeout(r, 900));
    const payload: DispatchPayload = {
      dispatchedTo: dispatchTo,
      quantity, volunteer: volunteer || 'Unassigned',
      dateTime: dateTime || new Date().toISOString(),
      vehicle: vehicle || undefined,
      notes: notes || undefined,
      priority,
    };
    dispatchResource(resource.id, payload);
    const ward = dispatchTo.split('·')[1]?.trim() ?? dispatchTo;
    toast.success(`🚚 ${resource.name} dispatched to ${ward}`, {
      style:{ background:'#111118', color:'#4AAF85', border:'1px solid #1E1E2E' },
    });
    setBusy(false); onClose();
  };

  const SC = { width:'100%', padding:'9px 12px', background:'#1E1E2E', border:'1px solid #2A2A40', borderRadius:6, color:'#F0F0F5', fontSize:13, outline:'none', boxSizing:'border-box' as const };

  return (
    <AnimatePresence>
      {!!resource && (
        <>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={() => !busy && onClose()}
            style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.75)',backdropFilter:'blur(6px)'}}/>
          <div style={{position:'fixed',inset:0,zIndex:1001,display:'flex',alignItems:'center',justifyContent:'center',padding:16,pointerEvents:'none'}}>
            <motion.div initial={{scale:0.95,opacity:0,y:20}} animate={{scale:1,opacity:1,y:0}} exit={{scale:0.95,opacity:0,y:20}}
              transition={{type:'spring',stiffness:340,damping:28}}
              onClick={e=>e.stopPropagation()}
              style={{background:'#0A0A0F',border:'1px solid #1E1E2E',borderRadius:12,width:'100%',maxWidth:520,maxHeight:'92vh',
                overflowY:'auto',pointerEvents:'all',boxShadow:'0 32px 80px rgba(0,0,0,0.8)'}}>

              {/* Header */}
              <div style={{padding:'20px 24px',borderBottom:'1px solid #1E1E2E',display:'flex',alignItems:'center',justifyContent:'space-between',background:'#111118',borderRadius:'12px 12px 0 0',position:'sticky',top:0,zIndex:10}}>
                <div>
                  <h3 style={{fontSize:15,fontWeight:700,color:'#F0F0F5',margin:0,display:'flex',alignItems:'center',gap:8}}>
                    <Truck size={15} color="#6C63FF"/> Dispatch Resource
                  </h3>
                  <p style={{fontSize:12,color:'#55556A',marginTop:3}}>{resource.name}</p>
                </div>
                <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',color:'#55556A',padding:6,borderRadius:6,display:'flex'}}><X size={18}/></button>
              </div>

              <form onSubmit={submit} style={{padding:24,display:'flex',flexDirection:'column',gap:20}}>
                {/* Resource summary card */}
                <div style={{background:'#111118',border:'1px solid #1E1E2E',borderRadius:8,padding:'12px 16px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {[
                    ['Resource', resource.name],
                    ['NGO', resource.ngoName],
                    ['Location', resource.wardName.split(' - ')[0]],
                    ['Available', `${resource.quantity} ${resource.unit}`],
                  ].map(([k,v])=>(
                    <div key={k}>
                      <div style={{fontSize:10,color:'#55556A',textTransform:'uppercase',letterSpacing:'0.07em'}}>{k}</div>
                      <div style={{fontSize:13,fontWeight:500,color:'#F0F0F5',marginTop:2}}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* Priority warning */}
                {(priority==='Urgent'||priority==='Critical') && (
                  <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:8,
                    background:`${PRI_COLORS[priority]}15`,border:`1px solid ${PRI_COLORS[priority]}50`,color:PRI_COLORS[priority]}}>
                    <AlertTriangle size={14} style={{flexShrink:0}}/>
                    <span style={{fontSize:12,fontWeight:600}}>{priority} dispatch — dashboard alert will be sent</span>
                  </div>
                )}

                {/* Dispatch To */}
                <div>
                  <div style={{fontSize:11,fontWeight:600,color:'#8A8A9A',marginBottom:6}}>Dispatch To *</div>
                  <div style={{position:'relative'}}>
                    <select style={{...SC,cursor:'pointer'}} value={dispatchTo} onChange={e=>setDispatchTo(e.target.value)}>
                      {MOCK_NEEDS.map(n=>(
                        <option key={n.label} value={n.label}>{n.label} · {n.people} people</option>
                      ))}
                    </select>
                    <ChevronDown size={13} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',color:'#55556A',pointerEvents:'none'}}/>
                  </div>
                  {errors.dispatchTo && <div style={{fontSize:11,color:'#E05555',marginTop:4,display:'flex',gap:4,alignItems:'center'}}><AlertCircle size={11}/>{errors.dispatchTo}</div>}
                  {/* Severity badge */}
                  {(() => { const n = MOCK_NEEDS.find(x=>x.label===dispatchTo); return n ? (
                    <div style={{marginTop:6,display:'inline-flex',alignItems:'center',gap:4,fontSize:10,fontWeight:700,
                      padding:'2px 8px',borderRadius:20,border:`1px solid ${SEV_COLOR[n.severity]}`,
                      color:SEV_COLOR[n.severity],background:`${SEV_COLOR[n.severity]}15`}}>
                      {n.severity} · {n.people} people affected
                    </div>
                  ) : null; })()}
                </div>

                {/* Quantity */}
                <div>
                  <div style={{fontSize:11,fontWeight:600,color:'#8A8A9A',marginBottom:6}}>Quantity to Dispatch *</div>
                  <input type="number" min={1} max={maxQty} value={quantity}
                    onChange={e=>setQuantity(Math.min(maxQty, Math.max(1, Number(e.target.value))))}
                    style={SC}/>
                  {errors.quantity && <div style={{fontSize:11,color:'#E05555',marginTop:4,display:'flex',gap:4,alignItems:'center'}}><AlertCircle size={11}/>{errors.quantity}</div>}
                  <div style={{display:'flex',gap:16,marginTop:6,fontSize:11,color:'#55556A'}}>
                    <span>{maxQty} {resource.unit} available</span>
                    <span style={{color: fullyDispatched ? '#E05555' : '#4AAF85'}}>
                      After dispatch: {remaining} {resource.unit} {fullyDispatched ? '— fully dispatched' : 'remaining'}
                    </span>
                  </div>
                </div>

                {/* Volunteer */}
                <div>
                  <div style={{fontSize:11,fontWeight:600,color:'#8A8A9A',marginBottom:6}}>Assigned Volunteer / Driver</div>
                  <div style={{position:'relative'}}>
                    <select style={{...SC,cursor:'pointer'}} value={volunteer} onChange={e=>setVolunteer(e.target.value)}>
                      <option value="">— Unassigned —</option>
                      {volunteers.map(v=><option key={v.id} value={v.name}>{v.name} · {v.contact}</option>)}
                    </select>
                    <ChevronDown size={13} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',color:'#55556A',pointerEvents:'none'}}/>
                  </div>
                </div>

                {/* Date/Time */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div>
                    <div style={{fontSize:11,fontWeight:600,color:'#8A8A9A',marginBottom:6}}>Dispatch Date & Time *</div>
                    <input type="datetime-local" style={SC} value={dateTime} onChange={e=>setDateTime(e.target.value)}/>
                  </div>
                  <div>
                    <div style={{fontSize:11,fontWeight:600,color:'#8A8A9A',marginBottom:6}}>Vehicle (optional)</div>
                    <input style={SC} placeholder="e.g. Tempo MH-12 1234" value={vehicle} onChange={e=>setVehicle(e.target.value)}/>
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <div style={{fontSize:11,fontWeight:600,color:'#8A8A9A',marginBottom:8}}>Priority Level</div>
                  <div style={{display:'flex',gap:8}}>
                    {(['Normal','Urgent','Critical'] as DispatchPriority[]).map(p=>(
                      <label key={p} style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',flex:1,justifyContent:'center',
                        padding:'7px 0',borderRadius:6,border:`1px solid ${priority===p?PRI_COLORS[p]:'#1E1E2E'}`,
                        background:priority===p?`${PRI_COLORS[p]}18`:'transparent'}}>
                        <input type="radio" name="pri" checked={priority===p} onChange={()=>setPriority(p)} style={{accentColor:PRI_COLORS[p]}}/>
                        <span style={{fontSize:12,fontWeight:500,color:priority===p?PRI_COLORS[p]:'#8A8A9A'}}>{p}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <div style={{fontSize:11,fontWeight:600,color:'#8A8A9A',marginBottom:6}}>Dispatch Notes</div>
                  <textarea style={{...SC,resize:'none'}} rows={3} placeholder="Optional notes…" value={notes} onChange={e=>setNotes(e.target.value)}/>
                </div>

                {/* Footer */}
                <div style={{display:'flex',gap:12,paddingTop:12,borderTop:'1px solid #1E1E2E'}}>
                  <button type="button" onClick={onClose}
                    style={{flex:1,padding:'10px 0',borderRadius:6,border:'1px solid #1E1E2E',background:'transparent',color:'#8A8A9A',fontSize:13,fontWeight:500,cursor:'pointer'}}>
                    Cancel
                  </button>
                  <button type="submit" disabled={busy}
                    style={{flex:2,padding:'10px 0',borderRadius:6,border:'none',background:busy?'#5a52d9':'#6C63FF',color:'#fff',fontSize:13,fontWeight:600,cursor:busy?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                    {busy ? 'Dispatching…' : '🚚  Confirm Dispatch'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
