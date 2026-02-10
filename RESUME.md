# Workspace snapshot and resume instructions

This file captures how to resume work on this project and how to start the mobile and backend services.

Files changed in this snapshot:
- `.github/workflows/ci.yml` — CI example reading `GROK_API_KEY` from GitHub Secrets
- `/backend/.env.example` — example env file (do NOT commit real secrets)
- `/.gitignore` — ignores local envs, node_modules, build outputs

Quick resume steps (local development):

1. Backend (requires Bun):
```bash
cd backend
# copy example and add your key (do NOT commit this file)
cp .env.example .env
# edit backend/.env and set GROK_API_KEY
# then install and run
bun install
export GROK_API_KEY="xai-your-real-key-here"
bun run --hot src/index.ts
```

2. Mobile (Expo web):
```bash
cd mobile
npm install --legacy-peer-deps
npm run web
# or for device tunnel
npx expo start --tunnel
```

3. If running mobile on a different host or exposing backend, set the frontend env:
```bash
export EXPO_PUBLIC_VIBECODE_BACKEND_URL="https://your-backend.example.com"
```

Notes:
- Keep `backend/.env` out of git. Use GitHub Secrets (`GROK_API_KEY`) for CI and production.
- If you committed any real secrets earlier, revoke them immediately and rotate keys.

To save the workspace state, run `git status` and commit any other local changes as needed.
