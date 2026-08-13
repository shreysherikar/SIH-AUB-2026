import { supabaseAdmin, isAdminConfigured } from "@/lib/supabaseAdmin";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { verifyTurnstile } from "@/lib/turnstile";

const EVENT_NAME = process.env.NEXT_PUBLIC_EVENT_NAME || "Internal Smart India Hackathon";
const VALID_GENDERS = ["Female", "Male", "Other"];
const MEMBER_FIELDS = ["name", "sen", "year", "program", "school", "gender"];

// Team-level fields we accept from the form. Explicit allow-list so the API
// can never be used to write arbitrary columns.
const TEAM_FIELDS = [
  "team_name",
  "track",
  "problem_statement",
  "mentor_name",
  "contact_name",
  "contact_email",
  "contact_phone",
  "notes",
];

function pickTeam(body) {
  const out = {};
  for (const key of TEAM_FIELDS) {
    if (typeof body[key] === "string") out[key] = body[key].trim();
  }
  return out;
}

// Takes the raw members array from the request and returns only the rows
// that actually have something filled in, trimmed and field-limited.
// A "blank" member (all fields empty) is silently dropped rather than
// rejected -- that's just an unused slot in the form.
function pickMembers(rawMembers) {
  if (!Array.isArray(rawMembers)) return [];

  return rawMembers
    .map((m) => {
      const out = {};
      for (const key of MEMBER_FIELDS) {
        out[key] = typeof m?.[key] === "string" ? m[key].trim() : "";
      }
      return out;
    })
    .filter((m) => Object.values(m).some((v) => v.length > 0))
    .slice(0, 6);
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildEmailHtml(team, members) {
  const teamRows = [
    ["Team name", team.team_name],
    ["Track", team.track || "—"],
    ["Problem statement", team.problem_statement || "—"],
    ["Mentor", team.mentor_name || "—"],
    ["Point of contact", team.contact_name],
    ["Contact email", team.contact_email],
    ["Contact phone", team.contact_phone || "—"],
  ];

  const teamRowsHtml = teamRows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:8px 12px;color:#5B6478;font-size:13px;border-bottom:1px solid #E4D9BB;">${escapeHtml(label)}</td>
        <td style="padding:8px 12px;color:#152238;font-size:13px;border-bottom:1px solid #E4D9BB;">${escapeHtml(value)}</td>
      </tr>`
    )
    .join("");

  const memberRowsHtml = members
    .map(
      (m, i) => `
      <tr>
        <td style="padding:6px 10px;color:#152238;font-size:12px;border-bottom:1px solid #E4D9BB;">${i + 1}</td>
        <td style="padding:6px 10px;color:#152238;font-size:12px;border-bottom:1px solid #E4D9BB;">${escapeHtml(m.name)}</td>
        <td style="padding:6px 10px;color:#152238;font-size:12px;border-bottom:1px solid #E4D9BB;">${escapeHtml(m.sen)}</td>
        <td style="padding:6px 10px;color:#152238;font-size:12px;border-bottom:1px solid #E4D9BB;">${escapeHtml(m.year)}</td>
        <td style="padding:6px 10px;color:#152238;font-size:12px;border-bottom:1px solid #E4D9BB;">${escapeHtml(m.program)}</td>
        <td style="padding:6px 10px;color:#152238;font-size:12px;border-bottom:1px solid #E4D9BB;">${escapeHtml(m.school)}</td>
        <td style="padding:6px 10px;color:#152238;font-size:12px;border-bottom:1px solid #E4D9BB;">${escapeHtml(m.gender)}</td>
      </tr>`
    )
    .join("");

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#FAF7F0;padding:32px;">
    <div style="max-width:600px;margin:0 auto;background:#FFFFFF;border:1px solid #E4D9BB;border-radius:8px;overflow:hidden;">
      <div style="background:#0B1F3D;padding:20px 24px;">
        <div style="color:#C9971C;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Amity University Bengaluru</div>
        <div style="color:#ffffff;font-size:18px;font-weight:600;margin-top:4px;">${escapeHtml(EVENT_NAME)}</div>
      </div>
      <div style="padding:24px;">
        <p style="color:#152238;font-size:14px;margin-top:0;">
          Hi ${escapeHtml(team.contact_name)}, your team's registration has been received. Here's what we have on file:
        </p>
        <table style="width:100%;border-collapse:collapse;margin-top:12px;">
          ${teamRowsHtml}
        </table>
        <div style="margin-top:20px;color:#5B6478;font-size:13px;">Members</div>
        <table style="width:100%;border-collapse:collapse;margin-top:8px;">
          <tr>
            <th style="text-align:left;padding:6px 10px;color:#5B6478;font-size:11px;text-transform:uppercase;">#</th>
            <th style="text-align:left;padding:6px 10px;color:#5B6478;font-size:11px;text-transform:uppercase;">Name</th>
            <th style="text-align:left;padding:6px 10px;color:#5B6478;font-size:11px;text-transform:uppercase;">SEN</th>
            <th style="text-align:left;padding:6px 10px;color:#5B6478;font-size:11px;text-transform:uppercase;">Year</th>
            <th style="text-align:left;padding:6px 10px;color:#5B6478;font-size:11px;text-transform:uppercase;">Program</th>
            <th style="text-align:left;padding:6px 10px;color:#5B6478;font-size:11px;text-transform:uppercase;">School</th>
            <th style="text-align:left;padding:6px 10px;color:#5B6478;font-size:11px;text-transform:uppercase;">Gender</th>
          </tr>
          ${memberRowsHtml}
        </table>
        <p style="color:#5B6478;font-size:12px;margin-top:24px;">
          If any of this looks wrong, reply to this email or post it on the
          Queries page and an organizer will help. Watch the Announcements
          page for what happens next.
        </p>
      </div>
    </div>
  </div>`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isAdminConfigured) {
    return res.status(500).json({ error: "Server is not configured (missing Supabase service role key)." });
  }

  const ip = getClientIp(req);

  const { allowed } = await checkRateLimit({
    scope: "register",
    identifier: ip,
    limit: 5,
    windowMinutes: 60,
  });
  if (!allowed) {
    return res.status(429).json({
      error: "Too many registration attempts from this connection. Please wait a while and try again, or contact an organizer.",
    });
  }

  const turnstileResult = await verifyTurnstile(req.body?.turnstileToken, ip);
  if (turnstileResult.configured && !turnstileResult.success) {
    return res.status(400).json({ error: "Captcha check failed — please retry the challenge and submit again." });
  }

  const team = pickTeam(req.body || {});
  const members = pickMembers(req.body?.members);

  if (!team.team_name || !team.contact_name || !team.contact_email) {
    return res.status(400).json({ error: "Team name, point of contact name, and contact email are required." });
  }

  if (members.length === 0) {
    return res.status(400).json({ error: "Add at least one team member." });
  }

  for (const [i, m] of members.entries()) {
    const missing = MEMBER_FIELDS.filter((f) => !m[f]);
    if (missing.length > 0) {
      return res.status(400).json({
        error: `Member ${i + 1} is missing: ${missing.join(", ")}. Fill every field for any member row you use, or leave the whole row blank.`,
      });
    }
    if (!VALID_GENDERS.includes(m.gender)) {
      return res.status(400).json({ error: `Member ${i + 1} has an invalid gender value.` });
    }
  }

  if (!members.some((m) => m.gender === "Female")) {
    return res.status(400).json({ error: "At least one team member must be female." });
  }

  // Check registrations are open before writing anything.
  const { data: settings } = await supabaseAdmin
    .from("settings")
    .select("registrations_open")
    .eq("id", 1)
    .single();

  if (settings && settings.registrations_open === false) {
    return res.status(403).json({ error: "Registrations are currently closed." });
  }

  const { data: insertedTeam, error: teamError } = await supabaseAdmin
    .from("teams")
    .insert(team)
    .select("id")
    .single();

  if (teamError) {
    const message = teamError.message.includes("duplicate")
      ? "A team with that name already exists — pick a different team name."
      : teamError.message;
    return res.status(400).json({ error: message });
  }

  const memberRows = members.map((m, i) => ({ team_id: insertedTeam.id, member_order: i + 1, ...m }));
  const { error: membersError } = await supabaseAdmin.from("team_members").insert(memberRows);

  if (membersError) {
    // Roll back the team row so we don't leave an orphaned team with no
    // members behind -- better to fail the whole registration cleanly than
    // to save half of it.
    await supabaseAdmin.from("teams").delete().eq("id", insertedTeam.id);
    return res.status(400).json({ error: `Could not save team members: ${membersError.message}` });
  }

  // Email is best-effort: if it fails, the registration is still saved.
  let emailSent = false;
  const resendKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM_EMAIL;

  if (resendKey && fromAddress) {
    try {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress,
          to: team.contact_email,
          subject: `Registration received — ${team.team_name}`,
          html: buildEmailHtml(team, members),
        }),
      });
      emailSent = emailRes.ok;
      if (!emailRes.ok) {
        console.error("Resend error:", await emailRes.text());
      }
    } catch (err) {
      console.error("Failed to send confirmation email:", err);
    }
  }

  return res.status(200).json({ ok: true, emailSent });
}
