/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#127475', // Example blue color
          alt: '#F5DFBB',
          light: '#0E9594',
        },
        secondary: {
          DEFAULT: '#562C2C', // Example green color
          light: '#F5DFBB',
        },
        warning: {
          DEFAULT: '#F2542D', // Example yellow color
        }
      }
    },
  },
  plugins: [],
}

