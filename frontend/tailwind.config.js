/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable dark mode with class strategy
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sandy Serenity Palette - Light Mode
        cream: '#f1e6b2',
        sand: '#e2c68a',
        serria: '#d4a54e',
        marigold: '#c48f2b',
        copper: '#a8752f',
        dallas: '#7a5d2c',
        judge: '#4f3f2e',
        thunder: '#2e292b',
        
        // Sandy Serenity Palette - Dark Mode
        'dark-bg': '#1c1610',
        'dark-bg2': '#241e14',
        'dark-bg3': '#2e2718',
        'dark-surface': '#2e292b',
        'dark-border': '#4f3f2e',
        'dark-text': '#f1e6b2',
        'dark-text2': '#e2c68a',
        'dark-text3': '#d4a54e',
        'dark-accent': '#d4a54e',
        'dark-accent2': '#c48f2b',
        
        // USSD Colors
        'ussd-bg': '#1a1208',
        'ussd-screen': '#0e0c08',
        'ussd-dim': '#7a5d2c',
        
        // Aliases
        harvest: '#c48f2b',
        soil: '#2e292b',
        surface: '#ffffff',
      },
    },
  },
  plugins: [],
}