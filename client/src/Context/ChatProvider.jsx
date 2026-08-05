import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { ChatContext, readStoredUser } from './ChatContext';

const ENDPOINT = 'http://localhost:5000';

const ChatProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [selectedChat, setSelectedChat] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState();
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const history = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = readStoredUser();
    setUser(storedUser);
  }, [location.pathname]);

  useEffect(() => {
    if (!user && location.pathname.startsWith('/chats')) {
      history('/');
    }
  }, [user, location.pathname, history]);

  useEffect(() => {
    if (!user?._id) {
      return undefined;
    }

    const newSocket = io(ENDPOINT, { transports: ['websocket'] });

    newSocket.on('connect', () => {
      newSocket.emit('setup', user);
    });

    newSocket.on('connected', () => setSocketConnected(true));
    newSocket.on('online users', (users) => {
      setOnlineUsers(users.map(String));
    });
    newSocket.on('user online', (userId) => {
      setOnlineUsers(prev => {
        const id = String(userId);
        return prev.includes(id) ? prev : [...prev, id];
      });
    });
    newSocket.on('user offline', (userId) => {
      setOnlineUsers(prev => prev.filter(id => id !== String(userId)));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setSocketConnected(false);
      setOnlineUsers([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const value = useMemo(() => ({
    user, setUser,
    selectedChat, setSelectedChat,
    notification, setNotification,
    chats, setChats,
    socket,
    socketConnected,
    onlineUsers,
  }), [user, selectedChat, notification, chats, socket, socketConnected, onlineUsers]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
export { ChatState } from './ChatContext';
