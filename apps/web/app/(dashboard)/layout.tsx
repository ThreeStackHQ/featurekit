import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { signOut } from '@/auth';

const NAV = [
  { href: '/dashboard', label: '📊 Overview' },
  { href: '/dashboard/projects', label: '📁 Projects' },
  { href: '/dashboard/billing', label: '💳 Billing' },
  { href: '/dashboard/settings', label: '⚙️ Settings' },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <Link href="/dashboard" className="text-xl font-bold text-violet-400">⚡ FeatureKit</Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="text-xs text-gray-500 mb-2">{session.user.email}</div>
          <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }); }}>
            <button type="submit" className="w-full text-left text-sm text-gray-400 hover:text-white transition">
              Sign out →
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
