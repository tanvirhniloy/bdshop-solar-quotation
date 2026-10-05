import { requireUser } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import QuotationEditor from '@/components/QuotationEditor';
export default async function NewQuotationPage(){const {profile}=await requireUser();if(!profile)return null;return <AppShell profile={profile}><QuotationEditor/></AppShell>;}
