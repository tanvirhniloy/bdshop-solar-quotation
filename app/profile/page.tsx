import { requireUser } from '@/lib/auth';
import AppShell from '@/components/AppShell';

export default async function ProfilePage(){ const {profile}=await requireUser(); if(!profile)return null; return <AppShell profile={profile}><div className="max-w-2xl"><h1 className="text-2xl font-bold mb-1">Profile</h1><p className="text-sm text-slate-500 mb-6">Your authenticated account information.</p><div className="card p-6 space-y-4"><div><div className="label">Full name</div><div className="font-semibold">{profile.full_name||'Not set'}</div></div><div><div className="label">Email</div><div className="font-semibold">{profile.email}</div></div><div><div className="label">Role</div><div className="font-semibold">{profile.role}</div></div></div></div></AppShell>; }
