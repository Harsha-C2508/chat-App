import React, { useState } from 'react'
import {Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack} from '@chakra-ui/react'
const Signup = () => {
    const [show,setShow] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [confirmpassword, setConfirmpassword] = useState('')
    const [password,setPassword] = useState('')
    const [pic, setPic] = useState('')
    
    const handleShow = () => {
        setShow(!show)
    }

    const profilePhoto = (pic) => {
        
    }

    const handleSignUp = () => {
        
    }
  return (
      <VStack spacing='5px'>
          <FormControl id='first-name' isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                  placeholder='Enter Your Name'
                  onChange={(e)=>setName(e.target.value)}
              />
          </FormControl>

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

          <FormControl id='confirm-password' isRequired>
              <FormLabel>Confirm Password</FormLabel>
              <InputGroup>
                <Input
                    placeholder='Confirm password'
                      type={show ? "text" : "password"}
                    onChange={(e)=>setConfirmpassword(e.target.value)}
                />
                 <InputRightElement width='4.5rem'>
                        <Button h='1.75rem' size='sm' onClick={handleShow}>
                          {show? "Hide" : "Show"}
                        </Button>
                  </InputRightElement>
              </InputGroup>
          </FormControl>
          
          <FormControl id='profile' isRequired>
              <FormLabel>Profile</FormLabel>
              <Input
                  padding='4px'
                  type='file'
                  accept='image/*'
                  onChange={(e)=>profilePhoto(e.target.files[0])}
              />
          </FormControl>

          <Button
              colorScheme='yellow'
              width='100%'
              style={{ marginTop: 15 }}
              onClick={handleSignUp}
          >
              Sign Up
          </Button>
    </VStack>
  )
}

export default Signup