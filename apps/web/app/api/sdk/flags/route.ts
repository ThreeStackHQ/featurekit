import { NextRequest, NextResponse } from 'next/server';
import { getDb, projects, flags, eq } from '@featurekit/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('X-API-Key') || req.nextUrl.searchParams.get('apiKey');

  if (!apiKey) {
    return NextResponse.json({ error: 'API key required (X-API-Key header)' }, { status: 401 });
  }

  const db = getDb();
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.apiKey, apiKey))
    .limit(1);

  if (!project) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  const projectFlags = await db
    .select({
      id: flags.id,
      key: flags.key,
      name: flags.name,
      enabled: flags.enabled,
      rolloutPercentage: flags.rolloutPercentage,
      targetingRules: flags.targetingRules,
      variants: flags.variants,
      isExperiment: flags.isExperiment,
    })
    .from(flags)
    .where(eq(flags.projectId, project.id));

  return NextResponse.json(
    { projectId: project.id, flags: projectFlags },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'X-API-Key, Content-Type',
      },
    }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'X-API-Key, Content-Type',
    },
  });
}
