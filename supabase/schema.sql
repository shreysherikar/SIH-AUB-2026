-- ============================================================================
-- SIH Internal Hackathon Portal — Database Schema + Security Policies
-- Run this once in Supabase: Dashboard -> SQL Editor -> New query -> Run
-- ============================================================================

-- ---------- ANNOUNCEMENTS -----------------------------------------------
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  pinned boolean default false,
  created_at timestamptz default now()
);

alter table announcements enable row level security;

-- Anyone (even logged-out visitors) can read announcements
create policy "announcements_public_read"
  on announcements for select
  using (true);

-- Only logged-in organizers can create/edit/delete
create policy "announcements_organizer_write"
  on announcements for insert
  to authenticated
  with check (true);

create policy "announcements_organizer_update"
  on announcements for update
  to authenticated
  using (true);

create policy "announcements_organizer_delete"
  on announcements for delete
  to authenticated
  using (true);


-- ---------- QUERIES (public Q&A, replaces the WhatsApp DMs) -------------
create table if not exists queries (
  id uuid primary key default gen_random_uuid(),
  display_name text not null default 'Anonymous',
  question text not null,
  answer text,
  answered_at timestamptz,
  created_at timestamptz default now()
);

alter table queries enable row level security;

-- Anyone can read the Q&A board (that's the whole point of building this)
create policy "queries_public_read"
  on queries for select
  using (true);

-- Question posting happens via pages/api/query.js using the service role
-- key, which bypasses RLS -- so there is deliberately NO public insert
-- policy here either, for the same reason as the teams table above.
create policy "queries_organizer_answer"
  on queries for update
  to authenticated
  using (true);

create policy "queries_organizer_delete"
  on queries for delete
  to authenticated
  using (true);


-- ---------- TEAM REGISTRATIONS (the sensitive one) -----------------------
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  team_name text not null unique,
  track text,
  problem_statement text,
  leader_name text not null,
  leader_email text not null,
  leader_phone text,
  member_2 text,
  member_3 text,
  member_4 text,
  member_5 text,
  member_6 text,
  notes text,
  created_at timestamptz default now()
);

alter table teams enable row level security;

-- IMPORTANT: there is deliberately NO public "select" policy on this table.
-- With RLS enabled and no matching policy, a request is denied by default.
-- That means students can submit a registration but CANNOT read the list
-- back -- not their own row, not anyone else's -- via the public API.

-- Registration happens via pages/api/register.js using the service role
-- key, which bypasses RLS -- so there is deliberately NO public insert
-- policy here. This is what forces every submission through the server
-- route, where rate limiting + captcha verification actually happen.
-- (See supabase/migration_2_rate_limiting.sql for the reasoning if you're
-- reading this after that migration already ran.)
create policy "teams_organizer_read"
  on teams for select
  to authenticated
  using (true);

create policy "teams_organizer_update"
  on teams for update
  to authenticated
  using (true);

create policy "teams_organizer_delete"
  on teams for delete
  to authenticated
  using (true);


-- ---------- EVENT SETTINGS (single row, controls the site) --------------
create table if not exists settings (
  id int primary key default 1,
  registrations_open boolean default true,
  constraint singleton check (id = 1)
);

insert into settings (id, registrations_open)
values (1, true)
on conflict (id) do nothing;

alter table settings enable row level security;

create policy "settings_public_read"
  on settings for select
  using (true);

create policy "settings_organizer_update"
  on settings for update
  to authenticated
  using (true);


-- ---------- RATE LIMIT LOG ------------------------------------------------
-- Backs the sliding-window rate limiter in lib/rateLimit.js. Only the
-- server (using the service role key) ever touches this table -- no
-- policies are added on purpose, so it's default-deny for anon/authenticated.
create table if not exists rate_limit_hits (
  id uuid primary key default gen_random_uuid(),
  scope text not null,
  identifier text not null,
  created_at timestamptz default now()
);

create index if not exists rate_limit_hits_lookup
  on rate_limit_hits (scope, identifier, created_at);

alter table rate_limit_hits enable row level security;

-- ============================================================================
-- NEXT STEPS (do these in the Supabase dashboard, not in SQL):
-- 1. Authentication -> Providers -> keep only Email enabled.
-- 2. Authentication -> Settings -> turn OFF "Allow new users to sign up".
--    This is what stops random people from creating their own admin login.
-- 3. Authentication -> Users -> Add user -> create one account per organizer
--    (yourself + your team), with a strong password. Share it privately.
-- 4. Done. Your organizers log in at /admin/login with those accounts.
-- ============================================================================
