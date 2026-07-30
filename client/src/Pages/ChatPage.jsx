import React, { useState } from 'react'
import { ChatState } from '../Context/ChatContext';
import MyChats from '../components/Chat/MyChats';
import ChatBox from "../components/Chat/ChatBox";
import ProfilePanel from '../components/Chat/ProfilePanel';
import { C } from '../config/themeColors';

const ChatPage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const chatState = ChatState();
  const user = chatState?.user;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', backgroundColor: C.bgBase, fontFamily: C.font }}>
      {user && (
        <MyChats
          fetchAgain={fetchAgain}
          setFetchAgain={setFetchAgain}
          showProfile={showProfile}
          onOpenProfile={() => setShowProfile(true)}
          onCloseProfile={() => setShowProfile(false)}
        />
      )}
      {user && (
        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
          {showProfile && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 25 }}>
              <ProfilePanel onClose={() => setShowProfile(false)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ChatPage
