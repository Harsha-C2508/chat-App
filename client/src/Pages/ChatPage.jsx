import React, { useState } from 'react'
import { ChatState } from '../Context/ChatProvider';
import { Box } from '@chakra-ui/react';
import SideDrawer from '../components/Chat/SideDrawer';

const ChatPage = () => {
    const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = ChatState();

  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrawer />}
      <Box d="flex" justifyContent="space-between" w="100%" h="91.5vh" p="10px">
        {/* {user && <MyChats fetchAgain={fetchAgain} />}
        {user && (
          <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )} */}
      </Box>
    </div>
  );
}

export default ChatPage