import { requireUser } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import QuotationDetail from '@/components/QuotationDetail';
export default async function QuotationDetailPage({params}:{params:Promise<{id:string}>}){const {id}=await params;const {profile}=await requireUser();if(!profile)return null;return <AppShell profile={profile}><QuotationDetail id={id} role={profile.role}/></AppShell>;}
