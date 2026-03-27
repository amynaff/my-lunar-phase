"use client";

import { Check, Crown } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "Basic cycle tracking",
      "60-day history",
      "3 symptoms per day",
      "Community access",
      "Moon phase wisdom",
    ],
    cta: "Current Plan",
    highlighted: false,
    priceId: null,
  },
  {
    name: "Monthly",
    price: "$6.99",
    period: "/month",
    features: [
      "Everything in Free",
      "Unlimited history",
      "Unlimited symptom tracking",
      "Luna AI chat",
      "Personalized insights",
      "Data export",
      "Priority support",
    ],
    cta: "Start Monthly",
    highlighted: true,
    priceId: "monthly",
  },
  {
    name: "Annual",
    price: "$59.99",
    period: "/year",
    badge: "Save 29%",
    features: [
      "Everything in Monthly",
      "$5/month equivalent",
      "Save vs monthly",
      "Early feature access",
    ],
    cta: "Start Annual",
    highlighted: false,
    priceId: "annual",
  },
];

export function PricingCards({ currentPlan }: { currentPlan?: string }) {
  async function handleSubscribe(priceId: string) {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan, index) => (
        <motion.div
          key={plan.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`relative rounded-[20px] border p-6 ${
            plan.highlighted
              ? "border-accent-purple bg-gradient-to-b from-accent-purple/5 to-accent-rose/5 shadow-lg"
              : "border-border-light bg-bg-card"
          }`}
        >
          {plan.badge && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-accent-rose to-accent-purple text-white text-xs font-quicksand font-semibold">
              {plan.badge}
            </div>
          )}

          {plan.highlighted && (
            <Crown className="absolute top-4 right-4 h-5 w-5 text-accent-purple" />
          )}

          <h3 className="font-cormorant text-2xl font-semibold text-text-primary">
            {plan.name}
          </h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-quicksand font-semibold text-text-primary">
              {plan.price}
            </span>
            <span className="text-sm text-text-muted font-quicksand">
              {plan.period}
            </span>
          </div>

          <ul className="mt-6 space-y-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-accent-purple mt-0.5 flex-shrink-0" />
                <span className="text-sm text-text-secondary font-quicksand">
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => plan.priceId && handleSubscribe(plan.priceId)}
            disabled={!plan.priceId || currentPlan === plan.priceId}
            className={`w-full mt-6 py-3 rounded-2xl font-quicksand font-semibold text-sm transition-opacity ${
              plan.highlighted
                ? "bg-gradient-to-r from-accent-rose to-accent-purple text-white hover:opacity-90"
                : "border border-border-light text-text-secondary hover:bg-bg-secondary"
            } disabled:opacity-50`}
          >
            {currentPlan === plan.priceId ? "Current Plan" : plan.cta}
          </button>
        </motion.div>
      ))}
    </div>
  );
}
