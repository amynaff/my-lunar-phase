# My Lunar Phase

Menstrual cycle + lunar phase tracking app. Monorepo with three packages.

## Security

**CRITICAL — follow these rules in every conversation:**

- NEVER read, display, print, or echo `.env` files, `.env.*` files, or any file containing secrets/credentials
- NEVER output API keys, database URLs, passwords, tokens, or secrets — even partially
- NEVER run shell commands that would print environment variables (e.g., `echo $DATABASE_URL`, `env`, `printenv`, `set`)
- NEVER hardcode secrets in source code, config files, or settings files
- If you encounter secrets in tool output, do NOT repeat them — tell the user to rotate them immediately
- Reference environment variables by name only (e.g., "set `DATABASE_URL` in your .env")

## Project Structure

```
my-lunar-phase/
├── backend/     — Hono API server (Bun + TypeScript), hosted on Railway
├── mobile/      — Expo/React Native app (Bun, not npm)
├── web/         — Next.js web app
└── AGENTS.md    — This file (root)
```

Each package has its own `AGENTS.md` with specific conventions — read them before working in that package.

## Stack

- **Backend:** Bun, Hono, Prisma, Zod, hosted on Railway
- **Mobile:** Expo SDK 53, React Native, NativeWind, React Query, Zustand
- **Web:** Next.js, Prisma, Tailwind
- **Database:** Supabase (PostgreSQL)
- **Auth:** better-auth

## General Rules

- Use `bun` for all package management (never `npm` or `yarn`)
- All backend API routes must be prefixed with `/api/`
- After `bun add`, immediately commit `package.json` and `bun.lock`
- Don't add unnecessary dependencies — check if something is already installed first
- Keep changes focused and minimal — don't refactor code that wasn't asked about

## Git

- Write clear, conventional commit messages (`feat:`, `fix:`, `chore:`, etc.)
- Don't force-push or rewrite history without asking
- Check `git status` before committing to avoid including unintended changes
