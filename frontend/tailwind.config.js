/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#5AB4C5',
        secondary: '#F5BA4B',
        'seat-available': '#76A732',
        'seat-full': '#ADB8BE',
        'seat-unknown': '#FFFFFF',
        'seat-unknown-border': '#91A0A8'
      },
      boxShadow: {
        map: '0 4px 12px rgba(0, 0, 0, 0.15)',
        card: '0 4px 20px rgba(11, 13, 14, 0.1)',
        sheet: '0 -4px 24px rgba(11, 13, 14, 0.12)'
      }
    }
  },
  plugins: []
};
