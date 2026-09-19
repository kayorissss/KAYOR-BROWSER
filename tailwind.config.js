/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        kayor: {
          red: "#ff253a",
          dark: "#0a0a0f",
          glass: "rgba(255,255,255,0.08)"
        }
      },
      backdropBlur: {
        glass: "24px"
      },
      fontFamily: {
        sans: ["Inter","SF Pro Display","-apple-system","BlinkMacSystemFont","Segoe UI","sans-serif"],
        display: ["Manrope","Inter","sans-serif"]
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.12)",
        tab: "0 2px 12px rgba(0,0,0,0.18)"
      }
    }
  },
  plugins: []
}
