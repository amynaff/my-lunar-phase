# MyLunarPhase Deployment Guide

## Prerequisites

- Vercel account
- Supabase project
- Stripe account
- Resend account
- Google Cloud Console project (for OAuth)
- Apple Developer account (for Apple Sign-In)
- Upstash Redis instance (for rate limiting)

## 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings > Database** and copy:
   - **Connection string (Transaction/Session mode)** → `DATABASE_URL`
   - **Connection string (Direct)** → `DIRECT_URL`
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```
4. Seed the database:
   ```bash
   npx prisma db seed
   ```

## 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Set authorized redirect URI to the Google callback shown in Supabase Auth provider settings
4. Copy the Client ID and Client Secret into Supabase Auth > Providers > Google

## 3. Apple Sign-In Setup

Apple Sign In **requires HTTPS** — it will not work on `localhost`.

1. Go to [Apple Developer Portal](https://developer.apple.com) → Certificates, Identifiers & Profiles
2. Under **Identifiers**, create a **Services ID** (not an App ID):
   - Description: `My Lunar Phase Sign In`
   - Identifier: `com.mylunarphase.siwa` (or your chosen reverse-domain)
   - Enable **Sign in with Apple** → Configure
   - Primary App ID: select `com.mylunarphase.app`
   - Domains: `mylunarphase.com`
   - Return URLs: the Apple callback shown in Supabase Auth provider settings
3. Note your **Team ID** (10 chars, top-right of Apple Developer portal)
4. The private key file is at `~/Documents/AuthKey_53THZT6U4L,mlp_appledev.p8` (Key ID: `53THZT6U4L`)
5. Generate the client secret JWT:
   ```bash
   node scripts/generate-apple-secret.mjs \
     --key-file ~/Documents/AuthKey_53THZT6U4L,mlp_appledev.p8 \
     --team-id  <YOUR_TEAM_ID> \
     --key-id   53THZT6U4L \
     --client-id com.mylunarphase.siwa
   ```
6. Copy the output JWT into Supabase Auth > Providers > Apple
7. Set the Apple Services ID in Supabase Auth to `com.mylunarphase.siwa`
8. Re-run this script every ~5 months (JWT expires after 6 months max)

## 4. Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create two products with recurring prices:
   - Monthly: $6.99/month → copy Price ID to `STRIPE_MONTHLY_PRICE_ID`
   - Annual: $59.99/year → copy Price ID to `STRIPE_ANNUAL_PRICE_ID`
3. Copy Secret Key → `STRIPE_SECRET_KEY`
4. Copy Publishable Key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
5. Set up webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
6. Copy Webhook Signing Secret → `STRIPE_WEBHOOK_SECRET`

## 5. Resend Setup

1. Go to [resend.com](https://resend.com)
2. Add and verify your domain
3. Create an API key → `RESEND_API_KEY`
4. Set `EMAIL_FROM` to your verified sender address

## 6. Upstash Redis Setup

1. Go to [upstash.com](https://upstash.com)
2. Create a Redis database
3. Copy REST URL → `UPSTASH_REDIS_REST_URL`
4. Copy REST Token → `UPSTASH_REDIS_REST_TOKEN`

## 7. Vercel Deployment

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Set the **Root Directory** to `web`
4. Configure **Build Command**: `npx prisma generate && npm run build`
5. Add ALL environment variables from `.env.example`
6. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your Supabase project API settings
7. Set `NEXT_PUBLIC_APP_URL` to your production domain
8. Deploy

## 8. Post-Deployment Checklist

- [ ] Verify auth flows (Google, Apple, email/password)
- [ ] Test email delivery (welcome, verification, reset)
- [ ] Test Stripe checkout (use test mode first)
- [ ] Verify Stripe webhook receives events
- [ ] Test mobile app against new API URL
- [ ] Check security headers (use securityheaders.com)
- [ ] Verify rate limiting works
- [ ] Run Lighthouse audit
- [ ] Set up monitoring/alerting

## 9. Mobile App Configuration

Update the mobile app to point at the web API and Supabase project:

```
EXPO_PUBLIC_BACKEND_URL=https://yourdomain.com
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

## Custom Domain

1. In Vercel, go to Settings > Domains
2. Add your domain (e.g., `mylunarphase.com`)
3. Configure DNS records as shown by Vercel
4. SSL is automatic
