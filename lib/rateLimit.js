import { supabaseAdmin } from "./supabaseAdmin";

// Vercel/most hosts put the real client IP first in x-forwarded-for.
export function getClientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) {
    return fwd.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

// Sliding-window rate limit stored in Postgres. Not as fast as Redis, but
// needs no extra paid service to run -- plenty for hackathon-registration
// traffic. Each allowed call logs a "hit"; blocked calls don't log one.
export async function checkRateLimit({ scope, identifier, limit, windowMinutes }) {
  const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

  const { count, error: countError } = await supabaseAdmin
    .from("rate_limit_hits")
    .select("id", { count: "exact", head: true })
    .eq("scope", scope)
    .eq("identifier", identifier)
    .gte("created_at", since);

  if (countError) {
    // Fail OPEN rather than blocking legitimate users if the rate-limit
    // table itself has a problem -- but log it loudly so it's noticed.
    console.error("Rate limit check failed, allowing request:", countError.message);
    return { allowed: true };
  }

  if ((count ?? 0) >= limit) {
    return { allowed: false };
  }

  await supabaseAdmin.from("rate_limit_hits").insert({ scope, identifier });
  return { allowed: true };
}
