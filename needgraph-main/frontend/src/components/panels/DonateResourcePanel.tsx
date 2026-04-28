import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, AlertCircle, ChevronDown, User, Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { wards } from '../../data/mockData';
import { useResourceStore, type DonateResourcePayload } from '../../store/resourceStore';
import type { ResourceCategory, ResourceUnit, DonorType, ResourceCondition } from '../../types';

const CATEGORIES: ResourceCategory[] = ['Food','Water','Medical','Shelter','Education','Other'];
const UNITS: ResourceUnit[] = ['KG','Liters','Units','Kits','Boxes','Packs','Sets','Bottles','Tabs','Other'];

interface Props { open: boolean; onClose: () => void; }
interface F {
  donorName:string; donorEmail:string; donorPhone:string; donorType:DonorType; orgName:string;
  resourceName:string; category:ResourceCategory; quantity:string; unit:ResourceUnit;
  condition:ResourceCondition; description:string;
  pickupDate:string; pickupAddress:string; deliveryPref:'drop-off'|'pickup'; targetWard:string;
  wardId:string; declared:boolean;
}
const EMPTY: F = { donorName:'', donorEmail:'', donorPhone:'', donorType:'Individual', orgName:'',
  resourceName:'', category:'Food', quantity:'', unit:'KG', condition:'New', description:'',
  pickupDate:'', pickupAddress:'', deliveryPref:'drop-off', targetWard:'', wardId:'1', declared:false };

