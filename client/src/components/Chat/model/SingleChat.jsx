import React, { useState, useEffect, useRef } from 'react';
import { ChatState } from '../../../Context/ChatProvider';
import UpdateGroupChatModal from './UpdateGroupChatModal';
import ProfileModel from "./ProfileModel";
import { getSender, getSenderFull } from "../../../config/ChatLogics";
import axios from 'axios';
import "./styles.css";
import ScrollableChat from './ScrollableChat';
import ChatDetailsPanel from './ChatDetailsPanel';
import ChatSearchPanel from './ChatSearchPanel';
import UserAvatar from '../userAvatar/UserAvatar';
import { getChatWallpaper, buildWallpaperStyles } from '../../../config/chatBackgrounds';
import Lottie from "react-lottie";
import animationData from "../../../animation/typing.json";
import { notifications } from '@mantine/notifications';
import { C } from '../../../config/themeColors';

const S = {
  root: { display: 'flex', flexDirection: 'column', height: '100%', fontFamily: C.font },
  empty: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.bgBase,
  },
  emptyIcon: {
    width: '64px', height: '64px', borderRadius: '16px',
    backgroundColor: C.bgElevated, display: 'flex',
    alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
  },
  emptyText: { color: C.textFaint, fontSize: '14px' },
  header: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 20px', borderBottom: `1px solid ${C.border}`,
    backgroundColor: C.bgBase, flexShrink: 0,
  },
  headerAvatar: (color) => ({
    width: '38px', height: '38px', borderRadius: '50%',
    backgroundColor: color, display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#fff', fontSize: '13px',
    fontWeight: 700, flexShrink: 0,
  }),
  headerInfo: { flex: 1 },
  headerName: { color: C.textPrimary, fontSize: '15px', fontWeight: 600, margin: 0 },
  headerStatus: (online) => ({ color: online ? C.online : C.textFaint, fontSize: '12px', margin: 0 }),
  headerActions: { display: 'flex', alignItems: 'center', gap: '4px' },
  iconBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: C.textFaint, padding: '7px', borderRadius: '8px',
    display: 'flex', alignItems: 'center',
  },
  messagesArea: {
    flex: 1, overflow: 'hidden', display: 'flex',
    flexDirection: 'column', padding: '16px 16px 8px',
  },
  inputBar: {
    padding: '12px 16px', borderTop: `1px solid ${C.border}`,
    backgroundColor: C.bgBase, flexShrink: 0,
  },
  inputInner: {
    display: 'flex', alignItems: 'center', gap: '12px',
    backgroundColor: C.bgElevated, borderRadius: '14px',
    padding: '10px 14px',
  },
  input: {
    flex: 1, background: 'none', border: 'none', outline: 'none',
    color: C.textSecondary, fontSize: '14px',
  },
  sendBtn: {
    width: '34px', height: '34px', borderRadius: '50%',
    backgroundColor: C.accent, border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
};

