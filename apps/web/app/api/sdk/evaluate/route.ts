import { NextRequest, NextResponse } from 'next/server';
import { getDb, projects, flags, flagEvaluations, eq, and } from '@featurekit/db';
import { z } from 'zod';
import { evaluateFlag } from '@/lib/evaluate';
import type { Flag } from '@featurekit/db';

export const dynamic = 'force-dynamic';

const evaluateSchema = z.object({
  flagKey: z.string(),
  context: z.record(z.union([z.string(), z.number(), z.boolean()])).default({}),
});

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'X-API-Key, Content-Type',
};

/** Fire-and-forget evaluation tracking — never throws */
function trackEvaluation(
  flagId: string,
  endUserId: string | undefined,
  variant: string | undefined
): void {
  const db = getDb();
  db.insert(flagEvaluations)
    .values({
      flagId,
      endUserId: endUserId ?? null,
      variant: variant ?? null,
    })
    .execute()
    .catch(() => {
      // Silently ignore — tracking should never break the evaluation
    });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const apiKey = req.headers.get('X-API-Key');

  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401, headers: CORS_HEADERS });
  }

  try {
    const body = await req.json();
    const { flagKey, context } = evaluateSchema.parse(body);

    const db = getDb();
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.apiKey, apiKey))
      .limit(1);

    if (!project) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401, headers: CORS_HEADERS });
    }

    const [flag] = await db
      .select()
      .from(flags)
      .where(and(eq(flags.projectId, project.id), eq(flags.key, flagKey)))
      .limit(1);

    if (!flag) {
      return NextResponse.json(
        { enabled: false, reason: 'flag_not_found' },
        { headers: CORS_HEADERS }
      );
    }

    const result = evaluateFlag(flag as Flag, context);

    // Fire-and-forget: track this evaluation for A/B analytics
    const endUserId = typeof context['userId'] === 'string' ? context['userId'] : undefined;
    trackEvaluation(flag.id, endUserId, result.variant);

    return NextResponse.json(
      { flagKey, ...result },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400, headers: CORS_HEADERS });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { headers: CORS_HEADERS });
}
