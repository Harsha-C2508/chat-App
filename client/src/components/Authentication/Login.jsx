import React, { useState } from 'react'
import axios from 'axios'
import { Button, FormControl, FormLabel,useToast, Input, InputGroup, InputRightElement, VStack } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [show, setShow] = useState(false)
    const [loading,setLoading] = useState(false)
    const toast = useToast()
    const navigate = useNavigate();
     
    const handleShow = () => {
        setShow(!show)
    }

    const handleLogin = async() => {
        setLoading(true);
        if ( !email || !password) {
            toast({
                title: "Please Fill All The Feilds!",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            });
            setLoading(false);
            return;
        }
  
        try {
            const config = {
                headers: {
                    "Content-type":"application/json"
                },
            }
            const { data } = await axios.post(
                "/api/user/login",
                { email, password },
                config
            );
            toast({
                title: "Login Successful",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            });
            localStorage.setItem("userInfo", JSON.stringify(data));
            setLoading(false);
            navigate("/chats")
        } catch (err) {
             toast({
                title: "Error Occured!",
                description:err.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom"
             });
            setLoading(false)
        }
    }
  return (
      <VStack spacing='5px'>
           <FormControl id='userEmail' isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                  placeholder='Enter valid email'
                  type='email'
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
              />
          </FormControl>

          <FormControl id='userPassword' isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                  <Input
                      type={show?"text":"password"}
                      placeholder='Enter a strong password'
                      value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                  />
                  
                  <InputRightElement width='4.5rem'>
                        <Button h='1.75rem' size='sm' onClick={handleShow}>
                          {show? "Hide" : "Show"}
                        </Button>
                  </InputRightElement>
              
              </InputGroup>
          </FormControl>

          <Button w={'100%'}
              colorScheme={'yellow'}
              style={{ marginTop: 15 }}
              onClick={handleLogin}
              isLoading={loading}
          >Login</Button>

          <Button
              variant={'solid'}
              colorScheme='red'
              w={'100%'}
              onClick={() => {
                  setEmail("guest@new.com")
                  setPassword("guest123")
              }}
          >
              
              Guest User
          </Button>
      </VStack>
  )
}

export default Login