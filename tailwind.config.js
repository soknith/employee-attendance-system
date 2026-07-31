/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf6ff',
          100: '#f8eef9',
          200: '#f0d9f2',
          300: '#e3bce6',
          400: '#c98fcc',
          500: '#935073',
          600: '#935073',
          700: '#7a3f61',
          800: '#502D55',
          900: '#3a1f3e',
          950: '#2a1430',
        },
        dusk: {
          light:  '#F8F4E9',
          cream:  '#F6DBC0',
          rose:   '#935073',
          deep:   '#502D55',
          darker: '#3a1f3e',
          bg:     '#2e1a32',
        },
      },
    },
  },
  plugins: [],
};
