import { NextRequest, NextResponse } from 'next/server';
import { getDb, projects, flags, eq, and } from '@featurekit/db';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

const updateFlagSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  enabled: z.boolean().optional(),
  rolloutPercentage: z.number().int().min(0).max(100).optional(),
  targetingRules: z.array(z.object({
    attribute: z.string(),
    operator: z.enum(['IS', 'IS_NOT', 'CONTAINS', 'NOT_CONTAINS', 'IN', 'NOT_IN', 'GT', 'LT']),
    value: z.union([z.string(), z.array(z.string()), z.number()]),
  })).optional(),
  variants: z.array(z.object({
    name: z.string(),
    weight: z.number().int().min(0).max(100),
  })).optional(),
  isExperiment: z.boolean().optional(),
});

async function verifyOwnership(userId: string, projectId: string, flagId: string) {
  const db = getDb();
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1);

  if (!project) return null;

  const [flag] = await db
    .select()
    .from(flags)
    .where(and(eq(flags.id, flagId), eq(flags.projectId, projectId)))
    .limit(1);

  return flag || null;
}

export async function GET(req: NextRequest, { params }: { params: { id: string; flagId: string } }) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const flag = await verifyOwnership(session!.user!.id!, params.id, params.flagId);
  if (!flag) return NextResponse.json({ error: 'Flag not found' }, { status: 404 });

  return NextResponse.json(flag);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string; flagId: string } }) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const flag = await verifyOwnership(session!.user!.id!, params.id, params.flagId);
  if (!flag) return NextResponse.json({ error: 'Flag not found' }, { status: 404 });

  try {
    const body = await req.json();
    const updates = updateFlagSchema.parse(body);

    const db = getDb();
    const [updated] = await db
      .update(flags)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(flags.id, params.flagId))
      .returning();

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors }, { status: 400 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string; flagId: string } }) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const flag = await verifyOwnership(session!.user!.id!, params.id, params.flagId);
  if (!flag) return NextResponse.json({ error: 'Flag not found' }, { status: 404 });

  const db = getDb();
  await db.delete(flags).where(eq(flags.id, params.flagId));
  return NextResponse.json({ success: true });
}