const S: React.CSSProperties = { width:'100%', padding:'9px 12px', background:'#111118', border:'1px solid #1E1E2E', borderRadius:6, color:'#F0F0F5', fontSize:13, outline:'none', boxSizing:'border-box' };
const SI: React.CSSProperties = { ...S, paddingLeft:36 };
function Lbl({c}:{c:string}) { return <div style={{fontSize:11,fontWeight:600,color:'#8A8A9A',marginBottom:6}}>{c}</div>; }
function Sec({c}:{c:string}) { return <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.09em',color:'#55556A',textTransform:'uppercase',borderBottom:'1px solid #1E1E2E',paddingBottom:8,marginBottom:16}}>{c}</div>; }
function Err({m}:{m?:string}) { return m ? <div style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:'#E05555',marginTop:4}}><AlertCircle size={11}/>{m}</div> : null; }
function Ico({ch}:{ch:React.ReactNode}) { return <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#55556A',display:'flex',pointerEvents:'none'}}>{ch}</span>; }

export default function DonateResourcePanel({ open, onClose }: Props) {
  const { donateResource } = useResourceStore();
  const [form, setForm] = useState<F>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof F,string>>>({});
  const [busy, setBusy] = useState(false);

  const upd = <K extends keyof F>(k:K, v:F[K]) => { setForm(p=>({...p,[k]:v})); setErrors(p=>({...p,[k]:undefined})); };

  const validate = () => {
    const e: Partial<Record<keyof F,string>> = {};
    if (!form.donorName.trim())     e.donorName     = 'Required';
    if (!form.donorEmail.trim())    e.donorEmail    = 'Required';
    if (!form.donorPhone.trim())    e.donorPhone    = 'Required';
    if (!form.resourceName.trim())  e.resourceName  = 'Required';
    if (Number(form.quantity) < 1)  e.quantity      = 'Must be ≥ 1';
    if (!form.pickupDate)           e.pickupDate    = 'Required';
    if (!form.pickupAddress.trim()) e.pickupAddress = 'Required';
    if (!form.declared)             e.declared      = 'Please confirm the declaration';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setBusy(true);
    await new Promise(r => setTimeout(r, 900));
    const ward = wards.find(w => w.id === Number(form.wardId));
    const payload: DonateResourcePayload = {
      donorName: form.donorName.trim(), donorEmail: form.donorEmail.trim(),
      donorPhone: form.donorPhone.trim(), donorType: form.donorType,
      orgName: form.donorType === 'Organization' ? form.orgName.trim() : undefined,
      resourceName: form.resourceName.trim(), category: form.category,
      quantity: Number(form.quantity), unit: form.unit, condition: form.condition,
      description: form.description || undefined,
      pickupDate: form.pickupDate, pickupAddress: form.pickupAddress.trim(),
      deliveryPreference: form.deliveryPref,
      targetWard: form.targetWard || undefined,
      wardId: Number(form.wardId), wardName: ward?.name ?? `Ward ${form.wardId}`,
    };
    donateResource(payload);
    toast.success('💜 Thank you! Your donation has been recorded.', { style:{ background:'#111118', color:'#6C63FF', border:'1px solid #1E1E2E' } });
    setBusy(false); setForm(EMPTY); onClose();
  };

  const close = () => { if (!busy) { setForm(EMPTY); setErrors({}); onClose(); } };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={close}
            style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(4px)'}} />
          <motion.div initial={{opacity:0,x:80}} animate={{opacity:1,x:0}} exit={{opacity:0,x:80}}
            transition={{type:'spring',stiffness:300,damping:30}}
            style={{position:'fixed',right:0,top:0,bottom:0,zIndex:1001,width:'100%',maxWidth:520,
              background:'#0A0A0F',borderLeft:'1px solid #1E1E2E',display:'flex',flexDirection:'column',overflowY:'auto'}}>
            {/* Header */}
            <div style={{padding:24,borderBottom:'1px solid #1E1E2E',background:'#111118',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10}}>
              <div>
                <h2 style={{fontSize:16,fontWeight:700,color:'#F0F0F5',margin:0,display:'flex',alignItems:'center',gap:8}}>
                  <Heart size={16} color="#6C63FF"/> Donate a Resource
                </h2>
                <p style={{fontSize:12,color:'#55556A',marginTop:4}}>Contribute resources to communities in need</p>
              </div>
              <button onClick={close} style={{background:'none',border:'none',cursor:'pointer',color:'#55556A',padding:6,borderRadius:6,display:'flex'}}><X size={18}/></button>
            </div>

            <form onSubmit={submit} style={{flex:1,padding:24,display:'flex',flexDirection:'column',gap:20}}>
              {/* Section 1: Donor Info */}
              <Sec c="Donor Info"/>
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                {/* Donor Type radio */}
                <div>
                  <Lbl c="Donor Type *"/>
                  <div style={{display:'flex',gap:10}}>
                    {(['Individual','Organization'] as DonorType[]).map(t=>(
                      <label key={t} style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',
                        padding:'6px 14px',borderRadius:6,border:`1px solid ${form.donorType===t?'#6C63FF':'#1E1E2E'}`,
                        background:form.donorType===t?'rgba(108,99,255,0.12)':'transparent'}}>
                        <input type="radio" name="donorType" checked={form.donorType===t} onChange={()=>upd('donorType',t)} style={{accentColor:'#6C63FF'}}/>
                        <span style={{fontSize:12,fontWeight:500,color:form.donorType===t?'#6C63FF':'#8A8A9A'}}>{t}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div><Lbl c="Full Name *"/>
                  <div style={{position:'relative'}}><Ico ch={<User size={14}/>}/>
                    <input style={SI} placeholder="Your full name" value={form.donorName} onChange={e=>upd('donorName',e.target.value)}/>
                  </div><Err m={errors.donorName}/>
                </div>
                {form.donorType==='Organization' && (
                  <div><Lbl c="Organization Name"/>
                    <input style={S} placeholder="e.g. Hyderabad NGO Council" value={form.orgName} onChange={e=>upd('orgName',e.target.value)}/>
                  </div>
                )}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div><Lbl c="Email *"/>
                    <div style={{position:'relative'}}><Ico ch={<Mail size={14}/>}/>
                      <input style={SI} type="email" placeholder="email@example.com" value={form.donorEmail} onChange={e=>upd('donorEmail',e.target.value)}/>
                    </div><Err m={errors.donorEmail}/>
                  </div>
                  <div><Lbl c="Phone *"/>
                    <div style={{position:'relative'}}><Ico ch={<Phone size={14}/>}/>
                      <input style={SI} type="tel" placeholder="+91 …" value={form.donorPhone} onChange={e=>upd('donorPhone',e.target.value)}/>
                    </div><Err m={errors.donorPhone}/>
                  </div>
                </div>
              </div>

              {/* Section 2: Resource */}
              <Sec c="Resource Being Donated"/>
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                <div><Lbl c="Resource Name *"/>
                  <input style={S} placeholder="e.g. Rice Packs" value={form.resourceName} onChange={e=>upd('resourceName',e.target.value)}/>
                  <Err m={errors.resourceName}/>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div><Lbl c="Category *"/>
                    <div style={{position:'relative'}}>
                      <select style={{...S,cursor:'pointer'}} value={form.category} onChange={e=>upd('category',e.target.value as ResourceCategory)}>
                        {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                      </select><ChevronDown size={13} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',color:'#55556A',pointerEvents:'none'}}/>
                    </div>
                  </div>
                  <div><Lbl c="Unit *"/>
                    <div style={{position:'relative'}}>
                      <select style={{...S,cursor:'pointer'}} value={form.unit} onChange={e=>upd('unit',e.target.value as ResourceUnit)}>
                        {UNITS.map(u=><option key={u}>{u}</option>)}
                      </select><ChevronDown size={13} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',color:'#55556A',pointerEvents:'none'}}/>
                    </div>
                  </div>
                </div>
                <div><Lbl c="Quantity *"/>
                  <input style={S} type="number" min={1} placeholder="e.g. 50" value={form.quantity} onChange={e=>upd('quantity',e.target.value)}/>
                  <Err m={errors.quantity}/>
                </div>
                <div><Lbl c="Condition *"/>
                  <div style={{display:'flex',gap:8}}>
                    {(['New','Good Condition','Usable'] as ResourceCondition[]).map(c=>(
                      <label key={c} style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',
                        padding:'5px 10px',borderRadius:6,border:`1px solid ${form.condition===c?'#4AAF85':'#1E1E2E'}`,
                        background:form.condition===c?'rgba(74,175,133,0.1)':'transparent',flex:1,justifyContent:'center'}}>
                        <input type="radio" name="cond" checked={form.condition===c} onChange={()=>upd('condition',c)} style={{accentColor:'#4AAF85'}}/>
                        <span style={{fontSize:11,fontWeight:500,color:form.condition===c?'#4AAF85':'#8A8A9A'}}>{c}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div><Lbl c="Description"/>
                  <textarea style={{...S,resize:'none'}} rows={3} placeholder="Any additional info…" value={form.description} onChange={e=>upd('description',e.target.value)}/>
                </div>
              </div>

              {/* Section 3: Pickup */}
              <Sec c="Pickup / Delivery"/>
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                <div><Lbl c="Preferred Pickup Date *"/>
                  <input type="date" style={S} value={form.pickupDate} onChange={e=>upd('pickupDate',e.target.value)}/>
                  <Err m={errors.pickupDate}/>
                </div>
                <div><Lbl c="Pickup Address *"/>
                  <div style={{position:'relative'}}><Ico ch={<MapPin size={14}/>}/>
                    <input style={SI} placeholder="Full address" value={form.pickupAddress} onChange={e=>upd('pickupAddress',e.target.value)}/>
                  </div><Err m={errors.pickupAddress}/>
                </div>
                <div><Lbl c="Delivery Preference *"/>
                  <div style={{display:'flex',gap:10}}>
                    {([['drop-off','I will drop it off'],['pickup','Please arrange pickup']] as [F['deliveryPref'],string][]).map(([v,l])=>(
                      <label key={v} style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',
                        padding:'6px 12px',borderRadius:6,border:`1px solid ${form.deliveryPref===v?'#6C63FF':'#1E1E2E'}`,
                        background:form.deliveryPref===v?'rgba(108,99,255,0.1)':'transparent',flex:1}}>
                        <input type="radio" name="deliv" checked={form.deliveryPref===v} onChange={()=>upd('deliveryPref',v)} style={{accentColor:'#6C63FF'}}/>
                        <span style={{fontSize:11,fontWeight:500,color:form.deliveryPref===v?'#6C63FF':'#8A8A9A'}}>{l}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div><Lbl c="Target Ward (optional)"/>
                  <div style={{position:'relative'}}>
                    <select style={{...S,cursor:'pointer'}} value={form.wardId} onChange={e=>upd('wardId',e.target.value)}>
                      {wards.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
                    </select><ChevronDown size={13} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',color:'#55556A',pointerEvents:'none'}}/>
                  </div>
                </div>
              </div>

              {/* Section 4: Declaration */}
              <Sec c="Declaration"/>
              <label style={{display:'flex',alignItems:'flex-start',gap:10,cursor:'pointer',
                padding:14,borderRadius:8,border:`1px solid ${errors.declared?'#E05555':form.declared?'#6C63FF':'#1E1E2E'}`,
                background:form.declared?'rgba(108,99,255,0.08)':'transparent'}}>
                <input type="checkbox" checked={form.declared} onChange={e=>upd('declared',e.target.checked)}
                  style={{accentColor:'#6C63FF',marginTop:2,flexShrink:0}}/>
                <span style={{fontSize:12,color:'#8A8A9A',lineHeight:1.5}}>
                  I confirm this donation is voluntary and the information provided is accurate.
                </span>
              </label>
              <Err m={errors.declared}/>

              {/* Footer */}
              <div style={{display:'flex',gap:12,paddingTop:16,borderTop:'1px solid #1E1E2E',marginTop:8}}>
                <button type="button" onClick={close}
                  style={{flex:1,padding:'10px 0',borderRadius:6,border:'1px solid #1E1E2E',background:'transparent',color:'#8A8A9A',fontSize:13,fontWeight:500,cursor:'pointer'}}>
                  Cancel
                </button>
                <button type="submit" disabled={busy}
                  style={{flex:2,padding:'10px 0',borderRadius:6,border:'none',background:busy?'#5a52d9':'#6C63FF',color:'#fff',fontSize:13,fontWeight:600,cursor:busy?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                  {busy ? 'Submitting…' : '💜  Submit Donation'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
