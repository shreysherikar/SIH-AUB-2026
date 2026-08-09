export default function Footer() {
  return (
    <footer className="bg-navy mt-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/amity-logo.png"
              alt="Amity University Bengaluru"
              className="h-12 w-auto"
            />
            <div className="leading-tight">
              <div className="font-display font-semibold text-white text-sm">
                Amity University Bengaluru
              </div>
              <div className="text-white/60 text-xs">
                Internal Smart India Hackathon Portal
              </div>
            </div>
          </div>
          <a href="/admin/login" className="text-white/60 text-xs hover:text-amber transition-colors">
            Organizer login &rarr;
          </a>
        </div>
        <div className="scanline-divider my-6 opacity-20" />
        <p className="text-white/40 text-xs leading-relaxed max-w-2xl">
          This is an internal college portal run by the SIH organizing team at
          Amity University Bengaluru. It is not the official Smart India
          Hackathon website — for national rules, timelines, and the official
          problem statement bank, visit{" "}
          <a href="https://sih.gov.in" target="_blank" rel="noreferrer" className="underline hover:text-amber">
            sih.gov.in
          </a>.
        </p>
      </div>
    </footer>
  );
}


