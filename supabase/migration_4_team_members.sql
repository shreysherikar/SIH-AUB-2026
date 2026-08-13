-- ============================================================================
-- Migration 4: Per-member registration details (SEN, year, program, school,
-- gender) + team-level mentor field
-- Run this in Supabase -> SQL Editor -> New query -> Run
-- ============================================================================

-- ---------- RESHAPE THE TEAMS TABLE --------------------------------------
-- The old flat member_2..member_6 columns are replaced by the team_members
-- table below. leader_name/leader_email/leader_phone become a generic
-- "contact" for the team, since a confirmation email still needs somewhere
-- to go, even though individual members no longer have an email field.

alter table teams drop column if exists member_2;
alter table teams drop column if exists member_3;
alter table teams drop column if exists member_4;
alter table teams drop column if exists member_5;
alter table teams drop column if exists member_6;

alter table teams rename column leader_name to contact_name;
alter table teams rename column leader_email to contact_email;
alter table teams rename column leader_phone to contact_phone;

alter table teams add column if not exists mentor_name text;


-- ---------- TEAM MEMBERS ---------------------------------------------------
create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  member_order smallint not null,
  name text not null,
  sen text not null,
  year text not null,
  program text not null,
  school text not null,
  gender text not null check (gender in ('Female', 'Male', 'Other')),
  created_at timestamptz default now(),
  unique (team_id, member_order)
);

alter table team_members enable row level security;

-- Same pattern as teams/queries: no public insert policy. All writes go
-- through pages/api/register.js using the service role key, which is what
-- lets the "at least one female member" rule actually be enforced
-- server-side instead of just in the browser.
create policy "team_members_organizer_read"
  on team_members for select
  to authenticated
  using (true);

create policy "team_members_organizer_update"
  on team_members for update
  to authenticated
  using (true);

create policy "team_members_organizer_delete"
  on team_members for delete
  to authenticated
  using (true);

-- ============================================================================
-- After running this, redeploy the updated register.js / api/register.js /
-- admin dashboard files before anyone registers again -- the old code
-- references columns that no longer exist.
-- ============================================================================
