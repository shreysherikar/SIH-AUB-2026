import { useEffect, useRef } from "react";
import Script from "next/script";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

export function isTurnstileConfigured() {
  return Boolean(SITE_KEY);
}

// Renders a Cloudflare Turnstile challenge and reports the resulting token
// up via onToken. If no site key is configured (e.g. still in local dev),
// shows a small notice instead of a broken widget.
export default function Turnstile({ onToken }) {
  const containerRef = useRef(null);
  const widgetId = useRef(null);

  function renderWidget() {
    if (!window.turnstile || !containerRef.current || widgetId.current) return;
    widgetId.current = window.turnstile.render(containerRef.current, {
      sitekey: SITE_KEY,
      theme: "light",
      callback: (token) => onToken(token),
      "expired-callback": () => onToken(""),
      "error-callback": () => onToken(""),
    });
  }

  useEffect(() => {
    renderWidget();
    return () => {
      if (window.turnstile && widgetId.current) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!SITE_KEY) {
    return (
      <p className="text-xs text-inkDim font-mono">
        Spam-check isn't configured yet (missing Turnstile site key) — this
        form is running unprotected. See README before going live.
      </p>
    );
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={renderWidget}
      />
      <div ref={containerRef} />
    </>
  );
}
