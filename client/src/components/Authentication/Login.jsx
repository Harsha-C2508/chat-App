import React, { useState } from 'react'
import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack } from '@chakra-ui/react'
const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [show, setShow] = useState(false)
    
     
    const handleShow = () => {
        setShow(!show)
    }

    const handleLogin = () => {
        
    }
  return (
      <VStack spacing='5px'>
           <FormControl id='email' isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                  placeholder='Enter valid email'
                  type='email'
                  onChange={(e)=>setEmail(e.target.value)}
              />
          </FormControl>

          <FormControl id='password' isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                  <Input
                      type={show?"text":"password"}
                    placeholder='Enter a strong password'
                    onChange={(e)=>setPassword(e.target.value)}
                  />
                  
                  <InputRightElement width='4.5rem'>
                        <Button h='1.75rem' size='sm' onClick={handleShow}>
                          {show? "Hide" : "Show"}
                        </Button>
                  </InputRightElement>
              
              </InputGroup>
          </FormControl>

          <Button w={'100%'} colorScheme={'yellow'} style={{ marginTop: 15 }}
              onClick={handleLogin}
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