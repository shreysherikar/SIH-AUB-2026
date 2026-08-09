import Head from "next/head";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const THEMES = [
  "Smart Automation",
  "MedTech / BioTech / HealthTech",
  "Agriculture, FoodTech & Rural Development",
  "Smart Vehicles",
  "Transportation & Logistics",
  "Robotics & Drones",
  "Clean & Green Technology",
  "Tourism",
  "Renewable / Sustainable Energy",
  "Blockchain & Cybersecurity",
  "Fitness & Sports",
  "Heritage & Culture",
  "Miscellaneous (Hospitality, FinTech, Retail)",
];

function Fact({ label, value }) {
  return (
    <div className="panel rounded-lg p-5">
      <div className="font-mono text-[11px] text-amberDim uppercase tracking-wider mb-1.5">{label}</div>
      <div className="text-ink text-sm font-medium">{value}</div>
    </div>
  );
}

export default function About() {
  return (
    <>
      <Head>
        <title>About Smart India Hackathon — Amity University Bengaluru</title>
      </Head>
      <div className="min-h-screen bg-cream">
        <Nav />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <div className="font-mono text-xs text-cyan tracking-widest uppercase mb-3">
            primer
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-navy mb-6">
            About Smart India Hackathon
          </h1>

          <p className="text-inkDim text-sm sm:text-base leading-relaxed mb-10">
            Smart India Hackathon (SIH) is a nationwide innovation challenge
            run by the Ministry of Education's Innovation Cell along with
            AICTE. Every year it invites students from colleges across India
            to build working solutions for real problems posed by government
            departments, PSUs, and industry &mdash; the goal being practical,
            deployable ideas rather than just prototypes on paper.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            <Fact label="Organized by" value="Ministry of Education's Innovation Cell + AICTE" />
            <Fact label="Editions" value="Software track and Hardware track" />
            <Fact label="Typical team size" value="Up to 6 students, plus 1–2 mentors" />
            <Fact label="Eligibility" value="Students enrolled in a recognized Indian college/university" />
          </div>

          <h2 className="font-display text-xl font-bold text-navy mb-3">
            Why Amity Bengaluru runs an internal round
          </h2>
          <p className="text-inkDim text-sm sm:text-base leading-relaxed mb-10">
            SIH only lets each college nominate a limited number of teams to
            the national portal, and every participating institute is
            required to run its own internal hackathon first to arrive at
            that shortlist. This is that round for Amity Bengaluru &mdash;
            getting through it is what actually puts a team in front of the
            national evaluators, so it&apos;s worth preparing for like the
            real thing.
          </p>

          <h2 className="font-display text-xl font-bold text-navy mb-3">
            Eligibility
          </h2>
          <ul className="text-inkDim text-sm sm:text-base leading-relaxed mb-10 space-y-2 list-disc pl-5">
            <li>Open to undergraduate, postgraduate, and PhD students, from any discipline or branch.</li>
            <li>You must be a currently enrolled, regular student at Amity University Bengaluru.</li>
            <li>Every member of a team must be from Amity Bengaluru &mdash; SIH does not permit inter-college teams.</li>
          </ul>

          <h2 className="font-display text-xl font-bold text-navy mb-3">
            Team formation
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <Fact label="Team size" value="Exactly 6 members, including the team leader" />
            <Fact label="Gender rule" value="At least 1 female member is mandatory (all-women teams are allowed)" />
            <Fact label="Mentor" value="Each team needs a faculty mentor before submitting" />
            <Fact label="Discipline mix" value="Cross-branch teams are encouraged, especially for the hardware track" />
          </div>
          <p className="text-inkDim text-sm sm:text-base leading-relaxed mb-10">
            The 1-female-member rule is a hard SIH eligibility requirement,
            not just an internal preference &mdash; teams that don&apos;t
            meet it can&apos;t be nominated to the national portal, so sort
            this out before you lock in the rest of your lineup. For the
            software track, most of your team should be comfortable with
            actual programming; for hardware, aim for a genuine mix &mdash;
            mechanical, electronics, design, and software, rather than six
            people with the same skillset.
          </p>

          <h2 className="font-display text-xl font-bold text-navy mb-3">
            How the internal round works
          </h2>
          <ol className="text-inkDim text-sm sm:text-base leading-relaxed mb-10 space-y-2 list-decimal pl-5">
            <li>Form your team of 6 (see the rules above) and register within the window posted on Announcements.</li>
            <li>Pick a problem statement from the official SIH bank that matches your team&apos;s skills and interests.</li>
            <li>Submit your idea &mdash; typically a short PPT or proposal covering your approach, tech stack, and feasibility.</li>
            <li>Present to a faculty evaluation panel, who score ideas on originality, feasibility, clarity, and real-world impact.</li>
            <li>Top-ranked teams are shortlisted and nominated by Amity Bengaluru on the official SIH portal.</li>
          </ol>

          <h2 className="font-display text-xl font-bold text-navy mb-4">
            Problem statement themes
          </h2>
          <p className="text-inkDim text-sm mb-4">
            SIH problem statements are grouped under broad themes so every
            discipline has somewhere to contribute:
          </p>
          <div className="flex flex-wrap gap-2 mb-12">
            {THEMES.map((t) => (
              <span
                key={t}
                className="px-3 py-1.5 rounded-full border border-line bg-panelLight text-xs text-ink"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="panel rounded-lg p-6 border-l-4 border-l-amber">
            <p className="text-sm text-inkDim leading-relaxed">
              This page is a short primer, not a replacement for the official
              rules. For the full, current problem-statement bank, exact
              national timelines, and official guidelines, visit{" "}
              <a
                href="https://sih.gov.in"
                target="_blank"
                rel="noreferrer"
                className="text-amberDim underline hover:text-amber"
              >
                sih.gov.in
              </a>
              . For anything specific to our internal round, check{" "}
              <a href="/announcements" className="text-amberDim underline hover:text-amber">
                Announcements
              </a>{" "}
              or post it on{" "}
              <a href="/queries" className="text-amberDim underline hover:text-amber">
                Queries
              </a>
              .
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
