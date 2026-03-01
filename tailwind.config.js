/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-purple-dark': '#3a2561',
        'brand-purple': '#503b76',
        'brand-green': '#2ebf91',
        'brand-bg': '#190032',
        'brand-card': '#190032',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
