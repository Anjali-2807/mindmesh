/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#0f172a',
        'brand-accent': '#6366f1',
        'brand-soft': '#e2e8f0'
      }
    },
  },
  plugins: [],
}