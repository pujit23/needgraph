import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, AlertCircle, ChevronDown, Building2, Phone, User, MapPin, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { wards } from '../../data/mockData';
import { useResourceStore, type AddResourcePayload } from '../../store/resourceStore';
import type { ResourceCategory, ResourceStatus, ResourceUnit } from '../../types';

const CATEGORIES: ResourceCategory[] = ['Food','Water','Medical','Shelter','Education','Other'];
const UNITS: ResourceUnit[] = ['KG','Liters','Units','Kits','Boxes','Packs','Sets','Bottles','Tabs','Other'];
const STATUSES: ResourceStatus[] = ['Available','Reserved','Dispatched','Depleted'];
const STATUS_COLORS: Record<ResourceStatus,string> = { Available:'#4AAF85', Reserved:'#C9A84C', Dispatched:'#6C63FF', Depleted:'#E05555' };

interface Props { open: boolean; onClose: () => void; }
interface F {
  name:string; category:ResourceCategory; quantity:string; unit:ResourceUnit; description:string;
  ngoName:string; contactPerson:string; contactNumber:string; wardId:string;
  storageLocation:string; status:ResourceStatus; expiryDate:string; notes:string;
}
const EMPTY: F = { name:'', category:'Food', quantity:'', unit:'KG', description:'', ngoName:'', contactPerson:'', contactNumber:'', wardId:'1', storageLocation:'', status:'Available', expiryDate:'', notes:'' };

const S: React.CSSProperties = { width:'100%', padding:'9px 12px', background:'#111118', border:'1px solid #1E1E2E', borderRadius:6, color:'#F0F0F5', fontSize:13, outline:'none', boxSizing:'border-box' };
const SI: React.CSSProperties = { ...S, paddingLeft:36 };

function Lbl({c}:{c:string}) { return <div style={{fontSize:11,fontWeight:600,color:'#8A8A9A',marginBottom:6}}>{c}</div>; }
function Sec({c}:{c:string}) { return <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.09em',color:'#55556A',textTransform:'uppercase',borderBottom:'1px solid #1E1E2E',paddingBottom:8,marginBottom:16}}>{c}</div>; }
function Err({m}:{m?:string}) { return m ? <div style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:'#E05555',marginTop:4}}><AlertCircle size={11}/>{m}</div> : null; }
function Ico({ch}:{ch:React.ReactNode}) { return <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'#55556A',display:'flex',pointerEvents:'none'}}>{ch}</span>; }

