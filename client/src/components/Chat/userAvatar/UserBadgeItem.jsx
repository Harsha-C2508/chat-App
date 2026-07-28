import React from 'react';

const UserBadgeItem = ({ user, handleFunction, admin }) => {
  return (
    <span
      onClick={handleFunction}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '3px 10px 3px 8px', borderRadius: '9999px',
        backgroundColor: 'rgba(91,124,246,0.2)', color: '#7c9cf8',
        fontSize: '12px', fontWeight: 500, cursor: 'pointer',
        border: '1px solid rgba(91,124,246,0.3)',
        transition: 'background 0.15s',
      }}
    >
      {user.name}
      {admin === user._id && <span style={{ color: '#9ca3af', fontSize: '11px' }}> (Admin)</span>}
      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ opacity: 0.7 }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </span>
  );
};

export default UserBadgeItem;
