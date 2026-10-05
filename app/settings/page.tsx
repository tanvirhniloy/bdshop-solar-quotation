import { requireUser } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import SettingsClient from '@/components/SettingsClient';
export default async function SettingsPage(){const {profile}=await requireUser();if(!profile)return null;if(profile.role!=='ADMIN')return <AppShell profile={profile}><div className="card p-8 text-center"><h1 className="text-xl font-bold">Admin access required</h1><p className="text-sm text-slate-500 mt-2">Quotation settings are restricted to administrators.</p></div></AppShell>;return <AppShell profile={profile}><SettingsClient/></AppShell>;}
