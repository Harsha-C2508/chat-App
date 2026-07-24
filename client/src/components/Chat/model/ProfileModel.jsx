import { useState } from 'react';
import UserAvatar from '../userAvatar/UserAvatar';

const ProfileModel = ({ userInfo, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  if (!userInfo) return null;

  return (
    <>
      <span onClick={() => setIsOpen(true)} style={{ cursor: 'pointer' }}>
        {children ?? (
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '7px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        )}
      </span>

      {isOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: 'rgba(0,0,0,0.7)' }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{ position: 'relative', backgroundColor: '#252535', border: '1px solid #2e2e42', borderRadius: '16px', width: '100%', maxWidth: '360px', boxShadow: '0 24px 64px rgba(0,0,0,0.5)', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setIsOpen(false)}
              style={{ position: 'absolute', top: '14px', right: '14px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px', display: 'flex', alignItems: 'center' }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 32px 28px' }}>
              <UserAvatar
                name={userInfo.name}
                pic={userInfo.pic}
                size={88}
                style={{ border: '3px solid #2e2e42', marginBottom: '16px' }}
              />
              <h2 style={{ color: '#f0f0f5', fontSize: '20px', fontWeight: 700, margin: '0 0 6px' }}>{userInfo.name}</h2>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>{userInfo.email}</p>
            </div>

            <div style={{ padding: '0 20px 20px' }}>
              <button
                onClick={() => setIsOpen(false)}
                style={{ width: '100%', backgroundColor: '#1e1e2e', color: '#d1d5db', border: '1px solid #2e2e42', borderRadius: '10px', padding: '11px', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileModel;
