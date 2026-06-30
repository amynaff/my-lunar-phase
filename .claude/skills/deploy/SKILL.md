---
name: deploy
description: Step-by-step deployment guide for my-lunar-phase. Use when the user wants to deploy the backend, web, or mobile app, check deployment readiness, or troubleshoot deployment issues.
---

# Deployment Guide — my-lunar-phase

## Project Overview
- **Backend**: Bun + Hono + Prisma, hosted on **Railway** (Postgres)
- **Web**: Next.js + Prisma + Tailwind, hosted on **Netlify**
- **Mobile**: Expo SDK 53 React Native app, built locally via **Xcode** and distributed via **TestFlight / App Store** (Expo/EAS builds are exhausted)
- **Auth**: better-auth (email + Apple Sign In)
- **Database**: Railway Postgres (single backend; NOT Supabase, NOT SQLite in prod)

---

## Before Deploying — Checklist

### Backend
```bash
cd backend
bun run typecheck        # catch TypeScript errors before deploy
```

Required production environment variables (set in Railway's Variables tab — see `backend/src/env.ts` for the validated schema; the app exits at startup if any are missing):
- `DATABASE_URL` — Railway Postgres connection string (reference the Postgres service var)
- `BETTER_AUTH_SECRET` — auth signing secret
- `ANTHROPIC_API_KEY` — required for Luna AI chat, quick advice, symptom checker, journal insights
- `BACKEND_URL` — public backend URL (Railway sets the host at run-time)
- `PORT` / `NODE_ENV` — usually provided by Railway

Never commit real secrets — use Railway's Variables tab or GitHub Secrets.

### Web
- Hosted on Netlify; builds are skipped when `web/` is unchanged.
- Ensure the web app's env points at the deployed Railway backend.

### Mobile
- `EXPO_PUBLIC_BACKEND_URL` must point at the deployed Railway backend.
- iOS build number lives as a **literal** `CFBundleVersion` in `mobile/ios/MyLunarPhase/Info.plist` (it is NOT driven by `app.json` `buildNumber` or the pbxproj `CURRENT_PROJECT_VERSION`). Bump it for every TestFlight build or App Store Connect rejects the duplicate.

---

## Backend Deployment (Railway)

Railway auto-deploys on push to `main`.

**To deploy**: merge/push to `main` → Railway builds with Bun and restarts the service.

**Important**: the backend uses **Bun** (`bun.lock` is the source of truth). After adding a package, commit both:
```bash
cd backend
bun add some-package
git add package.json bun.lock
git commit -m "chore: add some-package"
```
Do not introduce an npm `package-lock.json` in `backend/` — two lockfiles cause confusion and drift.

---

## Web Deployment (Netlify)

Push to `main` → Netlify builds the Next.js app. Builds are skipped automatically when nothing under `web/` changed.

---

## Mobile Deployment (Xcode → TestFlight)

EAS/Expo cloud builds are exhausted, so builds are produced locally in Xcode.

1. Bump `CFBundleVersion` in `mobile/ios/MyLunarPhase/Info.plist`.
2. Archive (CLI or Xcode):
   ```bash
   cd mobile/ios
   xcodebuild -workspace MyLunarPhase.xcworkspace -scheme MyLunarPhase \
     -configuration Release -archivePath build/MyLunarPhase.xcarchive \
     -allowProvisioningUpdates archive
   ```
3. **Distribute via Xcode Organizer** (NOT `xcodebuild -exportArchive`): copy the `.xcarchive` into `~/Library/Developer/Xcode/Archives/<date>/`, open Xcode → Window → Organizer → select it → Distribute App → App Store Connect → Upload → Automatically manage signing.
   - CLI export fails with "No signing certificate iOS Distribution found / Cloud signing permission error" because there's no local distribution cert and the ASC API keys lack Admin cloud-signing rights. The Organizer uses the Account Holder login to create the cert.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Cannot find package` on backend restart | Package not committed — `git add package.json bun.lock && git commit` |
| Prisma errors on deploy | Schema mismatch — check `prisma/schema.prisma`, run `bunx prisma migrate deploy` / `db push` against the Railway DB |
| Backend exits at startup with env errors | A required var in `backend/src/env.ts` is missing — set it in Railway Variables |
| Mobile can't reach backend | Check `EXPO_PUBLIC_BACKEND_URL` points at the Railway backend |
| Auth not working | Verify `BETTER_AUTH_SECRET` and Apple Sign In config |
| iOS upload rejected: duplicate build | Bump `CFBundleVersion` in `mobile/ios/MyLunarPhase/Info.plist` |
| iOS CLI export "no distribution certificate" | Distribute via Xcode Organizer instead (creates the cert via Account Holder login) |

---

## Quick Deploy Summary

```bash
# 1. Typecheck
cd backend && bun run typecheck

# 2. Commit everything (including any new packages)
git add -p
git commit -m "feat: your changes"

# 3. Push to main → Railway (backend) + Netlify (web) auto-deploy
git push origin main

# 4. Mobile → bump Info.plist CFBundleVersion, archive in Xcode, upload via Organizer
```
