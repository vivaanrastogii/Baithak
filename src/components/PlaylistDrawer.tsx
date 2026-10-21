import React, { useState } from 'react';
import { Track, ThemeConfig } from '../types/theme';
import { extractYouTubeVideoId } from '../lib/youtube';
import {
  X,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Music2,
  Play,
  Check,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

interface PlaylistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeConfig;
  tracks: Track[];
  currentTrackIndex: number;
  onSelectTrack: (index: number) => void;
  onAddTrack: (track: Omit<Track, 'id'>) => void;
  onRemoveTrack: (index: number) => void;
  onMoveTrack: (index: number, direction: 'up' | 'down') => void;
  onRestoreDefaults: () => void;
  isCustomized: boolean;
}

export const PlaylistDrawer: React.FC<PlaylistDrawerProps> = ({
  isOpen,
  onClose,
  theme,
  tracks,
  currentTrackIndex,
  onSelectTrack,
  onAddTrack,
  onRemoveTrack,
  onMoveTrack,
  onRestoreDefaults,
  isCustomized,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [artistInput, setArtistInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const videoId = extractYouTubeVideoId(urlInput);
    if (!videoId) {
      setFormError('Please enter a valid YouTube video URL or 11-character video ID.');
      return;
    }

    if (!titleInput.trim()) {
      setFormError('Please enter a song title.');
      return;
    }

    onAddTrack({
      title: titleInput.trim(),
      artist: artistInput.trim() || 'Unknown Artist',
      youtubeVideoId: videoId,
      source: 'user',
      year: new Date().getFullYear().toString(),
    });

    setUrlInput('');
    setTitleInput('');
    setArtistInput('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative w-full max-w-lg h-full bg-stone-950/95 border-l border-white/10 shadow-2xl flex flex-col z-10 text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-black/40">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: theme.themeColor }}
              />
              <h3 className="font-serif text-lg font-medium tracking-wide">
                {theme.name} Playlist
              </h3>
            </div>
            <p className="text-xs text-white/50 mt-0.5">
              {tracks.length} tracks {isCustomized && '· Customised'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all text-white"
              title="Add a custom track"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Track</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close playlist drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Add Track Form Panel */}
        {showAddForm && (
          <form
            onSubmit={handleAddSubmit}
            className="p-4 bg-stone-900 border-b border-white/10 space-y-3 animate-in fade-in slide-in-from-top-2"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-white/90 uppercase tracking-wider">
                Add YouTube Track
              </h4>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-white/40 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="block text-[11px] text-white/60 mb-1">
                YouTube URL or Video ID *
              </label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://youtu.be/... or 11-char ID"
                className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-white/60 mb-1">Song Title *</label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="e.g. Mere Dholna"
                  className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/40"
                />
              </div>
              <div>
                <label className="block text-[11px] text-white/60 mb-1">Artist / Credits</label>
                <input
                  type="text"
                  value={artistInput}
                  onChange={(e) => setArtistInput(e.target.value)}
                  placeholder="e.g. Shreya Ghoshal"
                  className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/40"
                />
              </div>
            </div>

            {formError && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                {formError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2 rounded-lg text-xs font-semibold text-black transition-transform active:scale-[0.98]"
              style={{ backgroundColor: theme.themeColor }}
            >
              Add to {theme.name}
            </button>
          </form>
        )}

        {/* Reset Confirmation Dialog */}
        {showResetConfirm && (
          <div className="p-4 bg-rose-950/40 border-b border-rose-500/20 text-xs">
            <p className="text-white font-medium mb-1">
              Reset playlist to canonical 20 tracks?
            </p>
            <p className="text-white/60 mb-3">
              This will discard your custom additions, deletions, and track order for this theme.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onRestoreDefaults();
                  setShowResetConfirm(false);
                }}
                className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium"
              >
                Yes, Restore Defaults
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Track List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1.5">
          {tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-white/40">
              <Music2 className="w-8 h-8 mb-2 stroke-1" />
              <p className="text-sm">No tracks in this playlist.</p>
              <button
                onClick={onRestoreDefaults}
                className="mt-3 text-xs text-white/80 underline hover:text-white"
              >
                Restore default 20 tracks
              </button>
            </div>
          ) : (
            tracks.map((track, index) => {
              const isCurrent = index === currentTrackIndex;
              return (
                <div
                  key={track.id}
                  className={`group flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                    isCurrent
                      ? 'bg-white/10 border-white/30 text-white'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.06] text-white/80'
                  }`}
                >
                  {/* Track Info & Select */}
                  <button
                    onClick={() => onSelectTrack(index)}
                    className="flex items-center gap-3 text-left flex-1 min-w-0 pr-2 focus:outline-none"
                  >
                    <span className="w-5 text-center text-xs font-mono text-white/40 group-hover:text-white/80 shrink-0">
                      {isCurrent ? (
                        <Play
                          className="w-3.5 h-3.5 fill-current inline"
                          style={{ color: theme.themeColor }}
                        />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-medium truncate ${
                          isCurrent ? 'text-white font-semibold' : 'text-white/90'
                        }`}
                      >
                        {track.title}
                      </p>
                      <p className="text-[11px] text-white/50 truncate">
                        {track.artist} {track.year && `· ${track.year}`}
                      </p>
                    </div>
                  </button>

                  {/* Actions (Reorder, Delete, Link) */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                    {/* Move Up */}
                    <button
                      onClick={() => onMoveTrack(index, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent"
                      title="Move track up"
                      aria-label={`Move ${track.title} up`}
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Down */}
                    <button
                      onClick={() => onMoveTrack(index, 'down')}
                      disabled={index === tracks.length - 1}
                      className="p-1 rounded text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent"
                      title="Move track down"
                      aria-label={`Move ${track.title} down`}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {/* YouTube Source Link */}
                    {track.youtubeVideoId && (
                      <a
                        href={`https://www.youtube.com/watch?v=${track.youtubeVideoId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded text-white/30 hover:text-white/80 hover:bg-white/10"
                        title="View on YouTube"
                        aria-label="View on YouTube"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {/* Remove Track */}
                    <button
                      onClick={() => onRemoveTrack(index)}
                      className="p-1 rounded text-white/30 hover:text-rose-400 hover:bg-white/10"
                      title="Remove from playlist"
                      aria-label={`Remove ${track.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info & restore action */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between text-[11px] text-white/40">
          <span>Saved locally on this browser</span>
          {isCustomized && (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1 text-white/60 hover:text-amber-400 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restore original 20</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
