import { ThemeId, Track, PlaylistStorageData } from '../types/theme';

const STORAGE_VERSION = 1;
const PLAYLIST_KEY_PREFIX = `vibelok_playlist_v${STORAGE_VERSION}_`;
const ACTIVE_THEME_KEY = `vibelok_active_theme_v${STORAGE_VERSION}`;
const VOLUME_KEY = `vibelok_volume_v${STORAGE_VERSION}`;

/**
 * Loads the user's custom playlist for a theme, falling back safely to defaultTracks
 */
export function loadThemePlaylist(themeId: ThemeId, defaultTracks: Track[]): Track[] {
  if (typeof window === 'undefined') return defaultTracks;

  try {
    const raw = localStorage.getItem(`${PLAYLIST_KEY_PREFIX}${themeId}`);
    if (!raw) return defaultTracks;

    const parsed: PlaylistStorageData = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.tracks) || parsed.tracks.length === 0) {
      return defaultTracks;
    }

    // Validate that each track in loaded data has minimum valid fields
    const validTracks = parsed.tracks.filter(
      (t) => t && typeof t.id === 'string' && typeof t.title === 'string' && t.title.trim() !== ''
    );

    return validTracks.length > 0 ? validTracks : defaultTracks;
  } catch (e) {
    console.warn(`Failed to parse saved playlist for theme ${themeId}:`, e);
    return defaultTracks;
  }
}

/**
 * Persists the user's customized playlist for a theme
 */
export function saveThemePlaylist(themeId: ThemeId, tracks: Track[]): void {
  if (typeof window === 'undefined') return;

  try {
    const data: PlaylistStorageData = {
      version: STORAGE_VERSION,
      themeId,
      tracks,
      lastModified: Date.now(),
    };
    localStorage.setItem(`${PLAYLIST_KEY_PREFIX}${themeId}`, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save playlist for theme ${themeId} to localStorage:`, e);
  }
}

/**
 * Restores the theme's playlist back to the canonical default 20 tracks
 */
export function restoreThemePlaylist(themeId: ThemeId, defaultTracks: Track[]): Track[] {
  if (typeof window === 'undefined') return defaultTracks;

  try {
    localStorage.removeItem(`${PLAYLIST_KEY_PREFIX}${themeId}`);
  } catch (e) {
    console.error(`Failed to remove custom playlist for theme ${themeId}:`, e);
  }
  return [...defaultTracks];
}

/**
 * Checks if a theme's current playlist deviates from default tracks
 */
export function isPlaylistCustomized(currentTracks: Track[], defaultTracks: Track[]): boolean {
  if (currentTracks.length !== defaultTracks.length) return true;
  for (let i = 0; i < currentTracks.length; i++) {
    if (
      currentTracks[i].id !== defaultTracks[i].id ||
      currentTracks[i].youtubeVideoId !== defaultTracks[i].youtubeVideoId ||
      currentTracks[i].title !== defaultTracks[i].title
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Persists the user's active theme preference
 */
export function saveActiveThemeId(themeId: ThemeId | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (themeId) {
      localStorage.setItem(ACTIVE_THEME_KEY, themeId);
    } else {
      localStorage.removeItem(ACTIVE_THEME_KEY);
    }
  } catch (e) {
    console.warn('Failed to save active theme:', e);
  }
}

/**
 * Loads the user's previously selected theme
 */
export function loadActiveThemeId(): ThemeId | null {
  if (typeof window === 'undefined') return null;
  try {
    const val = localStorage.getItem(ACTIVE_THEME_KEY);
    return val as ThemeId | null;
  } catch {
    return null;
  }
}

/**
 * Persists the user's volume settings
 */
export function saveVolumeSettings(volume: number, isMuted: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VOLUME_KEY, JSON.stringify({ volume, isMuted }));
  } catch (e) {
    console.warn('Failed to save volume:', e);
  }
}

/**
 * Loads saved volume settings
 */
export function loadVolumeSettings(): { volume: number; isMuted: boolean } {
  if (typeof window === 'undefined') return { volume: 80, isMuted: false };
  try {
    const raw = localStorage.getItem(VOLUME_KEY);
    if (!raw) return { volume: 80, isMuted: false };
    const parsed = JSON.parse(raw);
    return {
      volume: typeof parsed.volume === 'number' ? Math.max(0, Math.min(100, parsed.volume)) : 80,
      isMuted: Boolean(parsed.isMuted),
    };
  } catch {
    return { volume: 80, isMuted: false };
  }
}
