/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#FAFAFA',
        surface: '#FFFFFF',
        hairline: '#F0F0F0',
        border: {
          subtle: '#ECECEC',
          DEFAULT: '#E4E4E4',
        },
        ink: {
          DEFAULT: '#0A0A0A',
          secondary: '#6B6B6B',
          tertiary: '#9B9B9B',
        },
        positive: '#4CAF7A',
        attention: '#E8A93B',
        problem: '#E26B5C',
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      fontSize: {
        'label': ['11px', { lineHeight: '1.2', letterSpacing: '0.08em' }],
      },
      borderRadius: {
        card: '14px',
        control: '10px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(10, 10, 10, 0.04), 0 1px 1px rgba(10, 10, 10, 0.02)',
        lift: '0 2px 8px rgba(10, 10, 10, 0.05), 0 1px 2px rgba(10, 10, 10, 0.03)',
      },
      maxWidth: {
        content: '1200px',
      },
    },
  },
  plugins: [],
};
