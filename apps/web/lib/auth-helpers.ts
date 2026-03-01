import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';

// Session type with guaranteed user.id (string)
export interface AuthSession extends Session {
  user: NonNullable<Session['user']> & { id: string };
}

export async function getSession(): Promise<AuthSession | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session as AuthSession;
}

export async function requireAuth(): Promise<
  | { session: AuthSession; error: null }
  | { session: null; error: NextResponse }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      session: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { session: session as AuthSession, error: null };
}
