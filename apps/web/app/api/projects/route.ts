import { NextRequest, NextResponse } from 'next/server';
import { getDb, projects, flags, users, eq, and, count, sql } from '@featurekit/db';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth-helpers';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const db = getDb();
  const userProjects = await db
    .select({
      id: projects.id,
      name: projects.name,
      apiKey: projects.apiKey,
      description: projects.description,
      createdAt: projects.createdAt,
    })
    .from(projects)
    .where(eq(projects.userId, session!.user!.id!));

  return NextResponse.json(userProjects);
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await req.json();
    const { name, description } = createProjectSchema.parse(body);

    const apiKey = 'fk_live_' + crypto.randomBytes(32).toString('hex');
    const db = getDb();
    const [project] = await db
      .insert(projects)
      .values({ userId: session!.user!.id!, name, apiKey, description })
      .returning();

    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
