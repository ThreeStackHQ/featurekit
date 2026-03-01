import { NextRequest, NextResponse } from 'next/server';
import { getDb, projects, flags, eq, and, count } from '@featurekit/db';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth-helpers';
import { canCreateFlag } from '@/lib/tier';

export const dynamic = 'force-dynamic';

const createFlagSchema = z.object({
  name: z.string().min(1).max(100),
  key: z.string().min(1).max(100).regex(/^[a-z0-9_-]+$/, 'Key must be lowercase with hyphens/underscores'),
  description: z.string().max(500).optional(),
  enabled: z.boolean().default(false),
  rolloutPercentage: z.number().int().min(0).max(100).default(0),
  targetingRules: z.array(z.object({
    attribute: z.string(),
    operator: z.enum(['IS', 'IS_NOT', 'CONTAINS', 'NOT_CONTAINS', 'IN', 'NOT_IN', 'GT', 'LT']),
    value: z.union([z.string(), z.array(z.string()), z.number()]),
  })).default([]),
  variants: z.array(z.object({
    name: z.string(),
    weight: z.number().int().min(0).max(100),
  })).default([]),
  isExperiment: z.boolean().default(false),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const db = getDb();
  // Verify ownership
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, params.id), eq(projects.userId, session!.user.id)))
    .limit(1);

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  const projectFlags = await db.select().from(flags).where(eq(flags.projectId, params.id));
  return NextResponse.json(projectFlags);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const db = getDb();
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, params.id), eq(projects.userId, session!.user.id)))
    .limit(1);

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  // Check tier limit
  const [{ value: flagCount }] = await db
    .select({ value: count() })
    .from(flags)
    .where(eq(flags.projectId, params.id));

  const allowed = await canCreateFlag(session!.user.id, Number(flagCount));
  if (!allowed) {
    return NextResponse.json(
      { error: 'Flag limit reached. Upgrade to Pro for unlimited flags.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const data = createFlagSchema.parse(body);

    // Check key uniqueness within project
    const existing = await db
      .select()
      .from(flags)
      .where(and(eq(flags.projectId, params.id), eq(flags.key, data.key)))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Flag key already exists in this project' }, { status: 400 });
    }

    const [flag] = await db.insert(flags).values({ projectId: params.id, ...data }).returning();
    return NextResponse.json(flag, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors }, { status: 400 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
