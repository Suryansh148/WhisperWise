import { useState, useEffect } from "react"
import React from 'react'

import axios from "axios";
import { useToast } from "@chakra-ui/toast";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { ChatState } from "../context/chatProvider";
import Lottie from "react-lottie";
import animationData from "../animations/Homepage.json"
import { Box, Text } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/react";
import { Input } from "@chakra-ui/react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const {user,setUser} = ChatState();

const defaultOptions = {
      loop: true,
      autoplay: true,
      animationData: animationData,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
    };

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  
    if (userInfo) navigate("/chats");
  
  }, [navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!email || !password) {
      toast({
        title: "Please Fill all the Feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      setLoading(false);
      return;
    }

    
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

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
        position: "top-right",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      setLoading(false);
      navigate("/chats");
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      setLoading(false);
    }
  };
  
  return (
    <Box backgroundColor={"#424657"} className="h-screen flex flex-col md:flex-row justify-center space-y-10 md:space-y-0 md:space-x-16 items-center md:mx-0 md:my-0 ">
      <div className="md:w-1/3 hidden md:block max-w-sm mr-7">
      
          <Lottie
              options={defaultOptions}
              height={350}
              width={350}
            />
      </div>
      <div className="md:w-1/3 max-w-sm  shadow-xl hover:shadow-lg rounded-lg p-4">
        
        <Text 
          color={"white"}
         className='text-fuchsia-900 font-semibold mb-5 text-3xl'>
          Login
        </Text>
        <Input color={"white"} className="text-sm w-full px-4 py-2 border border-solid border-gray-300 rounded-lg" type="text" placeholder="Email Address" 
          onChange={(e)=>{setEmail(e.target.value)}}
          value={email}
        />
        <Input color={"white"} className="text-sm w-full px-4 py-2 border border-solid border-gray-300 rounded-lg mt-4" type="password" placeholder="Password" 
          onChange={(e)=>{setPassword(e.target.value)}}
          value={password}
        />
    
        <div className="text-center md:text-left">
          <Button backgroundColor={"#3f5dcc"} _hover={{
            backgroundColor:"#4d6ad6"
          }} color={"white"} borderRadius={"1xl"} className="mt-4 w-full bg-fuchsia-800 hover:bg-fuchsia-900 px-4 py-2 text-white rounded-lg text-xs tracking-wider" type="submit" onClick={submitHandler}
          >
          {loading?<svg aria-hidden="true" role="status" className="inline w-4 h-4 mr-3 text-gray-200 animate-spin dark:text-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#4d6ad6"/>
    </svg> : <span>Login</span>}</Button>
        </div>
        <div className="mt-4 font-semibold text-sm text-slate-500 text-center md:text-left">
          Don't have an account? <span className="text-white text-bold hover:underline hover:underline-offset-4"><Link to={"/signup"}>Register</Link></span>
        </div>
      </div>

    </Box>
  );
}
