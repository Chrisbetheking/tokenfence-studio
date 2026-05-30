import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 18px 45px rgba(15,23,42,.08)"
      }
    }
  },
  plugins: []
};

export default config;
