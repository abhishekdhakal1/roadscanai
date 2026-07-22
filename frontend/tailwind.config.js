/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Legacy aliases kept for components still referencing them.
        asphalt: {
          950: '#020617',
          900: '#0F172A', // Text primary
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
          500: '#64748B', // Text secondary
          400: '#94A3B8'
        },
        concrete: {
          50: '#F8FAFC',  // App background
          100: '#F1F5F9', // Hover
          200: '#E2E8F0'  // Border
        },
        marking: {
          DEFAULT: '#2563EB',
          dim: '#1D4ED8'
        },
        severity: {
          low: '#22C55E',
          medium: '#F59E0B',
          high: '#EF4444'
        },
        brand: {
          primary: '#2563EB',
          secondary: '#EF4444'
        },
        // New semantic design tokens
        surface: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          hover: '#F1F5F9'
        },
        primary: {
          DEFAULT: '#2563EB',
          50: '#EFF6FF',
          100: '#DBEAFE',
          600: '#2563EB',
          700: '#1D4ED8'
        },
        success: {
          DEFAULT: '#22C55E',
          50: '#F0FDF4'
        },
        warning: {
          DEFAULT: '#F59E0B',
          50: '#FFFBEB'
        },
        danger: {
          DEFAULT: '#EF4444',
          50: '#FEF2F2'
        },
        text: {
          primary: '#0F172A',
          secondary: '#64748B'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"Plus Jakarta Sans"', 'sans-serif']
      },
      spacing: {
        4.5: '1.125rem'
      },
      borderRadius: {
        md: '10px',
        lg: '14px',
        xl: '16px',
        '2xl': '18px'
      },
      boxShadow: {
        panel: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -8px rgba(15, 23, 42, 0.08)',
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 2px 8px -2px rgba(15, 23, 42, 0.06)',
        'card-hover': '0 4px 12px -2px rgba(15, 23, 42, 0.10), 0 8px 24px -8px rgba(15, 23, 42, 0.10)',
        nav: '0 1px 0 rgba(15, 23, 42, 0.04)'
      },
      transitionDuration: {
        150: '150ms',
        200: '200ms'
      }
    }
  },
  plugins: []
}
