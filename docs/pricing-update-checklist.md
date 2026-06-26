# Subscription Price Update Checklist

The app code (`mobile/src/lib/subscription-store.ts`, `mobile/src/app/(app)/paywall.tsx`)
only holds **display fallbacks**. The prices users actually see and are charged come from
**App Store Connect**, surfaced through **RevenueCat** (`pkg.product.priceString`). To change
the real price you MUST update App Store Connect — code changes alone do nothing.

## Current target pricing (updated 2026-06-25)

The **mobile app is priced higher than the web** on purpose — Apple takes 15–30% per
sale vs ~3% for Stripe on web, so the App Store prices offset Apple's cut.

| Plan | App (Apple / RevenueCat) | Web (Stripe) |
|---|---|---|
| Monthly | **$9.99** (`premium_monthly` → `$rc_monthly`) | $6.99 |
| Yearly | **$59.99** (`premium_yearly_v2` → `$rc_annual`) | $49.99 |
| Lifetime | removed | removed |

App yearly $59.99 = "Save 50%" vs $9.99/mo ($119.88/yr). 7-day free trial on the yearly plan.

Note: App Store product IDs are `premium_monthly` / `premium_yearly_v2`; the `$rc_*`
names are RevenueCat package identifiers that map to them.

## App Store Connect (source of truth for price)
- [ ] App Store Connect → app → **Monetization → Subscriptions**
- [ ] **Premium Monthly** (`premium_monthly`) → price = **$9.99** tier (was set to $9.99 — already correct as of 2026-06-25)
- [ ] **Premium Yearly** (`premium_yearly_v2`) → set price to **$59.99** tier (current yearly price not yet verified — check, then set to $59.99)
- [ ] **Premium Yearly** → confirm a **7-day free trial** introductory offer is attached (paywall copy promises it)
- [ ] No subscribers yet (products still "Missing Metadata"), so price changes are consequence-free — no Apple consent flow needed
- [ ] Both products "Missing Metadata" clears when attached to the next app version and submitted together (Apple requires the first subscription to ship with a build)

## RevenueCat
- [ ] **Offerings** → confirm the Monthly package maps to `premium_monthly` and the Annual package maps to **`premium_yearly_v2`** (note the `_v2`; an old `premium_yearly` would show nothing/old price)
- [ ] **Entitlements** → confirm a `premium` entitlement exists and BOTH products attach to it (app gates on the literal string `premium`)
- [ ] No lifetime product exists — nothing to remove

## Verify
- [ ] On the new TestFlight build, open the paywall and confirm it shows **$9.99 / $59.99**, "Save 50%", 7-day trial, no lifetime card
- [ ] Note: App Store Connect price changes can take time to propagate to the StoreKit sandbox

## Notes
- $9.99 and $59.99 are standard Apple price tiers — no custom-tier issues.
- App is intentionally pricier than web (Apple's cut). Web stays $6.99 / $49.99 via Stripe.
- Code values are display fallbacks only; ASC always wins at runtime.
