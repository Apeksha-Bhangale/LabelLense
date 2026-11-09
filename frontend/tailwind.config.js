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
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#1b365d',
          900: '#0b1d3a',
          950: '#060f1f',
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        compliance: {
          pass: '#16a34a', // green
          passLight: '#dcfce7',
          passBorder: '#86efac',
          violation: '#dc2626', // red
          violationLight: '#fee2e2',
          violationBorder: '#fca5a5',
          review: '#d97706', // amber
          reviewLight: '#fef3c7',
          reviewBorder: '#fcd34d',
          na: '#64748b', // slate
          naLight: '#f1f5f9',
          naBorder: '#cbd5e1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
