# MyLunarPhase Security Checklist (OWASP Top 10)

## A01: Broken Access Control
- [x] NextAuth.js session validation on all protected API routes via `requireAuth()`
- [x] JWT session strategy with user ID embedded in token
- [x] Server-side auth checks in middleware.ts (redirect unauthenticated users)
- [x] API routes return 401 for unauthenticated requests
- [x] Partner data access verified via partnership relationship
- [x] Account deletion cascades all related data

## A02: Cryptographic Failures
- [x] Passwords hashed with bcrypt (10 salt rounds)
- [x] HTTPS enforced via HSTS header (max-age=31536000)
- [x] JWT tokens signed with NEXTAUTH_SECRET
- [x] Stripe webhook signature verification
- [x] No sensitive data in URL parameters
- [x] Database credentials in environment variables (never in code)

## A03: Injection
- [x] Prisma ORM with parameterized queries (prevents SQL injection)
- [x] Zod validation on ALL API inputs (mood, community, partner, AI chat)
- [x] React auto-escapes rendered content (prevents XSS)
- [x] Content-Type headers enforced on API responses
- [x] No raw SQL queries anywhere in codebase

## A04: Insecure Design
- [x] Rate limiting on auth endpoints (5/min), AI endpoints (20/min), general (100/min)
- [x] Partner invite codes expire after 48 hours
- [x] Email verification required before credentials login
- [x] Stripe idempotent webhook processing
- [x] Community content anonymized (no user IDs linked to stories)

## A05: Security Misconfiguration
- [x] Security headers configured in next.config.ts:
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: strict-origin-when-cross-origin
  - X-XSS-Protection: 1; mode=block
  - Strict-Transport-Security: max-age=31536000; includeSubDomains
- [x] CORS restricted to known origins (Vibecode, localhost)
- [x] Environment variables validated with Zod at startup
- [x] No debug info exposed in production error responses
- [x] .env excluded from version control

## A06: Vulnerable and Outdated Components
- [x] Dependencies managed with npm (lock file)
- [ ] Set up Dependabot or npm audit in CI
- [ ] Regular dependency updates schedule

## A07: Identification and Authentication Failures
- [x] NextAuth.js v5 with Prisma adapter
- [x] Google + Apple OAuth (delegated auth)
- [x] Password hashing with bcrypt
- [x] Email verification flow
- [x] Rate limiting on login attempts (5/min per IP)
- [x] Secure cookie settings (httpOnly, sameSite, secure in production)
- [ ] Optional TOTP 2FA (infrastructure ready, UI pending)

## A08: Software and Data Integrity Failures
- [x] Stripe webhook signature verification (prevents tampered events)
- [x] Zod schema validation on all incoming data
- [x] Prisma type safety prevents data corruption
- [x] npm lockfile for reproducible builds

## A09: Security Logging and Monitoring Failures
- [x] API errors logged to console (Vercel captures these)
- [ ] Set up structured logging (e.g., Axiom, Datadog)
- [ ] Set up alerting for auth failures
- [ ] Set up uptime monitoring

## A10: Server-Side Request Forgery (SSRF)
- [x] Only outbound API calls to known services (Grok API at api.x.ai, Stripe, Resend)
- [x] No user-supplied URLs used in server-side requests
- [x] Grok API key stored server-side, never exposed to client
