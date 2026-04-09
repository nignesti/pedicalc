/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eff8ff",
          100: "#dbeefe",
          200: "#bfe0fe",
          300: "#93cdfd",
          400: "#60b0fa",
          500: "#3b8ff6",
          600: "#2571eb",
          700: "#1e5cd8",
          800: "#1f4baf",
          900: "#1f4289",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