export default function AddResourcePanel({ open, onClose }: Props) {
  const { addResource } = useResourceStore();
  const [form, setForm] = useState<F>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof F,string>>>({});
  const [busy, setBusy] = useState(false);

  const upd = <K extends keyof F>(k:K, v:F[K]) => { setForm(p=>({...p,[k]:v})); setErrors(p=>({...p,[k]:undefined})); };

  const validate = () => {
    const e: Partial<Record<keyof F,string>> = {};
    if (!form.name.trim())           e.name     = 'Required';
    if (Number(form.quantity) < 1)   e.quantity = 'Must be ≥ 1';
    if (!form.ngoName.trim())        e.ngoName  = 'Required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setBusy(true);
    await new Promise(r => setTimeout(r, 800));
    const ward = wards.find(w => w.id === Number(form.wardId));
    const payload: AddResourcePayload = {
      name: form.name.trim(), category: form.category, quantity: Number(form.quantity), unit: form.unit,
      description: form.description || undefined, ngoName: form.ngoName.trim(),
      contactPerson: form.contactPerson || undefined, contactNumber: form.contactNumber || undefined,
      wardId: Number(form.wardId), wardName: ward?.name ?? `Ward ${form.wardId}`,
      storageLocation: form.storageLocation || undefined, status: form.status,
      expiryDate: form.expiryDate || undefined, notes: form.notes || undefined,
    };
    addResource(payload);
    toast.success('✅ Resource added successfully', { style:{ background:'#111118', color:'#4AAF85', border:'1px solid #1E1E2E' } });
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
                <h2 style={{fontSize:16,fontWeight:700,color:'#F0F0F5',margin:0}}>Add New Resource</h2>
                <p style={{fontSize:12,color:'#55556A',marginTop:4}}>Register a resource in the inventory</p>
              </div>
              <button onClick={close} style={{background:'none',border:'none',cursor:'pointer',color:'#55556A',padding:6,borderRadius:6,display:'flex'}}><X size={18}/></button>
            </div>
            {/* Form */}
            <form onSubmit={submit} style={{flex:1,padding:24,display:'flex',flexDirection:'column',gap:20}}>
              <Sec c="Resource Info"/>
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                <div>
                  <Lbl c="Resource Name *"/>
                  <div style={{position:'relative'}}><Ico ch={<Package size={14}/>}/>
                    <input style={SI} placeholder="e.g. Rice & Grain Packs" value={form.name} onChange={e=>upd('name',e.target.value)}/>
                  </div><Err m={errors.name}/>
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
                  <input style={S} type="number" min={1} placeholder="e.g. 500" value={form.quantity} onChange={e=>upd('quantity',e.target.value)}/>
                  <Err m={errors.quantity}/>
                </div>
                <div><Lbl c="Description"/>
                  <textarea style={{...S,resize:'none'}} rows={3} placeholder="Optional…" value={form.description} onChange={e=>upd('description',e.target.value)}/>
                </div>
              </div>

              <Sec c="Source / NGO"/>
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                <div><Lbl c="NGO / Organization Name *"/>
                  <div style={{position:'relative'}}><Ico ch={<Building2 size={14}/>}/>
                    <input style={SI} placeholder="e.g. MedRelief NGO" value={form.ngoName} onChange={e=>upd('ngoName',e.target.value)}/>
                  </div><Err m={errors.ngoName}/>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div><Lbl c="Contact Person"/>
                    <div style={{position:'relative'}}><Ico ch={<User size={14}/>}/>
                      <input style={SI} placeholder="Full name" value={form.contactPerson} onChange={e=>upd('contactPerson',e.target.value)}/>
                    </div>
                  </div>
                  <div><Lbl c="Contact Number"/>
                    <div style={{position:'relative'}}><Ico ch={<Phone size={14}/>}/>
                      <input style={SI} type="tel" placeholder="+91 …" value={form.contactNumber} onChange={e=>upd('contactNumber',e.target.value)}/>
                    </div>
                  </div>
                </div>
              </div>

              <Sec c="Location & Assignment"/>
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                <div><Lbl c="Ward Assignment *"/>
                  <div style={{position:'relative'}}>
                    <select style={{...S,cursor:'pointer'}} value={form.wardId} onChange={e=>upd('wardId',e.target.value)}>
                      {wards.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
                    </select><ChevronDown size={13} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',color:'#55556A',pointerEvents:'none'}}/>
                  </div>
                </div>
                <div><Lbl c="Storage Location"/>
                  <div style={{position:'relative'}}><Ico ch={<MapPin size={14}/>}/>
                    <input style={SI} placeholder="e.g. Community Hall, Ward 12" value={form.storageLocation} onChange={e=>upd('storageLocation',e.target.value)}/>
                  </div>
                </div>
                <div><Lbl c="Availability Status *"/>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:4}}>
                    {STATUSES.map(s=>(
                      <label key={s} style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',
                        padding:'6px 12px',borderRadius:6,border:`1px solid ${form.status===s?STATUS_COLORS[s]:'#1E1E2E'}`,
                        background:form.status===s?`${STATUS_COLORS[s]}18`:'transparent'}}>
                        <input type="radio" name="status" value={s} checked={form.status===s} onChange={()=>upd('status',s)} style={{accentColor:STATUS_COLORS[s]}}/>
                        <span style={{fontSize:12,fontWeight:500,color:form.status===s?STATUS_COLORS[s]:'#8A8A9A'}}>{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <Sec c="Expiry & Notes"/>
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                <div><Lbl c="Expiry Date"/>
                  <div style={{position:'relative'}}><Ico ch={<Calendar size={14}/>}/>
                    <input type="date" style={SI} value={form.expiryDate} onChange={e=>upd('expiryDate',e.target.value)}/>
                  </div>
                </div>
                <div><Lbl c="Internal Notes"/>
                  <textarea style={{...S,resize:'none'}} rows={3} placeholder="Optional internal notes…" value={form.notes} onChange={e=>upd('notes',e.target.value)}/>
                </div>
              </div>

              {/* Footer */}
              <div style={{display:'flex',gap:12,paddingTop:16,borderTop:'1px solid #1E1E2E',marginTop:8}}>
                <button type="button" onClick={close}
                  style={{flex:1,padding:'10px 0',borderRadius:6,border:'1px solid #1E1E2E',background:'transparent',color:'#8A8A9A',fontSize:13,fontWeight:500,cursor:'pointer'}}>
                  Cancel
                </button>
                <button type="submit" disabled={busy}
                  style={{flex:2,padding:'10px 0',borderRadius:6,border:'none',background:busy?'#5a52d9':'#6C63FF',color:'#fff',fontSize:13,fontWeight:600,cursor:busy?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                  {busy ? 'Saving…' : '💾  Save Resource'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
