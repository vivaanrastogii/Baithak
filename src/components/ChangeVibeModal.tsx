import React from 'react';
import { ThemeConfig, ThemeId } from '../types/theme';
import { THEMES } from '../data/themes';
import { X, LayoutGrid, ArrowRight, Sparkles } from 'lucide-react';

interface ChangeVibeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
  onReturnToHome: () => void;
}

export const ChangeVibeModal: React.FC<ChangeVibeModalProps> = ({
  isOpen,
  onClose,
  currentThemeId,
  onSelectTheme,
  onReturnToHome,
}) => {
  if (!isOpen) return null;

  const otherThemes = THEMES.filter((t) => t.id !== currentThemeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-stone-950/95 border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden z-10 text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="font-serif text-lg font-medium tracking-wide">
                Change Vibe
              </h3>
            </div>
            <p className="text-xs text-white/50 mt-0.5">
              Select another atmosphere or return to all worlds
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close vibe switcher"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Other Theme Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
          {otherThemes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => {
                onSelectTheme(theme.id);
                onClose();
              }}
              className="group relative h-28 rounded-xl overflow-hidden border border-white/10 hover:border-white/40 transition-all text-left flex flex-col justify-end p-4 focus:outline-none"
            >
              {/* Background preview thumbnail with subtle crop */}
              <img
                src={theme.backgroundImage}
                alt={theme.name}
                className="absolute inset-0 w-full h-full object-cover brightness-60 group-hover:scale-105 group-hover:brightness-75 transition-all duration-500"
                onError={(e) => {
                  if (theme.fallbackImage && !e.currentTarget.src.includes(theme.fallbackImage)) {
                    e.currentTarget.src = theme.fallbackImage;
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              {/* Text info */}
              <div className="relative z-10">
                <span className="text-[10px] tracking-wider uppercase text-white/60 font-medium">
                  {theme.hindiName}
                </span>
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-base font-semibold text-white group-hover:text-amber-200 transition-colors">
                    {theme.name}
                  </h4>
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Return to Home / Overview Button */}
        <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs">
          <button
            onClick={() => {
              onClose();
              onReturnToHome();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/15 hover:border-white/30 hover:bg-white/5 text-white/80 hover:text-white transition-colors"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Return to All 5 Worlds</span>
          </button>

          <span className="text-[11px] text-white/40">
            Playback transitions seamlessly
          </span>
        </div>
      </div>
    </div>
  );
};
