/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f2f3',
          100: '#cce5e7',
          200: '#99cbcf',
          300: '#66b1b7',
          400: '#33979f',
          500: '#007074',
          600: '#034C53',
          700: '#005a5d',
          800: '#023d43',
          900: '#012e32',
        },
        accent: {
          50: '#fef7f5',
          100: '#fdeee9',
          200: '#fbddd4',
          300: '#f9ccbe',
          400: '#00674F',
          500: '#ee8767ed',
          600: '#f0755f',
          700: '#ed5e45',
          800: '#ea472b',
          900: '#e73011',
        },
        sage: {
          50: '#f6f8f4',
          100: '#e8f0e3',
          400: '#a5c087',
          500: '#87a96b',
          600: '#6d8a54',
          700: '#557043',
        },
        gray: {
          50: '#f8f9fa',
          100: '#f1f3f4',
          200: '#e8eaed',
          300: '#dadce0',
          400: '#9aa0a6',
          500: '#5f6368',
          600: '#3c4043',
          700: '#202124',
          800: '#171717',
          900: '#0f0f0f',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px 0 rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 16px 0 rgba(0, 0, 0, 0.12)',
        'strong': '0 8px 24px 0 rgba(0, 0, 0, 0.16)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
