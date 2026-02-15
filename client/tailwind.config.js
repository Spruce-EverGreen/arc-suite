/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#007da5',
        'primary-dark': '#005f7f',
      },
    },
  },
  plugins: [],
}
