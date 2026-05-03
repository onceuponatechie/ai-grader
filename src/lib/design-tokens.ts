/**
 * Marka design tokens.
 *
 * Calm and confident: Linear / Notion / Vercel feel. Generous whitespace,
 * soft shadows, near-white surfaces. No saturated colors — this is a
 * working tool for teachers, not a marketing surface.
 *
 * Tailwind classes mirror these values via tailwind.config.js. Import from
 * here when a value is needed in TS (e.g. chart fills, inline styles).
 */

export const color = {
  canvas: '#FAFAFA',
  surface: '#FFFFFF',
  hairline: '#F0F0F0',

  border: {
    subtle: '#ECECEC',
    default: '#E4E4E4',
  },

  ink: {
    primary: '#0A0A0A',
    secondary: '#6B6B6B',
    tertiary: '#9B9B9B',
  },

  action: {
    primary: '#0A0A0A',
    primaryText: '#FFFFFF',
    primaryHover: '#1F1F1F',
  },

  // Muted, desaturated. Never harsh.
  status: {
    positive: '#4CAF7A',
    positiveSoft: '#E8F4ED',
    attention: '#E8A93B',
    attentionSoft: '#FBF1DE',
    problem: '#E26B5C',
    problemSoft: '#FBE8E4',
  },
} as const;

export const typography = {
  family: {
    sans: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },
  size: {
    display: '32px',
    h1: '24px',
    h2: '18px',
    body: '14px',
    small: '13px',
    label: '11px',
  },
  lineHeight: {
    tight: 1.2,
    body: 1.55,
    loose: 1.7,
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  letterSpacing: {
    label: '0.08em',
  },
} as const;

export const spacing = {
  sidebarWidth: 240,
  topbarHeight: 64,
  contentMaxWidth: 1200,
  contentPaddingX: 32,
  contentPaddingY: 28,
} as const;

export const radius = {
  control: 10,
  card: 14,
  pill: 999,
} as const;

export const shadow = {
  soft: '0 1px 2px rgba(10, 10, 10, 0.04), 0 1px 1px rgba(10, 10, 10, 0.02)',
  lift: '0 2px 8px rgba(10, 10, 10, 0.05), 0 1px 2px rgba(10, 10, 10, 0.03)',
} as const;

export const motion = {
  duration: {
    fast: '120ms',
    base: '180ms',
    slow: '260ms',
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0.0, 0.2, 1)',
  },
} as const;
