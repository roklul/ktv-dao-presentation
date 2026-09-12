import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["'LXGW WenKai TC'", "'BiauKai'", "'DFKai-SB'", "'TW-Kai'", "'STKaiti'", "'KaiTi'", "'Noto Serif TC'", "serif"],
        "en-classic": ["'EB Garamond'", "'Times New Roman'", "'Libre Baskerville'", "Georgia", "serif"],
        "cn-kaiti": ["'LXGW WenKai TC'", "'BiauKai'", "'DFKai-SB'", "'TW-Kai'", "'STKaiti'", "'KaiTi'", "'Noto Serif TC'", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
