import { redirect } from 'next/navigation';
import { getSessionContext } from '@/lib/auth';

export default async function Home() {
  const { user } = await getSessionContext();
  redirect(user ? '/dashboard' : '/login');
}
