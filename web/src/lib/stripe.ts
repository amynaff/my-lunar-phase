import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return Reflect.get(getStripe(), prop);
  },
});

export const PLANS = {
  free: { name: "Free", price: 0, priceId: null },
  monthly: {
    name: "Monthly",
    price: 6.99,
    get priceId() {
      return process.env.STRIPE_MONTHLY_PRICE_ID!;
    },
  },
  annual: {
    name: "Annual",
    price: 59.99,
    get priceId() {
      return process.env.STRIPE_ANNUAL_PRICE_ID!;
    },
  },
} as const;
