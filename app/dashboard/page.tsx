import { requireUser } from '@/lib/auth';
import AppShell from '@/components/AppShell';
import DashboardClient from '@/components/DashboardClient';

export default async function DashboardPage() {
  const { profile } = await requireUser();
  if (!profile) return null;
  return <AppShell profile={profile}><DashboardClient /></AppShell>;
}
