import Head from "next/head";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import Turnstile from "@/components/Turnstile";

const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"];
const GENDER_OPTIONS = ["Female", "Male", "Other"];

const emptyTeam = {
  team_name: "",
  track: "",
  problem_statement: "",
  mentor_name: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  notes: "",
};

const emptyMember = { name: "", sen: "", year: "", program: "", school: "", gender: "" };

function emptyMembers() {
  return Array.from({ length: 6 }, () => ({ ...emptyMember }));
}

function isMemberFilled(m) {
  return Object.values(m).some((v) => v.trim().length > 0);
}

function isMemberComplete(m) {
  return Object.values(m).every((v) => v.trim().length > 0);
}

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
  const [members, setMembers] = useState(emptyMembers());
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

  function updateMember(index, key, value) {
    setMembers((prev) => prev.map((m, i) => (i === index ? { ...m, [key]: value } : m)));
  }

  function validateMembers() {
    const filled = members.filter(isMemberFilled);

    if (filled.length === 0) {
      return "Add at least one team member.";
    }
    const incompleteIndex = members.findIndex((m) => isMemberFilled(m) && !isMemberComplete(m));
    if (incompleteIndex !== -1) {
      return `Member ${incompleteIndex + 1} has some fields missing — fill in every field for that row, or clear it completely.`;
    }
    if (!filled.some((m) => m.gender === "Female")) {
      return "At least one team member must be female.";
    }
    return "";
  }

  async function submit(e) {
    e.preventDefault();

    const memberError = validateMembers();
    if (memberError) {
      setStatus("error");
      setErrorMsg(memberError);
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    const payload = {
      ...form,
      members: members.filter(isMemberFilled),
      turnstileToken,
    };

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(result.error || "Something went wrong, try again.");
        return;
      }

      setStatus(result.emailSent ? "sent" : "sent_no_email");
      setForm(emptyTeam);
      setMembers(emptyMembers());
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
      <div className="min-h-screen bg-cream bg-grid bg-fixed">
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
                  ? "Your team is in — a confirmation email with your submitted details is on its way to the contact email. Watch the announcements page for next steps."
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
                <Field label="Mentor">
                  <input
                    className={inputClass}
                    placeholder="Faculty mentor's name"
                    value={form.mentor_name}
                    onChange={(e) => update("mentor_name", e.target.value)}
                    maxLength={80}
                  />
                </Field>
              </div>

              <div className="panel rounded-lg p-6 space-y-4">
                <div className="font-mono text-xs text-inkDim uppercase tracking-wider">
                  point of contact
                </div>
                <p className="text-xs text-inkDim -mt-2">
                  Where the confirmation email and any updates about your registration will go.
                </p>
                <Field label="Name" required>
                  <input
                    className={inputClass}
                    value={form.contact_name}
                    onChange={(e) => update("contact_name", e.target.value)}
                    required
                    maxLength={80}
                  />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Email" required>
                    <input
                      type="email"
                      className={inputClass}
                      value={form.contact_email}
                      onChange={(e) => update("contact_email", e.target.value)}
                      required
                      maxLength={120}
                    />
                  </Field>
                  <Field label="Phone">
                    <input
                      className={inputClass}
                      value={form.contact_phone}
                      onChange={(e) => update("contact_phone", e.target.value)}
                      maxLength={20}
                    />
                  </Field>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs text-inkDim uppercase tracking-wider">
                    team members (up to 6)
                  </div>
                  <div className="font-mono text-[11px] text-amberDim">
                    at least 1 female member required
                  </div>
                </div>

                {members.map((m, i) => (
                  <div key={i} className="panel rounded-lg p-5 space-y-3">
                    <div className="font-display font-semibold text-navy text-sm">
                      Member {i + 1}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Field label="Name">
                        <input
                          className={inputClass}
                          value={m.name}
                          onChange={(e) => updateMember(i, "name", e.target.value)}
                          maxLength={80}
                        />
                      </Field>
                      <Field label="SEN">
                        <input
                          className={inputClass}
                          placeholder="Student enrollment no."
                          value={m.sen}
                          onChange={(e) => updateMember(i, "sen", e.target.value)}
                          maxLength={40}
                        />
                      </Field>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <Field label="Year">
                        <select
                          className={inputClass}
                          value={m.year}
                          onChange={(e) => updateMember(i, "year", e.target.value)}
                        >
                          <option value="">Select…</option>
                          {YEAR_OPTIONS.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Gender">
                        <select
                          className={inputClass}
                          value={m.gender}
                          onChange={(e) => updateMember(i, "gender", e.target.value)}
                        >
                          <option value="">Select…</option>
                          {GENDER_OPTIONS.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Program">
                        <input
                          className={inputClass}
                          placeholder="e.g. B.Tech CSE"
                          value={m.program}
                          onChange={(e) => updateMember(i, "program", e.target.value)}
                          maxLength={80}
                        />
                      </Field>
                    </div>
                    <Field label="School">
                      <input
                        className={inputClass}
                        placeholder="e.g. Amity School of Engineering & Technology"
                        value={m.school}
                        onChange={(e) => updateMember(i, "school", e.target.value)}
                        maxLength={120}
                      />
                    </Field>
                  </div>
                ))}
              </div>

              <div className="panel rounded-lg p-6 space-y-4">
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
