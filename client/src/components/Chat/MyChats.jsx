import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { notifications } from '@mantine/notifications';
import { getSender, getSenderFull } from "../../config/ChatLogics";
import { ChatState } from "../../Context/ChatProvider";
import GroupChatModal from "./model/GroupChatModal";
import UserListItem from "./userAvatar/UserListItem";
import UserAvatar from "./userAvatar/UserAvatar";
import ChatLoading from "./ChatLoading";
import { C } from "../../config/themeColors";
import {
  hasSecretKey,
  verifySecretKey,
  resolveUserId,
  hideChat,
  unhideChat,
  getHiddenChatIds,
  clearHiddenChat,
} from "../../config/secretKey";

// ── helpers ──────────────────────────────────────────────────────────────────
const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((todayStart - msgStart) / 86400000);
  if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// ── styles ────────────────────────────────────────────────────────────────────
const S = {
  sidebar: {
    display: 'flex', flexDirection: 'column',
    width: '310px', minWidth: '310px', flexShrink: 0,
    backgroundColor: C.bgElevated,
    borderRight: `1px solid ${C.border}`,
    height: '100%',
    fontFamily: C.font,
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 20px 12px',
  },
  title: {
    display: 'flex', alignItems: 'center', gap: '8px',
  },
  dot: {
    width: '10px', height: '10px', borderRadius: '50%',
    backgroundColor: C.accent, flexShrink: 0,
  },
  titleText: {
    color: C.textPrimary, fontSize: '22px', fontWeight: 700,
    letterSpacing: '-0.3px', margin: 0,
  },
  addBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: C.textFaint, padding: '6px', borderRadius: '8px',
    display: 'flex', alignItems: 'center',
  },
  searchWrap: {
    padding: '0 16px 12px',
  },
  searchInner: {
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: C.bgBase, borderRadius: '12px',
    padding: '9px 14px',
  },
  searchInput: {
    background: 'none', border: 'none', outline: 'none',
    color: C.textMuted, fontSize: '14px', flex: 1,
  },
  sectionLabel: {
    padding: '4px 20px 8px',
    color: C.textFaint, fontSize: '11px', fontWeight: 600,
    letterSpacing: '0.08em', textTransform: 'uppercase',
  },
  list: { flex: 1, overflowY: 'auto', padding: '0 8px' },
  chatRow: (selected) => ({
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '10px 12px', borderRadius: '12px',
    marginBottom: '2px', cursor: 'pointer', border: 'none',
    width: '100%', textAlign: 'left',
    backgroundColor: selected ? C.bgHover : 'transparent',
    transition: 'background 0.15s',
  }),
  avatar: (color) => ({
    width: '44px', height: '44px', borderRadius: '50%',
    backgroundColor: color, display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#fff', fontSize: '14px',
    fontWeight: 700, flexShrink: 0,
  }),
  chatInfo: { flex: 1, minWidth: 0 },
  chatTopRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '3px',
  },
  chatName: {
    color: C.textPrimary, fontSize: '14px', fontWeight: 600,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  chatTime: { color: C.textFaint, fontSize: '11px', flexShrink: 0, marginLeft: '8px' },
  chatPreview: {
    color: C.textFaint, fontSize: '13px',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  badge: {
    backgroundColor: C.accent, color: '#fff',
    fontSize: '10px', fontWeight: 700,
    borderRadius: '9999px', minWidth: '18px', height: '18px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0 5px', flexShrink: 0,
  },
  bottomBar: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '14px 16px',
    borderTop: `1px solid ${C.border}`,
  },
  bottomAvatar: (color) => ({
    width: '34px', height: '34px', borderRadius: '50%',
    backgroundColor: color, display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#fff', fontSize: '12px',
    fontWeight: 700, flexShrink: 0,
  }),
  bottomName: { color: C.textSecondary, fontSize: '14px', fontWeight: 500, flex: 1 },
  dotsBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: C.textFaint, padding: '4px', display: 'flex', alignItems: 'center',
  },
};

