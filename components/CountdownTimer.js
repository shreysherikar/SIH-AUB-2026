import { useEffect, useState } from "react";

function getParts(target) {
  const diff = Math.max(0, target - Date.now());
  const s = Math.floor(diff / 1000);
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
    done: diff <= 0,
  };
}

export default function CountdownTimer({ targetIso }) {
  const target = new Date(targetIso).getTime();
  const [mounted, setMounted] = useState(false);
  const [parts, setParts] = useState(null);

  useEffect(() => {
    setMounted(true);

    setParts(getParts(target));

    const id = setInterval(() => {
      setParts(getParts(target));
    }, 1000);

    return () => clearInterval(id);
  }, [target]);

  if (!mounted || !parts) {
    return null;
  }

  const cells = [
    { label: "Days", value: parts.d },
    { label: "Hrs", value: parts.h },
    { label: "Min", value: parts.m },
    { label: "Sec", value: parts.s },
  ];

  return (
    <div className="inline-block rounded-lg border border-white/15 bg-white/5 px-5 py-4 sm:px-8 sm:py-6">
      <div className="font-mono text-[10px] sm:text-xs text-white/60 mb-3 tracking-widest uppercase">
        {parts.done ? "Event is live" : "Time until kickoff"}
      </div>
      <div className="flex gap-4 sm:gap-6">
        {cells.map((c) => (
          <div key={c.label} className="text-center">
            <div className="font-display text-3xl sm:text-5xl font-bold text-amber tabular-nums">
              {String(c.value).padStart(2, "0")}
            </div>
            <div className="font-mono text-[10px] sm:text-xs text-white/60 uppercase tracking-wider mt-1">
              {c.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


