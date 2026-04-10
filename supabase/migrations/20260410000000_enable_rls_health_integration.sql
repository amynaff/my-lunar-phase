-- Migration: Enable RLS on public.HealthIntegration
-- Issue: LUN-63 / Parent: LUN-62
-- Date: 2026-04-10
--
-- The HealthIntegration table stores OAuth tokens linking users to third-party
-- health providers (Withings, Oura, Fitbit, Garmin, WHOOP, Google Fit).
-- Row Level Security ensures users can only access their own integration rows.
--
-- Note: Prisma maps the "userId" field to a quoted "userId" column (case-sensitive).

-- Step 1: Enable RLS
alter table public."HealthIntegration" enable row level security;

-- Step 2: Users can only SELECT their own integrations
create policy "health_integration_select_own"
  on public."HealthIntegration"
  for select
  to authenticated
  using ("userId" = auth.uid());

-- Step 3: Users can only INSERT rows for themselves
create policy "health_integration_insert_own"
  on public."HealthIntegration"
  for insert
  to authenticated
  with check ("userId" = auth.uid());

-- Step 4: Users can only UPDATE their own integrations
create policy "health_integration_update_own"
  on public."HealthIntegration"
  for update
  to authenticated
  using ("userId" = auth.uid())
  with check ("userId" = auth.uid());

-- Step 5: Users can only DELETE their own integrations
create policy "health_integration_delete_own"
  on public."HealthIntegration"
  for delete
  to authenticated
  using ("userId" = auth.uid());

-- Step 6: Revoke anon access as defense-in-depth
-- (Health integration tokens should never be accessible anonymously)
revoke all on table public."HealthIntegration" from anon;

-- Also enable RLS on the related HealthMeasurement table (same concern)
alter table public."HealthMeasurement" enable row level security;

create policy "health_measurement_select_own"
  on public."HealthMeasurement"
  for select
  to authenticated
  using ("userId" = auth.uid());

create policy "health_measurement_insert_own"
  on public."HealthMeasurement"
  for insert
  to authenticated
  with check ("userId" = auth.uid());

create policy "health_measurement_update_own"
  on public."HealthMeasurement"
  for update
  to authenticated
  using ("userId" = auth.uid())
  with check ("userId" = auth.uid());

create policy "health_measurement_delete_own"
  on public."HealthMeasurement"
  for delete
  to authenticated
  using ("userId" = auth.uid());

revoke all on table public."HealthMeasurement" from anon;
