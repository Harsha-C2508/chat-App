import React from 'react'
import { ChatState } from '../../../Context/ChatProvider'
import { Box, IconButton, Text } from '@chakra-ui/react';
import UpdateGroupChatModal from './UpdateGroupChatModal';
import { ArrowBackIcon } from '@chakra-ui/icons';
import ProfileModel from "./ProfileModel";
import { getSender, getSenderFull} from "../../../config/ChatLogics";

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const {user, selectedChat, setSelectedChat } = ChatState();
  return (
   <>
   {selectedChat? (
    <>
    <Text 
    fontSize={{ base: "28px", md: "30px" }}
    pb={3}
    px={2}
    w="100%"
    fontFamily="Work sans"
    display="flex"
    justifyContent={{ base: "space-between" }}
    alignItems="center"
    >
         <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            /> 
            { (!selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}
                  <ProfileModel
                    userInfo={getSenderFull(user, selectedChat.users)}
                  />
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    // fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))}
    </Text>
    <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          ></Box>
    </>
   ) : (
    <Box display="flex" alignItems="center" justifyContent={"center"} h={"100%"} className={"chat"}>
        <Text fontSize={"7xl"} pb={3} fontFamily={"Work sans"}>
            Click On a User To Chat
        </Text>
    </Box>
   )}
   </>
  )
}

export default SingleChat