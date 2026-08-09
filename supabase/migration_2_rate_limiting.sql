-- ============================================================================
-- Migration 2: Real rate limiting + closing an RLS bypass
-- Run this in Supabase -> SQL Editor -> New query -> Run
-- (Safe to run once; run only once.)
-- ============================================================================

-- ---------- RATE LIMIT LOG ------------------------------------------------
-- Backs the sliding-window rate limiter in lib/rateLimit.js. Only the
-- server (using the service role key) ever touches this table -- there is
-- deliberately no policy granting anon/authenticated access, so with RLS
-- enabled it's fully locked to everyone except the service role.
create table if not exists rate_limit_hits (
  id uuid primary key default gen_random_uuid(),
  scope text not null,
  identifier text not null,
  created_at timestamptz default now()
);

create index if not exists rate_limit_hits_lookup
  on rate_limit_hits (scope, identifier, created_at);

alter table rate_limit_hits enable row level security;
-- No policies added on purpose: default-deny for anon and authenticated.


-- ---------- CLOSE THE BYPASS ----------------------------------------------
-- Registration and question-posting now go through server routes
-- (pages/api/register.js, pages/api/query.js) which use the service role
-- key and therefore bypass RLS anyway. The old "public can insert" policies
-- below are no longer needed for the app to work, and leaving them in place
-- would let anyone skip the server-side rate limit + captcha entirely by
-- calling Supabase directly with the public anon key. Drop them:

drop policy if exists "teams_public_register" on teams;
drop policy if exists "queries_public_ask" on queries;

-- Public read access to queries, and organizer-only write access to both
-- tables, are unaffected -- those policies still exist from schema.sql.

-- ============================================================================
-- After running this, registrations and questions can ONLY be created
-- through /api/register and /api/query. If either endpoint is somehow
-- unreachable, submissions will fail closed (safe) rather than silently
-- bypassing the checks.
-- ============================================================================

-- ---------- SERVER ROLE GRANTS --------------------------------------------

grant select, insert, update, delete
on all tables in schema public
to service_role;

grant usage, select
on all sequences in schema public
to service_role;

alter default privileges in schema public
grant select, insert, update, delete
on tables to service_role;

alter default privileges in schema public
grant usage, select
on sequences to service_role;