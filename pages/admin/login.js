import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/useAuth";

export default function AdminLogin() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && user) {
    router.replace("/admin");
    return null;
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setError("Login failed — check your email and password.");
    } else {
      router.replace("/admin");
    }
  }

  return (
    <>
      <Head>
        <title>Organizer login</title>
      </Head>
      <div className="min-h-screen bg-cream bg-grid bg-fixed">
        <Nav />
        <main className="max-w-sm mx-auto px-4 sm:px-6 py-24">
          <div className="font-mono text-xs text-cyan tracking-widest uppercase mb-3">
            restricted
          </div>
          <h1 className="font-display text-2xl font-bold text-ink mb-8">
            Organizer login
          </h1>

          {!isSupabaseConfigured ? (
            <div className="panel rounded-lg p-6 text-inkDim text-sm">
              Supabase isn't connected yet — see the README to set up auth.
            </div>
          ) : (
            <form onSubmit={submit} className="panel rounded-lg p-6 space-y-4">
              <input
                type="email"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-panelLight border border-line rounded px-4 py-2.5 text-sm text-ink focus:border-amber outline-none"
              />
              <input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-panelLight border border-line rounded px-4 py-2.5 text-sm text-ink focus:border-amber outline-none"
              />
              <button
                type="submit"
                disabled={busy}
                className="w-full px-5 py-2.5 bg-amber text-base font-mono text-sm font-semibold rounded hover:bg-amber/90 transition-colors disabled:opacity-50"
              >
                {busy ? "signing in…" : "sign in"}
              </button>
              {error && <p className="text-bad text-xs font-mono">{error}</p>}
              <p className="text-inkDim text-xs">
                No self sign-up — accounts are created by the organizing team
                directly in Supabase.
              </p>
            </form>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}


