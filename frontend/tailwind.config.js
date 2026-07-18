/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        asphalt: {
          950: '#020617', // Slate 950
          900: '#0F172A', // Slate 900
          800: '#1E293B', // Slate 800 (Deep Charcoal)
          700: '#334155', // Slate 700
          600: '#475569', // Slate 600
          500: '#64748B', // Slate 500 (Slate-grey)
          400: '#94A3B8'  // Slate 400
        },
        concrete: {
          50: '#F8FAFC',  // Slate 50 (Soft off-white)
          100: '#F1F5F9', // Slate 100
          200: '#E2E8F0'  // Slate 200
        },
        marking: {
          DEFAULT: '#4DB6AC', // Mint-Teal
          dim: '#26A69A'
        },
        severity: {
          low: '#4DB6AC',    // Mint-Teal
          medium: '#FFB74D', // Soft Amber
          high: '#FA7052'    // Coral/Peach
        },
        brand: {
          primary: '#4DB6AC', // Mint-Teal
          secondary: '#FA7052'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        panel: '0 2px 8px -2px rgba(15, 23, 42, 0.05), 0 4px 12px -2px rgba(15, 23, 42, 0.05)',
      },
      backgroundImage: {
        'road-dash': 'repeating-linear-gradient(90deg, currentColor 0, currentColor 14px, transparent 14px, transparent 26px)',
      }
    }
  },
  plugins: []
}
