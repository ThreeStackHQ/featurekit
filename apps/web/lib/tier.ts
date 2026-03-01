import { getDb, subscriptions, eq } from '@featurekit/db';

export type Tier = 'free' | 'pro' | 'business';

export const FLAG_LIMITS: Record<Tier, number> = {
  free: 5,
  pro: Infinity,
  business: Infinity,
};

export async function getUserTier(userId: string): Promise<Tier> {
  const db = getDb();
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (!sub || sub.status !== 'active') return 'free';
  return (sub.tier as Tier) || 'free';
}

export async function flagLimit(userId: string): Promise<number> {
  const tier = await getUserTier(userId);
  return FLAG_LIMITS[tier];
}

export async function canCreateFlag(userId: string, currentFlagCount: number): Promise<boolean> {
  const tier = await getUserTier(userId);
  const limit = FLAG_LIMITS[tier];
  return currentFlagCount < limit;
}
