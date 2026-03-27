# MyLunarPhase Web App

A comprehensive women's hormone wellness platform built with Next.js 15, TypeScript, Prisma, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL) via Prisma ORM
- **Auth**: NextAuth.js v5 (Google, Apple OAuth + email/password)
- **Payments**: Stripe (subscriptions with monthly/annual billing)
- **Email**: Resend + React Email templates
- **AI**: Grok API (X.ai) for Luna AI wellness companion
- **State**: Zustand (client) + TanStack Query (server)
- **Styling**: Tailwind CSS 4 + custom design system
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Rate Limiting**: Upstash Redis

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A Supabase project (PostgreSQL database)
- Stripe account (test mode for development)
- Google Cloud OAuth credentials
- Apple Developer credentials (for Apple Sign-In)
- Grok API key (X.ai)
- Resend account
- Upstash Redis (for rate limiting)

### Setup

1. **Clone and install**:
   ```bash
   cd web
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env.local
   ```
   Fill in all values in `.env.local` (see Environment Variables below).

3. **Setup database**:
   ```bash
   npx prisma generate
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase pooling connection string |
| `DIRECT_URL` | Supabase direct connection string |
| `NEXTAUTH_URL` | App URL (http://localhost:3000 for dev) |
| `NEXTAUTH_SECRET` | Random 32+ char secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `APPLE_CLIENT_ID` | Apple Sign-In service ID |
| `APPLE_CLIENT_SECRET` | Apple Sign-In secret key |
| `GROK_API_KEY` | X.ai Grok API key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_MONTHLY_PRICE_ID` | Stripe price ID for monthly plan |
| `STRIPE_ANNUAL_PRICE_ID` | Stripe price ID for annual plan |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | Sender email address |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token |
| `NEXT_PUBLIC_APP_URL` | Public app URL |

## Project Structure

```
web/
├── prisma/
│   ├── schema.prisma     # Database schema (17 models)
│   └── seed.ts           # Seed chat channels
├── src/
│   ├── app/
│   │   ├── (auth)/       # Auth pages (sign-in, sign-up, etc.)
│   │   ├── (app)/        # Protected app pages
│   │   ├── api/          # API routes (backward compatible with mobile)
│   │   ├── page.tsx      # Landing page
│   │   └── layout.tsx    # Root layout
│   ├── components/
│   │   ├── ui/           # Primitive components (button, card, etc.)
│   │   ├── layout/       # Sidebar, header, mobile nav
│   │   ├── cycle/        # Cycle wheel, moon phase, phase info
│   │   ├── mood/         # Mood form, heatmap calendar
│   │   ├── ai/           # Chat interface, message bubble
│   │   ├── community/    # Story cards, channel list
│   │   ├── partner/      # Invite code
│   │   ├── subscription/ # Pricing cards
│   │   ├── onboarding/   # Life stage picker, cycle config
│   │   └── shared/       # Gradient background, theme toggle
│   ├── lib/
│   │   ├── ai/           # Grok client, prompts, context manager
│   │   ├── cycle/        # Phase calculator, moon phase, data
│   │   ├── email/        # Sending, React Email templates
│   │   ├── validations/  # Zod schemas for all endpoints
│   │   ├── auth.ts       # NextAuth configuration
│   │   ├── prisma.ts     # Prisma client
│   │   ├── stripe.ts     # Stripe SDK
│   │   └── rate-limit.ts # Rate limiting
│   ├── stores/           # Zustand (cycle, mood, theme, subscription)
│   ├── hooks/            # Custom hooks
│   └── types/            # TypeScript types
├── middleware.ts          # Auth, CORS, rate limiting
└── .env.example
```

## API Endpoints

All endpoints are backward-compatible with the existing mobile app.

### Auth
- `GET/POST /api/auth/*` — NextAuth handlers
- `GET /api/me` — Current user

### Mood
- `GET /api/mood/entries` — List entries (startDate, endDate query)
- `POST /api/mood/entry` — Create/update entry
- `GET /api/mood/entry/:date` — Get by date
- `DELETE /api/mood/entry/:date` — Delete
- `GET /api/mood/stats` — Statistics

### Community
- `GET/POST /api/community/stories` — List/create
- `POST /api/community/stories/:id/heart` — Heart story
- `GET/POST /api/community/stories/:id/comments` — Comments
- `GET /api/community/channels` — List channels
- `GET/POST /api/community/channels/:id/messages` — Messages

### Partner
- `POST /api/partner/invite` — Generate 6-char invite code
- `POST /api/partner/accept` — Accept invite
- `POST /api/partner/sync` — Sync cycle data
- `GET /api/partner/partner-data` — Partner's shared data
- `GET /api/partner/status` — Partnership status
- `DELETE /api/partner/disconnect` — Disconnect

### AI Chat
- `POST /api/ai-chat` — Main Luna AI chat
- `POST /api/ai-chat/quick-advice` — Quick tips
- `POST /api/ai-chat/symptom-check` — Symptom analysis

### Payments
- `POST /api/stripe/checkout` — Create checkout session
- `POST /api/stripe/webhook` — Stripe webhook (idempotent)
- `POST /api/stripe/portal` — Customer portal session

## Testing

```bash
npx vitest          # Run all tests
npx vitest --watch  # Watch mode
```

## Deployment (Vercel)

See [DEPLOY.md](./DEPLOY.md) for full deployment instructions.

Quick steps:
1. Push to GitHub
2. Connect repo in Vercel
3. Set all environment variables
4. Build command: `prisma generate && next build`
5. Configure Stripe webhook for production domain

## Features

- Cycle tracking (menstrual, follicular, ovulatory, luteal)
- Moon phase wisdom (8 lunar phases)
- Life stage support (regular, perimenopause, menopause, postmenopause)
- Luna AI wellness companion (Grok-powered)
- Phase-specific nutrition + grocery lists
- Phase-appropriate movement recommendations
- Self-care: affirmations, journal prompts, rituals
- Anonymous community: stories, comments, chat channels
- Partner data sharing via invite codes
- Labs guide for hormone testing
- Premium subscriptions: Free / $6.99 monthly / $59.99 annual
- Dark mode with system preference detection
- Mobile-responsive design
- CORS support for mobile app compatibility
