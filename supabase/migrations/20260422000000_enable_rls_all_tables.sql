-- Migration: Enable RLS on all public tables
-- Date: 2026-04-22
--
-- Comprehensive RLS policies for all tables in the schema.
-- The existing health integration migration may have already applied RLS
-- to HealthIntegration and HealthMeasurement — these statements use
-- IF NOT EXISTS to avoid conflicts.

-- ============================================================
-- HELPER: Check if policies exist before creating
-- (Postgres doesn't have CREATE POLICY IF NOT EXISTS,
--  so we drop-and-recreate for the two tables that may
--  already have policies from the prior migration.)
-- ============================================================

-- ==================== User ====================
-- Contains passwordHash, twoFactorSecret — extremely sensitive

alter table public."User" enable row level security;

create policy "user_select_own" on public."User"
  for select to authenticated
  using (id = auth.uid()::text);


create policy "user_update_own" on public."User"
  for update to authenticated
  using (id = auth.uid()::text)
  with check (id = auth.uid()::text);

-- Users should not delete their own row directly (use app logic)
-- Users should not insert directly (handled by auth flow)

revoke all on table public."User" from anon;

-- ==================== Account ====================
-- OAuth tokens (access_token, refresh_token)

alter table public."Account" enable row level security;

create policy "account_select_own" on public."Account"
  for select to authenticated
  using ("userId" = auth.uid()::text);

create policy "account_insert_own" on public."Account"
  for insert to authenticated
  with check ("userId" = auth.uid()::text);

create policy "account_update_own" on public."Account"
  for update to authenticated
  using ("userId" = auth.uid()::text)
  with check ("userId" = auth.uid()::text);

create policy "account_delete_own" on public."Account"
  for delete to authenticated
  using ("userId" = auth.uid()::text);

revoke all on table public."Account" from anon;

-- ==================== Session ====================
-- Session tokens

alter table public."Session" enable row level security;

create policy "session_select_own" on public."Session"
  for select to authenticated
  using ("userId" = auth.uid()::text);

create policy "session_insert_own" on public."Session"
  for insert to authenticated
  with check ("userId" = auth.uid()::text);

create policy "session_update_own" on public."Session"
  for update to authenticated
  using ("userId" = auth.uid()::text)
  with check ("userId" = auth.uid()::text);

create policy "session_delete_own" on public."Session"
  for delete to authenticated
  using ("userId" = auth.uid()::text);

revoke all on table public."Session" from anon;

-- ==================== VerificationToken ====================
-- Auth verification — no userId column, lock down entirely

alter table public."VerificationToken" enable row level security;

-- No select/insert/update/delete policies for regular users.
-- Only the service_role (backend) should access this table.
revoke all on table public."VerificationToken" from anon;
revoke all on table public."VerificationToken" from authenticated;

-- ==================== Subscription ====================
-- Stripe payment data

alter table public."Subscription" enable row level security;

create policy "subscription_select_own" on public."Subscription"
  for select to authenticated
  using ("userId" = auth.uid()::text);

revoke all on table public."Subscription" from anon;

-- ==================== MobileSubscription ====================

alter table public."MobileSubscription" enable row level security;

create policy "mobile_subscription_select_own" on public."MobileSubscription"
  for select to authenticated
  using ("userId" = auth.uid()::text);

revoke all on table public."MobileSubscription" from anon;

-- ==================== AIConversation ====================
-- Private AI chat history

alter table public."AIConversation" enable row level security;

create policy "ai_conversation_select_own" on public."AIConversation"
  for select to authenticated
  using ("userId" = auth.uid()::text);

create policy "ai_conversation_insert_own" on public."AIConversation"
  for insert to authenticated
  with check ("userId" = auth.uid()::text);

create policy "ai_conversation_update_own" on public."AIConversation"
  for update to authenticated
  using ("userId" = auth.uid()::text)
  with check ("userId" = auth.uid()::text);

create policy "ai_conversation_delete_own" on public."AIConversation"
  for delete to authenticated
  using ("userId" = auth.uid()::text);

revoke all on table public."AIConversation" from anon;

-- ==================== AIMessage ====================
-- Private AI messages — scoped via conversation ownership

