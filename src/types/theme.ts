/**
 * VIBELOK Theme and Music Player Type Definitions
 */

export interface Track {
  id: string;
  title: string;
  artist: string;
  youtubeVideoId: string;
  year?: string;
  source?: 'curated' | 'user';
  notes?: string;
}

export type ThemeId = 
  | '90s-carvan'
  | 'dil-tuta-aashiq'
  | 'safar-e-car'
  | 'shaadi-wala-ghar'
  | 'mahaul-e-genz';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  hindiName?: string;
  tagline: string;
  description: string;
  backgroundImage: string;
  fallbackImage?: string;
  themeColor: string; // Hex for UI accent
  themeColorRgb: string; // RGB tuple e.g. "234, 179, 8"
  overlayGradient: string;
  accentBadge: string;
  defaultTracks: Track[];
}

export interface PlayerState {
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number; // 0 to 100
  isMuted: boolean;
  currentTrackIndex: number;
  error: string | null;
  isVideoVisible: boolean;
  autoplayBlocked: boolean;
}

export interface PlaylistStorageData {
  version: number;
  themeId: ThemeId;
  tracks: Track[];
  lastModified: number;
}
