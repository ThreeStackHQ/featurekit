import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apiVersion: '2026-02-25.clover' as any,
    });
  }
  return _stripe;
}

export const PLANS = {
  free: { name: 'Free', price: 0, priceId: null },
  pro: { name: 'Pro', price: 9, priceId: process.env.STRIPE_PRICE_PRO ?? null },
  business: { name: 'Business', price: 29, priceId: process.env.STRIPE_PRICE_BUSINESS ?? null },
} as const;
