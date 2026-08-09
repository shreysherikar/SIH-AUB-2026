import { supabaseAdmin, isAdminConfigured } from "@/lib/supabaseAdmin";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { verifyTurnstile } from "@/lib/turnstile";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isAdminConfigured) {
    return res.status(500).json({ error: "Server is not configured (missing Supabase service role key)." });
  }

  const displayName =
    typeof req.body?.display_name === "string" ? req.body.display_name.trim().slice(0, 80) : "";
  const question = typeof req.body?.question === "string" ? req.body.question.trim().slice(0, 600) : "";

  if (!question) {
    return res.status(400).json({ error: "Question can't be empty." });
  }

  const ip = getClientIp(req);

  const { allowed } = await checkRateLimit({
    scope: "query",
    identifier: ip,
    limit: 5,
    windowMinutes: 60,
  });
  if (!allowed) {
    return res.status(429).json({
      error: "Too many questions posted from this connection recently. Please wait a while and try again.",
    });
  }

  const turnstileResult = await verifyTurnstile(req.body?.turnstileToken, ip);
  if (turnstileResult.configured && !turnstileResult.success) {
    return res.status(400).json({ error: "Captcha check failed — please retry the challenge and submit again." });
  }

  const { error } = await supabaseAdmin.from("queries").insert({
    display_name: displayName || "Anonymous",
    question,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ ok: true });
}
