// PLACEHOLDER LOGO — built to sit in your brand colors (navy + gold) so the
// layout looks right immediately. Swap this out for the real Amity University
// Bengaluru logo as soon as you have the file:
//
//   1. Drop the official logo file into /public, e.g. /public/amity-logo.png
//   2. Replace <AmityMark /> below with:
//        <img src="/amity-logo.png" alt="Amity University Bengaluru" className={className} />
//
// Do this in Nav.js and Footer.js (search for <AmityMark).

export default function AmityMark({ className = "h-9 w-9" }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-label="Amity University Bengaluru (placeholder mark)">
      <path
        d="M24 2 L44 9 V23 C44 34 36 42.5 24 46 C12 42.5 4 34 4 23 V9 Z"
        fill="#0B1F3D"
      />
      <path
        d="M24 2 L44 9 V23 C44 34 36 42.5 24 46 Z"
        fill="#C9971C"
      />
      <text
        x="24"
        y="30"
        textAnchor="middle"
        fontFamily="Poppins, sans-serif"
        fontWeight="700"
        fontSize="18"
        fill="#FAF7F0"
      >
        A
      </text>
    </svg>
  );
}


