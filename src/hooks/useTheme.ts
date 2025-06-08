import { useEffect, useCallback } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { Theme } from '../types';
import { resolveTheme, applyTheme, getSystemTheme } from '../constants/themes';

/**
 * Custom hook for managing application theme
 */
export function useTheme() {
  const { settings, updateSettings } = useSettingsStore();
  const currentTheme = settings.theme;

  // Get the resolved theme (converts 'system' to actual theme)
  const resolvedTheme = resolveTheme(currentTheme);

  // Set theme
  const setTheme = useCallback((theme: Theme) => {
    updateSettings({ theme });
  }, [updateSettings]);

  // Toggle between light and dark (ignores system)
  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  // Apply theme to DOM
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  // Listen for system theme changes when theme is set to 'system'
  useEffect(() => {
    if (currentTheme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      const systemTheme = getSystemTheme();
      applyTheme(systemTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [currentTheme]);

  return {
    theme: currentTheme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isLight: resolvedTheme === 'light',
    isDark: resolvedTheme === 'dark',
    isSystem: currentTheme === 'system'
  };
}

/**
 * Hook for managing theme-specific CSS classes
 */
export function useThemeClasses() {
  const { resolvedTheme } = useTheme();

  const getThemeClass = useCallback((lightClass: string, darkClass: string) => {
    return resolvedTheme === 'light' ? lightClass : darkClass;
  }, [resolvedTheme]);

  const getConditionalClass = useCallback((className: string, condition: 'light' | 'dark' | 'both' = 'both') => {
    if (condition === 'both') return className;
    return condition === resolvedTheme ? className : '';
  }, [resolvedTheme]);

  return {
    themeClass: resolvedTheme,
    getThemeClass,
    getConditionalClass,
    // Common theme-based classes
    bgClass: getThemeClass('bg-white', 'bg-gray-900'),
    textClass: getThemeClass('text-gray-900', 'text-gray-100'),
    borderClass: getThemeClass('border-gray-200', 'border-gray-700'),
    surfaceClass: getThemeClass('bg-gray-50', 'bg-gray-800')
  };
}

/**
 * Hook for managing Mermaid theme based on app theme
 */
export function useMermaidTheme() {
  const { resolvedTheme } = useTheme();

  const getMermaidTheme = useCallback(() => {
    return resolvedTheme === 'light' ? 'default' : 'dark';
  }, [resolvedTheme]);

  const getMermaidConfig = useCallback(() => {
    const baseConfig = {
      startOnLoad: false,
      securityLevel: 'loose' as const,
      theme: getMermaidTheme(),
      fontFamily: 'Inter, system-ui, sans-serif'
    };

    // Add theme-specific variables
    if (resolvedTheme === 'dark') {
      return {
        ...baseConfig,
        themeVariables: {
          primaryColor: '#60a5fa',
          primaryTextColor: '#0f172a',
          primaryBorderColor: '#3b82f6',
          lineColor: '#94a3b8',
          sectionBkgColor: '#1e293b',
          altSectionBkgColor: '#334155',
          gridColor: '#475569'
        }
      };
    }

    return {
      ...baseConfig,
      themeVariables: {
        primaryColor: '#3b82f6',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#2563eb',
        lineColor: '#64748b',
        sectionBkgColor: '#f1f5f9',
        altSectionBkgColor: '#e2e8f0',
        gridColor: '#cbd5e1'
      }
    };
  }, [resolvedTheme, getMermaidTheme]);

  return {
    mermaidTheme: getMermaidTheme(),
    mermaidConfig: getMermaidConfig()
  };
}