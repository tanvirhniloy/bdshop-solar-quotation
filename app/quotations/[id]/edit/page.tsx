import { requireUser } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import QuotationEditor from '@/components/QuotationEditor';
export default async function EditQuotationPage({params}:{params:Promise<{id:string}>}){const {id}=await params;const {profile}=await requireUser();if(!profile)return null;return <AppShell profile={profile}><QuotationEditor id={id}/></AppShell>;}
