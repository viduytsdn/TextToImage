export const defaultTheme = {
  colors: {
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#111827',
    mutedText: '#6b7280',
    primary: '#6366f1',
    onPrimary: '#f9fafb',
    border: '#e5e7eb',
  },
  layout: {
    maxWidth: '1080px',
  },
  spacing: (factor: number) => `${0.25 * factor}rem`,
  shadows: {
    soft: '0 10px 30px -20px rgba(15, 23, 42, 0.45)',
  },
} as const

export type AppTheme = typeof defaultTheme
