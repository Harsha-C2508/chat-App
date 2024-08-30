import { ViewIcon } from '@chakra-ui/icons';
import { Button, IconButton, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure } from '@chakra-ui/react'
import React from 'react'

const ProfileModel = ({userInfo, children}) => {
    console.log(userInfo)
    const { isOpen, onOpen, onClose} = useDisclosure();
  return (
    <>
      {children? <span onClick={onOpen}>{children}</span> 
       : 
        <IconButton
         display={{base: "flex"}}
         icon={<ViewIcon/>}
         onClick={onOpen}
        />
      }

      <Modal size="lg" isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent height={"410px"}>
          <ModalCloseButton />
          <ModalBody
            display={"flex"}
            justifyContent={"space-between"}
            flexDir={"column"}
            alignItems="center"
          > <ModalHeader
          display={"flex"}
          fontFamily="Work sans"
          fontSize={"40px"}
          justifyContent={"center"}
        >{userInfo.name}</ModalHeader>
            <Image
              borderRadius="full"
              boxSize={"150px"}
              src={userInfo.pic? userInfo.pic:"https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"}
              alt={userInfo.email}
            />
            <Text>
                Email: {userInfo.email}
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ProfileModel