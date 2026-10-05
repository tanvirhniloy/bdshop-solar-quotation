'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import type { Profile, Quotation, QuotationSettings, QuotationStatus } from '@/types/quotation';
import QuotationPreview from './QuotationPreview';
import ExportButtons from './ExportButtons';

export default function QuotationDetail({id,role}:{id:string;role:Profile['role']}){
 const router=useRouter();const ref=useRef<HTMLDivElement>(null);const [q,setQ]=useState<Quotation|null>(null);const [settings,setSettings]=useState<QuotationSettings|null>(null);const [loading,setLoading]=useState(true);
 async function load(){const [qr,sr]=await Promise.all([fetch(`/api/quotations/${id}`),fetch('/api/settings')]);const qj=await qr.json();const sj=await sr.json();if(!qr.ok){toast.error(qj.error||'Quotation not found');router.replace('/quotations');return;}setQ(qj.data);if(sr.ok)setSettings(sj.data);setLoading(false);}
 useEffect(()=>{load();},[id]);
 async function duplicate(){const r=await fetch(`/api/quotations/${id}/duplicate`,{method:'POST'});const j=await r.json();if(!r.ok){toast.error(j.error||'Unable to duplicate');return;}toast.success('Quotation duplicated.');router.push(`/quotations/${j.data.id}`);}
 async function remove(){if(!confirm('Delete this quotation permanently?'))return;const r=await fetch(`/api/quotations/${id}`,{method:'DELETE'});const j=await r.json();if(!r.ok){toast.error(j.error||'Unable to delete');return;}toast.success('Quotation deleted.');router.push('/quotations');}
 async function statusChange(status:QuotationStatus){const r=await fetch(`/api/quotations/${id}/status`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})});const j=await r.json();if(!r.ok){toast.error(j.error||'Unable to update status');return;}setQ(prev=>prev?{...prev,status}:prev);toast.success('Status updated.');}
 if(loading||!q||!settings)return <div className="py-20 text-center text-slate-500">Loading quotation...</div>;
 return <div><div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 mb-5 no-print"><div><Link href="/quotations" className="text-sm text-[#15458f] inline-flex items-center gap-1 mb-2"><ArrowLeft size={14}/> Quotation History</Link><h1 className="text-2xl font-bold">{q.quotation_number}</h1><p className="text-sm text-slate-500">{q.customer_name} · {q.customer_company||'Individual customer'}</p></div><div className="flex flex-wrap items-center gap-2"><select className="field w-36" value={q.status} onChange={e=>statusChange(e.target.value as QuotationStatus)}><option>Draft</option><option>Generated</option><option>Sent</option><option>Approved</option><option>Rejected</option><option>Cancelled</option></select><Link href={`/quotations/${id}/edit`} className="btn btn-secondary"><Pencil size={15}/> Edit</Link><button className="btn btn-secondary" onClick={duplicate}><Copy size={15}/> Duplicate</button>{role==='ADMIN'&&<button className="btn btn-danger" onClick={remove}><Trash2 size={15}/> Delete</button>}<ExportButtons quotation={q} settings={settings} previewRef={ref}/></div></div><div className="flex justify-center"><div ref={ref} className="bg-slate-200 p-4 rounded-xl overflow-auto print-target"><QuotationPreview quotation={q} settings={settings}/></div></div></div>;
}
