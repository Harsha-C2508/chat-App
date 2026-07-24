import { useMemo, useState } from 'react';

const panelStyle = {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  width: '320px',
  maxWidth: '100%',
  backgroundColor: '#1e1e2e',
  borderLeft: '1px solid #2e2e42',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 30,
  boxShadow: '-8px 0 32px rgba(0,0,0,0.25)',
};

const formatResultTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (msgDay.getTime() === today.getTime()) return `Today, ${time}`;
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${time}`;
};

const getPreview = (message) => {
  if (message.isDeleted) return 'Message deleted';
  if (message.content) return message.content;
  if (message.fileUrl) return message.fileName ? `📎 ${message.fileName}` : '📎 Attachment';
  return 'Empty message';
};

const ChatSearchPanel = ({ messages, userId, onClose, onSelectMessage }) => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return messages
      .filter(m => !m.isDeleted)
      .filter(m => {
        const inContent = m.content?.toLowerCase().includes(q);
        const inFile = m.fileName?.toLowerCase().includes(q);
        return inContent || inFile;
      })
      .slice()
      .reverse();
  }, [messages, query]);

  return (
    <div style={panelStyle}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '14px 16px',
        borderBottom: '1px solid #2e2e42',
        backgroundColor: '#252535',
      }}>
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px', display: 'flex' }}
          title="Close"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 style={{ color: '#f0f0f5', fontSize: '15px', fontWeight: 600, margin: 0 }}>Search in chat</h3>
      </div>

      <div style={{ padding: '14px 16px', borderBottom: '1px solid #2e2e42' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#252535',
          borderRadius: '10px',
          padding: '10px 12px',
          border: '1px solid #2e2e42',
        }}>
          <svg width="16" height="16" fill="none" stroke="#6b7280" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search messages..."
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: '#f0f0f5',
              fontSize: '14px',
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0, display: 'flex' }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {!query.trim() ? (
          <p style={{ color: '#6b7280', fontSize: '13px', padding: '16px', margin: 0, textAlign: 'center' }}>
            Find messages by text or file name
          </p>
        ) : results.length === 0 ? (
          <p style={{ color: '#6b7280', fontSize: '13px', padding: '16px', margin: 0, textAlign: 'center' }}>
            No messages found
          </p>
        ) : (
          results.map(m => {
            const isMine = String(m.sender._id) === String(userId);
            return (
              <button
                key={m._id}
                type="button"
                onClick={() => onSelectMessage(m._id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '12px 16px',
                  borderBottom: '1px solid #252535',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#252535'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ color: isMine ? '#93c5fd' : '#10b981', fontSize: '12px', fontWeight: 600 }}>
                    {isMine ? 'You' : m.sender?.name || 'Unknown'}
                  </span>
                  <span style={{ color: '#6b7280', fontSize: '11px', flexShrink: 0 }}>
                    {formatResultTime(m.createdAt)}
                  </span>
                </div>
                <p style={{
                  color: '#d1d5db',
                  fontSize: '13px',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.4,
                }}>
                  {getPreview(m)}
                </p>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatSearchPanel;
