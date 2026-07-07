/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Base surfaces — near-black, slightly cool (terminal glass, not pure #000)
        base: {
          950: '#0A0C10',
          900: '#0D1016',
          800: '#12151C',
          700: '#181C24',
          600: '#232833',
          500: '#2E3440',
        },
        // Text
        ink: {
          100: '#EDEFF2',
          300: '#C3C9D3',
          500: '#8A93A3',
          700: '#5B6473',
        },
        // Brand accent — signal teal, used sparingly (links, active states, brand mark)
        signal: {
          400: '#3FE8CB',
          500: '#1FD1B8',
          600: '#16A896',
        },
        // Data semantics
        gain: {
          500: '#2ECC71',
          400: '#4ADE80',
        },
        loss: {
          500: '#FF5C5C',
          400: '#FF7A7A',
        },
        warn: {
          500: '#F5A623',
        },
        // Segment rail colors — one per FII segment, used as consistent tags everywhere
        segment: {
          logistico: '#3FA7D6',
          shopping: '#F2B134',
          escritorios: '#7B61FF',
          papel: '#1FD1B8',
          fof: '#C77DFF',
          hibrido: '#FF8FA3',
          agro: '#8BC34A',
          hospitalar: '#FF6F61',
          educacional: '#FFC857',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'slide-up': { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.25s ease-out',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
}
