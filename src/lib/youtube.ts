/**
 * YouTube IFrame API helper utilities for VIBELOK
 */

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

/**
 * Extracts a valid 11-character YouTube video ID from various URL formats or raw ID input
 */
export function extractYouTubeVideoId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // If user pasted a clean 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Common YouTube URL patterns
  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/i,
    /^[a-zA-Z0-9_-]{11}$/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  try {
    const url = new URL(trimmed);
    if (url.hostname.includes('youtube.com')) {
      const v = url.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
        return v;
      }
    }
  } catch {
    // Not a valid URL
  }

  return null;
}

let ytApiPromise: Promise<typeof window.YT> | null = null;

/**
 * Loads the YouTube IFrame Player API script singleton
 */
export function loadYouTubeIFrameAPI(): Promise<typeof window.YT> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window not available'));
  }

  if (window.YT && window.YT.Player) {
    return Promise.resolve(window.YT);
  }

  if (ytApiPromise) {
    return ytApiPromise;
  }

  ytApiPromise = new Promise((resolve, reject) => {
    // Check if script is already present in DOM
    const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
    
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousReady) {
        try {
          previousReady();
        } catch (e) {
          console.error('Previous YT ready callback error:', e);
        }
      }
      resolve(window.YT);
    };

    if (!existingScript) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      tag.onerror = () => {
        ytApiPromise = null;
        reject(new Error('Failed to load YouTube IFrame API. Please check your network connection.'));
      };
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }
  });

  return ytApiPromise;
}

/**
 * Maps YouTube Player error codes to actionable user messages
 */
export function getYouTubeErrorMessage(errorCode: number): string {
  switch (errorCode) {
    case 2:
      return 'Invalid video request parameter.';
    case 5:
      return 'HTML5 playback error. The track cannot be rendered.';
    case 100:
      return 'The requested song was not found or has been removed.';
    case 101:
    case 150:
      return 'Playback restricted: The owner of this song does not allow embedded streaming.';
    default:
      return 'Unable to play this track right now. You can skip to the next track.';
  }
}
