import { ThemeConfig } from '../types/theme';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates the VIBELOK theme catalog against architectural requirements:
 * 1. Exactly 5 themes
 * 2. Exactly 20 default tracks per theme (100 total)
 * 3. Unique stable track IDs within each theme
 * 4. Non-empty titles and artists
 * 5. Valid YouTube video ID format (11 characters)
 * 6. Background image paths
 */
export function validateThemeCatalog(themes: ThemeConfig[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(themes)) {
    return { isValid: false, errors: ['Themes catalog must be an array'], warnings: [] };
  }

  if (themes.length !== 5) {
    errors.push(`Expected exactly 5 themes, but found ${themes.length}`);
  }

  const expectedThemeIds = ['90s-carvan', 'dil-tuta-aashiq', 'safar-e-car', 'shaadi-wala-ghar', 'mahaul-e-genz'];
  const presentThemeIds = new Set(themes.map((t) => t.id));

  for (const expId of expectedThemeIds) {
    if (!presentThemeIds.has(expId as any)) {
      errors.push(`Missing mandatory theme ID: "${expId}"`);
    }
  }

  themes.forEach((theme) => {
    if (!theme.name || theme.name.trim() === '') {
      errors.push(`Theme "${theme.id}" is missing a display name`);
    }

    if (!theme.backgroundImage) {
      errors.push(`Theme "${theme.id}" has no backgroundImage path configured`);
    }

    if (!Array.isArray(theme.defaultTracks)) {
      errors.push(`Theme "${theme.id}" defaultTracks must be an array`);
      return;
    }

    if (theme.defaultTracks.length !== 20) {
      errors.push(`Theme "${theme.id}" must have exactly 20 default tracks, found ${theme.defaultTracks.length}`);
    }

    const trackIds = new Set<string>();
    theme.defaultTracks.forEach((track, index) => {
      if (!track.id || track.id.trim() === '') {
        errors.push(`Theme "${theme.id}", track at index ${index} has empty ID`);
      } else if (trackIds.has(track.id)) {
        errors.push(`Theme "${theme.id}" has duplicate track ID: "${track.id}"`);
      } else {
        trackIds.add(track.id);
      }

      if (!track.title || track.title.trim() === '') {
        errors.push(`Theme "${theme.id}", track "${track.id}" has empty title`);
      }

      if (!track.artist || track.artist.trim() === '') {
        errors.push(`Theme "${theme.id}", track "${track.id}" has empty artist`);
      }

      if (track.youtubeVideoId) {
        // Standard YouTube video IDs are 11 alphanumeric and -_ characters
        const isValidYtId = /^[a-zA-Z0-9_-]{11}$/.test(track.youtubeVideoId);
        if (!isValidYtId) {
          warnings.push(`Theme "${theme.id}", track "${track.title}" has non-standard YouTube ID: "${track.youtubeVideoId}"`);
        }
      } else {
        warnings.push(`Theme "${theme.id}", track "${track.title}" has no video ID configured`);
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
