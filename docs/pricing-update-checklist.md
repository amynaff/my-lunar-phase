# Subscription Price Update Checklist

The app code (`mobile/src/lib/subscription-store.ts`, `mobile/src/app/(app)/paywall.tsx`)
only holds **display fallbacks**. The prices users actually see and are charged come from
**App Store Connect**, surfaced through **RevenueCat** (`pkg.product.priceString`). To change
the real price you MUST update App Store Connect — code changes alone do nothing.

Target pricing (set in code on 2026-06-23, PR #47):

| Plan | Old | New | Product ID |
|---|---|---|---|
| Monthly | $2.99 | **$6.99** | `$rc_monthly` |
| Yearly | $19.99 | **$49.99** | `$rc_annual` |
| Lifetime | $39.99 | **removed from UI** | `$rc_lifetime` |

## App Store Connect (source of truth for price)
- [ ] App Store Connect → app → **Monetization → Subscriptions**
- [ ] **Monthly** (`$rc_monthly`) → set price to **$6.99** tier
- [ ] **Yearly** (`$rc_annual`) → set price to **$49.99** tier; confirm the **7-day free trial** intro offer is still attached (paywall copy promises it)
- [ ] **Lifetime** (`$rc_lifetime`):
  - [ ] If no existing buyers → mark non-available / remove from offering
  - [ ] If anyone purchased → leave the product active (don't delete; preserves their access), just keep it out of the offering
- [ ] On the price-change prompt, choose **new subscribers only** for the raise (existing subs keep their price unless you run Apple's consent flow) to avoid churn

## RevenueCat
- [ ] **Offerings** → confirm `$rc_monthly` / `$rc_annual` packages map to the updated App Store products (RevenueCat reads price from Apple automatically — no separate price entry)
- [ ] Remove the lifetime package from the current Offering if dropping it

## Verify
- [ ] On the new TestFlight build, open the paywall and confirm it shows **$6.99 / $49.99**, no lifetime card
- [ ] Note: App Store Connect price changes can take time to propagate to the StoreKit sandbox

## Notes
- $6.99 and $49.99 are standard Apple price tiers — no custom-tier issues.
- These display fallbacks should match ASC, but ASC always wins at runtime.
