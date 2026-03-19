"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, ExternalLink, Loader2 } from "lucide-react";
import { PricingCards } from "@/components/subscription/pricing-cards";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { Button } from "@/components/ui/button";

export default function BillingPage() {
  const { plan, isPremium } = useSubscriptionStore();
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  async function handleManageSubscription() {
    setIsLoadingPortal(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Handle error silently
    } finally {
      setIsLoadingPortal(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent-purple/15">
            <CreditCard className="h-5 w-5 text-accent-purple" />
          </div>
          <div>
            <h1 className="font-cormorant text-3xl font-semibold text-text-primary">
              Billing
            </h1>
            <p className="text-sm text-text-secondary font-quicksand">
              Manage your subscription and billing
            </p>
          </div>
        </div>
      </motion.div>

      {/* Current Plan */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-[20px] border border-border-light bg-bg-card p-6 mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-text-accent font-quicksand font-semibold">
              Current Plan
            </p>
            <p className="font-cormorant text-2xl font-semibold text-text-primary mt-1 capitalize">
              {plan}
            </p>
            <p className="text-sm text-text-secondary font-quicksand mt-1">
              {isPremium()
                ? "You have full access to all features."
                : "Upgrade to unlock Luna AI, detailed insights, and more."}
            </p>
          </div>
          {isPremium() && (
            <Button
              variant="outline"
              onClick={handleManageSubscription}
              disabled={isLoadingPortal}
            >
              {isLoadingPortal ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ExternalLink className="h-4 w-4" />
                  Manage Subscription
                </>
              )}
            </Button>
          )}
        </div>
      </motion.div>

      {/* Pricing Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <PricingCards currentPlan={plan} />
      </motion.div>
    </div>
  );
}
