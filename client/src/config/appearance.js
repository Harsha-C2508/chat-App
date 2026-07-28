export const STORAGE_KEYS = {
  theme: 'halo-theme',
  font: 'halo-font',
};

export const THEMES = {
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    preview: ['#1e1e2e', '#5b7cf6', '#252535'],
    vars: {
      '--color-bg-base': '#1e1e2e',
      '--color-bg-page': '#111118',
      '--color-bg-elevated': '#252535',
      '--color-bg-input': '#252535',
      '--color-bg-muted': '#2a2a3e',
      '--color-bg-hover': '#2e2e45',
      '--color-border': '#2e2e42',
      '--color-border-strong': '#3a3a55',
      '--color-text-primary': '#f0f0f5',
      '--color-text-secondary': '#d1d5db',
      '--color-text-muted': '#9ca3af',
      '--color-text-faint': '#6b7280',
      '--color-accent': '#5b7cf6',
      '--color-accent-soft': 'rgba(91, 124, 246, 0.15)',
      '--color-online': '#10b981',
      '--color-danger': '#f43f5e',
      '--color-bubble-other': '#2a2a3e',
      '--color-bubble-mine': '#5b7cf6',
      '--color-bubble-mine-text': '#ffffff',
      '--color-bubble-other-text': '#e5e7eb',
      '--color-shadow': 'rgba(0, 0, 0, 0.6)',
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    preview: ['#0c1929', '#0ea5e9', '#132337'],
    vars: {
      '--color-bg-base': '#0c1929',
      '--color-bg-page': '#071018',
      '--color-bg-elevated': '#132337',
      '--color-bg-input': '#132337',
      '--color-bg-muted': '#1a3050',
      '--color-bg-hover': '#1e3a5f',
      '--color-border': '#1e3a5f',
      '--color-border-strong': '#2a5080',
      '--color-text-primary': '#e0f2fe',
      '--color-text-secondary': '#bae6fd',
      '--color-text-muted': '#7dd3fc',
      '--color-text-faint': '#64748b',
      '--color-accent': '#0ea5e9',
      '--color-accent-soft': 'rgba(14, 165, 233, 0.18)',
      '--color-online': '#34d399',
      '--color-danger': '#f87171',
      '--color-bubble-other': '#1a3050',
      '--color-bubble-mine': '#0284c7',
      '--color-bubble-mine-text': '#ffffff',
      '--color-bubble-other-text': '#e0f2fe',
      '--color-shadow': 'rgba(0, 20, 40, 0.7)',
    },
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    preview: ['#0d1f17', '#10b981', '#152820'],
    vars: {
      '--color-bg-base': '#0d1f17',
      '--color-bg-page': '#071510',
      '--color-bg-elevated': '#152820',
      '--color-bg-input': '#152820',
      '--color-bg-muted': '#1a3328',
      '--color-bg-hover': '#1f3d30',
      '--color-border': '#1f3d30',
      '--color-border-strong': '#2d5a45',
      '--color-text-primary': '#ecfdf5',
      '--color-text-secondary': '#a7f3d0',
      '--color-text-muted': '#6ee7b7',
      '--color-text-faint': '#64748b',
      '--color-accent': '#10b981',
      '--color-accent-soft': 'rgba(16, 185, 129, 0.18)',
      '--color-online': '#34d399',
      '--color-danger': '#f87171',
      '--color-bubble-other': '#1a3328',
      '--color-bubble-mine': '#059669',
      '--color-bubble-mine-text': '#ffffff',
      '--color-bubble-other-text': '#ecfdf5',
      '--color-shadow': 'rgba(0, 20, 10, 0.7)',
    },
  },
  rose: {
    id: 'rose',
    name: 'Rose',
    preview: ['#1a1220', '#ec4899', '#2a1f35'],
    vars: {
      '--color-bg-base': '#1a1220',
      '--color-bg-page': '#110a18',
      '--color-bg-elevated': '#2a1f35',
      '--color-bg-input': '#2a1f35',
      '--color-bg-muted': '#352845',
      '--color-bg-hover': '#3d3050',
      '--color-border': '#3d3050',
      '--color-border-strong': '#5a4570',
      '--color-text-primary': '#fdf2f8',
      '--color-text-secondary': '#f9a8d4',
      '--color-text-muted': '#d8b4fe',
      '--color-text-faint': '#9ca3af',
      '--color-accent': '#ec4899',
      '--color-accent-soft': 'rgba(236, 72, 153, 0.18)',
      '--color-online': '#34d399',
      '--color-danger': '#f87171',
      '--color-bubble-other': '#352845',
      '--color-bubble-mine': '#db2777',
      '--color-bubble-mine-text': '#ffffff',
      '--color-bubble-other-text': '#fdf2f8',
      '--color-shadow': 'rgba(20, 0, 30, 0.7)',
    },
  },
  light: {
    id: 'light',
    name: 'Light',
    preview: ['#f3f4f6', '#5b7cf6', '#ffffff'],
    vars: {
      '--color-bg-base': '#f3f4f6',
      '--color-bg-page': '#e5e7eb',
      '--color-bg-elevated': '#ffffff',
      '--color-bg-input': '#ffffff',
      '--color-bg-muted': '#e5e7eb',
      '--color-bg-hover': '#e0e7ff',
      '--color-border': '#d1d5db',
      '--color-border-strong': '#9ca3af',
      '--color-text-primary': '#111827',
      '--color-text-secondary': '#374151',
      '--color-text-muted': '#6b7280',
      '--color-text-faint': '#9ca3af',
      '--color-accent': '#5b7cf6',
      '--color-accent-soft': 'rgba(91, 124, 246, 0.12)',
      '--color-online': '#059669',
      '--color-danger': '#dc2626',
      '--color-bubble-other': '#ffffff',
      '--color-bubble-mine': '#5b7cf6',
      '--color-bubble-mine-text': '#ffffff',
      '--color-bubble-other-text': '#111827',
      '--color-shadow': 'rgba(0, 0, 0, 0.12)',
    },
  },
};

