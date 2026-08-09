// Verifies a Cloudflare Turnstile token server-side. Never trust the
// client-reported "I passed the captcha" -- always re-check with Cloudflare.
export async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    // Not configured yet (e.g. still in local dev). Callers decide what to
    // do with `configured: false` -- kept distinct from a real pass/fail so
    // it's never confused with an actual successful verification.
    return { configured: false, success: false };
  }
  if (!token) {
    return { configured: true, success: false };
  }

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: ip || "" }),
    });
    const data = await res.json();
    return { configured: true, success: Boolean(data.success) };
  } catch (err) {
    console.error("Turnstile verification error:", err);
    return { configured: true, success: false };
  }
}
