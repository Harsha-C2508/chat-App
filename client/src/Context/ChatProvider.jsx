// Context Api help us to manage the states of our app

import React, { createContext, useContext, useState } from 'react'
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";

const chatContext = createContext();

const ChatProvider = ({children}) => {
    const [user, setUser] = useState();
    const [selectedChat, setSelectedChat] = useState();
    const [notification, setNotification] = useState([]);
    const [chats, setChats] = useState();
    const history = useNavigate();

    useEffect(()=>{
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        setUser(userInfo);

        if(!userInfo) {
          history("/");
        }
    },[history])
  return (
    <chatContext.Provider value={{
        user,setUser,
        selectedChat,setSelectedChat,
        notification,setNotification,
        chats,setChats,
    }}>{children}</chatContext.Provider>
  )
}

export const ChatState = () =>{
    return useContext(chatContext);
}

export default ChatProvider;
