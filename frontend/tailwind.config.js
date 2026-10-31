/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Added brand colors required by the updated pages
        navy: {
          50: '#e9edf7',
          100: '#c9d2ee',
          200: '#9aaadf',
          300: '#6a80cf',
          400: '#435fbe',
          500: '#2a47a6',
          600: '#223a86',
          700: '#1a2d69',
          800: '#152554',
          900: '#0e1a3b',
        },
        accent: {
          50: '#fff9e6',
          100: '#ffefbf',
          200: '#ffe491',
          300: '#ffd85e',
          400: '#ffcd36',
          500: '#ffc107',
          600: '#e0a400',
          700: '#b37f00',
          800: '#8a6100',
          900: '#5c4000',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}