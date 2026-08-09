import Head from "next/head";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CountdownTimer from "@/components/CountdownTimer";

const EVENT_NAME = process.env.NEXT_PUBLIC_EVENT_NAME || "Internal Smart India Hackathon";
const EVENT_DATE = process.env.NEXT_PUBLIC_EVENT_DATE || "2026-09-15T09:00:00+05:30";

const quickLinks = [
  {
    href: "/announcements",
    title: "Announcements",
    desc: "Dates, venue changes, problem statement drops — the single source of truth. No more digging through WhatsApp.",
  },
  {
    href: "/queries",
    title: "Queries",
    desc: "Post a doubt, get it answered, everyone benefits. If someone already asked it, you'll see it here first.",
  },
  {
    href: "/register",
    title: "Register",
    desc: "Submit your team once. We don't publish your details anywhere — only organizers can see the list.",
  },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>{EVENT_NAME} — Amity University Bengaluru</title>
        <meta
          name="description"
          content="Internal Smart India Hackathon portal for Amity University Bengaluru — announcements, queries, and team registration in one place."
        />
      </Head>

      <div className="min-h-screen bg-cream">
        <Nav />

        <main>
          {/* Hero band */}
          <section className="bg-navy bg-grid">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-16">
              <div className="inline-block px-3 py-1 rounded-full border border-amber/40 bg-amber/10 font-mono text-[11px] text-amber tracking-widest uppercase mb-6">
                Internal Round &middot; College Portal
              </div>
              <h1 className="font-display text-4xl sm:text-6xl font-bold text-white leading-[1.1] max-w-3xl">
                {EVENT_NAME}
              </h1>
              <p className="mt-5 text-white/70 max-w-xl text-base sm:text-lg">
                Everything you need for Amity University Bengaluru's internal
                round lives here — announcements, an open queries board
                instead of DMs, and registration. Built by the organizing
                team so first-timers don't have to guess.
              </p>

              <div className="mt-10">
                <CountdownTimer targetIso={EVENT_DATE} />
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="px-5 py-3 bg-amber text-navy font-semibold text-sm rounded hover:bg-amber/90 transition-colors"
                >
                  Register your team &rarr;
                </Link>
                <Link
                  href="/queries"
                  className="px-5 py-3 border border-white/25 text-white text-sm rounded hover:bg-white/10 transition-colors"
                >
                  Ask a question
                </Link>
              </div>
            </div>
          </section>

          {/* Quick links */}
          <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 grid sm:grid-cols-3 gap-5">
            {quickLinks.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="panel rounded-lg p-6 hover:border-amber transition-colors group border-t-4 border-t-amber/70"
              >
                <div className="font-display font-semibold text-navy text-base mb-3">
                  {q.title}
                </div>
                <p className="text-sm text-inkDim leading-relaxed">{q.desc}</p>
                <div className="mt-4 text-xs text-amberDim group-hover:text-amber font-medium transition-colors">
                  Open &rarr;
                </div>
              </Link>
            ))}
          </section>

          {/* About SIH preview */}
          <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
            <div className="panel rounded-lg p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-6">
              <div className="flex-1">
                <div className="text-xs font-mono text-cyan tracking-widest uppercase mb-2">
                  New to SIH?
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-navy mb-3">
                  What Smart India Hackathon actually is
                </h2>
                <p className="text-sm text-inkDim leading-relaxed max-w-2xl">
                  A quick primer on the national initiative, how this internal
                  round fits in, team size rules, and the problem-statement
                  themes — all in one short page, so you don't have to dig
                  through the official site to get started.
                </p>
              </div>
              <Link
                href="/about"
                className="shrink-0 px-5 py-2.5 border border-navy text-navy text-sm font-medium rounded hover:bg-navy hover:text-white transition-colors"
              >
                Read the primer &rarr;
              </Link>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}


