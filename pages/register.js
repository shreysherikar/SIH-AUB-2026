import Head from "next/head";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import Turnstile from "@/components/Turnstile";

const emptyTeam = {
  team_name: "",
  track: "",
  problem_statement: "",
  leader_name: "",
  leader_email: "",
  leader_phone: "",
  member_2: "",
  member_3: "",
  member_4: "",
  member_5: "",
  member_6: "",
  notes: "",
};

function Field({ label, children, required }) {
  return (
    <label className="block">
      <span className="block font-mono text-xs text-inkDim uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-amber">*</span>}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full bg-panelLight border border-line rounded px-4 py-2.5 text-sm text-ink placeholder:text-inkDim/60 focus:border-amber outline-none";

export default function Register() {
  const [form, setForm] = useState(emptyTeam);
  const [status, setStatus] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [regOpen, setRegOpen] = useState(true);
  const [turnstileToken, setTurnstileToken] = useState("");

  useEffect(() => {
    async function loadSettings() {
      if (!isSupabaseConfigured) {
        setSettingsLoading(false);
        return;
      }
      const { data } = await supabase.from("settings").select("registrations_open").eq("id", 1).single();
      if (data) setRegOpen(data.registrations_open);
      setSettingsLoading(false);
    }
    loadSettings();
  }, []);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, turnstileToken }),
      });
      const result = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(result.error || "Something went wrong, try again.");
        return;
      }

      setStatus(result.emailSent ? "sent" : "sent_no_email");
      setForm(emptyTeam);
      setTurnstileToken("");
    } catch (err) {
      setStatus("error");
      setErrorMsg("Couldn't reach the server, try again in a bit.");
    }
  }

  return (
    <>
      <Head>
        <title>Register — SIH Internal Portal</title>
      </Head>
      <div className="min-h-screen bg-base bg-grid bg-fixed">
        <Nav />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
          <div className="font-mono text-xs text-cyan tracking-widest uppercase mb-3">
            insert-only &middot; not publicly readable
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink mb-3">
            Team Registration
          </h1>
          <p className="text-inkDim text-sm mb-10 max-w-xl">
            Submit once per team. Your details go straight to the organizers'
            database — this page can't be used to look up other teams'
            information, and there's no public list.
          </p>

          {!settingsLoading && !regOpen && (
            <div className="panel rounded-lg p-6 text-inkDim text-sm mb-10 border-bad/50">
              Registrations are currently closed. Check{" "}
              <a href="/announcements" className="text-amber underline">
                announcements
              </a>{" "}
              for updates.
            </div>
          )}

          {!isSupabaseConfigured && (
            <div className="panel rounded-lg p-6 text-inkDim text-sm mb-10">
              Supabase isn't connected yet, so this form is disabled in this preview.
            </div>
          )}

          {status === "sent" || status === "sent_no_email" ? (
            <div className="panel rounded-lg p-8 text-center">
              <div className="text-good font-mono text-sm mb-2">✓ registration received</div>
              <p className="text-inkDim text-sm">
                {status === "sent"
                  ? "Your team is in — a confirmation email with your submitted details is on its way to the leader's inbox. Watch the announcements page for next steps."
                  : "Your team is in and saved. We couldn't send a confirmation email just now, but your registration is safe — watch the announcements page for next steps."}
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-6">
              <div className="panel rounded-lg p-6 space-y-4">
                <Field label="Team name" required>
                  <input
                    className={inputClass}
                    value={form.team_name}
                    onChange={(e) => update("team_name", e.target.value)}
                    required
                    maxLength={80}
                  />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Track / domain">
                    <input
                      className={inputClass}
                      placeholder="e.g. HealthTech"
                      value={form.track}
                      onChange={(e) => update("track", e.target.value)}
                      maxLength={80}
                    />
                  </Field>
                  <Field label="Problem statement">
                    <input
                      className={inputClass}
                      placeholder="PS code or title"
                      value={form.problem_statement}
                      onChange={(e) => update("problem_statement", e.target.value)}
                      maxLength={120}
                    />
                  </Field>
                </div>
              </div>

              <div className="panel rounded-lg p-6 space-y-4">
                <div className="font-mono text-xs text-inkDim uppercase tracking-wider">
                  team leader (point of contact)
                </div>
                <Field label="Name" required>
                  <input
                    className={inputClass}
                    value={form.leader_name}
                    onChange={(e) => update("leader_name", e.target.value)}
                    required
                    maxLength={80}
                  />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Email" required>
                    <input
                      type="email"
                      className={inputClass}
                      value={form.leader_email}
                      onChange={(e) => update("leader_email", e.target.value)}
                      required
                      maxLength={120}
                    />
                  </Field>
                  <Field label="Phone">
                    <input
                      className={inputClass}
                      value={form.leader_phone}
                      onChange={(e) => update("leader_phone", e.target.value)}
                      maxLength={20}
                    />
                  </Field>
                </div>
              </div>

              <div className="panel rounded-lg p-6 space-y-4">
                <div className="font-mono text-xs text-inkDim uppercase tracking-wider">
                  other members (up to 5, optional)
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {["member_2", "member_3", "member_4", "member_5", "member_6"].map((key, i) => (
                    <Field key={key} label={`Member ${i + 2}`}>
                      <input
                        className={inputClass}
                        value={form[key]}
                        onChange={(e) => update(key, e.target.value)}
                        maxLength={80}
                      />
                    </Field>
                  ))}
                </div>
                <Field label="Notes for organizers">
                  <textarea
                    className={inputClass}
                    rows={2}
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    maxLength={400}
                  />
                </Field>
              </div>

              <Turnstile onToken={setTurnstileToken} />

              <button
                type="submit"
                disabled={status === "sending" || !isSupabaseConfigured || (!settingsLoading && !regOpen)}
                className="w-full px-5 py-3 bg-amber text-base font-mono text-sm font-semibold rounded hover:bg-amber/90 transition-colors disabled:opacity-50"
              >
                {status === "sending" ? "submitting…" : "submit registration"}
              </button>

              {status === "error" && (
                <p className="text-bad text-xs font-mono">{errorMsg}</p>
              )}
            </form>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}
