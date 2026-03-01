import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { getDb, projects, flags, eq, and } from '@featurekit/db';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import FlagsClient from '@/app/components/FlagsClient';

export const dynamic = 'force-dynamic';

export default async function FlagsPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const db = getDb();
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, params.id), eq(projects.userId, session.user.id)))
    .limit(1);

  if (!project) notFound();

  const projectFlags = await db
    .select()
    .from(flags)
    .where(eq(flags.projectId, params.id));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link href="/dashboard/projects" className="hover:text-gray-300 transition">Projects</Link>
            <span>/</span>
            <Link href={`/dashboard/projects/${params.id}`} className="hover:text-gray-300 transition">{project.name}</Link>
            <span>/</span>
            <span className="text-gray-300">Flags</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            {project.name}
            <span className="text-sm font-normal text-gray-400">— Feature Flags</span>
          </h1>
        </div>
        <Link
          href={`/dashboard/projects/${params.id}`}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-700 rounded-lg transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Overview
        </Link>
      </div>

      <FlagsClient flags={projectFlags} projectId={params.id} />
    </div>
  );
}
