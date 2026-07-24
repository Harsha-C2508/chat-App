import { useState } from "react";
import ScrollableFeed from "react-scrollable-feed";
import { isSameSender, isLastMessage, isSameUser } from "../../../config/ChatLogics";
import { getMessageStatusInfo, formatStatusTime } from "../../../config/messageStatus";
import { ChatState } from "../../../Context/ChatProvider";
import UserAvatar from "../userAvatar/UserAvatar";
import { resolveFileUrl } from "../../../config/fileUtils";
import { C } from "../../../config/themeColors";

const isVideoFile = (fileType, fileName) =>
  fileType?.startsWith("video/") ||
  /\.(webm|mp4|mov|avi|mkv|m4v)$/i.test(fileName || "");

const isImageFile = (fileType, fileName) =>
  fileType?.startsWith("image/") ||
  (!isVideoFile(fileType, fileName) && /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(fileName || ""));

const formatMsgTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDateLabel = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart - 86400000);
  const msgStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (msgStart.getTime() === todayStart.getTime()) return 'Today';
  if (msgStart.getTime() === yesterdayStart.getTime()) return 'Yesterday';
  return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
};

const isSameDay = (a, b) => {
  const da = new Date(a), db = new Date(b);
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate();
};

const formatBytes = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const renderFileContent = (m, isMine) => {
  const { fileUrl, fileName, fileType, fileSize } = m;
  const src = resolveFileUrl(fileUrl);

  if (isImageFile(fileType, fileName)) {
    return (
      <a href={src} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
        <img
          src={src}
          alt={fileName}
          style={{ maxWidth: '240px', maxHeight: '280px', borderRadius: '12px', display: 'block', cursor: 'pointer' }}
        />
        {fileName && (
          <span style={{ fontSize: '11px', opacity: 0.75, display: 'block', marginTop: '4px', paddingLeft: '2px' }}>
            {fileName}
          </span>
        )}
      </a>
    );
  }

  if (isVideoFile(fileType, fileName)) {
    return (
      <div>
        <video
          src={src}
          controls
          style={{ maxWidth: '280px', maxHeight: '220px', borderRadius: '12px', display: 'block' }}
        />
        {fileName && (
          <span style={{ fontSize: '11px', opacity: 0.75, display: 'block', marginTop: '4px' }}>
            {fileName}
          </span>
        )}
      </div>
    );
  }

  if (fileType && fileType.startsWith('audio/')) {
    return (
      <div style={{ minWidth: '220px' }}>
        <audio src={src} controls style={{ width: '100%', display: 'block' }} />
        {fileName && (
          <span style={{ fontSize: '11px', opacity: 0.75, display: 'block', marginTop: '4px' }}>
            {fileName}
          </span>
        )}
      </div>
    );
  }

  // Generic document / unknown
  const ext = fileName ? fileName.split('.').pop().toUpperCase() : 'FILE';
  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      download={fileName}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
        color: 'inherit',
        padding: '4px 4px',
        minWidth: '180px',
      }}
    >
      <div style={{
        width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
        backgroundColor: isMine ? 'rgba(255,255,255,0.15)' : 'rgba(91,124,246,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '10px', fontWeight: 700, color: isMine ? '#fff' : '#5b7cf6',
      }}>
        {ext.substring(0, 4)}
      </div>
      <div style={{ overflow: 'hidden' }}>
        <div style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
          {fileName || 'File'}
        </div>
        <div style={{ fontSize: '11px', opacity: 0.65 }}>
          {fileSize ? formatBytes(fileSize) : ''} · {ext}
        </div>
      </div>
      <div style={{ marginLeft: 'auto', flexShrink: 0, opacity: 0.7 }}>
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </div>
    </a>
  );
};

const TrashIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const StatusChecks = ({ status }) => {
  const color = status === 'read' ? '#93c5fd' : '#9ca3af';
  return (
    <span style={{ color, fontSize: '12px', lineHeight: 1, letterSpacing: '-2px', fontWeight: 700 }}>
      ✓{status !== 'sent' ? '✓' : ''}
    </span>
  );
};

