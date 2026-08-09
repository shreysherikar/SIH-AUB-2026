import Head from "next/head";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

function formatDate(iso) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Announcements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured) {
        setError("not_configured");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) {
        setError(error.message);
      } else {
        setItems(data);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <>
      <Head>
        <title>Announcements — SIH Internal Portal</title>
      </Head>
      <div className="min-h-screen bg-cream bg-grid bg-fixed">
        <Nav />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <div className="font-mono text-xs text-cyan tracking-widest uppercase mb-3">
            log &middot; latest first
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink mb-10">
            Announcements
          </h1>

          {error === "not_configured" && (
            <div className="panel rounded-lg p-6 text-inkDim text-sm">
              Supabase isn't connected yet. Once the organizer sets up the
              database (see README), announcements will appear here.
            </div>
          )}

          {loading && !error && (
            <p className="font-mono text-sm text-inkDim">loading&hellip;</p>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="panel rounded-lg p-6 text-inkDim text-sm">
              Nothing posted yet. Check back closer to the event.
            </div>
          )}

          <div className="space-y-4">
            {items.map((item) => (
              <article key={item.id} className="panel rounded-lg p-6">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h2 className="font-display font-semibold text-lg text-ink">
                    {item.pinned && <span className="text-amber mr-2">&#9733;</span>}
                    {item.title}
                  </h2>
                  <time className="shrink-0 font-mono text-xs text-inkDim">
                    {formatDate(item.created_at)}
                  </time>
                </div>
                <p className="text-inkDim text-sm leading-relaxed whitespace-pre-wrap">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}


