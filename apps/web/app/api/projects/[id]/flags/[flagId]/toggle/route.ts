import { NextRequest, NextResponse } from 'next/server';
import { getDb, projects, flags, eq, and } from '@featurekit/db';
import { requireAuth } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string; flagId: string } }) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const db = getDb();
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, params.id), eq(projects.userId, session!.user.id)))
    .limit(1);

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  const [flag] = await db
    .select()
    .from(flags)
    .where(and(eq(flags.id, params.flagId), eq(flags.projectId, params.id)))
    .limit(1);

  if (!flag) return NextResponse.json({ error: 'Flag not found' }, { status: 404 });

  const [updated] = await db
    .update(flags)
    .set({ enabled: !flag.enabled, updatedAt: new Date() })
    .where(eq(flags.id, params.flagId))
    .returning();

  return NextResponse.json(updated);
}
