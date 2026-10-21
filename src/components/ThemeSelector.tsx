import React from 'react';
import { THEMES } from '../data/themes';
import { ThemeId, ThemeConfig } from '../types/theme';
import { ArrowUpRight, Play, Disc3 } from 'lucide-react';

interface ThemeSelectorProps {
  onSelectTheme: (themeId: ThemeId) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onSelectTheme }) => {
  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col justify-between selection:bg-amber-500/30">
      {/* Subtle atmospheric ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-amber-500/10 via-rose-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Header with VIBELOK Wordmark */}
      <header className="relative z-10 pt-10 pb-6 px-6 sm:px-12 max-w-7xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 mb-3">
          <Disc3 className="w-5 h-5 text-amber-400 animate-spin-slow opacity-80" />
          <span className="text-[11px] uppercase tracking-[0.25em] text-white/50 font-medium">
            Multi-World Soundscapes
          </span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-3">
          VIBELOK
        </h1>

        <p className="text-base sm:text-lg text-white/60 max-w-xl mx-auto font-light leading-relaxed">
          Five immersive Indian cultural worlds. Step inside to listen.
        </p>
      </header>

      {/* 5 Theme Cards Grid */}
      <main className="relative z-10 px-4 sm:px-8 max-w-7xl mx-auto w-full my-auto py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
          {THEMES.map((theme: ThemeConfig, idx: number) => {
            return (
              <button
                key={theme.id}
                onClick={() => onSelectTheme(theme.id)}
                className="group relative h-[380px] sm:h-[430px] lg:h-[480px] rounded-2xl overflow-hidden border border-white/10 hover:border-white/40 transition-all duration-500 flex flex-col justify-between p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer shadow-xl active:scale-[0.99]"
              >
                {/* Background Artwork */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={theme.backgroundImage}
                    alt={theme.name}
                    className="w-full h-full object-cover object-center brightness-[0.72] group-hover:brightness-90 group-hover:scale-105 transition-all duration-700 ease-out"
                    loading="eager"
                    onError={(e) => {
                      if (theme.fallbackImage && !e.currentTarget.src.includes(theme.fallbackImage)) {
                        e.currentTarget.src = theme.fallbackImage;
                      }
                    }}
                  />
                  {/* Dynamic Gradient Overlay */}
                  <div
                    className="absolute inset-0 opacity-70 group-hover:opacity-50 transition-opacity duration-500"
                    style={{ background: theme.overlayGradient }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />
                </div>

                {/* Card Top: Number & Hindi Callout */}
                <div className="relative z-10 flex items-start justify-between">
                  <span className="font-serif text-sm text-white/50 font-medium">
                    0{idx + 1}
                  </span>
                  <div className="text-right">
                    <span className="text-xs text-white/70 tracking-wider font-light">
                      {theme.hindiName}
                    </span>
                  </div>
                </div>

                {/* Card Bottom: Title, Tagline, & Enter CTA */}
                <div className="relative z-10 space-y-3">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-white group-hover:text-amber-200 transition-colors">
                      {theme.name}
                    </h2>
                    <p className="text-xs text-white/70 line-clamp-2 mt-1 leading-relaxed font-light">
                      {theme.tagline}
                    </p>
                  </div>

                  {/* Clean unboxed metadata (anti-slop) */}
                  <div className="flex items-center gap-2 text-[11px] text-white/50">
                    <span>20 Curated Tracks</span>
                    <span aria-hidden="true">·</span>
                    <span style={{ color: theme.themeColor }}>{theme.accentBadge}</span>
                  </div>

                  {/* Interactive Button */}
                  <div
                    className="w-full py-2.5 px-4 rounded-xl flex items-center justify-between font-medium text-xs text-black transition-all duration-300 group-hover:shadow-lg"
                    style={{ backgroundColor: theme.themeColor }}
                  >
                    <span className="font-semibold flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Enter World
                    </span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 py-6 px-6 text-center text-xs text-white/40">
        <p>VIBELOK — Curated soundscapes with official YouTube IFrame playback.</p>
      </footer>
    </div>
  );
};
