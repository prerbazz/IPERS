/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          dark: '#0a192f',     // Root background
          card: '#112240',     // Card background
          border: '#1b2f4f',   // High-contrast borders
          hover: '#1d3557',    // Focus/Hover states
          light: '#233554',    // Muted headers and elements
        },
        teal: {
          accent: '#64ffda',   // Vibrant glow teal for key accents
          hover: '#0d9488',    // Standard teal hover
          main: '#0f766e',     // Core brand color
          light: '#ccfbf1',    // Success background alerts
        },
        gold: {
          main: '#d97706',     // Core brand highlight
          accent: '#f59e0b',   // Bright amber highlights
          light: '#fde68a',    // Warning background alerts
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
