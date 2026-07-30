import { createContext, useContext } from 'react';

export const defaultChatContext = {
  user: undefined,
  setUser: () => {},
  selectedChat: undefined,
  setSelectedChat: () => {},
  notification: [],
  setNotification: () => {},
  chats: undefined,
  setChats: () => {},
  socket: null,
  socketConnected: false,
  onlineUsers: [],
};

export const ChatContext = createContext(defaultChatContext);

export const ChatState = () => useContext(ChatContext);

export const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('userInfo') || 'null');
  } catch {
    return null;
  }
};
