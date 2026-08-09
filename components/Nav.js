import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import AmityMark from "./AmityMark";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About SIH" },
  { href: "/announcements", label: "Announcements" },
  { href: "/queries", label: "Queries" },
  { href: "/register", label: "Register" },
  { href: "/gallery", label: "Team" },
];

export default function Nav() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-20">
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <Image
            src="/amity-logo.png"
            alt="Amity University Bengaluru"
            width={60}
            height={60}
          />
          <div className="min-w-0 leading-tight">
            <div className="font-display font-semibold text-ink text-sm sm:text-base truncate">
              Amity University Bengaluru
            </div>
            <div className="font-mono text-[10px] sm:text-xs text-amberDim tracking-wide truncate">
              Internal Smart India Hackathon
            </div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {links.map((l) => {
            const active = router.pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2 rounded font-medium transition-colors ${
                  active
                    ? "text-navy border-b-2 border-amber"
                    : "text-inkDim hover:text-navy"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <nav className="flex md:hidden items-center gap-1 text-xs overflow-x-auto">
          {links.map((l) => {
            const active = router.pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-2 py-1.5 rounded whitespace-nowrap font-medium ${
                  active ? "text-navy underline decoration-amber decoration-2" : "text-inkDim"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}


