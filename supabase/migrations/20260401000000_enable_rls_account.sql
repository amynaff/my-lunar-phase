-- Enable Row Level Security on public."Account"
--
-- This table is managed exclusively by NextAuth.js via Prisma using the
-- Supabase service-role connection string.  The service role is exempt from
-- RLS by default, so enabling RLS here does NOT break any application
-- behaviour – it only closes the PostgREST exposure for the `anon` and
-- `authenticated` roles.
--
-- We intentionally add no policies for those roles: the Account table stores
-- OAuth provider tokens and must never be directly readable or writable
-- through PostgREST by end-users.

ALTER TABLE public."Account" ENABLE ROW LEVEL SECURITY;

-- Explicitly deny all PostgREST access for completeness (belt-and-suspenders).
-- Because no permissive policies exist, all rows are already denied to
-- anon/authenticated.  The explicit RESTRICTIVE policy below makes the intent
-- clear and survives accidental future policy additions.
CREATE POLICY "account_deny_all_postgrest"
  ON public."Account"
  AS RESTRICTIVE
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
