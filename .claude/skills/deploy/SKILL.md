---
name: deploy
description: Step-by-step deployment guide for my-lunar-phase. Use when the user wants to deploy the backend or mobile app, check deployment readiness, or troubleshoot deployment issues.
---

# Deployment Guide — my-lunar-phase

## Project Overview
- **Backend**: Bun + Hono + Prisma, hosted on Vibecode cloud
- **Mobile**: Expo SDK 53 React Native app, distributed via Vibecode / App Store / Google Play

---

## Before Deploying — Checklist

Run these checks first:

### Backend
```bash
cd backend
bun run typecheck        # catch TypeScript errors before deploy
```

Make sure these environment variables are set in production:
- `GROK_API_KEY` — required for AI features
- `DATABASE_URL` — auto-set by Vibecode in production (`file:/data/production.db`)
- `VIBECODE_PROJECT_ID` — auto-set by Vibecode (enables DB viewer)
- Any auth secrets used by `better-auth`

Check `backend/.env.example` for the full list. Never commit real secrets — use Vibecode's ENV tab or GitHub Secrets.

### Mobile
- Make sure `EXPO_PUBLIC_VIBECODE_BACKEND_URL` points to the deployed backend URL
- Confirm all API keys in the ENV tab of the Vibecode App are set

---

## Backend Deployment

Vibecode handles the backend automatically using `backend/scripts/start`.

What `scripts/start` does in production:
1. Sets `NODE_ENV=production`, `DATABASE_FILE=/data/production.db`
2. Backs up the SQLite database (`VACUUM INTO backup`)
3. Runs `bun install`
4. Generates Prisma client (`bunx prisma generate`)
5. Pushes schema changes (`bunx prisma db push --accept-data-loss`)
6. Enables the Vibecode DB viewer
7. Starts the server (`bun src/index.ts`)

**To trigger a redeploy**: commit and push your changes to `main`. Vibecode auto-deploys on push.

**Important**: After adding any new backend package with `bun add`, you MUST commit `package.json` and `bun.lock` before deploying:
```bash
bun add some-package
git add backend/package.json backend/bun.lock
git commit -m "chore: add some-package"
```

---

## Mobile Deployment

### Development / Testing
```bash
cd mobile
npm install --legacy-peer-deps
npm run web           # Expo web preview
# or
npx expo start --tunnel   # tunnel for device testing
```

### App Store / Google Play Submission
Use Vibecode's built-in submission flow:
1. Open the **Vibecode App**
2. Tap **Share** (top right)
3. Select **Submit to App Store** or **Submit to Google Play**

Claude Code cannot assist with `app.json`, `eas.json`, or EAS CLI commands directly.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Cannot find package` on backend restart | Package not committed — run `git add package.json bun.lock && git commit` |
| Prisma errors on deploy | Schema mismatch — check `prisma/schema.prisma` and run `bunx prisma db push` locally first |
| Mobile can't reach backend | Check `EXPO_PUBLIC_VIBECODE_BACKEND_URL` is set correctly in ENV tab |
| Auth not working | Verify `better-auth` secrets are set as env vars in Vibecode |
| DB data lost after deploy | Backup is auto-created before each production deploy as `production.db-{timestamp}` |

---

## Quick Deploy Summary

```bash
# 1. Typecheck
cd backend && bun run typecheck

# 2. Commit everything (including any new packages)
git add -p
git commit -m "feat: your changes"

# 3. Push to main → Vibecode auto-deploys backend
git push origin main

# 4. For mobile app release → use Vibecode App > Share > Submit
```
