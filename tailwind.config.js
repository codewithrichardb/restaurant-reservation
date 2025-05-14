/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8f5f2',
          100: '#f1ece5',
          200: '#e3d9cc',
          300: '#d5c6b3',
          400: '#c7b39a',
          500: '#b9a081',
          600: '#a08d68',
          700: '#876a4f',
          800: '#6e4736',
          900: '#55241d',
        },
        accent: {
          50: '#f2f8f5',
          100: '#e5f1ec',
          200: '#cce3d9',
          300: '#b3d5c6',
          400: '#9ac7b3',
          500: '#81b9a0',
          600: '#68a08d',
          700: '#4f876a',
          800: '#366e47',
          900: '#1d5524',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'],
      },
    },
  },
  plugins: [],
}
