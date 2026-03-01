import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { signOut } from '@/auth';
import DashboardSidebar from '@/app/components/DashboardSidebar';

async function signOutAction() {
  'use server';
  await signOut({ redirectTo: '/login' });
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  return (
    <DashboardSidebar
      email={session.user.email ?? ''}
      name={session.user.name ?? ''}
      signOutAction={signOutAction}
    >
      {children}
    </DashboardSidebar>
  );
}
