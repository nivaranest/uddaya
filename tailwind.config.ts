import type { Config } from "tailwindcss";

// Design tokens from the Uddaya design prototypes (docs/design).
// Neutral text/background greys map exactly onto Tailwind's default gray scale
// (gray-800 #1F2937 ink, gray-600 #4B5563 body, gray-500 #6B7280 subtle, ...).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bronze: { DEFAULT: "#B07A48", dark: "#8A5A2B", deep: "#6B4423" },
        gold: "#E3C08A",
        sand: { 50: "#FDF8EF", 100: "#FAF0DF", 200: "#F6E1C3", 300: "#F0D6B4", line: "#EFDDBC" },
        cream: "#FBF9F5",
        paper: "#F4F1EB",
        line: { DEFAULT: "#ECE8E1", strong: "#D9D3C9", hover: "#B8B0A3" },
        mint: { DEFAULT: "#DCEFE4", hover: "#C7E3D3", ink: "#1F4D3A", soft: "#E6F2EA", wash: "#F1F7F3", pale: "#EEF6F1" },
        sage: "#8FC3A8",
        forest: { DEFAULT: "#3F7A5E", dark: "#2F5E48" },
        danger: "#B35A52",
        rose: "#D08A84",
        steel: "#4A6490",
        mist: "#E9EDF3",
        periwinkle: "#A9BCDD",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        pop: "0 16px 40px rgba(31,41,55,0.14)",
        toast: "0 12px 30px rgba(31,41,55,0.3)",
        drawer: "8px 0 30px rgba(31,41,55,0.2)",
      },
      keyframes: {
        "ud-pulse": {
          "0%": { boxShadow: "0 0 0 0 rgba(176,122,72,.5)" },
          "70%": { boxShadow: "0 0 0 10px rgba(176,122,72,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(176,122,72,0)" },
        },
        "ud-rec": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: ".35", transform: "scale(.8)" },
        },
      },
      animation: {
        "ud-pulse": "ud-pulse 1.8s infinite",
        "ud-rec": "ud-rec 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
