import { useRef, useState } from 'react';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { C } from '../../../config/themeColors';
import {
  WALLPAPER_PRESETS,
  getChatWallpaper,
  saveChatWallpaper,
  buildWallpaperStyles,
} from '../../../config/chatBackgrounds';

const ChatWallpaperPicker = ({ chatId, userId, userToken, onChange }) => {
  const [customColor, setCustomColor] = useState('#1e3a5f');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const current = getChatWallpaper(userId, chatId);
  const isSelected = (id) => current.type === 'preset' && current.id === id;
  const isCustomColor = current.type === 'color';
  const isCustomImage = current.type === 'image';

  const apply = (wallpaper) => {
    saveChatWallpaper(userId, chatId, wallpaper);
    onChange(wallpaper);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    if (file.size > 5 * 1024 * 1024) {
      notifications.show({ title: 'Too large', message: 'Wallpaper must be under 5 MB', color: 'yellow' });
      return;
    }

    setUploading(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data } = await axios.post(
        '/api/upload',
        { base64, fileName: file.name, fileType: file.type, fileSize: file.size },
        { headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' } }
      );

      apply({ type: 'image', value: data.fileUrl, overlay: 0.35 });
      notifications.show({ title: 'Wallpaper set', message: 'Custom image applied to this chat', color: 'green' });
    } catch {
      notifications.show({ title: 'Upload failed', message: 'Could not set wallpaper', color: 'red' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <p style={{
        color: C.textMuted, fontSize: '11px', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px',
      }}>
        Chat wallpaper
      </p>
      <p style={{ color: C.textFaint, fontSize: '12px', margin: '0 0 12px', lineHeight: 1.4 }}>
        Personal background for this conversation only you can see.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
        {WALLPAPER_PRESETS.map(preset => {
          const selected = isSelected(preset.id);
          const previewStyle = buildWallpaperStyles({ type: 'preset', id: preset.id }).container;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => apply({ type: 'preset', id: preset.id })}
              title={preset.name}
              style={{
                aspectRatio: '1',
                borderRadius: '10px',
                border: selected ? `2px solid ${C.accent}` : `1px solid ${C.border}`,
                cursor: 'pointer',
                padding: 0,
                overflow: 'hidden',
                position: 'relative',
                ...previewStyle,
              }}
            >
              <span style={{
                position: 'absolute', bottom: '4px', left: '4px', right: '4px',
                fontSize: '9px', fontWeight: 600, color: '#fff',
                textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {preset.name}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <label style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 12px', borderRadius: '10px',
          border: isCustomColor ? `2px solid ${C.accent}` : `1px solid ${C.border}`,
          backgroundColor: C.bgMuted, cursor: 'pointer', flex: 1,
        }}>
          <input
            type="color"
            value={isCustomColor ? current.value : customColor}
            onChange={(e) => {
              setCustomColor(e.target.value);
              apply({ type: 'color', value: e.target.value });
            }}
            style={{ width: '28px', height: '28px', border: 'none', padding: 0, cursor: 'pointer', background: 'none' }}
          />
          <span style={{ color: C.textSecondary, fontSize: '13px' }}>Custom color</span>
        </label>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            padding: '10px 12px', borderRadius: '10px', flex: 1,
            border: isCustomImage ? `2px solid ${C.accent}` : `1px solid ${C.border}`,
            backgroundColor: C.bgMuted, color: C.textSecondary,
            fontSize: '13px', cursor: uploading ? 'wait' : 'pointer',
          }}
        >
          {uploading ? 'Uploading…' : 'Upload image'}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageUpload} />
      </div>

      {(isCustomColor || isCustomImage) && (
        <button
          type="button"
          onClick={() => apply({ type: 'preset', id: 'default' })}
          style={{
            width: '100%', padding: '9px', borderRadius: '8px',
            border: `1px solid ${C.border}`, backgroundColor: 'transparent',
            color: C.textMuted, fontSize: '12px', cursor: 'pointer',
          }}
        >
          Reset to default wallpaper
        </button>
      )}
    </div>
  );
};

export default ChatWallpaperPicker;
