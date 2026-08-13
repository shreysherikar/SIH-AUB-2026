import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/useAuth";

const TABS = ["announcements", "queries", "teams", "settings"];

function Tab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded font-mono text-xs uppercase tracking-wider transition-colors ${
        active ? "bg-amber text-base font-semibold" : "text-inkDim hover:text-ink hover:bg-panel"
      }`}
    >
      {children}
    </button>
  );
}

function AnnouncementsTab() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function post(e) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    await supabase.from("announcements").insert({ title, body, pinned });
    setTitle("");
    setBody("");
    setPinned(false);
    load();
  }

  async function remove(id) {
    if (!confirm("Delete this announcement?")) return;
    await supabase.from("announcements").delete().eq("id", id);
    load();
  }

  async function togglePin(item) {
    await supabase.from("announcements").update({ pinned: !item.pinned }).eq("id", item.id);
    load();
  }

  return (
    <div>
      <form onSubmit={post} className="panel rounded-lg p-5 space-y-3 mb-8">
        <input
          className="w-full bg-panelLight border border-line rounded px-4 py-2.5 text-sm text-ink outline-none focus:border-amber"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
        />
        <textarea
          className="w-full bg-panelLight border border-line rounded px-4 py-2.5 text-sm text-ink outline-none focus:border-amber resize-none"
          placeholder="Details…"
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-inkDim font-mono">
            <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
            pin to top
          </label>
          <button className="px-4 py-2 bg-amber text-base font-mono text-xs font-semibold rounded hover:bg-amber/90">
            post announcement
          </button>
        </div>
      </form>

      {loading ? (
        <p className="font-mono text-sm text-inkDim">loading…</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="panel rounded-lg p-4 flex items-start justify-between gap-4">
              <div>
                <div className="font-display font-semibold text-ink text-sm">
                  {item.pinned && <span className="text-amber mr-1">★</span>}
                  {item.title}
                </div>
                <p className="text-inkDim text-xs mt-1 whitespace-pre-wrap">{item.body}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => togglePin(item)}
                  className="font-mono text-xs text-inkDim hover:text-amber"
                >
                  {item.pinned ? "unpin" : "pin"}
                </button>
                <button
                  onClick={() => remove(item.id)}
                  className="font-mono text-xs text-inkDim hover:text-bad"
                >
                  delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QueriesTab() {
  const [items, setItems] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase.from("queries").select("*").order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function answer(id) {
    const text = drafts[id];
    if (!text || !text.trim()) return;
    await supabase
      .from("queries")
      .update({ answer: text.trim(), answered_at: new Date().toISOString() })
      .eq("id", id);
    load();
  }

  async function remove(id) {
    if (!confirm("Delete this question?")) return;
    await supabase.from("queries").delete().eq("id", id);
    load();
  }

  if (loading) return <p className="font-mono text-sm text-inkDim">loading…</p>;

  const pending = items.filter((i) => !i.answer);
  const answered = items.filter((i) => i.answer);

  return (
    <div className="space-y-8">
      <div>
        <div className="font-mono text-xs text-inkDim uppercase tracking-wider mb-3">
          pending ({pending.length})
        </div>
        <div className="space-y-3">
          {pending.map((q) => (
            <div key={q.id} className="panel rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-cyan">{q.display_name}</span>
                <button onClick={() => remove(q.id)} className="font-mono text-xs text-inkDim hover:text-bad">
                  delete
                </button>
              </div>
              <p className="text-sm text-ink mb-3">{q.question}</p>
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-panelLight border border-line rounded px-3 py-2 text-sm text-ink outline-none focus:border-amber"
                  placeholder="Type an answer…"
                  value={drafts[q.id] || ""}
                  onChange={(e) => setDrafts((d) => ({ ...d, [q.id]: e.target.value }))}
                />
                <button
                  onClick={() => answer(q.id)}
                  className="px-4 py-2 bg-amber text-base font-mono text-xs font-semibold rounded hover:bg-amber/90 shrink-0"
                >
                  answer
                </button>
              </div>
            </div>
          ))}
          {pending.length === 0 && <p className="text-inkDim text-sm">All caught up.</p>}
        </div>
      </div>

      <div>
        <div className="font-mono text-xs text-inkDim uppercase tracking-wider mb-3">
          answered ({answered.length})
        </div>
        <div className="space-y-3">
          {answered.map((q) => (
            <div key={q.id} className="panel rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-cyan">{q.display_name}</span>
                <button onClick={() => remove(q.id)} className="font-mono text-xs text-inkDim hover:text-bad">
                  delete
                </button>
              </div>
              <p className="text-sm text-ink mb-2">{q.question}</p>
              <p className="text-sm text-inkDim border-l-2 border-amber pl-3">{q.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeamsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data: teams } = await supabase.from("teams").select("*").order("created_at", { ascending: false });
    const { data: members } = await supabase
      .from("team_members")
      .select("*")
      .order("member_order", { ascending: true });

    const membersByTeam = {};
    (members || []).forEach((m) => {
      (membersByTeam[m.team_id] ||= []).push(m);
    });

    setItems((teams || []).map((t) => ({ ...t, members: membersByTeam[t.id] || [] })));
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function exportCsv() {
    // One row per member, team details repeated -- easiest shape to work
    // with in a spreadsheet or attendance sheet.
    const headers = [
      "team_name", "track", "problem_statement", "mentor_name",
      "contact_name", "contact_email", "contact_phone",
      "member_order", "member_name", "sen", "year", "program", "school", "gender",
      "notes", "created_at",
    ];
    const rows = [];
    items.forEach((t) => {
      const memberList = t.members.length ? t.members : [{}];
      memberList.forEach((m) => {
        const row = {
          team_name: t.team_name,
          track: t.track,
          problem_statement: t.problem_statement,
          mentor_name: t.mentor_name,
          contact_name: t.contact_name,
          contact_email: t.contact_email,
          contact_phone: t.contact_phone,
          member_order: m.member_order ?? "",
          member_name: m.name ?? "",
          sen: m.sen ?? "",
          year: m.year ?? "",
          program: m.program ?? "",
          school: m.school ?? "",
          gender: m.gender ?? "",
          notes: t.notes,
          created_at: t.created_at,
        };
        rows.push(headers.map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(","));
      });
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "team_registrations.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function remove(id) {
    if (!confirm("Delete this registration? This also deletes its members.")) return;
    await supabase.from("teams").delete().eq("id", id);
    load();
  }

  if (loading) return <p className="font-mono text-sm text-inkDim">loading…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-xs text-inkDim uppercase tracking-wider">
          {items.length} team{items.length !== 1 ? "s" : ""} registered
        </span>
        <button
          onClick={exportCsv}
          disabled={items.length === 0}
          className="px-4 py-2 panel text-ink font-mono text-xs rounded hover:border-amberDim disabled:opacity-40"
        >
          export csv
        </button>
      </div>
      <div className="space-y-3">
        {items.map((t) => (
          <div key={t.id} className="panel rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-display font-semibold text-ink text-sm">{t.team_name}</div>
                <div className="text-xs text-inkDim mt-1">
                  {t.track && <>{t.track} &middot; </>}
                  {t.problem_statement || "no PS set"}
                  {t.mentor_name && <> &middot; mentor: {t.mentor_name}</>}
                </div>
              </div>
              <button onClick={() => remove(t.id)} className="font-mono text-xs text-inkDim hover:text-bad shrink-0">
                delete
              </button>
            </div>

            <div className="mt-3 text-xs text-inkDim font-mono">
              contact: {t.contact_name} ({t.contact_email}{t.contact_phone ? `, ${t.contact_phone}` : ""})
            </div>

            {t.members.length > 0 && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-inkDim font-mono uppercase text-[10px]">
                      <th className="text-left pr-3 pb-1">#</th>
                      <th className="text-left pr-3 pb-1">Name</th>
                      <th className="text-left pr-3 pb-1">SEN</th>
                      <th className="text-left pr-3 pb-1">Year</th>
                      <th className="text-left pr-3 pb-1">Program</th>
                      <th className="text-left pr-3 pb-1">School</th>
                      <th className="text-left pr-3 pb-1">Gender</th>
                    </tr>
                  </thead>
                  <tbody>
                    {t.members.map((m) => (
                      <tr key={m.id} className="border-t border-line">
                        <td className="pr-3 py-1 text-inkDim">{m.member_order}</td>
                        <td className="pr-3 py-1 text-ink">{m.name}</td>
                        <td className="pr-3 py-1 text-inkDim">{m.sen}</td>
                        <td className="pr-3 py-1 text-inkDim">{m.year}</td>
                        <td className="pr-3 py-1 text-inkDim">{m.program}</td>
                        <td className="pr-3 py-1 text-inkDim">{m.school}</td>
                        <td className="pr-3 py-1 text-inkDim">
                          {m.gender === "Female" && <span className="text-amberDim">&#9679; </span>}
                          {m.gender}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {t.notes && <p className="text-xs text-inkDim mt-2 italic">note: {t.notes}</p>}
          </div>
        ))}
        {items.length === 0 && <p className="text-inkDim text-sm">No registrations yet.</p>}
      </div>
    </div>
  );
}

function SettingsTab() {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase.from("settings").select("registrations_open").eq("id", 1).single();
    if (data) setOpen(data.registrations_open);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle() {
    const next = !open;
    setOpen(next);
    await supabase.from("settings").update({ registrations_open: next }).eq("id", 1);
  }

  if (loading) return <p className="font-mono text-sm text-inkDim">loading…</p>;

  return (
    <div className="panel rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display font-semibold text-ink text-sm mb-1">Team registrations</div>
          <p className="text-inkDim text-xs">
            When closed, the public registration form stops accepting new teams.
          </p>
        </div>
        <button
          onClick={toggle}
          className={`px-4 py-2 font-mono text-xs font-semibold rounded ${
            open ? "bg-good/20 text-good border border-good/40" : "bg-bad/20 text-bad border border-bad/40"
          }`}
        >
          {open ? "open — click to close" : "closed — click to open"}
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [tab, setTab] = useState("announcements");

  useEffect(() => {
    if (!loading && !user) router.replace("/admin/login");
  }, [loading, user, router]);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="font-mono text-sm text-inkDim">checking session…</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin dashboard</title>
      </Head>
      <div className="min-h-screen bg-cream bg-grid bg-fixed">
        <Nav />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="font-mono text-xs text-cyan tracking-widest uppercase mb-2">
                logged in as {user.email}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">Admin dashboard</h1>
            </div>
            <button onClick={signOut} className="font-mono text-xs text-inkDim hover:text-bad">
              sign out
            </button>
          </div>

          <div className="flex gap-2 mb-8 flex-wrap">
            {TABS.map((t) => (
              <Tab key={t} active={tab === t} onClick={() => setTab(t)}>
                {t}
              </Tab>
            ))}
          </div>

          {tab === "announcements" && <AnnouncementsTab />}
          {tab === "queries" && <QueriesTab />}
          {tab === "teams" && <TeamsTab />}
          {tab === "settings" && <SettingsTab />}
        </main>
        <Footer />
      </div>
    </>
  );
}


