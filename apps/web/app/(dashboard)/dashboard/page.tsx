import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getDb, projects, flags, eq, count } from '@featurekit/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const db = getDb();
  const userProjects = await db.select().from(projects).where(eq(projects.userId, session.user.id));

  const flagCountResult = await db
    .select({ count: count() })
    .from(flags)
    .innerJoin(projects, eq(flags.projectId, projects.id))
    .where(eq(projects.userId, session.user.id));
  const flagCount = flagCountResult[0]?.count ?? 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back, {session.user.name}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="text-2xl font-bold text-violet-400">{userProjects.length}</div>
          <div className="text-sm text-gray-400 mt-1">Projects</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="text-2xl font-bold text-green-400">{flagCount}</div>
          <div className="text-sm text-gray-400 mt-1">Active flags across projects</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="text-2xl font-bold text-blue-400">Free</div>
          <div className="text-sm text-gray-400 mt-1">Current plan</div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Projects</h2>
        <Link href="/dashboard/projects/new"
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition">
          + New Project
        </Link>
      </div>

      {userProjects.length === 0 ? (
        <div className="bg-gray-900 border border-dashed border-gray-700 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">🚀</div>
          <p className="text-gray-400 mb-4">No projects yet. Create your first one!</p>
          <Link href="/dashboard/projects/new"
            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition">
            Create Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {userProjects.map((p) => (
            <Link key={p.id} href={`/dashboard/projects/${p.id}`}
              className="bg-gray-900 border border-gray-800 hover:border-violet-700/50 rounded-xl p-6 transition group">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-white group-hover:text-violet-400 transition">{p.name}</h3>
                  {p.description && <p className="text-sm text-gray-400 mt-1">{p.description}</p>}
                </div>
                <code className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                  {p.apiKey.slice(0, 20)}...
                </code>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