export const FONTS = {
  inter: {
    id: 'inter',
    name: 'Inter',
    family: "'Inter', system-ui, sans-serif",
  },
  poppins: {
    id: 'poppins',
    name: 'Poppins',
    family: "'Poppins', system-ui, sans-serif",
  },
  roboto: {
    id: 'roboto',
    name: 'Roboto',
    family: "'Roboto', system-ui, sans-serif",
  },
  dmSans: {
    id: 'dmSans',
    name: 'DM Sans',
    family: "'DM Sans', system-ui, sans-serif",
  },
  nunito: {
    id: 'nunito',
    name: 'Nunito',
    family: "'Nunito', system-ui, sans-serif",
  },
  sourceSans: {
    id: 'sourceSans',
    name: 'Source Sans 3',
    family: "'Source Sans 3', system-ui, sans-serif",
  },
};

export const DEFAULT_THEME = 'midnight';
export const DEFAULT_FONT = 'inter';

export const applyAppearance = (themeId, fontId) => {
  const theme = THEMES[themeId] || THEMES[DEFAULT_THEME];
  const font = FONTS[fontId] || FONTS[DEFAULT_FONT];
  const root = document.documentElement;

  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  root.style.setProperty('--font-family', font.family);
  root.setAttribute('data-theme', theme.id);
  root.style.fontFamily = font.family;
};

export const loadStoredAppearance = () => {
  const themeId = localStorage.getItem(STORAGE_KEYS.theme) || DEFAULT_THEME;
  const fontId = localStorage.getItem(STORAGE_KEYS.font) || DEFAULT_FONT;
  return {
    themeId: THEMES[themeId] ? themeId : DEFAULT_THEME,
    fontId: FONTS[fontId] ? fontId : DEFAULT_FONT,
  };
};
