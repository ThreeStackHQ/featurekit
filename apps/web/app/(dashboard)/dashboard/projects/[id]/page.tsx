import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { getDb, projects, flags, eq, and, count } from '@featurekit/db';
import Link from 'next/link';
import { ArrowRight, Key, Flag, Zap, Activity } from 'lucide-react';
import CopyApiKey from '@/app/components/CopyApiKey';

export const dynamic = 'force-dynamic';

export default async function ProjectOverviewPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const db = getDb();
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, params.id), eq(projects.userId, session.user.id)))
    .limit(1);

  if (!project) notFound();

  const allFlags = await db.select().from(flags).where(eq(flags.projectId, params.id));
  const enabledCount = allFlags.filter((f) => f.enabled).length;
  const totalCount = allFlags.length;

  const maskedKey = project.apiKey.slice(0, 8) + '••••••••••••••••' + project.apiKey.slice(-4);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link href="/dashboard/projects" className="hover:text-gray-300 transition">Projects</Link>
            <span>/</span>
            <span className="text-gray-300">{project.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{project.name}</h1>
          {project.description && (
            <p className="text-gray-400 mt-1">{project.description}</p>
          )}
        </div>
        <Link
          href={`/dashboard/projects/${params.id}/flags`}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition"
        >
          Go to Flags
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Flags', value: totalCount, icon: Flag, color: 'text-violet-400' },
          { label: 'Enabled', value: enabledCount, icon: Zap, color: 'text-green-400' },
          { label: 'Evaluations Today', value: 0, icon: Activity, color: 'text-blue-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>

      {/* API Key */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Key className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-white">API Key</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Use this key in your SDK to fetch flags. Keep it secret — treat it like a password.
        </p>
        <CopyApiKey apiKey={project.apiKey} maskedKey={maskedKey} />
      </div>

      {/* Env tabs (cosmetic) */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-3">Environments</h2>
        <div className="flex gap-2">
          {['Production', 'Development'].map((env, i) => (
            <button
              key={env}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                i === 0
                  ? 'bg-violet-900/50 text-violet-300 border border-violet-700/40'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800 border border-transparent'
              }`}
            >
              {env}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Multiple environments per project coming soon. Currently using Production.
        </p>
      </div>
    </div>
  );
}
