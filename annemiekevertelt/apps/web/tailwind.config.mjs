/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FDF6E9',
          dark: '#F5ECD8',
        },
        'warm-brown': '#8B7355',
        gold: {
          DEFAULT: '#C4A77D',
          light: '#D4B88D',
        },
        'dark-brown': '#4A4036',
        'text-muted': '#6B5E4F',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Source Sans 3', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
