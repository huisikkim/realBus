/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: { 
          DEFAULT: "#2563EB", 
          light: "#3B82F6", 
          dark: "#1E40AF" 
        },
        "safe-green": "#059669",
        "action-red": "#E11D48",
      },
      fontFamily: {
        sans: ["Noto Sans KR", "sans-serif"],
      },
      borderRadius: {
        large: "1.25rem",
      },
    },
  },
  plugins: [],
}
