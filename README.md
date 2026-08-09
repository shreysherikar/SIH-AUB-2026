# SIH Internal Hackathon Portal

A website for your college's internal Smart India Hackathon round:
announcements, a public queries board (so answers don't get lost in
WhatsApp DMs), and team registration — with an admin dashboard only
organizers can reach.

**Stack:** Next.js (free hosting on Vercel) + Supabase (free Postgres +
Auth). No server to babysit, no cost at college-hackathon scale.

---

## 1. How the security model works (read this first)

- **Announcements & Q&A** are public to read — that's the point.
- **Only logged-in organizers** can post announcements or answer questions.
  Login only works for accounts *you* create — there is no public sign-up
  page, so nobody can register themselves as an admin.
- **Team registrations** can be *submitted* by anyone, but the list can
  only be *read* by logged-in organizers. This is enforced by the
  database itself (Postgres Row Level Security), not just hidden in the
  UI — so it holds even if someone pokes at the API directly.
- Passwords are hashed and managed by Supabase Auth. This app never
  touches or stores raw passwords.

This gets you real, basic-but-genuine security without running your own
backend server. It is **not** enterprise-grade (no 2FA, no audit log) —
for an internal college round, that's the right amount of security for
the effort involved. If your college's data policy needs more than this,
loop in your IT/faculty advisor before collecting real student data.

---

## 2. Set up Supabase (~10 minutes)

1. Go to [supabase.com](https://supabase.com) → New project (free tier).
2. Once it's created, go to **SQL Editor** → New query → paste the
   entire contents of `supabase/schema.sql` from this project → **Run**.
   This creates all four tables and every security policy.
3. Go to **Authentication → Sign In / Providers** → make sure only
   **Email** is enabled.
4. Go to **Authentication → Settings** → turn **off** "Allow new users to
   sign up". (This is the setting that keeps random students from
   creating their own admin account.)
5. Go to **Authentication → Users → Add user** → create one login per
   organizer (your team). Use real college emails and strong passwords.
   Share passwords with your team privately (not over this repo).
6. Go to **Project Settings → API** → copy the **Project URL** and the
   **anon public key**. You'll need these next.

---

## 3. Run it locally

```bash
npm install
cp .env.example .env.local
# paste your Supabase URL + anon key into .env.local
npm run dev
```

Open http://localhost:3000. Try `/admin/login` with the organizer
account you created in step 5 above.

---

## 4. Deploy it for real (Vercel, free)

1. Push this folder to a GitHub repo (can be private).
2. Go to [vercel.com](https://vercel.com) → New Project → import that repo.
3. In the project's **Environment Variables** settings, add the same
   values from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_EVENT_NAME` (optional)
   - `NEXT_PUBLIC_EVENT_DATE` (optional, ISO format e.g. `2026-09-15T09:00:00+05:30`)
4. Deploy. Vercel gives you a free `.vercel.app` URL immediately; you can
   attach a college subdomain later if you want.

Every time you `git push`, Vercel redeploys automatically.

---

## 5. Day-to-day use for organizers

- Post dates/venue/problem-statement drops on `/admin` → Announcements tab.
- Answer student doubts on `/admin` → Queries tab — answers show up
  publicly on `/queries` immediately.
- Watch registrations roll in on `/admin` → Teams tab, export to CSV
  any time for offline records or attendance sheets.
- Toggle registration open/closed on `/admin` → Settings tab once your
  team count is full.

---

## 6. Registration confirmation emails (Resend)

Registrations now go through a server-side API route (`pages/api/register.js`)
instead of the browser talking to Supabase directly. This lets the server
also send a confirmation email with the team's submitted details.

1. Go to [resend.com](https://resend.com) → sign up (free tier is plenty
   for a college event) → **API Keys** → create one.
2. While testing, you can send from their sandbox address
   `onboarding@resend.dev` without any setup — emails will land, but only
   to your own verified Resend account email. To send to real student
   inboxes, go to **Domains** in Resend and verify your college domain (or
   any domain you control), then use an address on that domain as
   `RESEND_FROM_EMAIL`.
3. In Supabase: **Project Settings → API**, copy the **service_role** key
   (different from the anon key — keep this one secret).
4. Add to `.env.local` (and to Vercel's Environment Variables):
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
5. Redeploy. If email sending fails for any reason, the registration is
   still saved — the form just tells the student the confirmation email
   didn't go out, instead of losing their submission.

## 7. Organizing team gallery

Edit the `TEAM` array at the top of `pages/gallery.js` with your real
names, roles, and emails. Drop photos into `/public/team/` (square,
300x300px or larger works best) and reference them like `/team/priya.jpg`.
Leave `photo: ""` for anyone whose photo you don't have yet — they'll get
a placeholder initials avatar instead of a broken image.

## 8. Editing the design

- Colors/fonts: `tailwind.config.js`
- Event name/date shown on the homepage: environment variables (no code
  change needed) — see `.env.example`
- Everything else is plain React in `pages/` and `components/`.

## 9. Honest limitations

- No rate-limiting beyond a simple math CAPTCHA on public forms — fine
  for an internal audience, not bot-proof against a determined attacker.
- No email notifications built in (e.g. confirming a registration) —
  can be added later via a Supabase Edge Function + email provider if
  you want it.
- This is v1 of a real product, not a hardened enterprise system. Good
  enough for a college internal round; say so plainly if anyone asks.
