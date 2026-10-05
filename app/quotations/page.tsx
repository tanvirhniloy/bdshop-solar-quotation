import { requireUser } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import QuotationHistory from '@/components/QuotationHistory';
export default async function QuotationsPage(){const {profile}=await requireUser();if(!profile)return null;return <AppShell profile={profile}><QuotationHistory role={profile.role}/></AppShell>;}
