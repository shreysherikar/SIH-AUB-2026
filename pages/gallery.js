import Head from "next/head";
import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

// ---------------------------------------------------------------------------
// EDIT THIS ARRAY with your actual organizing team.
// - photo: put the image file in /public/team/ and reference it here, e.g.
//   "/team/priya.jpg". Leave as "" to show a placeholder initials avatar
//   instead (useful until you have everyone's photo).
// - Recommended photo: square, at least 300x300px.
// ---------------------------------------------------------------------------
const TEAM = [
  { name: "Your Name", role: "Lead Organizer", photo: "", email: "" },
  { name: "Co-organizer Name", role: "Logistics Lead", photo: "", email: "" },
  { name: "Co-organizer Name", role: "Tech & Portal", photo: "", email: "" },
  { name: "Co-organizer Name", role: "Outreach", photo: "", email: "" },
];

function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function TeamCard({ member }) {
  const [imgFailed, setImgFailed] = useState(!member.photo);

  return (
    <div className="panel rounded-lg p-6 text-center">
      {!imgFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={member.photo}
          alt={member.name}
          onError={() => setImgFailed(true)}
          className="h-24 w-24 rounded-full object-cover mx-auto border-2 border-amber/50"
        />
      ) : (
        <div className="h-24 w-24 rounded-full mx-auto flex items-center justify-center bg-navy text-amber font-display font-semibold text-xl border-2 border-amber/50">
          {initials(member.name)}
        </div>
      )}
      <div className="font-display font-semibold text-navy text-sm mt-4">{member.name}</div>
      <div className="text-xs text-amberDim mt-1">{member.role}</div>
      {member.email && (
        <a href={`mailto:${member.email}`} className="block text-xs text-inkDim mt-2 hover:text-amber">
          {member.email}
        </a>
      )}
    </div>
  );
}

export default function Gallery() {
  return (
    <>
      <Head>
        <title>Organizing Team — Internal Smart India Hackathon</title>
      </Head>
      <div className="min-h-screen bg-cream">
        <Nav />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
          <div className="font-mono text-xs text-cyan tracking-widest uppercase mb-3">
            behind the portal
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-navy mb-3">
            Organizing Team
          </h1>
          <p className="text-inkDim text-sm sm:text-base mb-10 max-w-xl">
            The people running this year's internal round — reach out here if
            queries board answers aren't enough.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {TEAM.map((m, i) => (
              <TeamCard key={i} member={m} />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}


