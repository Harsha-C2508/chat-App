import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { ChatState } from '../../Context/ChatProvider';
import { useAppearance } from '../../Context/AppearanceProvider';
import { isSupportedImage } from '../../config/imageUtils';
import { C } from '../../config/themeColors';
import { hasSecretKey, setSecretKey, removeSecretKey } from '../../config/secretKey';

const AVATAR_COLORS = [
  '#5b7cf6', '#a855f7', '#10b981', '#f43f5e',
  '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6',
];
const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
const getAvatarColor = (name = '') =>
  AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

const ProfilePanel = ({ onClose }) => {
  const { user, setUser } = ChatState();
  const { themeId, fontId, themes, fonts, setThemeId, setFontId } = useAppearance();

  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [picPreview, setPicPreview] = useState(user?.pic ?? '');
  const [picBase64, setPicBase64] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [secretInput, setSecretInput] = useState('');
  const [secretConfirm, setSecretConfirm] = useState('');
  const [secretEnabled, setSecretEnabled] = useState(hasSecretKey(user?._id));

  useEffect(() => {
    setSecretEnabled(hasSecretKey(user?._id));
  }, [user?._id]);

  const fileInputRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!isSupportedImage(file)) {
      notifications.show({
        title: 'Unsupported image',
        message: 'Please use JPG, PNG, WEBP, or GIF.',
        color: 'yellow',
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      notifications.show({ title: 'Too large', message: 'Image must be under 5 MB', color: 'yellow' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPicPreview(ev.target.result);
      // strip the data:image/...;base64, prefix
      setPicBase64(ev.target.result.split(',')[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let picUrl = picPreview;

      // upload image first if a new one was selected
      if (picBase64) {
        const ext = picPreview.match(/data:image\/(\w+)/)?.[1] ?? 'png';
        const { data: uploadData } = await axios.post(
          '/api/upload',
          { base64: picBase64, fileName: `avatar.${ext}`, fileType: `image/${ext}` },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        picUrl = uploadData.fileUrl;
      }

      const { data } = await axios.put(
        '/api/user/profile',
        { name, bio, pic: picUrl },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      const updated = { ...data, token: user.token };
      setUser(updated);
      localStorage.setItem('userInfo', JSON.stringify(updated));
      setPicBase64(null);
      notifications.show({ title: 'Saved', message: 'Profile updated', color: 'green' });
    } catch (err) {
      notifications.show({ title: 'Error', message: err?.response?.data?.message ?? 'Failed to save', color: 'red' });
    } finally {
      setSaving(false);
    }
  };

  const isDirty = name !== user?.name || bio !== (user?.bio ?? '') || picBase64 !== null;

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      height: '100%', backgroundColor: C.bgBase, overflow: 'hidden', fontFamily: C.font,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '18px 20px', borderBottom: `1px solid ${C.border}`,
        backgroundColor: C.bgElevated,
      }}>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textFaint, padding: '4px', display: 'flex', alignItems: 'center' }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h2 style={{ color: C.textPrimary, fontSize: '17px', fontWeight: 700, margin: 0 }}>Profile</h2>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 0' }}>

        {/* Avatar section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '36px' }}>
          <div
            style={{ position: 'relative', cursor: 'pointer' }}
            onClick={() => fileInputRef.current.click()}
            title="Change photo"
          >
            {picPreview && !picPreview.includes('gravatar') ? (
              <img
                src={picPreview}
                alt="avatar"
                style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${C.border}` }}
              />
            ) : (
              <div style={{
                width: '120px', height: '120px', borderRadius: '50%',
                backgroundColor: getAvatarColor(name),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '36px', fontWeight: 700,
                border: `3px solid ${C.border}`,
              }}>
                {getInitials(name)}
              </div>
            )}
            {/* camera overlay */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.45)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transition: 'opacity 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0}
            >
              <svg width="28" height="28" fill="none" stroke="#fff" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span style={{ color: '#fff', fontSize: '11px', marginTop: '4px', fontWeight: 500 }}>Change</span>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
          <p style={{ color: C.textFaint, fontSize: '12px', margin: 0 }}>Click photo to change</p>
        </div>

        {/* Info rows */}
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '0' }}>

          {/* Name */}
          <FieldRow
            label="Your name"
            value={name}
            editing={editingName}
            onEdit={() => setEditingName(true)}
            onChange={setName}
            onDone={() => setEditingName(false)}
            placeholder="Enter your name"
            maxLength={60}
          />

          {/* Bio */}
          <FieldRow
            label="About"
            value={bio}
            editing={editingBio}
            onEdit={() => setEditingBio(true)}
            onChange={setBio}
            onDone={() => setEditingBio(false)}
            placeholder="Hey there! I am using Halo."
            maxLength={140}
            multiline
          />

          {/* Email (read-only) */}
          <div style={{ padding: '20px 0', borderBottom: `1px solid ${C.border}` }}>
            <p style={{ color: C.accent, fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 6px' }}>Email</p>
            <p style={{ color: C.textMuted, fontSize: '15px', margin: 0 }}>{user?.email}</p>
          </div>

          {/* Privacy — secret key */}
          <div style={{ padding: '24px 0', borderBottom: `1px solid ${C.border}` }}>
            <p style={{ color: C.accent, fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 8px' }}>Privacy</p>
            <p style={{ color: C.textMuted, fontSize: '13px', margin: '0 0 14px', lineHeight: 1.5 }}>
              Set a secret key here first. After hiding chats, type that same key in the sidebar search bar and press Enter to view them.
            </p>

            {secretEnabled ? (
              <p style={{ color: C.online, fontSize: '13px', margin: '0 0 12px' }}>Secret key is set</p>
            ) : (
              <>
                <input
                  type="password"
                  value={secretInput}
                  onChange={e => setSecretInput(e.target.value)}
                  placeholder="New secret key (min 4 chars)"
                  style={{
                    width: '100%', boxSizing: 'border-box', marginBottom: '8px',
                    backgroundColor: C.bgBase, border: `1px solid ${C.border}`,
                    borderRadius: '10px', padding: '10px 12px', color: C.textPrimary, fontSize: '14px', outline: 'none',
                  }}
                />
                <input
                  type="password"
                  value={secretConfirm}
                  onChange={e => setSecretConfirm(e.target.value)}
                  placeholder="Confirm secret key"
                  style={{
                    width: '100%', boxSizing: 'border-box', marginBottom: '10px',
                    backgroundColor: C.bgBase, border: `1px solid ${C.border}`,
                    borderRadius: '10px', padding: '10px 12px', color: C.textPrimary, fontSize: '14px', outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (secretInput.length < 4) {
                      notifications.show({ title: 'Too short', message: 'Secret key must be at least 4 characters', color: 'yellow' });
                      return;
                    }
                    if (secretInput !== secretConfirm) {
                      notifications.show({ title: 'Mismatch', message: 'Secret keys do not match', color: 'yellow' });
                      return;
                    }
                    try {
                      setSecretKey(user._id, secretInput);
                      setSecretEnabled(true);
                      setSecretInput('');
                      setSecretConfirm('');
                      notifications.show({ title: 'Saved', message: 'Secret key set successfully', color: 'green' });
                    } catch (err) {
                      notifications.show({ title: 'Error', message: err.message, color: 'red' });
                    }
                  }}
                  style={{
                    width: '100%', padding: '10px', borderRadius: '10px',
                    border: 'none', backgroundColor: C.accent, color: '#fff',
                    fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Set secret key
                </button>
              </>
            )}

            {secretEnabled && (
              <button
                type="button"
                onClick={() => {
                  const current = window.prompt('Enter current secret key to remove it:');
                  if (!current) return;
                  if (removeSecretKey(user._id, current)) {
                    setSecretEnabled(false);
                    notifications.show({ title: 'Removed', message: 'Secret key removed', color: 'green' });
                  } else {
                    notifications.show({ title: 'Wrong key', message: 'Incorrect secret key', color: 'red' });
                  }
                }}
                style={{
                  marginTop: '8px', background: 'none', border: 'none',
                  color: C.danger, fontSize: '12px', cursor: 'pointer', padding: 0,
                }}
              >
                Remove secret key
              </button>
            )}
          </div>

          {/* Appearance */}
          <div style={{ padding: '24px 0', borderBottom: `1px solid ${C.border}` }}>
            <p style={{ color: C.accent, fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 14px' }}>Appearance</p>

            <p style={{ color: C.textMuted, fontSize: '13px', fontWeight: 500, margin: '0 0 10px' }}>Theme</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px' }}>
              {Object.values(themes).map(theme => {
                const selected = themeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setThemeId(theme.id)}
                    style={{
                      padding: '10px',
                      borderRadius: '12px',
                      border: selected ? `2px solid ${C.accent}` : `1px solid ${C.border}`,
                      backgroundColor: selected ? C.accentSoft : C.bgMuted,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                      {theme.preview.map(color => (
                        <span key={color} style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: color, border: `1px solid ${C.border}` }} />
                      ))}
                    </div>
                    <span style={{ color: selected ? C.textPrimary : C.textMuted, fontSize: '12px', fontWeight: selected ? 600 : 500 }}>
                      {theme.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <p style={{ color: C.textMuted, fontSize: '13px', fontWeight: 500, margin: '0 0 10px' }}>Font family</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {Object.values(fonts).map(font => {
                const selected = fontId === font.id;
                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => setFontId(font.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: selected ? `2px solid ${C.accent}` : `1px solid ${C.border}`,
                      backgroundColor: selected ? C.accentSoft : C.bgMuted,
                      cursor: 'pointer',
                      fontFamily: font.family,
                    }}
                  >
                    <span style={{ color: C.textPrimary, fontSize: '14px', fontWeight: selected ? 600 : 400 }}>
                      {font.name}
                    </span>
                    <span style={{ color: C.textFaint, fontSize: '12px' }}>Aa</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      {isDirty && (
        <div style={{ padding: '16px 24px', borderTop: `1px solid ${C.border}`, backgroundColor: C.bgElevated }}>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            style={{
              width: '100%', padding: '12px', borderRadius: '12px',
              backgroundColor: saving ? C.textFaint : C.accent,
              color: '#fff', fontWeight: 600, fontSize: '15px',
              border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {saving && (
              <span style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
            )}
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ── inline field row ──────────────────────────────────────────────────────────
const FieldRow = ({ label, value, editing, onEdit, onChange, onDone, placeholder, maxLength, multiline }) => (
  <div style={{ padding: '20px 0', borderBottom: `1px solid ${C.border}` }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
      <p style={{ color: C.accent, fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>{label}</p>
      {!editing && (
        <button onClick={onEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textFaint, padding: '2px', display: 'flex' }} title="Edit">
          <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
          </svg>
        </button>
      )}
    </div>
    {editing ? (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
        {multiline ? (
          <textarea
            autoFocus
            value={value}
            onChange={e => onChange(e.target.value)}
            maxLength={maxLength}
            rows={3}
            placeholder={placeholder}
            style={{
              flex: 1, background: 'none', border: 'none', borderBottom: `2px solid ${C.accent}`,
              outline: 'none', color: C.textPrimary, fontSize: '15px',
              resize: 'none', padding: '4px 0', lineHeight: '1.5',
              fontFamily: 'inherit',
            }}
          />
        ) : (
          <input
            autoFocus
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            maxLength={maxLength}
            placeholder={placeholder}
            style={{
              flex: 1, background: 'none', border: 'none', borderBottom: `2px solid ${C.accent}`,
              outline: 'none', color: C.textPrimary, fontSize: '15px', padding: '4px 0',
            }}
          />
        )}
        <button onClick={onDone} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.online, padding: '4px', flexShrink: 0 }} title="Done">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    ) : (
      <p
        onClick={onEdit}
        style={{ color: value ? C.textSecondary : C.textFaint, fontSize: '15px', margin: 0, cursor: 'text', minHeight: '22px' }}
      >
        {value || placeholder}
      </p>
    )}
    {editing && maxLength && (
      <p style={{ color: C.textFaint, fontSize: '11px', textAlign: 'right', margin: '4px 0 0' }}>{value.length}/{maxLength}</p>
    )}
  </div>
);

export default ProfilePanel;
