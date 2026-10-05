'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/browser';
import { LockKeyhole } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter(); const supabase = createClient();
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [loading,setLoading]=useState(false);
  async function submit(e: FormEvent) { e.preventDefault(); setLoading(true); const {error}=await supabase.auth.signInWithPassword({email,password}); setLoading(false); if(error){toast.error(error.message);return;} router.replace('/dashboard'); router.refresh(); }
  return <div className="w-full max-w-md card p-8">
    <div className="mb-8"><div className="text-3xl font-black text-[#15458f]">BDSHOP</div><div className="text-xs tracking-[.35em] text-slate-500">SOLAR & IPS QUOTATION MAKER</div></div>
    <h1 className="text-2xl font-bold mb-1">Sign in</h1><p className="text-sm text-slate-500 mb-6">Authorized BDSHOP team members only.</p>
    <form onSubmit={submit} className="space-y-4">
      <div><label className="label">Email</label><input className="field" type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/></div>
      <div><label className="label">Password</label><input className="field" type="password" required value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/></div>
      <button className="btn btn-primary w-full py-3" disabled={loading}>{loading?'Signing in...':<><LockKeyhole size={16}/>Sign in</>}</button>
    </form>
  </div>;
}
