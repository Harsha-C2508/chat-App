import React from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AVATAR_COLORS = [
  '#5b7cf6', '#a855f7', '#10b981', '#f43f5e',
  '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6',
];

export const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

export const getAvatarColor = (name = '') =>
  AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

export const resolvePicUrl = (pic) => {
  if (!pic || pic.includes('gravatar')) return null;
  if (pic.startsWith('http') || pic.startsWith('data:')) return pic;
  const path = pic.startsWith('/') ? pic : `/${pic}`;
  const base = process.env.REACT_APP_API_URL || '';
  return base ? `${base.replace(/\/$/, '')}${path}` : path;
};

const UserAvatar = ({ name = '', pic, size = 44, style = {} }) => {
  const src = resolvePicUrl(pic);
  const color = getAvatarColor(name);
  const fontSize = size <= 28 ? 10 : size <= 38 ? 13 : 14;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize,
        fontWeight: 700,
        flexShrink: 0,
        overflow: 'hidden',
        ...style,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        getInitials(name)
      )}
    </div>
  );
};

export default UserAvatar;
