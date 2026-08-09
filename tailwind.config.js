/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Amity-inspired: deep navy + golden yellow, with a warm bronze/brown
        // secondary accent, on a paper-white institutional background.
        cream: "#FAF7F0",       // page background (warm paper white)
        panel: "#FFFFFF",      // card background
        panelLight: "#FDF6E3", // input / subtle-fill background (soft gold tint)
        line: "#E4D9BB",       // hairline borders (warm sand)
        navy: "#0B1F3D",       // primary brand navy
        navyLight: "#14335C",
        amber: "#C9971C",      // primary gold accent (buttons, links, highlights)
        amberDim: "#8A6224",
        cyan: "#8B5E34",       // bronze/brown accent (repurposed token, used for labels/tags)
        good: "#2E7D4F",
        bad: "#B3261E",
        ink: "#152238",        // primary text (near-navy)
        inkDim: "#5B6478",     // secondary text
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(11,31,61,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(11,31,61,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
    },
  },
  plugins: [],
};