// ── component ─────────────────────────────────────────────────────────────────
const MyChats = ({ fetchAgain, setFetchAgain, onOpenProfile, onCloseProfile, showProfile }) => {
  const [loggedUser, setLoggedUser] = useState();
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatMenuId, setChatMenuId] = useState(null);
  const [listVersion, setListVersion] = useState(0);
  const [secretUnlocked, setSecretUnlocked] = useState(false);
  const [searchMode, setSearchMode] = useState('users');
  const searchInputRef = useRef(null);

  const { selectedChat, setSelectedChat, user, chats, setChats, notification, setNotification } = ChatState();
  const userId = resolveUserId(user, loggedUser);

  useEffect(() => {
    if (showProfile) {
      setSearch('');
      setSearchResult([]);
    }
  }, [showProfile]);

  const fetchChats = async () => {
    try {
      const { data } = await axios.get('/api/chat', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setChats(data);
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to load chats', color: 'red' });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem('userInfo')));
    fetchChats();
    setSearch('');
    setSearchResult([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAgain]);

  const unlockHiddenChats = (hiddenCount) => {
    setSecretUnlocked(true);
    setSearch('');
    setSearchResult([]);
    setSearchMode('users');
    notifications.show({
      title: 'Unlocked',
      message: hiddenCount > 0
        ? `${hiddenCount} hidden chat${hiddenCount === 1 ? '' : 's'} visible`
        : 'No hidden chats right now',
      color: 'green',
    });
  };

  const tryUnlockSecret = (raw, { notifyWrongKey = false } = {}) => {
    const key = raw.trim();
    if (!key || !userId) return false;

    if (!hasSecretKey(userId)) {
      if (notifyWrongKey && getHiddenChatIds(userId).length > 0) {
        notifications.show({
          title: 'Secret key not set',
          message: 'Set one in Profile → Privacy first, then type it here.',
          color: 'yellow',
        });
      }
      return false;
    }

    if (!verifySecretKey(userId, key)) {
      if (notifyWrongKey) {
        notifications.show({
          title: 'Incorrect secret key',
          message: 'This does not match your privacy secret key.',
          color: 'red',
        });
      }
      return false;
    }

    unlockHiddenChats(getHiddenChatIds(userId).length);
    return true;
  };

  const handleSearch = async (q, { forceUnlock = false } = {}) => {
    setSearch(q);
    const trimmed = q.trim();
    if (!trimmed) {
      setSearchResult([]);
      setSearchMode('users');
      return;
    }

    if (tryUnlockSecret(trimmed, { notifyWrongKey: forceUnlock })) return;

    if (hasSecretKey(userId) && trimmed.length >= 4) {
      setSearchMode('unlock');
      setSearchResult([]);
      return;
    }

    if (!hasSecretKey(userId) && getHiddenChatIds(userId).length > 0) {
      setSearchMode('setup');
      setSearchResult([]);
      return;
    }

    setSearchMode('users');
    try {
      setSearching(true);
      const { data } = await axios.get(`/api/user?search=${encodeURIComponent(trimmed)}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSearchResult(data);
    } catch {
      notifications.show({ title: 'Error', message: 'Search failed', color: 'red' });
    } finally { setSearching(false); }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      tryUnlockSecret(search, { notifyWrongKey: true });
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const { data } = await axios.post('/api/chat', { userId }, {
        headers: { 'Content-type': 'application/json', Authorization: `Bearer ${user.token}` },
      });
      if (!chats.find(c => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setSearch(''); setSearchResult([]);
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to open chat', color: 'red' });
    } finally { setLoadingChat(false); }
  };

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    window.location.href = '/';
  };

  const bumpList = () => setListVersion(v => v + 1);

  const requestDelete = (chat) => {
    setChatMenuId(null);
    const chatName = !chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName;
    const confirmed = window.confirm(
      `Delete "${chatName}"?\n\nThis permanently removes the conversation${chat.isGroupChat ? ' for you' : ' and all messages'}.`
    );
    if (confirmed) performDelete(chat);
  };

  const performHide = (chat) => {
    if (!hasSecretKey(userId)) {
      notifications.show({
        title: 'Secret key required',
        message: 'Set a secret key in Profile → Privacy before hiding chats.',
        color: 'yellow',
      });
      return;
    }
    setChatMenuId(null);
    hideChat(userId, chat._id);
    if (String(selectedChat?._id) === String(chat._id)) setSelectedChat('');
    bumpList();
    notifications.show({ title: 'Chat hidden', message: 'Type your secret key in search and press Enter to view it', color: 'green' });
  };

  const performUnhide = (chat) => {
    setChatMenuId(null);
    unhideChat(userId, chat._id);
    bumpList();
    notifications.show({ title: 'Chat restored', message: 'Chat is visible again', color: 'green' });
  };

  const performDelete = async (chat) => {
    try {
      await axios.delete(`/api/chat/${chat._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      clearHiddenChat(userId, chat._id);
      setChats(prev => prev.filter(c => String(c._id) !== String(chat._id)));
      if (String(selectedChat?._id) === String(chat._id)) setSelectedChat('');
      setFetchAgain?.(f => !f);
      bumpList();
      notifications.show({ title: 'Chat deleted', message: 'Conversation removed', color: 'green' });
    } catch {
      notifications.show({ title: 'Error', message: 'Could not delete chat', color: 'red' });
    }
  };

  const hiddenIds = getHiddenChatIds(userId);
  // eslint-disable-next-line no-unused-expressions
  listVersion;

  const dedupeChats = (list) => {
    const seen = new Map();
    const deduped = [];
    for (const chat of list || []) {
      if (chat.isGroupChat) {
        deduped.push(chat);
      } else {
        const otherId = chat.users?.find(u => u?._id && String(u._id) !== String(loggedUser?._id))?._id;
        const key = otherId ? String(otherId) : chat._id;
        if (!seen.has(key)) {
          seen.set(key, true);
          deduped.push(chat);
        }
      }
    }
    return deduped;
  };

  const visibleChats = dedupeChats(chats).filter(c => !hiddenIds.includes(String(c._id)));
  const hiddenChats = dedupeChats(chats).filter(c => hiddenIds.includes(String(c._id)));

  const menuItemStyle = {
    width: '100%', textAlign: 'left', padding: '10px 12px',
    background: 'none', border: 'none', color: C.textSecondary,
    fontSize: '13px', cursor: 'pointer',
  };

  const renderChatRow = (chat, { isHiddenList = false } = {}) => {
    const isSelected = selectedChat?._id === chat._id;
    const chatName = !chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName;
    const chatPic = !chat.isGroupChat ? getSenderFull(loggedUser, chat.users)?.pic : null;
    const latestMsg = chat.latestMessage;
    const senderLabel = latestMsg?.sender?.name === user?.name ? 'You' : latestMsg?.sender?.name;
    const preview = latestMsg
      ? `${senderLabel}: ${latestMsg.content?.length > 38 ? latestMsg.content.substring(0, 38) + '…' : (latestMsg.content || '📎 Attachment')}`
      : 'No messages yet';

    return (
      <div key={chat._id} style={{ position: 'relative' }}>
        <button
          style={S.chatRow(isSelected)}
          onClick={() => { setSelectedChat(chat); setChatMenuId(null); onCloseProfile?.(); }}
        >
          <UserAvatar name={chatName} pic={chatPic} size={44} />
          <div style={S.chatInfo}>
            <div style={S.chatTopRow}>
              <span style={S.chatName}>{chatName}</span>
              <span style={S.chatTime}>{formatTime(latestMsg?.createdAt)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={S.chatPreview}>{preview}</span>
            </div>
          </div>
        </button>
        <button
          type="button"
          title="Chat options"
          onClick={(e) => {
            e.stopPropagation();
            setChatMenuId(chatMenuId === chat._id ? null : chat._id);
          }}
          style={{
            position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', color: C.textFaint,
            padding: '4px', borderRadius: '6px',
          }}
        >
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
          </svg>
        </button>
        {chatMenuId === chat._id && (
          <div style={{
            position: 'absolute', right: '8px', top: 'calc(100% - 4px)', zIndex: 60,
            minWidth: '140px', backgroundColor: C.bgElevated,
            border: `1px solid ${C.border}`, borderRadius: '10px',
            boxShadow: `0 8px 24px ${C.shadow}`, overflow: 'hidden',
          }}>
            {isHiddenList ? (
              <button
                type="button"
                onClick={() => performUnhide(chat)}
                style={menuItemStyle}
              >
                Unhide chat
              </button>
            ) : (
              <>
                <button type="button" onClick={() => performHide(chat)} style={menuItemStyle}>
                  Hide chat
                </button>
                <button
                  type="button"
                  onClick={() => requestDelete(chat)}
                  style={{ ...menuItemStyle, color: C.danger }}
                >
                  Delete chat
                </button>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={S.sidebar}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.title}>
          <span style={S.dot} />
          <h1 style={S.titleText}>Halo</h1>
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {/* Notification bell */}
          <div style={{ position: 'relative' }}>
            <button
              style={S.addBtn}
              onClick={() => setMenuOpen(m => m === 'notif' ? false : 'notif')}
              title="Notifications"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notification.length > 0 && (
                <span style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }} />
              )}
            </button>
            {menuOpen === 'notif' && (
              <div style={{ position: 'absolute', top: '36px', right: 0, zIndex: 50, width: '240px', backgroundColor: '#252535', border: '1px solid #2e2e42', borderRadius: '12px', boxShadow: '0 8px 32px #00000060', overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid #2e2e42', color: '#fff', fontSize: '13px', fontWeight: 600 }}>Notifications</div>
                {notification.length === 0
                  ? <div style={{ padding: '12px 14px', color: '#6b7280', fontSize: '13px' }}>No new messages</div>
                  : notification.map(notif => (
                    <button key={notif._id} onClick={() => { setSelectedChat(notif.chat); setNotification(notification.filter(n => n !== notif)); setMenuOpen(false); }}
                      style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', borderBottom: '1px solid #2e2e42', color: '#d1d5db', fontSize: '13px', cursor: 'pointer' }}>
                      {notif.chat.isGroupChat ? `New message in ${notif.chat.chatName}` : `New message from ${getSender(user, notif.chat.users)}`}
                    </button>
                  ))
                }
              </div>
            )}
          </div>

          {/* New group chat */}
          <GroupChatModal>
            <button style={S.addBtn} title="New Group Chat">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </GroupChatModal>
        </div>
      </div>

      {/* Search — results drop down; chat list always stays visible below */}
      <div style={{ ...S.searchWrap, position: 'relative', zIndex: 20 }}>
        <div style={S.searchInner}>
          <svg width="15" height="15" fill="none" stroke={C.textFaint} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={searchInputRef}
            id="halo-user-search"
            name="halo-user-search"
            type="search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-lpignore="true"
            data-form-type="other"
            readOnly
            onFocus={(e) => e.target.removeAttribute('readonly')}
            style={S.searchInput}
            placeholder="Search users"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          {search && (
            <button
              type="button"
              onClick={() => handleSearch('')}
              title="Clear search"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textFaint, padding: 0, display: 'flex' }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {search && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: '16px', right: '16px',
            maxHeight: '220px', overflowY: 'auto', zIndex: 60,
            backgroundColor: C.bgElevated,
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            boxShadow: `0 12px 32px ${C.shadow}`,
          }}>
            {searchMode === 'unlock' ? (
              <p style={{ color: C.textMuted, fontSize: '13px', padding: '12px 14px', margin: 0, lineHeight: 1.5 }}>
                Press <strong>Enter</strong> to unlock hidden chats with this key.
              </p>
            ) : searchMode === 'setup' ? (
              <p style={{ color: C.textMuted, fontSize: '13px', padding: '12px 14px', margin: 0, lineHeight: 1.5 }}>
                You have hidden chats. Set a secret key in Profile → Privacy, then type it here and press Enter.
              </p>
            ) : searching || loadingChat ? (
              <div style={{ padding: '12px' }}><ChatLoading /></div>
            ) : searchResult.length === 0 ? (
              <p style={{ color: C.textFaint, fontSize: '13px', padding: '12px 14px', margin: 0 }}>No users found</p>
            ) : (
              searchResult.map(u => (
                <UserListItem key={u._id} user={u} handleFunction={() => accessChat(u._id)} />
              ))
            )}
          </div>
        )}
      </div>

      {/* Chat list — always visible */}
      <>
        <div style={S.sectionLabel}>Messages</div>
        <div style={S.list}>
          {chats ? (
            visibleChats.length === 0
              ? (
                <p style={{ color: C.textFaint, fontSize: '13px', padding: '8px 12px', lineHeight: 1.5 }}>
                  {hiddenIds.length > 0
                    ? secretUnlocked
                      ? 'No visible chats'
                      : `${hiddenIds.length} chat${hiddenIds.length === 1 ? '' : 's'} hidden — type your secret key in search and press Enter`
                    : 'No chats yet'}
                </p>
              )
              : visibleChats.map(chat => renderChatRow(chat))
          ) : <ChatLoading />}
        </div>

        {secretUnlocked && (
          <>
            <div style={S.sectionLabel}>Hidden</div>
            <div style={{ ...S.list, maxHeight: '180px', paddingBottom: '8px' }}>
              {hiddenChats.length > 0
                ? hiddenChats.map(chat => renderChatRow(chat, { isHiddenList: true }))
                : <p style={{ color: C.textFaint, fontSize: '13px', padding: '8px 12px' }}>No hidden chats</p>}
            </div>
          </>
        )}
      </>

      {/* Bottom account bar */}
      <div style={S.bottomBar}>
        <UserAvatar name={user?.name} pic={user?.pic} size={34} />
        <span style={S.bottomName}>My Account</span>
        <div style={{ position: 'relative' }}>
          <button style={S.dotsBtn} onClick={() => setMenuOpen(m => m === 'account' ? false : 'account')}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
            </svg>
          </button>
          {menuOpen === 'account' && (
            <div style={{ position: 'absolute', bottom: '36px', right: 0, zIndex: 50, width: '160px', backgroundColor: '#252535', border: '1px solid #2e2e42', borderRadius: '12px', boxShadow: '0 8px 32px #00000060', overflow: 'hidden' }}>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setSearch('');
                  setSearchResult([]);
                  onOpenProfile?.();
                }}
                style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', color: '#d1d5db', fontSize: '13px', cursor: 'pointer' }}
              >My Profile</button>
              <div style={{ borderTop: '1px solid #2e2e42' }} />
              <button onClick={logoutHandler} style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', color: '#f87171', fontSize: '13px', cursor: 'pointer' }}>Logout</button>
            </div>
          )}
        </div>
      </div>

      {/* Click-outside to close menus */}
      {menuOpen && <div onClick={() => { setMenuOpen(false); setChatMenuId(null); }} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />}
    </div>
  );
};

export default MyChats;