alter table public."AIMessage" enable row level security;

create policy "ai_message_select_own" on public."AIMessage"
  for select to authenticated
  using (
    "conversationId" in (
      select id from public."AIConversation" where "userId" = auth.uid()::text
    )
  );

create policy "ai_message_insert_own" on public."AIMessage"
  for insert to authenticated
  with check (
    "conversationId" in (
      select id from public."AIConversation" where "userId" = auth.uid()::text
    )
  );

create policy "ai_message_delete_own" on public."AIMessage"
  for delete to authenticated
  using (
    "conversationId" in (
      select id from public."AIConversation" where "userId" = auth.uid()::text
    )
  );

revoke all on table public."AIMessage" from anon;

-- ==================== MoodEntry ====================
-- Personal health/wellness data

alter table public."MoodEntry" enable row level security;

create policy "mood_entry_select_own" on public."MoodEntry"
  for select to authenticated
  using ("userId" = auth.uid()::text);

create policy "mood_entry_insert_own" on public."MoodEntry"
  for insert to authenticated
  with check ("userId" = auth.uid()::text);

create policy "mood_entry_update_own" on public."MoodEntry"
  for update to authenticated
  using ("userId" = auth.uid()::text)
  with check ("userId" = auth.uid()::text);

create policy "mood_entry_delete_own" on public."MoodEntry"
  for delete to authenticated
  using ("userId" = auth.uid()::text);

revoke all on table public."MoodEntry" from anon;

-- ==================== CycleData ====================
-- Encrypted cycle/period data

alter table public."CycleData" enable row level security;

create policy "cycle_data_select_own" on public."CycleData"
  for select to authenticated
  using ("userId" = auth.uid()::text);

create policy "cycle_data_insert_own" on public."CycleData"
  for insert to authenticated
  with check ("userId" = auth.uid()::text);

create policy "cycle_data_update_own" on public."CycleData"
  for update to authenticated
  using ("userId" = auth.uid()::text)
  with check ("userId" = auth.uid()::text);

create policy "cycle_data_delete_own" on public."CycleData"
  for delete to authenticated
  using ("userId" = auth.uid()::text);

revoke all on table public."CycleData" from anon;

-- ==================== PartnerInvite ====================

alter table public."PartnerInvite" enable row level security;

create policy "partner_invite_select_own" on public."PartnerInvite"
  for select to authenticated
  using ("creatorId" = auth.uid()::text);

create policy "partner_invite_insert_own" on public."PartnerInvite"
  for insert to authenticated
  with check ("creatorId" = auth.uid()::text);

create policy "partner_invite_delete_own" on public."PartnerInvite"
  for delete to authenticated
  using ("creatorId" = auth.uid()::text);

revoke all on table public."PartnerInvite" from anon;

-- ==================== Partnership ====================

alter table public."Partnership" enable row level security;

create policy "partnership_select_own" on public."Partnership"
  for select to authenticated
  using ("userId" = auth.uid()::text or "partnerId" = auth.uid()::text);

create policy "partnership_delete_own" on public."Partnership"
  for delete to authenticated
  using ("userId" = auth.uid()::text or "partnerId" = auth.uid()::text);

revoke all on table public."Partnership" from anon;

-- ==================== SharedCycleData ====================

alter table public."SharedCycleData" enable row level security;

create policy "shared_cycle_data_select_own" on public."SharedCycleData"
  for select to authenticated
  using ("userId" = auth.uid()::text);

create policy "shared_cycle_data_insert_own" on public."SharedCycleData"
  for insert to authenticated
  with check ("userId" = auth.uid()::text);

create policy "shared_cycle_data_update_own" on public."SharedCycleData"
  for update to authenticated
  using ("userId" = auth.uid()::text)
  with check ("userId" = auth.uid()::text);

create policy "shared_cycle_data_delete_own" on public."SharedCycleData"
  for delete to authenticated
  using ("userId" = auth.uid()::text);

revoke all on table public."SharedCycleData" from anon;

-- ==================== PushSubscription ====================

alter table public."PushSubscription" enable row level security;

