/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mabbaca: {
          primary: '#075E54',
          'primary-dark': '#05473F',
          'primary-light': '#0B7F72',
          secondary: '#0F766E',
          'secondary-text': '#66736D',
          soft: '#E8F3EF',
          bg: '#F8FAF8',
          surface: '#FFFFFF',
          text: '#17211D',
          muted: '#66736D',
          border: '#E2E8E5',
          accent: '#10B981',
          'accent-dark': '#059669',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
        editorial: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(7, 94, 84, 0.05)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 10px 25px rgba(7, 94, 84, 0.08)',
      }
    },
  },
  plugins: [],
}
