import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { getDb, users, eq } from '@featurekit/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const signupSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, password } = signupSchema.parse(body);

    const db = getDb();
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const passwordHash = await hash(password, 12);
    const [user] = await db.insert(users).values({ email, name, passwordHash }).returning();

    return NextResponse.json({ id: user.id, email: user.email, name: user.name }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
