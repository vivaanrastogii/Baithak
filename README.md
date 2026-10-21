# VIBELOK — An Immersive Multi-World Indian Music Experience

VIBELOK is an editorial, cinematic web experience designed to transport listeners across five distinct Indian cultural, emotional, and generational soundscapes.

---

## 🎨 The Five Worlds & Image Mappings

1. **90s Carvan** (`90s-carvan`)
   - **Artwork**: `public/assets/aistudio/90s_carvan_1_e0b6aa59.jpg` (Raj Kapoor & Nargis umbrella rain scene)
   - **Atmosphere**: Vintage analogue nostalgia, Kishore Kumar & RD Burman classics, warm sepia tones.
2. **Dil Tuta Aashiq** (`dil-tuta-aashiq`)
   - **Artwork**: `public/assets/aistudio/Dil_Toota_Aashiq_1_079bbdb6.jpg` (Midnight roadside diner with glowing neon broken heart)
   - **Atmosphere**: Solitude, rainy midnight reflections, soulful ghazals and heartbreak ballads.
3. **Safar-e-Car** (`safar-e-car`)
   - **Artwork**: `public/assets/aistudio/Safar-e-car_1_38b89121.jpg` (POV night highway through steering wheel)
   - **Atmosphere**: Open road travel anthems, night drives under streetlamps, freedom rhythms.
4. **Shaadi Wala Ghar** (`shaadi-wala-ghar`)
   - **Artwork**: `public/assets/aistudio/Shaadi_wala_Ghar_1_959eb6dd.jpeg` (Joyous mandap celebration with flower showers and family)
   - **Atmosphere**: Dhol beats, sangeet dancing, wedding anthems, and vibrant saffron/marigold warmth.
5. **Mahaul-e-GenZ** (`mahaul-e-genz`)
   - **Artwork**: `public/assets/aistudio/Mahaul-e-genz_1_cb4e13b3.jpg` (Flash photography ghost sheets with sunglasses at night)
   - **Atmosphere**: Bedroom pop, indie confessions (Anuv Jain, The Local Train, Prateek Kuhad), raw acoustic vibes.

---

## 🎵 YouTube IFrame API Integration

- **Compliance**: Integrates directly with the official Google YouTube IFrame Player API (`https://www.youtube.com/iframe_api`).
- **Real Playback**: Real play, pause, progress scrubbing, duration display, volume, and mute controls synchronised with `YT.PlayerState`.
- **Dockable Video Window**: Complies with embedded player sizing while allowing users to toggle the video viewport.
- **Error Handling**: Gracefully handles blocked autoplays, video removal, and embedding restrictions with instant retry or skip.

---

## 🎧 Playlist Customization & Persistence

- **100 Starter Tracks**: 20 curated tracks per theme in `src/data/themes.ts`.
- **Add Tracks**: Paste any YouTube URL or 11-character video ID with custom title & artist.
- **Reorder & Remove**: Move tracks up/down or remove unwanted tracks.
- **Restore Defaults**: One-click reset to return to the canonical 20 songs.
- **Browser Persistence**: Custom playlists are stored in browser `localStorage` under versioned keys (`vibelok_playlist_v1_<themeId>`).

---

## ⌨️ Keyboard Shortcuts

- **Space**: Play / Pause
- **Ctrl/Cmd + Right Arrow**: Next track
- **Ctrl/Cmd + Left Arrow**: Previous track
- **M**: Mute / Unmute
- **Escape**: Close playlist drawer or Change Vibe modal
