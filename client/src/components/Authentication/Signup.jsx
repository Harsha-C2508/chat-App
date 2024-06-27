import React, { useState } from 'react'
import axios from 'axios'
// import { useHistory } from "react-router-dom";
import {Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack, useToast} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
const Signup = () => {
    const [show,setShow] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [confirmpassword, setConfirmpassword] = useState('')
    const [password,setPassword] = useState('')
    const [pic, setPic] = useState('')
    const [loading,setLoading] = useState(false)
    const toast = useToast()
    // const history = useHistory()
    const navigate = useNavigate()
    const handleShow = () => {
        setShow(!show)
    }

    const profilePhoto = (pic) => {
        setLoading(true);
        if (pic === undefined) {
            toast({
                title: "Please Select a Image!",
                status: "warning",
                duration:5000,
                isClosable:true,
                position:"bottom"
            })
            return;
        }
        if (pic.type === 'image/jpeg' || pic.type === "image/png") {
            const data = new FormData()
            data.append("file", pic);
            data.append("upload_preset", "chat-chat");
            data.append("cloude_name", "dbybrcscs");
            fetch("https://api.cloudinary.com/v1_1/dbybrcscs/image/upload", {
                method: 'post',
                body: data,
                
            })
                .then((res) => res.json())
                .then(data => {
                    setPic(data.url.toString());
                    console.log(data);
                    setLoading(false);
                }).catch((err) => {
                    console.log(err);
                    setLoading(false)
            })
        }
        else {
            toast({
                title: "Please Select a Image!",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            });
            setLoading(false);
            return;
        }
    }

    const handleSignUp = async() => {
        setLoading(true);
        if (!name || !email || !password || !confirmpassword) {
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
       if (password !== confirmpassword) {
            toast({
                title: "Password Do Not Match!",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            });
            return;
        } 

        try {
            const config = {
                headers: {
                    "Content-type":"application/json"
                },
            }
            const { data } = await axios.post(
                "/api/user",
                { name, email, password, pic },
                config
            );
            toast({
                title: "Registration Successful",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            });
            localStorage.setItem("userInfo", JSON.stringify(data));
            setLoading(false);
            // history.push("/chats");
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
              isLoading={loading}
          >
              Sign Up
          </Button>
    </VStack>
  )
}

export default Signup