const MessageStatusInfo = ({ message, chat, userId }) => {
  const [open, setOpen] = useState(false);
  const info = getMessageStatusInfo(message, userId, chat);

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        title="Message info"
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          display: 'flex', alignItems: 'center', gap: '4px',
        }}
      >
        <StatusChecks status={info.status} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', bottom: '22px', right: 0, zIndex: 20,
          backgroundColor: '#1a1a2e', border: '1px solid #2e2e42',
          borderRadius: '10px', padding: '10px 12px', minWidth: '190px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        }}>
          <p style={{ margin: '0 0 6px', color: '#f0f0f5', fontSize: '12px', fontWeight: 600 }}>Message info</p>
          <p style={{ margin: '4px 0', color: '#9ca3af', fontSize: '11px' }}>
            Sent: {formatStatusTime(info.sentAt) || '—'}
          </p>
          <p style={{ margin: '4px 0', color: '#9ca3af', fontSize: '11px' }}>
            Delivered: {formatStatusTime(info.deliveredAt) || 'Pending'}
          </p>
          <p style={{ margin: '4px 0 0', color: info.status === 'read' ? '#93c5fd' : '#9ca3af', fontSize: '11px' }}>
            Read: {formatStatusTime(info.readAt) || 'Pending'}
          </p>
        </div>
      )}
    </div>
  );
};

const MessageBubble = ({ m, isMine, showAvatar, smallGap, onDeleteMessage, chat, userId }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '6px',
        justifyContent: isMine ? 'flex-end' : 'flex-start',
        marginTop: smallGap ? '2px' : '10px',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Receiver avatar */}
      {!isMine && (
        <div style={{ width: '28px', flexShrink: 0 }}>
          {showAvatar ? (
            <UserAvatar name={m.sender.name} pic={m.sender.pic} size={28} />
          ) : null}
        </div>
      )}

      {/* Sent: timestamp + delete button left of bubble */}
      {isMine && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, alignSelf: 'flex-end', marginBottom: '2px' }}>
          {!m.isDeleted && hovered && (
            <button
              onClick={() => onDeleteMessage(m._id)}
              title="Delete message"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#f43f5e', padding: '3px', borderRadius: '6px',
                display: 'flex', alignItems: 'center',
                opacity: 0.85,
              }}
            >
              <TrashIcon />
            </button>
          )}
          <span style={{ color: '#6b7280', fontSize: '11px' }}>
            {formatMsgTime(m.createdAt)}
          </span>
          {!m.isDeleted && (
            <MessageStatusInfo message={m} chat={chat} userId={userId} />
          )}
        </div>
      )}

      {/* Bubble */}
      {m.isDeleted ? (
        <div style={{
          maxWidth: '62%',
          padding: '9px 14px',
          borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          backgroundColor: isMine ? 'rgba(91,124,246,0.3)' : 'rgba(42,42,62,0.6)',
          color: '#6b7280',
          fontSize: '13px',
          fontStyle: 'italic',
          border: '1px dashed #3e3e52',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          This message was deleted
        </div>
      ) : (
        <div style={{
          maxWidth: '62%',
          padding: m.fileUrl && !m.content ? '6px' : '9px 14px',
          borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          backgroundColor: isMine ? C.bubbleMine : C.bubbleOther,
          color: isMine ? C.bubbleMineText : C.bubbleOtherText,
          fontSize: '14px',
          lineHeight: '1.5',
          wordBreak: 'break-word',
          overflow: 'hidden',
        }}>
          {m.fileUrl && renderFileContent(m, isMine)}
          {m.content && <span>{m.content}</span>}
        </div>
      )}

      {/* Received: timestamp right of bubble */}
      {!isMine && (
        <span style={{ color: '#6b7280', fontSize: '11px', flexShrink: 0, alignSelf: 'flex-end', marginBottom: '2px' }}>
          {formatMsgTime(m.createdAt)}
        </span>
      )}
    </div>
  );
};

const ScrollableChat = ({ messages, onDeleteMessage, chat, highlightMessageId }) => {
  const { user } = ChatState();

  return (
    <ScrollableFeed>
      {messages && messages.map((m, i) => {
        const isMine = String(m.sender._id) === String(user._id);
        const showAvatar = isSameSender(messages, m, i, user._id) || isLastMessage(messages, i, user._id);
        const smallGap = isSameUser(messages, m, i, user._id);
        const isHighlighted = highlightMessageId && String(m._id) === String(highlightMessageId);

        const showDateSep = i === 0 || !isSameDay(messages[i - 1].createdAt, m.createdAt);

        return (
          <div
            key={m._id}
            id={`message-${m._id}`}
            style={{
              borderRadius: '12px',
              transition: 'background-color 0.3s ease',
              backgroundColor: isHighlighted ? 'rgba(91, 124, 246, 0.15)' : 'transparent',
            }}
          >
            {showDateSep && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0 12px' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#2e2e42' }} />
                <span style={{ color: '#6b7280', fontSize: '12px', whiteSpace: 'nowrap' }}>
                  {formatDateLabel(m.createdAt)}
                </span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#2e2e42' }} />
              </div>
            )}

            <MessageBubble
              m={m}
              isMine={isMine}
              showAvatar={showAvatar}
              smallGap={smallGap}
              onDeleteMessage={onDeleteMessage}
              chat={chat}
              userId={user._id}
            />
          </div>
        );
      })}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
