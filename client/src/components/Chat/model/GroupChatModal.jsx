import axios from "axios";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";
import { ChatState } from "../../../Context/ChatProvider";

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
    borderRadius: '6px',
  },
  body: { padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' },
  input: {
    width: '100%', backgroundColor: '#1e1e2e', border: '1px solid #2e2e42',
    borderRadius: '10px', padding: '10px 14px', color: '#e5e7eb',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  },
  resultsWrap: { maxHeight: '176px', overflowY: 'auto' },
  spinner: {
    width: '20px', height: '20px', border: '2px solid #5b7cf6',
    borderTopColor: 'transparent', borderRadius: '50%',
    animation: 'spin 1s linear infinite', margin: '12px auto',
  },
  footer: { padding: '14px 20px', borderTop: '1px solid #2e2e42' },
  createBtn: {
    width: '100%', backgroundColor: '#5b7cf6', color: '#fff',
    border: 'none', borderRadius: '10px', padding: '11px',
    fontSize: '14px', fontWeight: 600, cursor: 'pointer',
  },
};

const GroupChatModal = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user, chats, setChats } = ChatState();

  const handleGroup = (userToAdd) => {
    if (selectedUsers.find(u => u._id === userToAdd._id)) {
      notifications.show({ title: 'Already added', message: 'User is already in the group', color: 'yellow' });
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleSearch = async (query) => {
    setSearch(query);
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

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter(sel => sel._id !== delUser._id));
  };

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers.length) {
      notifications.show({ title: 'Missing fields', message: 'Please fill all the fields', color: 'yellow' });
      return;
    }
    try {
      const { data } = await axios.post('/api/chat/group', {
        name: groupChatName,
        users: JSON.stringify(selectedUsers.map(u => u._id)),
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      setChats([data, ...chats]);
      setIsOpen(false);
      setGroupChatName(''); setSelectedUsers([]); setSearchResult([]);
      notifications.show({ title: 'Group Created', message: 'New group chat created!', color: 'green' });
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to create group chat', color: 'red' });
    }
  };

  const close = () => { setIsOpen(false); setSearch(''); setSearchResult([]); };

  return (
    <>
      <span onClick={() => setIsOpen(true)}>{children}</span>

      {isOpen && (
        <div style={S.overlay} onClick={close}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={S.header}>
              <h2 style={S.title}>Create Group Chat</h2>
              <button style={S.closeBtn} onClick={close}>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div style={S.body}>
              <input
                style={S.input}
                placeholder="Chat Name"
                value={groupChatName}
                onChange={e => setGroupChatName(e.target.value)}
              />
              <input
                style={S.input}
                placeholder="Add users (e.g. John, Jane)"
                value={search}
                onChange={e => handleSearch(e.target.value)}
              />

              {/* Selected user badges */}
              {selectedUsers.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {selectedUsers.map(u => (
                    <UserBadgeItem key={u._id} user={u} handleFunction={() => handleDelete(u)} />
                  ))}
                </div>
              )}

              {/* Search results */}
              <div style={S.resultsWrap}>
                {loading
                  ? <div style={S.spinner} />
                  : searchResult.slice(0, 4).map(u => (
                    <UserListItem key={u._id} user={u} handleFunction={() => handleGroup(u)} />
                  ))
                }
              </div>
            </div>

            {/* Footer */}
            <div style={S.footer}>
              <button style={S.createBtn} onClick={handleSubmit}>Create Group</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupChatModal;
