import { NextRequest, NextResponse } from 'next/server';
import {
  getDb,
  projects,
  flags,
  flagEvaluations,
  eq,
  and,
  gte,
  sql,
  count,
} from '@featurekit/db';
import { requireAuth } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

async function verifyFlagOwnership(
  userId: string,
  projectId: string,
  flagId: string
): Promise<boolean> {
  const db = getDb();
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1);

  if (!project) return false;

  const [flag] = await db
    .select({ id: flags.id })
    .from(flags)
    .where(and(eq(flags.id, flagId), eq(flags.projectId, projectId)))
    .limit(1);

  return Boolean(flag);
}

/**
 * GET /api/projects/:id/flags/:flagId/analytics
 *
 * Returns A/B test analytics for the last 30 days.
 *
 * Response shape:
 * {
 *   flagId: string,
 *   date_range: { from: string, to: string },
 *   total_evaluations: number,
 *   unique_users: number,
 *   evaluations_by_variant: Record<string, number>
 * }
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; flagId: string } }
): Promise<NextResponse> {
  const { session, error } = await requireAuth();
  if (error) return error;

  const authorized = await verifyFlagOwnership(
    session!.user.id,
    params.id,
    params.flagId
  );

  if (!authorized) {
    return NextResponse.json({ error: 'Flag not found' }, { status: 404 });
  }

  const db = getDb();

  // Last 30 days window
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Total evaluations in the window
  const [totalRow] = await db
    .select({ total: count() })
    .from(flagEvaluations)
    .where(
      and(
        eq(flagEvaluations.flagId, params.flagId),
        gte(flagEvaluations.timestamp, thirtyDaysAgo)
      )
    );

  const totalEvaluations = totalRow?.total ?? 0;

  // Unique users (non-null endUserId)
  const [uniqueRow] = await db.execute<{ unique_users: string }>(
    sql`
      SELECT COUNT(DISTINCT end_user_id) AS unique_users
      FROM flag_evaluations
      WHERE flag_id = ${params.flagId}
        AND timestamp >= ${thirtyDaysAgo}
        AND end_user_id IS NOT NULL
    `
  );

  const uniqueUsers = Number(uniqueRow?.unique_users ?? 0);

  // Counts per variant
  const variantRows = await db.execute<{ variant: string | null; cnt: string }>(
    sql`
      SELECT variant, COUNT(*) AS cnt
      FROM flag_evaluations
      WHERE flag_id = ${params.flagId}
        AND timestamp >= ${thirtyDaysAgo}
      GROUP BY variant
    `
  );

  const evaluationsByVariant: Record<string, number> = {};
  for (const row of variantRows) {
    const variantKey = row.variant ?? '(none)';
    evaluationsByVariant[variantKey] = Number(row.cnt);
  }

  return NextResponse.json({
    flagId: params.flagId,
    date_range: {
      from: thirtyDaysAgo.toISOString(),
      to: now.toISOString(),
    },
    total_evaluations: totalEvaluations,
    unique_users: uniqueUsers,
    evaluations_by_variant: evaluationsByVariant,
  });
}
