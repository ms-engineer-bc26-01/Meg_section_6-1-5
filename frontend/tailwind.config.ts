import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2C4A3E",
        accent: "#7CB9A0",
        light: "#F5F0E8",
        dark: "#1A1A1A",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-noto-serif-jp)", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
