/**
 * Theme definitions for the application and Mermaid diagrams
 */

import { Theme } from '../types';

// Application themes
export const APP_THEMES: Record<Theme, { name: string; description: string }> = {
  light: {
    name: 'Light',
    description: 'Clean light theme with high contrast'
  },
  dark: {
    name: 'Dark', 
    description: 'Dark theme with reduced eye strain'
  },
  system: {
    name: 'System',
    description: 'Follow system preference'
  }
};

// Mermaid theme configurations
export const MERMAID_THEMES = {
  default: {
    name: 'Default',
    theme: 'default' as const,
    description: 'Standard Mermaid theme with blue accents'
  },
  neutral: {
    name: 'Neutral',
    theme: 'neutral' as const,
    description: 'Clean neutral theme with minimal colors'
  },
  dark: {
    name: 'Dark',
    theme: 'dark' as const,
    description: 'Dark theme optimized for dark mode'
  },
  forest: {
    name: 'Forest',
    theme: 'forest' as const,
    description: 'Green-themed color palette'
  },
  base: {
    name: 'Base',
    theme: 'base' as const,
    description: 'Minimal base theme for customization'
  }
};

// Color palettes for different themes
export const COLOR_PALETTES = {
  light: {
    primary: '#3b82f6',
    secondary: '#64748b',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    textSecondary: '#475569',
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  dark: {
    primary: '#60a5fa',
    secondary: '#94a3b8',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    border: '#334155',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171'
  }
};

// Monaco Editor themes
export const MONACO_THEMES = {
  light: 'vs',
  dark: 'vs-dark'
};

// Theme-specific Mermaid configurations
export const THEME_MERMAID_CONFIG = {
  light: {
    theme: 'default',
    themeVariables: {
      primaryColor: '#3b82f6',
      primaryTextColor: '#ffffff',
      primaryBorderColor: '#2563eb',
      lineColor: '#64748b',
      sectionBkgColor: '#f1f5f9',
      altSectionBkgColor: '#e2e8f0',
      gridColor: '#cbd5e1',
      cScale0: '#f1f5f9',
      cScale1: '#e2e8f0',
      cScale2: '#cbd5e1'
    }
  },
  dark: {
    theme: 'dark',
    themeVariables: {
      primaryColor: '#60a5fa',
      primaryTextColor: '#0f172a',
      primaryBorderColor: '#3b82f6',
      lineColor: '#94a3b8',
      sectionBkgColor: '#1e293b',
      altSectionBkgColor: '#334155',
      gridColor: '#475569',
      cScale0: '#1e293b',
      cScale1: '#334155',
      cScale2: '#475569'
    }
  }
};

// Default application settings
export const DEFAULT_SETTINGS = {
  theme: 'system' as Theme,
  fontSize: 14,
  showLineNumbers: true,
  wordWrap: true,
  minimap: false,
  mermaidTheme: 'default'
};

// CSS custom properties for dynamic theming
export const CSS_VARIABLES = {
  light: {
    '--color-primary': COLOR_PALETTES.light.primary,
    '--color-secondary': COLOR_PALETTES.light.secondary,
    '--color-background': COLOR_PALETTES.light.background,
    '--color-surface': COLOR_PALETTES.light.surface,
    '--color-text': COLOR_PALETTES.light.text,
    '--color-text-secondary': COLOR_PALETTES.light.textSecondary,
    '--color-border': COLOR_PALETTES.light.border,
    '--color-success': COLOR_PALETTES.light.success,
    '--color-warning': COLOR_PALETTES.light.warning,
    '--color-error': COLOR_PALETTES.light.error
  },
  dark: {
    '--color-primary': COLOR_PALETTES.dark.primary,
    '--color-secondary': COLOR_PALETTES.dark.secondary,
    '--color-background': COLOR_PALETTES.dark.background,
    '--color-surface': COLOR_PALETTES.dark.surface,
    '--color-text': COLOR_PALETTES.dark.text,
    '--color-text-secondary': COLOR_PALETTES.dark.textSecondary,
    '--color-border': COLOR_PALETTES.dark.border,
    '--color-success': COLOR_PALETTES.dark.success,
    '--color-warning': COLOR_PALETTES.dark.warning,
    '--color-error': COLOR_PALETTES.dark.error
  }
};

// Theme utility functions
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function resolveTheme(theme: Theme): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme;
}

export function applyTheme(theme: 'light' | 'dark'): void {
  const root = document.documentElement;
  const variables = CSS_VARIABLES[theme];
  
  Object.entries(variables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
  
  // Update body class for CSS-based theming
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(theme);
}