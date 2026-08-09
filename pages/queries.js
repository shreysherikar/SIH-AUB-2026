import Head from "next/head";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import Turnstile from "@/components/Turnstile";

function formatDate(iso) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Queries() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [status, setStatus] = useState("");

  async function load() {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("queries")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setItems(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e) {
    e.preventDefault();

    if (!question.trim()) return;

    if (
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY &&
      !turnstileToken
    ) {
      setStatus("captcha");
      return;
    }

    setStatus("sending");

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          display_name: name.trim() || "Anonymous",
          question: question.trim(),
          turnstileToken,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setStatus(result.error || "error");
        return;
      }

      setStatus("sent");
      setQuestion("");
      setName("");
      setTurnstileToken("");
      load();
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }

  const answered = items.filter((i) => i.answer);
  const pending = items.filter((i) => !i.answer);

  return (
    <>
      <Head>
        <title>Queries — SIH Internal Portal</title>
      </Head>

      <div className="min-h-screen bg-base bg-grid bg-fixed">
        <Nav />

        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <div className="font-mono text-xs text-cyan tracking-widest uppercase mb-3">
            open board · no DMs
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink mb-3">
            Queries
          </h1>

          <p className="text-inkDim text-sm mb-10 max-w-xl">
            Ask here instead of DMing the organizers — chances are someone
            else has the same doubt, and this way everyone sees the answer.
          </p>

          {!isSupabaseConfigured && (
            <div className="panel rounded-lg p-6 text-inkDim text-sm mb-10">
              Supabase isn't connected yet, so questions can't be submitted
              in this preview. Once configured, this form goes live.
            </div>
          )}

          <form
            onSubmit={submit}
            className="panel rounded-lg p-6 mb-12 space-y-4"
          >
            <div className="font-mono text-xs text-inkDim uppercase tracking-wider">
              ask a question
            </div>

            <input
              type="text"
              placeholder="Your name or team name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-panelLight border border-line rounded px-4 py-2.5 text-sm text-ink placeholder:text-inkDim/60 focus:border-amber outline-none"
              maxLength={80}
            />

            <textarea
              placeholder="What's your question?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              rows={3}
              maxLength={600}
              className="w-full bg-panelLight border border-line rounded px-4 py-2.5 text-sm text-ink placeholder:text-inkDim/60 focus:border-amber outline-none resize-none"
            />

            <Turnstile onToken={setTurnstileToken} />

            <button
              type="submit"
              disabled={
                status === "sending" || !isSupabaseConfigured
              }
              className="px-5 py-2.5 bg-amber text-base font-mono text-sm font-semibold rounded hover:bg-amber/90 transition-colors disabled:opacity-50"
            >
              {status === "sending" ? "posting…" : "post question"}
            </button>

            {status === "captcha" && (
              <p className="text-bad text-xs font-mono">
                please complete the captcha before posting
              </p>
            )}

            {status === "sent" && (
              <p className="text-good text-xs font-mono">
                posted — an organizer will answer it here soon
              </p>
            )}

            {status === "error" && (
              <p className="text-bad text-xs font-mono">
                something went wrong, try again in a bit
              </p>
            )}

            {status &&
              status !== "sending" &&
              status !== "captcha" &&
              status !== "sent" &&
              status !== "error" && (
                <p className="text-bad text-xs font-mono">
                  {status}
                </p>
              )}
          </form>

          {loading && (
            <p className="font-mono text-sm text-inkDim">
              loading&hellip;
            </p>
          )}

          {!loading && pending.length > 0 && (
            <div className="mb-12">
              <div className="font-mono text-xs text-inkDim uppercase tracking-wider mb-4">
                awaiting answer ({pending.length})
              </div>

              <div className="space-y-3">
                {pending.map((q) => (
                  <div key={q.id} className="panel rounded-lg p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs text-cyan">
                        {q.display_name}
                      </span>

                      <time className="font-mono text-xs text-inkDim">
                        {formatDate(q.created_at)}
                      </time>
                    </div>

                    <p className="text-sm text-ink">{q.question}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && answered.length > 0 && (
            <div>
              <div className="font-mono text-xs text-inkDim uppercase tracking-wider mb-4">
                answered ({answered.length})
              </div>

              <div className="space-y-4">
                {answered.map((q) => (
                  <div key={q.id} className="panel rounded-lg p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs text-cyan">
                        {q.display_name}
                      </span>

                      <time className="font-mono text-xs text-inkDim">
                        {formatDate(q.created_at)}
                      </time>
                    </div>

                    <p className="text-sm text-ink mb-3">
                      {q.question}
                    </p>

                    <div className="border-l-2 border-amber pl-3">
                      <div className="font-mono text-[10px] text-amber uppercase tracking-wider mb-1">
                        organizer
                      </div>

                      <p className="text-sm text-inkDim">
                        {q.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}