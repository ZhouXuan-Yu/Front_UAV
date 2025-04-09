/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'skydio-blue': '#0066CC',
        'skydio-dark': '#2e2d3f',
        'skydio-light': '#fafafa',
      },
      fontFamily: {
        'case': ['Case', 'sans-serif'],
        'sans': ['Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
