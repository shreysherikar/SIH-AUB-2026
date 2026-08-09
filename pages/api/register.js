import { supabaseAdmin, isAdminConfigured } from "@/lib/supabaseAdmin";

const EVENT_NAME = process.env.NEXT_PUBLIC_EVENT_NAME || "Internal Smart India Hackathon";

// Fields we accept from the form. Keeping an explicit allow-list here means
// the API can never be used to write arbitrary columns, even if someone
// crafts their own request instead of using the form.
const ALLOWED_FIELDS = [
  "team_name",
  "track",
  "problem_statement",
  "leader_name",
  "leader_email",
  "leader_phone",
  "member_2",
  "member_3",
  "member_4",
  "member_5",
  "member_6",
  "notes",
];

function pick(body) {
  const out = {};
  for (const key of ALLOWED_FIELDS) {
    if (typeof body[key] === "string") out[key] = body[key].trim();
  }
  return out;
}

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildEmailHtml(team) {
  const members = [team.member_2, team.member_3, team.member_4, team.member_5, team.member_6].filter(Boolean);

  const rows = [
    ["Team name", team.team_name],
    ["Track", team.track || "—"],
    ["Problem statement", team.problem_statement || "—"],
    ["Team leader", team.leader_name],
    ["Leader email", team.leader_email],
    ["Leader phone", team.leader_phone || "—"],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:8px 12px;color:#5B6478;font-size:13px;border-bottom:1px solid #E4D9BB;">${escapeHtml(label)}</td>
        <td style="padding:8px 12px;color:#152238;font-size:13px;border-bottom:1px solid #E4D9BB;">${escapeHtml(value)}</td>
      </tr>`
    )
    .join("");

  const membersHtml = members.length
    ? `<ul style="margin:8px 0 0;padding-left:18px;color:#152238;font-size:13px;">${members
        .map((m) => `<li>${escapeHtml(m)}</li>`)
        .join("")}</ul>`
    : `<p style="margin:8px 0 0;color:#5B6478;font-size:13px;">No additional members listed.</p>`;

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#FAF7F0;padding:32px;">
    <div style="max-width:520px;margin:0 auto;background:#FFFFFF;border:1px solid #E4D9BB;border-radius:8px;overflow:hidden;">
      <div style="background:#0B1F3D;padding:20px 24px;">
        <div style="color:#C9971C;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Amity University Bengaluru</div>
        <div style="color:#ffffff;font-size:18px;font-weight:600;margin-top:4px;">${escapeHtml(EVENT_NAME)}</div>
      </div>
      <div style="padding:24px;">
        <p style="color:#152238;font-size:14px;margin-top:0;">
          Hi ${escapeHtml(team.leader_name)}, your team's registration has been received. Here's what we have on file:
        </p>
        <table style="width:100%;border-collapse:collapse;margin-top:12px;">
          ${rowsHtml}
        </table>
        <div style="margin-top:16px;">
          <div style="color:#5B6478;font-size:13px;">Other members</div>
          ${membersHtml}
        </div>
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

  const team = pick(req.body || {});

  if (!team.team_name || !team.leader_name || !team.leader_email) {
    return res.status(400).json({ error: "Team name, leader name, and leader email are required." });
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

  const { error: insertError } = await supabaseAdmin.from("teams").insert(team);

  if (insertError) {
    const message = insertError.message.includes("duplicate")
      ? "A team with that name already exists — pick a different team name."
      : insertError.message;
    return res.status(400).json({ error: message });
  }

  // Email is best-effort: if it fails, the registration is still saved.
  // We tell the caller either way so the UI can be honest about it.
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
          to: team.leader_email,
          subject: `Registration received — ${team.team_name}`,
          html: buildEmailHtml(team),
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


