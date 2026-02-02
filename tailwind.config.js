/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lila: '#9D4EDD',
        celeste: '#3A86FF',
        lilaClaro: '#E0AAFF',
        celesteClaro: '#90E0FF',
      }
    },
  },
  plugins: [],
}
