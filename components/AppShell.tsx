'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, FilePlus2, FileText, Settings, UserCircle, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import type { Profile } from '@/types/quotation';

export default function AppShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const supabase = createClient();
  const nav = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/new', label: 'New Quotation', icon: FilePlus2 },
    { href: '/quotations', label: 'Quotation History', icon: FileText },
    { href: '/settings', label: 'Settings', icon: Settings, admin: true },
    { href: '/profile', label: 'Profile', icon: UserCircle },
  ].filter((item) => !item.admin || profile.role === 'ADMIN');

  async function logout() { await supabase.auth.signOut(); router.replace('/login'); router.refresh(); }

  return <div className="min-h-screen flex">
    <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static z-40 inset-y-0 left-0 w-64 bg-[#102f64] text-white transition-transform duration-200 flex flex-col`}>
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
        <div><div className="text-xl font-black tracking-wide">BDSHOP</div><div className="text-[10px] tracking-[.3em] text-blue-200">SOLAR & IPS</div></div>
        <button className="lg:hidden" onClick={() => setOpen(false)}><X size={20}/></button>
      </div>
      <nav className="p-3 space-y-1 flex-1">
        {nav.map(({ href,label,icon:Icon }) => <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${pathname === href || pathname.startsWith(`${href}/`) ? 'bg-white/15 font-bold' : 'text-blue-100 hover:bg-white/10'}`}><Icon size={18}/>{label}</Link>)}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="text-sm font-semibold truncate">{profile.full_name || profile.email}</div>
        <div className="text-xs text-blue-200 mb-3">{profile.role}</div>
        <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm"><LogOut size={16}/> Logout</button>
      </div>
    </aside>
    {open && <button aria-label="Close menu" className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setOpen(false)} />}
    <main className="flex-1 min-w-0">
      <header className="lg:hidden h-16 bg-white border-b flex items-center px-4 sticky top-0 z-20"><button onClick={() => setOpen(true)} className="mr-3"><Menu/></button><span className="font-bold">BDSHOP Solar & IPS</span></header>
      <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">{children}</div>
    </main>
  </div>;
}