const ATTACHMENT_TYPES = [
  {
    id: 'image',
    label: 'Photo',
    accept: 'image/*',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: '#10b981',
  },
  {
    id: 'video',
    label: 'Video',
    accept: 'video/*',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 10l4.553-2.277A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
      </svg>
    ),
    color: '#f43f5e',
  },
  {
    id: 'document',
    label: 'Document',
    accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.csv',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: C.accent,
  },
  {
    id: 'audio',
    label: 'Audio',
    accept: 'audio/*',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
    color: '#f59e0b',
  },
];

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [highlightMessageId, setHighlightMessageId] = useState(null);
  const [chatWallpaper, setChatWallpaper] = useState({ type: 'preset', id: 'default' });
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);
  const fileInputAcceptRef = useRef('*');
  const attachMenuRef = useRef(null);
  const { user, selectedChat, setSelectedChat, setNotification, socket, socketConnected, onlineUsers } = ChatState();
  const selectedChatRef = useRef(selectedChat);

  const authHeaders = () => ({ Authorization: `Bearer ${user.token}` });

  const updateMessageInState = (updatedMsg) => {
    setMessages(prev => prev.map(m => String(m._id) === String(updatedMsg._id) ? updatedMsg : m));
  };

  const markMessageDelivered = async (messageId) => {
    if (!messageId) return;
    try {
      const { data } = await axios.put(`/api/message/delivered/${messageId}`, {}, { headers: authHeaders() });
      updateMessageInState(data);
    } catch {
      // ignore delivery ack failures
    }
  };

  const markChatAsRead = async (chatId) => {
    if (!chatId) return;
    try {
      const { data } = await axios.put(`/api/message/read/${chatId}`, {}, { headers: authHeaders() });
      (data.messages || []).forEach(updateMessageInState);
    } catch {
      // ignore read ack failures
    }
  };

  const defaultOptions = {
    loop: true, autoplay: true, animationData,
    rendererSettings: { preserveAspectRatio: 'xMidYMid slice' },
  };

  useEffect(() => {
    if (!socket) return;

    const onTyping = (fromUserId) => {
      if (fromUserId !== user._id) setIsTyping(true);
    };
    const onStopTyping = (fromUserId) => {
      if (fromUserId !== user._id) setIsTyping(false);
    };
    const onMessageReceived = (newMsg) => {
      if (!selectedChatRef.current || String(selectedChatRef.current._id) !== String(newMsg.chat._id)) {
        markMessageDelivered(newMsg._id);
        setNotification(prev => {
          const alreadyExists = prev.some(n => n._id === newMsg._id);
          if (alreadyExists) return prev;
          setFetchAgain(f => !f);
          return [newMsg, ...prev];
        });
      } else {
        setMessages(prev => [...prev, newMsg]);
        markMessageDelivered(newMsg._id);
        markChatAsRead(newMsg.chat._id || selectedChatRef.current._id);
      }
    };
    const onMessageDeleted = (deletedMsg) => {
      setMessages(prev =>
        prev.map(m => String(m._id) === String(deletedMsg._id) ? deletedMsg : m)
      );
    };
    const onMessageStatus = (updatedMsg) => {
      updateMessageInState(updatedMsg);
    };

    socket.on('typing', onTyping);
    socket.on('stop typing', onStopTyping);
    socket.on('message recieved', onMessageReceived);
    socket.on('message deleted', onMessageDeleted);
    socket.on('message status', onMessageStatus);

    return () => {
      socket.off('typing', onTyping);
      socket.off('stop typing', onStopTyping);
      socket.off('message recieved', onMessageReceived);
      socket.off('message deleted', onMessageDeleted);
      socket.off('message status', onMessageStatus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
    setShowDetailsPanel(false);
    setShowSearchPanel(false);
    setHighlightMessageId(null);
    if (selectedChat && user?._id) {
      setChatWallpaper(getChatWallpaper(user._id, selectedChat._id));
    }
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat]);

  const handleSelectSearchResult = (messageId) => {
    setShowSearchPanel(false);
    setHighlightMessageId(messageId);
    requestAnimationFrame(() => {
      const el = document.getElementById(`message-${messageId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    setTimeout(() => setHighlightMessageId(null), 2500);
  };

  const fetchMessages = async () => {
    setLoading(true);
    if (!selectedChat) return;
    try {
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMessages(data);
      socket?.emit('join chat', selectedChat._id);
      await markChatAsRead(selectedChat._id);
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to load messages', color: 'red' });
    } finally { setLoading(false); }
  };

  const sendMessage = async (event) => {
    if (event.key === 'Enter' && newMessage) {
      socket?.emit('stop typing', { room: selectedChat._id, userId: user._id });
      try {
        const config = {
          headers: { 'Content-type': 'application/json', Authorization: `Bearer ${user.token}` },
        };
        setNewMessage('');
        const { data } = await axios.post('/api/message', {
          content: newMessage, chatId: selectedChat._id,
        }, config);
        socket?.emit('new message', data);
        const normalizedData = {
          ...data,
          sender: { ...data.sender, _id: String(data.sender._id) },
          chat: {
            ...data.chat,
            _id: String(data.chat._id),
            users: data.chat.users,
          },
        };
        setMessages(prev => [...prev, normalizedData]);
      } catch {
        notifications.show({ title: 'Error', message: 'Failed to send message', color: 'red' });
      }
    }
  };

  const handleSendClick = () => {
    if (newMessage) sendMessage({ key: 'Enter' });
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socket?.emit('typing', { room: selectedChat._id, userId: user._id });
    }
    const lastTypingTime = new Date().getTime();
    setTimeout(() => {
      const timeNow = new Date().getTime();
      if (timeNow - lastTypingTime >= 3000) {
        socket?.emit('stop typing', { room: selectedChat._id, userId: user._id });
        setTyping(false);
      }
    }, 3000);
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const { data } = await axios.put(
        `/api/message/delete/${messageId}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setMessages(prev => prev.map(m => String(m._id) === String(data._id) ? data : m));
      socket?.emit('message deleted', data);
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to delete message', color: 'red' });
    }
  };

  const openFilePicker = (accept) => {
    fileInputAcceptRef.current = accept;
    fileInputRef.current.accept = accept;
    fileInputRef.current.value = '';
    fileInputRef.current.click();
    setShowAttachMenu(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      notifications.show({ title: 'File too large', message: 'Maximum file size is 25 MB', color: 'red' });
      return;
    }

    setUploadingFile(true);
    try {
      const base64 = await fileToBase64(file);
      const uploadRes = await axios.post(
        '/api/upload',
        { base64, fileName: file.name, fileType: file.type, fileSize: file.size },
        { headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' } }
      );

      const { fileUrl, fileName, fileType, fileSize } = uploadRes.data;

      const { data } = await axios.post(
        '/api/message',
        { content: '', chatId: selectedChat._id, fileUrl, fileName, fileType, fileSize },
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` } }
      );

      socket?.emit('new message', data);
      setMessages(prev => [...prev, data]);
    } catch (err) {
      notifications.show({ title: 'Upload failed', message: err?.response?.data?.message || 'Could not send file', color: 'red' });
    } finally {
      setUploadingFile(false);
    }
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
    });

  // Close attach menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target)) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!selectedChat) {
    return (
      <div style={S.empty}>
        <div style={S.emptyIcon}>
          <svg width="32" height="32" fill="none" stroke="#4b5563" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p style={S.emptyText}>Select a conversation to start chatting</p>
      </div>
    );
  }

  const chatName = !selectedChat.isGroupChat
    ? getSender(user, selectedChat.users)
    : selectedChat.chatName;
  const headerPic = !selectedChat.isGroupChat ? getSenderFull(user, selectedChat.users)?.pic : null;
  const otherUser = !selectedChat.isGroupChat ? getSenderFull(user, selectedChat.users) : null;
  const isOnline = otherUser && onlineUsers.includes(String(otherUser._id));
  const onlineCount = selectedChat.isGroupChat
    ? selectedChat.users.filter(u => onlineUsers.includes(String(u._id))).length
    : 0;

  const wallpaperStyles = buildWallpaperStyles(chatWallpaper);

  return (
    <div style={{ ...S.root, position: 'relative' }}>
      {/* Header */}
      <div style={S.header}>
        {/* Mobile back */}
        <button
          onClick={() => setSelectedChat('')}
          style={{ ...S.iconBtn, display: 'none' }}
          className="md:hidden"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <UserAvatar name={chatName} pic={headerPic} size={38} />

        <div style={S.headerInfo}>
          <p style={S.headerName}>{chatName}</p>
          {!selectedChat.isGroupChat ? (
            <p style={S.headerStatus(isOnline)}>● {isOnline ? 'Online' : 'Offline'}</p>
          ) : (
            <p style={S.headerStatus(onlineCount > 0)}>
              ● {onlineCount > 0 ? `${onlineCount} online` : 'No one online'}
            </p>
          )}
        </div>

        <div style={S.headerActions}>
          {/* Chat details & shared media */}
          <button
            type="button"
            style={{ ...S.iconBtn, color: showDetailsPanel ? C.accent : C.textFaint }}
            onClick={() => {
              setShowSearchPanel(false);
              setShowDetailsPanel(v => !v);
            }}
            title="Chat details"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
          {/* Search in chat */}
          <button
            type="button"
            style={{ ...S.iconBtn, color: showSearchPanel ? C.accent : C.textFaint }}
            onClick={() => {
              setShowDetailsPanel(false);
              setShowSearchPanel(v => !v);
            }}
            title="Search in chat"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          {/* Profile / group settings */}
          {!selectedChat.isGroupChat ? (
            <ProfileModel userInfo={getSenderFull(user, selectedChat.users)}>
              <button style={S.iconBtn}>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="1" fill="currentColor" />
                  <circle cx="12" cy="12" r="1" fill="currentColor" />
                  <circle cx="12" cy="19" r="1" fill="currentColor" />
                </svg>
              </button>
            </ProfileModel>
          ) : (
            <UpdateGroupChatModal
              fetchMessages={fetchMessages}
              fetchAgain={fetchAgain}
              setFetchAgain={setFetchAgain}
            />
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ ...S.messagesArea, ...wallpaperStyles.container, position: 'relative' }}>
        {wallpaperStyles.overlay > 0 && (
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundColor: `rgba(0, 0, 0, ${wallpaperStyles.overlay})`,
          }} />
        )}
        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '32px', height: '32px', border: `2px solid ${C.accent}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <div className="messages" style={{ flex: 1, overflowY: 'auto' }}>
            <ScrollableChat
              messages={messages}
              onDeleteMessage={handleDeleteMessage}
              chat={selectedChat}
              highlightMessageId={highlightMessageId}
            />
          </div>
        )}
        {istyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '6px', paddingLeft: '38px' }}>
            <Lottie options={defaultOptions} width={48} style={{ margin: 0 }} />
          </div>
        )}
        </div>
      </div>

      {/* Input */}
      <div style={S.inputBar}>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <div style={S.inputInner}>
          {/* Attachment button */}
          <div ref={attachMenuRef} style={{ position: 'relative' }}>
            <button
              style={{ ...S.iconBtn, padding: '0', color: showAttachMenu ? C.accent : C.textFaint }}
              onClick={() => setShowAttachMenu(v => !v)}
              title="Attach file"
            >
              {uploadingFile ? (
                <div style={{ width: '20px', height: '20px', border: `2px solid ${C.accent}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              ) : (
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              )}
            </button>

            {/* Attachment menu popup */}
            {showAttachMenu && (
              <div style={{
                position: 'absolute',
                bottom: '44px',
                left: '-8px',
                backgroundColor: '#1a1a2e',
                border: '1px solid #2e2e42',
                borderRadius: '14px',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                zIndex: 100,
                minWidth: '148px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}>
                {ATTACHMENT_TYPES.map(at => (
                  <button
                    key={at.id}
                    onClick={() => openFilePicker(at.accept)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: at.color,
                      padding: '8px 10px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 500,
                      textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#252535'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {at.icon}
                    {at.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <input
            style={S.input}
            placeholder={`Message ${chatName}...`}
            value={newMessage}
            onChange={typingHandler}
            onKeyDown={sendMessage}
          />
          <button style={S.sendBtn} onClick={handleSendClick} title="Send">
            <svg width="16" height="16" fill="none" stroke="#fff" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

      {showDetailsPanel && (
        <ChatDetailsPanel
          chat={selectedChat}
          messages={messages}
          user={user}
          onlineUsers={onlineUsers}
          onClose={() => setShowDetailsPanel(false)}
          onWallpaperChange={setChatWallpaper}
        />
      )}

      {showSearchPanel && (
        <ChatSearchPanel
          messages={messages}
          userId={user._id}
          onClose={() => setShowSearchPanel(false)}
          onSelectMessage={handleSelectSearchResult}
        />
      )}
    </div>
  );
};

export default SingleChat;
