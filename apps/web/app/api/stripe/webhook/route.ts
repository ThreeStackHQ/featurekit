import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getDb, subscriptions, eq } from '@featurekit/db';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  const db = getDb();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier as 'pro' | 'business' | undefined;

        if (!userId || !tier) break;

        const subscriptionId = session.subscription as string;
        const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
        const currentPeriodEnd = new Date(
          (subscription.items.data[0]?.current_period_end ?? 0) * 1000
        );

        await db
          .insert(subscriptions)
          .values({
            userId,
            tier,
            status: 'active',
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscriptionId,
            currentPeriodEnd,
          })
          .onConflictDoUpdate({
            target: subscriptions.userId,
            set: {
              tier,
              status: 'active',
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscriptionId,
              currentPeriodEnd,
              updatedAt: new Date(),
            },
          });
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const currentPeriodEnd = new Date(
          (sub.items.data[0]?.current_period_end ?? 0) * 1000
        );
        await db
          .update(subscriptions)
          .set({ status: sub.status, currentPeriodEnd, updatedAt: new Date() })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id));
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await db
          .update(subscriptions)
          .set({ tier: 'free', status: 'canceled', updatedAt: new Date() })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id));
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
