import { useEffect, useState, useCallback } from 'react';

/**
 * Hook per gestire il tema chiaro/scuro.
 *
 * - Persiste la scelta in localStorage sotto la chiave 'pedicalc-theme'
 * - Al primo avvio rispetta la preferenza del sistema operativo
 * - Applica/rimuove la classe `dark` sull'elemento <html> (strategia Tailwind)
 */

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'pedicalc-theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return [theme, toggle];
}
