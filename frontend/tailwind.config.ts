import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#0f5c9e", dark: "#0a3d6b", light: "#e6f0f9" },
        accent: { DEFAULT: "#0f9e6e" },
        danger: { DEFAULT: "#c62828" },
        warning: { DEFAULT: "#e6a817" },
      },
    },
  },
  plugins: [],
};
export default config;
