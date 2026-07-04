/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        asphalt: {
          950: '#14181A',
          900: '#1C2226',
          800: '#262E32',
          700: '#333D42',
          600: '#48555B',
          500: '#5B6560',
          400: '#7C8681'
        },
        concrete: {
          50: '#F6F7F5',
          100: '#EEF0ED',
          200: '#E1E4DF'
        },
        marking: {
          DEFAULT: '#FFC93C',
          dim: '#B58F27'
        },
        severity: {
          low: '#4C9A6A',
          medium: '#E0A030',
          high: '#D1483B'
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        panel: '0 1px 2px rgba(20,24,26,0.06), 0 8px 24px -12px rgba(20,24,26,0.15)'
      },
      backgroundImage: {
        'road-dash': 'repeating-linear-gradient(90deg, currentColor 0, currentColor 14px, transparent 14px, transparent 26px)'
      }
    }
  },
  plugins: []
}
