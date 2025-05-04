/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // You can define custom colors for dark/light mode here
      },
      animation: {
        // Add any custom animations here
      },
    },
  },
  plugins: [],
}