/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { THEMES } from './data/themes';
import { ThemeId, ThemeConfig } from './types/theme';
import { ThemeSelector } from './components/ThemeSelector';
import { ImmersiveTheme } from './components/ImmersiveTheme';
import { validateThemeCatalog } from './lib/validation';
import { loadActiveThemeId, saveActiveThemeId } from './lib/storage';

export default function App() {
  const [activeThemeId, setActiveThemeId] = useState<ThemeId | null>(() => {
    // Check URL hash first (e.g. #90s-carvan)
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      const matched = THEMES.find((t) => t.id === hash);
      if (matched) return matched.id;
    }
    // Check localStorage
    return loadActiveThemeId();
  });

  // Run development-time schema validation
  useEffect(() => {
    const result = validateThemeCatalog(THEMES);
    if (!result.isValid) {
      console.error('VIBELOK Catalog Validation Errors:', result.errors);
    }
    if (result.warnings.length > 0) {
      console.warn('VIBELOK Catalog Validation Warnings:', result.warnings);
    }
  }, []);

  // Handle browser back/forward history navigation
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '');
      const matched = THEMES.find((t) => t.id === hash);
      if (matched) {
        setActiveThemeId(matched.id);
      } else {
        setActiveThemeId(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync hash and storage when theme changes
  const handleSelectTheme = (themeId: ThemeId) => {
    setActiveThemeId(themeId);
    saveActiveThemeId(themeId);
    window.location.hash = `#${themeId}`;
  };

  const handleReturnToHome = () => {
    setActiveThemeId(null);
    saveActiveThemeId(null);
    if (window.location.hash) {
      history.pushState(null, '', window.location.pathname);
    }
  };

  const currentTheme: ThemeConfig | undefined = useMemo(() => {
    return THEMES.find((t) => t.id === activeThemeId);
  }, [activeThemeId]);

  return (
    <div className="w-full h-full min-h-screen bg-black text-white">
      {currentTheme ? (
        <ImmersiveTheme
          theme={currentTheme}
          onSelectTheme={handleSelectTheme}
          onReturnToHome={handleReturnToHome}
        />
      ) : (
        <ThemeSelector onSelectTheme={handleSelectTheme} />
      )}
    </div>
  );
}
