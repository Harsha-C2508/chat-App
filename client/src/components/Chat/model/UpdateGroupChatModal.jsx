import axios from "axios";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { ChatState } from "../../../Context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";

const S = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 50,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '16px', backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modal: {
    position: 'relative', backgroundColor: '#252535',
    border: '1px solid #2e2e42', borderRadius: '16px',
    width: '100%', maxWidth: '440px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)', overflow: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '18px 20px', borderBottom: '1px solid #2e2e42',
  },
  title: { color: '#f0f0f5', fontSize: '16px', fontWeight: 600, margin: 0 },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#6b7280', padding: '4px', display: 'flex', alignItems: 'center',
  },
  body: { padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' },
  input: {
    width: '100%', backgroundColor: '#1e1e2e', border: '1px solid #2e2e42',
    borderRadius: '10px', padding: '10px 14px', color: '#e5e7eb',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  },
  row: { display: 'flex', gap: '8px' },
  updateBtn: {
    backgroundColor: '#5b7cf6', color: '#fff', border: 'none',
    borderRadius: '10px', padding: '10px 16px', fontSize: '14px',
    fontWeight: 600, cursor: 'pointer', flexShrink: 0,
  },
  resultsWrap: { maxHeight: '144px', overflowY: 'auto' },
  spinner: {
    width: '20px', height: '20px', border: '2px solid #5b7cf6',
    borderTopColor: 'transparent', borderRadius: '50%',
    animation: 'spin 1s linear infinite', margin: '12px auto',
  },
  footer: { padding: '14px 20px', borderTop: '1px solid #2e2e42' },
  leaveBtn: {
    width: '100%', backgroundColor: 'rgba(239,68,68,0.15)',
    color: '#f87171', border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '10px', padding: '11px', fontSize: '14px',
    fontWeight: 600, cursor: 'pointer',
  },
};

const UpdateGroupChatModal = ({ fetchMessages, fetchAgain, setFetchAgain }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  const { selectedChat, setSelectedChat, user } = ChatState();

  const handleSearch = async (query) => {
    if (!query) { setSearchResult([]); return; }
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/user?search=${query}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSearchResult(data);
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to load search results', color: 'red' });
    } finally { setLoading(false); }
  };

  const handleRename = async () => {
    if (!groupChatName) return;
    try {
      setRenameLoading(true);
      const { data } = await axios.put('/api/chat/rename', {
        chatId: selectedChat._id, groupName: groupChatName,
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      setSelectedChat(data); setFetchAgain(!fetchAgain); setGroupChatName('');
    } catch (error) {
      notifications.show({ title: 'Error', message: error.response?.data?.message || 'Rename failed', color: 'red' });
    } finally { setRenameLoading(false); }
  };

  const handleAddUser = async (userToAdd) => {
    if (selectedChat.users.find(u => u._id === userToAdd._id)) {
      notifications.show({ title: 'Already in group', message: 'User is already in the group', color: 'yellow' });
      return;
    }
    if (selectedChat.groupAdmin._id !== user._id) {
      notifications.show({ title: 'Access denied', message: 'Only admins can add users', color: 'red' });
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.put('/api/chat/groupadd', {
        chatId: selectedChat._id, userId: userToAdd._id,
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      setSelectedChat(data); setFetchAgain(!fetchAgain);
    } catch (error) {
      notifications.show({ title: 'Error', message: error.response?.data?.message || 'Failed to add user', color: 'red' });
    } finally { setLoading(false); setGroupChatName(''); }
  };

  const handleRemove = async (userToRemove) => {
    if (selectedChat.groupAdmin._id !== user._id && userToRemove._id !== user._id) {
      notifications.show({ title: 'Access denied', message: 'Only admins can remove users', color: 'red' });
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.put('/api/chat/groupremove', {
        chatId: selectedChat._id, userId: userToRemove._id,
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      userToRemove._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain); fetchMessages();
    } catch (error) {
      notifications.show({ title: 'Error', message: error.response?.data?.message || 'Failed to remove user', color: 'red' });
    } finally { setLoading(false); setGroupChatName(''); }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '7px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
        title="Group settings"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1" fill="currentColor" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
          <circle cx="12" cy="19" r="1" fill="currentColor" />
        </svg>
      </button>

      {isOpen && (
        <div style={S.overlay} onClick={() => setIsOpen(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.header}>
              <h2 style={S.title}>{selectedChat.chatName}</h2>
              <button style={S.closeBtn} onClick={() => setIsOpen(false)}>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div style={S.body}>
              {/* Members */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {selectedChat.users.map(u => (
                  <UserBadgeItem key={u._id} user={u} admin={selectedChat.groupAdmin._id} handleFunction={() => handleRemove(u)} />
                ))}
              </div>

              {/* Rename */}
              <div style={S.row}>
                <input
                  style={S.input}
                  placeholder="Rename group"
                  value={groupChatName}
                  onChange={e => setGroupChatName(e.target.value)}
                />
                <button style={S.updateBtn} onClick={handleRename} disabled={renameLoading}>
                  {renameLoading ? '...' : 'Rename'}
                </button>
              </div>

              {/* Add user */}
              <input
                style={S.input}
                placeholder="Add user to group"
                onChange={e => handleSearch(e.target.value)}
              />

              <div style={S.resultsWrap}>
                {loading
                  ? <div style={S.spinner} />
                  : searchResult.map(u => (
                    <UserListItem key={u._id} user={u} handleFunction={() => handleAddUser(u)} />
                  ))
                }
              </div>
            </div>

            <div style={S.footer}>
              <button style={S.leaveBtn} onClick={() => handleRemove(user)}>Leave Group</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UpdateGroupChatModal;
