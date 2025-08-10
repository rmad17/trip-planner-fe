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
          50: '#f0f4f8',
          100: '#d9e2ec',
          500: '#6c7b95',
          600: '#1a2332',
          700: '#151b26',
          800: '#0f141a',
          900: '#0a0e13',
        },
        accent: {
          50: '#fef9e7',
          100: '#fef3c7',
          400: '#fbbf24',
          500: '#d4af37',
          600: '#b8941f',
          700: '#9c7a08',
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