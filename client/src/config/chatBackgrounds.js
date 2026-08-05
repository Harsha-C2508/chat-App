import { resolveFileUrl } from './fileUtils';

const STORAGE_KEY = 'halo-chat-wallpapers';

export const WALLPAPER_PRESETS = [
  { id: 'default', name: 'Default', preview: 'var(--color-bg-base)' },
  { id: 'slate', name: 'Slate', preview: '#1a1f2e' },
  { id: 'navy', name: 'Navy', preview: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 100%)' },
  { id: 'purple', name: 'Purple', preview: 'linear-gradient(160deg, #1a1030 0%, #4c1d95 100%)' },
  { id: 'forest', name: 'Forest', preview: 'linear-gradient(160deg, #0a1f14 0%, #14532d 100%)' },
  { id: 'sunset', name: 'Sunset', preview: 'linear-gradient(160deg, #1a0a0a 0%, #7c2d12 100%)' },
  { id: 'rose', name: 'Rose', preview: 'linear-gradient(160deg, #1f0a18 0%, #831843 100%)' },
  { id: 'ocean', name: 'Ocean', preview: 'linear-gradient(160deg, #0c1929 0%, #0e7490 100%)' },
  { id: 'dots', name: 'Dots', preview: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)' },
  { id: 'grid', name: 'Grid', preview: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)' },
];

const PRESET_STYLES = {
  default: { overlay: 0 },
  slate: { backgroundColor: '#1a1f2e', overlay: 0 },
  navy: { background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 100%)', overlay: 0.08 },
  purple: { background: 'linear-gradient(160deg, #1a1030 0%, #4c1d95 100%)', overlay: 0.1 },
  forest: { background: 'linear-gradient(160deg, #0a1f14 0%, #14532d 100%)', overlay: 0.08 },
  sunset: { background: 'linear-gradient(160deg, #1a0a0a 0%, #7c2d12 100%)', overlay: 0.1 },
  rose: { background: 'linear-gradient(160deg, #1f0a18 0%, #831843 100%)', overlay: 0.1 },
  ocean: { background: 'linear-gradient(160deg, #0c1929 0%, #0e7490 100%)', overlay: 0.08 },
  dots: {
    backgroundColor: 'var(--color-bg-base)',
    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
    backgroundSize: '18px 18px',
    overlay: 0,
  },
  grid: {
    backgroundColor: 'var(--color-bg-base)',
    backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
    backgroundSize: '24px 24px',
    overlay: 0,
  },
};

const readAll = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

const storageKey = (userId, chatId) => `${userId}:${chatId}`;

export const getChatWallpaper = (userId, chatId) => {
  if (!userId || !chatId) return { type: 'preset', id: 'default' };
  return readAll()[storageKey(userId, chatId)] || { type: 'preset', id: 'default' };
};

export const saveChatWallpaper = (userId, chatId, wallpaper) => {
  if (!userId || !chatId) return;
  const all = readAll();
  if (!wallpaper || (wallpaper.type === 'preset' && wallpaper.id === 'default')) {
    delete all[storageKey(userId, chatId)];
  } else {
    all[storageKey(userId, chatId)] = wallpaper;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
};

export const buildWallpaperStyles = (wallpaper) => {
  if (!wallpaper || (wallpaper.type === 'preset' && wallpaper.id === 'default')) {
    return { container: { backgroundColor: 'var(--color-bg-base)' }, overlay: 0 };
  }

  if (wallpaper.type === 'preset') {
    const preset = PRESET_STYLES[wallpaper.id] || PRESET_STYLES.default;
    const { overlay = 0, ...container } = preset;
    return { container, overlay };
  }

  if (wallpaper.type === 'color') {
    return { container: { backgroundColor: wallpaper.value }, overlay: 0 };
  }

  if (wallpaper.type === 'image') {
    const url = resolveFileUrl(wallpaper.value);
    return {
      container: {
        backgroundImage: `url(${url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      },
      overlay: wallpaper.overlay ?? 0.35,
    };
  }

  return { container: { backgroundColor: 'var(--color-bg-base)' }, overlay: 0 };
};

export const getWallpaperPreviewStyle = (wallpaper) => {
  const { container } = buildWallpaperStyles(wallpaper);
  return container;
};
