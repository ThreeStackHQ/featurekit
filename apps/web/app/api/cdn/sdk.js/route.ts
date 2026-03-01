import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/cdn/sdk.js
 * Serves the FeatureKit IIFE bundle from packages/sdk-js/dist/sdk.iife.js
 * Usage: <script src="https://cdn.featurekit.threestack.io/api/cdn/sdk.js"></script>
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Resolve path relative to the monorepo root
    const sdkPath = path.resolve(
      process.cwd(),
      '../../packages/sdk-js/dist/sdk.iife.js'
    );

    if (!fs.existsSync(sdkPath)) {
      return new NextResponse('SDK bundle not found. Run: pnpm --filter @featurekit/sdk build', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    const bundle = fs.readFileSync(sdkPath, 'utf-8');

    return new NextResponse(bundle, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(`Failed to serve SDK: ${message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
