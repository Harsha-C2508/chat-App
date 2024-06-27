import React, { useEffect } from 'react'
import { Box, Container,Tab,TabList,TabPanel,TabPanels,Tabs,Text } from '@chakra-ui/react'
import Login from '../components/Authentication/Login'
import Signup from '../components/Authentication/Signup'
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(()=>{
      const user = JSON.parse(localStorage.getItem("userInfo"));

      if(user) {
        navigate("/chats");
      }
  },[navigate])
  return (
    <Container maxW='xl' centerContent>
      <Box
        d='flex'
        textAlign='center'
        p={3}
        bg={'white'}
        width='100%'
        m='40px 0 15px 0 '
        borderRadius='lg'
        borderWidth='1px'
      >
        <Text fontSize='4xl' fontFamily="du NSW ACT Foundation,cursive"
          color='black'>
          Chit Chat
        </Text>
      </Box>


      <Box bg='white' w='100%'
        p={4} borderRadius='lg'
        color='black' borderWidth='1px'
        fontFamily="du NSW ACT Foundation,cursive"
      >
        
            <Tabs variant='soft-rounded' colorScheme='yellow'>
              <TabList>
                <Tab w='50%'>Login</Tab>
                <Tab w='50%'>Sign Up</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Login/>
                </TabPanel>
                <TabPanel>
                  <Signup/>
                </TabPanel>
              </TabPanels>
            </Tabs>
      </Box>
    </Container>
  )
}

export default HomePage