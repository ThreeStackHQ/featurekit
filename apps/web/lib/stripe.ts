import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-02-25.clover' as Parameters<typeof Stripe>[1]['apiVersion'],
    });
  }
  return _stripe;
}

export const PLANS = {
  free: { name: 'Free', price: 0, priceId: null },
  pro: { name: 'Pro', price: 9, priceId: process.env.STRIPE_PRICE_PRO },
  business: { name: 'Business', price: 29, priceId: process.env.STRIPE_PRICE_BUSINESS },
} as const;
