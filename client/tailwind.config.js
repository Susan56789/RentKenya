module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a1a1a',  // Rich black
          light: '#2d2d2d',    // Lighter black for hover states
          dark: '#000000',     // Pure black for accents
        },
        accent: {
          DEFAULT: '#FFD700',  // Gold
          light: '#FFE55C',    // Lighter gold for hover states
          dark: '#B7980B',     // Darker gold for contrast
        },
        white: {
          DEFAULT: '#FFFFFF',
          off: '#F5F5F5',      // Off-white for backgrounds
          warm: '#FAFAFA',     // Warm white for cards
        }
      }
    }
  },
  plugins: [],
}