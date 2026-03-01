import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { getStripe, PLANS } from '@/lib/stripe';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const checkoutSchema = z.object({
  tier: z.enum(['pro', 'business']),
});

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await req.json();
    const { tier } = checkoutSchema.parse(body);

    const plan = PLANS[tier];
    if (!plan.priceId) {
      return NextResponse.json({ error: 'Price not configured' }, { status: 500 });
    }

    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
      metadata: {
        userId: session!.user.id,
        tier,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors }, { status: 400 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
