import { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { ChatState } from "../../../Context/ChatProvider";
import ProfileModel from "./ProfileModel";
import UserListItem from "../userAvatar/UserListItem";
import ChatLoading from "../ChatLoading";
import { getSender } from "../../../config/ChatLogics";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

  const history = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history("/");
  };

  const handleSearch = async () => {
    if (!search) {
      notifications.show({
        title: 'Search required',
        message: 'Please enter something to search',
        color: 'yellow',
      });
      return;
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load search results',
        color: 'red',
      });
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      setDrawerOpen(false);
      setSearch("");
      setSearchResult([]);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch chat',
        color: 'red',
      });
      setLoadingChat(false);
    }
  };

  const getInitials = (name = '') =>
    name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

  const avatarColors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500'];
  const getAvatarColor = (name = '') => {
    const idx = name.charCodeAt(0) % avatarColors.length;
    return avatarColors[idx];
  };

  return (
    <>
      {/* Narrow icon-rail sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '4rem', minWidth: '4rem', backgroundColor: '#111118', borderRight: '1px solid #22223a', padding: '1rem 0', gap: '1rem', flexShrink: 0, height: '100%' }} className="flex flex-col items-center w-16 bg-dark-900 border-r border-dark-700 py-4 gap-4 flex-shrink-0">
        {/* Logo */}
        <div className="mb-2">
          <span className="w-3 h-3 rounded-full bg-accent block"></span>
        </div>

        {/* Search trigger */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-dark-700 transition"
          title="Search users"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-dark-700 transition"
            title="Notifications"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {notification.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {notification.length > 9 ? '9+' : notification.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute left-12 top-0 z-50 w-64 bg-dark-800 border border-dark-600 rounded-xl shadow-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-dark-600">
                <p className="text-sm font-semibold text-white">Notifications</p>
              </div>
              {notification.length === 0 ? (
                <p className="text-gray-400 text-sm px-4 py-3">No new messages</p>
              ) : (
                notification.map((notif) => (
                  <button
                    key={notif._id}
                    onClick={() => {
                      setSelectedChat(notif.chat);
                      setNotification(notification.filter((n) => n !== notif));
                      setNotifOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-dark-700 transition border-b border-dark-700 last:border-0"
                  >
                    {notif.chat.isGroupChat
                      ? `New message in ${notif.chat.chatName}`
                      : `New message from ${getSender(user, notif.chat.users)}`}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* User avatar / menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`w-9 h-9 rounded-full ${getAvatarColor(user?.name)} flex items-center justify-center text-white text-xs font-bold`}
            title="Menu"
          >
            {getInitials(user?.name)}
          </button>

          {menuOpen && (
            <div className="absolute left-12 bottom-0 z-50 w-44 bg-dark-800 border border-dark-600 rounded-xl shadow-xl overflow-hidden">
              <ProfileModel userInfo={user}>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-dark-700 transition"
                >
                  My Profile
                </button>
              </ProfileModel>
              <div className="border-t border-dark-600" />
              <button
                onClick={logoutHandler}
                className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-dark-700 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search Drawer overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-80 bg-dark-800 h-full flex flex-col shadow-2xl">
            <div className="px-5 py-4 border-b border-dark-600 flex items-center justify-between">
              <h2 className="text-white font-semibold text-base">Search Users</h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-4 pt-4 pb-2 flex gap-2">
              <input
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-accent"
              />
              <button
                onClick={handleSearch}
                className="bg-accent hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                Go
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-2">
              {loading ? (
                <ChatLoading />
              ) : (
                searchResult.map((u) => (
                  <UserListItem
                    key={u._id}
                    user={u}
                    handleFunction={() => accessChat(u._id)}
                  />
                ))
              )}
              {loadingChat && (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Click-outside dismissal for menus */}
      {(menuOpen || notifOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setMenuOpen(false); setNotifOpen(false); }}
        />
      )}
    </>
  );
};

export default SideDrawer;
