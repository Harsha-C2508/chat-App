import { useState } from 'react';
import UserAvatar from '../userAvatar/UserAvatar';
import { getSenderFull } from '../../../config/ChatLogics';
import { resolveFileUrl, formatBytes } from '../../../config/fileUtils';
import MediaViewerModal from './MediaViewerModal';
import ChatWallpaperPicker from './ChatWallpaperPicker';
import { C } from '../../../config/themeColors';

const panelStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  width: '320px',
  maxWidth: '100%',
  backgroundColor: C.bgBase,
  borderLeft: `1px solid ${C.border}`,
  display: 'flex',
  flexDirection: 'column',
  zIndex: 30,
  boxShadow: '-8px 0 32px rgba(0,0,0,0.25)',
  fontFamily: C.font,
};

const headerBtn = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: C.textFaint,
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
};

const sectionTitle = {
  color: C.textMuted,
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 10px',
};

const MediaTile = ({ message, onOpen }) => {
  const src = resolveFileUrl(message.fileUrl);
  const isImage = message.fileType?.startsWith('image/');
  const isVideo = message.fileType?.startsWith('video/') ||
    message.fileName?.match(/\.(webm|mp4|mov|avi|mkv|m4v)$/i);

  return (
    <button
      type="button"
      onClick={() => onOpen(message)}
      title={message.fileName || 'Open file'}
      style={{
        aspectRatio: '1',
        borderRadius: '10px',
        overflow: 'hidden',
        backgroundColor: '#252535',
        border: '1px solid #2e2e42',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 0,
        color: '#9ca3af',
      }}
    >
      {isImage ? (
        <img src={src} alt={message.fileName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : isVideo ? (
        <video
          src={src}
          muted
          playsInline
          preload="metadata"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div style={{ padding: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#5b7cf6', marginBottom: '4px' }}>
            {(message.fileName?.split('.').pop() || 'FILE').toUpperCase().slice(0, 4)}
          </div>
          <div style={{ fontSize: '9px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {message.fileName || 'Document'}
          </div>
        </div>
      )}
    </button>
  );
};

const ChatDetailsPanel = ({ chat, messages, user, onlineUsers, onClose, onWallpaperChange }) => {
  const [previewMessage, setPreviewMessage] = useState(null);
  const chatName = chat.isGroupChat ? chat.chatName : getSenderFull(user, chat.users)?.name;
  const headerPic = chat.isGroupChat ? null : getSenderFull(user, chat.users)?.pic;
  const otherUser = !chat.isGroupChat ? getSenderFull(user, chat.users) : null;

  const activeMessages = messages.filter(m => !m.isDeleted);
  const sharedFiles = activeMessages.filter(m => m.fileUrl);
  const textCount = activeMessages.filter(m => m.content).length;

  return (
    <div style={panelStyle}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '14px 16px',
        borderBottom: `1px solid ${C.border}`,
        backgroundColor: C.bgElevated,
      }}>
        <button type="button" onClick={onClose} style={headerBtn} title="Close">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 style={{ color: C.textPrimary, fontSize: '15px', fontWeight: 600, margin: 0 }}>Chat details</h3>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <UserAvatar name={chatName} pic={headerPic} size={72} style={{ marginBottom: '12px' }} />
          <p style={{ color: C.textPrimary, fontSize: '16px', fontWeight: 600, margin: '0 0 4px', textAlign: 'center' }}>
            {chatName}
          </p>
          {otherUser && (
            <p style={{ color: C.textFaint, fontSize: '13px', margin: 0 }}>{otherUser.email}</p>
          )}
          {chat.isGroupChat && (
            <p style={{ color: C.textFaint, fontSize: '13px', margin: '4px 0 0' }}>
              {chat.users.length} members
            </p>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginBottom: '24px',
        }}>
          <div style={{ backgroundColor: C.bgMuted, borderRadius: '12px', padding: '12px', border: `1px solid ${C.border}` }}>
            <p style={{ color: C.textFaint, fontSize: '11px', margin: '0 0 4px' }}>Messages</p>
            <p style={{ color: C.textPrimary, fontSize: '18px', fontWeight: 700, margin: 0 }}>{activeMessages.length}</p>
          </div>
          <div style={{ backgroundColor: C.bgMuted, borderRadius: '12px', padding: '12px', border: `1px solid ${C.border}` }}>
            <p style={{ color: C.textFaint, fontSize: '11px', margin: '0 0 4px' }}>Files shared</p>
            <p style={{ color: C.textPrimary, fontSize: '18px', fontWeight: 700, margin: 0 }}>{sharedFiles.length}</p>
          </div>
        </div>

        {chat.isGroupChat ? (
          <div style={{ marginBottom: '24px' }}>
            <p style={sectionTitle}>Members</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {chat.users.map(member => {
                const isOnline = onlineUsers.includes(String(member._id));
                const isSelf = String(member._id) === String(user._id);
                return (
                  <div
                    key={member._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      backgroundColor: '#252535',
                      border: '1px solid #2e2e42',
                    }}
                  >
                    <UserAvatar name={member.name} pic={member.pic} size={34} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: '#f0f0f5', fontSize: '13px', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {member.name}{isSelf ? ' (You)' : ''}
                      </p>
                      <p style={{ color: isOnline ? '#10b981' : '#6b7280', fontSize: '11px', margin: '2px 0 0' }}>
                        {isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : otherUser && (
          <div style={{ marginBottom: '24px' }}>
            <p style={sectionTitle}>Contact</p>
            <div style={{ backgroundColor: '#252535', borderRadius: '12px', padding: '12px', border: '1px solid #2e2e42' }}>
              <p style={{ color: '#6b7280', fontSize: '11px', margin: '0 0 4px' }}>Status</p>
              <p style={{ color: onlineUsers.includes(String(otherUser._id)) ? '#10b981' : '#9ca3af', fontSize: '13px', margin: '0 0 10px' }}>
                {onlineUsers.includes(String(otherUser._id)) ? 'Online now' : 'Offline'}
              </p>
              <p style={{ color: '#6b7280', fontSize: '11px', margin: '0 0 4px' }}>Text messages</p>
              <p style={{ color: '#f0f0f5', fontSize: '13px', margin: 0 }}>{textCount}</p>
            </div>
          </div>
        )}

        <ChatWallpaperPicker
          chatId={chat._id}
          userId={user._id}
          userToken={user.token}
          onChange={onWallpaperChange}
        />

        <div>
          <p style={sectionTitle}>Shared media & files</p>
          {sharedFiles.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>No files shared yet</p>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {sharedFiles.slice(0, 12).map(m => (
                  <MediaTile key={m._id} message={m} onOpen={setPreviewMessage} />
                ))}
              </div>
              {sharedFiles.length > 12 && (
                <p style={{ color: '#6b7280', fontSize: '12px', margin: '10px 0 0' }}>
                  +{sharedFiles.length - 12} more files
                </p>
              )}
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {sharedFiles.slice(0, 5).map(m => (
                  <button
                    key={`list-${m._id}`}
                    type="button"
                    onClick={() => setPreviewMessage(m)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: '#252535',
                      border: '1px solid #2e2e42',
                      color: '#d1d5db',
                      fontSize: '12px',
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.fileName || 'File'}
                    </span>
                    <span style={{ color: '#6b7280', flexShrink: 0 }}>{formatBytes(m.fileSize)}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {previewMessage && (
        <MediaViewerModal
          message={previewMessage}
          onClose={() => setPreviewMessage(null)}
        />
      )}
    </div>
  );
};

export default ChatDetailsPanel;