create policy "push_subscription_select_own" on public."PushSubscription"
  for select to authenticated
  using ("userId" = auth.uid()::text);

create policy "push_subscription_insert_own" on public."PushSubscription"
  for insert to authenticated
  with check ("userId" = auth.uid()::text);

create policy "push_subscription_delete_own" on public."PushSubscription"
  for delete to authenticated
  using ("userId" = auth.uid()::text);

revoke all on table public."PushSubscription" from anon;

-- ==================== HealthIntegration ====================
-- (may already exist from prior migration — drop first to avoid error)

alter table public."HealthIntegration" enable row level security;

drop policy if exists "health_integration_select_own" on public."HealthIntegration";
drop policy if exists "health_integration_insert_own" on public."HealthIntegration";
drop policy if exists "health_integration_update_own" on public."HealthIntegration";
drop policy if exists "health_integration_delete_own" on public."HealthIntegration";

create policy "health_integration_select_own" on public."HealthIntegration"
  for select to authenticated
  using ("userId" = auth.uid()::text);

create policy "health_integration_insert_own" on public."HealthIntegration"
  for insert to authenticated
  with check ("userId" = auth.uid()::text);

create policy "health_integration_update_own" on public."HealthIntegration"
  for update to authenticated
  using ("userId" = auth.uid()::text)
  with check ("userId" = auth.uid()::text);

create policy "health_integration_delete_own" on public."HealthIntegration"
  for delete to authenticated
  using ("userId" = auth.uid()::text);

revoke all on table public."HealthIntegration" from anon;

-- ==================== HealthMeasurement ====================

alter table public."HealthMeasurement" enable row level security;

drop policy if exists "health_measurement_select_own" on public."HealthMeasurement";
drop policy if exists "health_measurement_insert_own" on public."HealthMeasurement";
drop policy if exists "health_measurement_update_own" on public."HealthMeasurement";
drop policy if exists "health_measurement_delete_own" on public."HealthMeasurement";

create policy "health_measurement_select_own" on public."HealthMeasurement"
  for select to authenticated
  using ("userId" = auth.uid()::text);

create policy "health_measurement_insert_own" on public."HealthMeasurement"
  for insert to authenticated
  with check ("userId" = auth.uid()::text);

create policy "health_measurement_update_own" on public."HealthMeasurement"
  for update to authenticated
  using ("userId" = auth.uid()::text)
  with check ("userId" = auth.uid()::text);

create policy "health_measurement_delete_own" on public."HealthMeasurement"
  for delete to authenticated
  using ("userId" = auth.uid()::text);

revoke all on table public."HealthMeasurement" from anon;

-- ==================== Community tables ====================
-- These are intentionally public/anonymous content, but we still
-- enable RLS and add permissive policies to be explicit about it.

-- CommunityStory: anyone can read, only authenticated can write
alter table public."CommunityStory" enable row level security;

create policy "community_story_select_all" on public."CommunityStory"
  for select to authenticated, anon
  using (true);

create policy "community_story_insert_auth" on public."CommunityStory"
  for insert to authenticated
  with check (true);

-- StoryComment: anyone can read, only authenticated can write
alter table public."StoryComment" enable row level security;

create policy "story_comment_select_all" on public."StoryComment"
  for select to authenticated, anon
  using (true);

create policy "story_comment_insert_auth" on public."StoryComment"
  for insert to authenticated
  with check (true);

-- ChatChannel: anyone can read channels
alter table public."ChatChannel" enable row level security;

create policy "chat_channel_select_all" on public."ChatChannel"
  for select to authenticated, anon
  using (true);

-- ChatMessage: anyone can read, only authenticated can write
alter table public."ChatMessage" enable row level security;

create policy "chat_message_select_all" on public."ChatMessage"
  for select to authenticated, anon
  using (true);

create policy "chat_message_insert_auth" on public."ChatMessage"
  for insert to authenticated
  with check (true);

-- Suggestion: anyone can read and submit
alter table public."Suggestion" enable row level security;

create policy "suggestion_select_all" on public."Suggestion"
  for select to authenticated, anon
  using (true);

create policy "suggestion_insert_all" on public."Suggestion"
  for insert to authenticated, anon
  with check (true);
