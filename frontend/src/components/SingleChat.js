import React from 'react'
import { ChatState } from '../context/chatProvider'
// import axios from 'axios';
import { useToast } from '@chakra-ui/react';
import { Box, Text } from "@chakra-ui/layout";
import { IconButton } from '@chakra-ui/button';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { getSender,getSenderFull } from '../config/ChatLogics';
import ProfileModal from './miscellaneous/ProfileModal';
import { Avatar } from "@chakra-ui/avatar";
import { useState, useEffect } from 'react';
import { Button } from '@chakra-ui/react'
import { FormControl, Input, Spinner } from '@chakra-ui/react';
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal';
import axios from 'axios';
import './style.css';
import ScrollableChat from './ScrollableChat';
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData1 from "../animations/typing.json";
import animationData2 from "../animations/EmptyChatBox.json"
import MessageLoading from "./MessageLoading"

const ENDPOINT = "https://whisperwise.onrender.com/";
var socket, selectedChatCompare;

export const SingleChat = ({fetchAgain,setFetchAgain}) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const {user, selectedChat, setSelectedChat, notification, setNotification} = ChatState();
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [istyping, setIsTyping] = useState(false);
    const [timerId, setTimerId] = useState(null);
    const toast  = useToast();

     const defaultOptions1 = {
      loop: true,
      autoplay: true,
      animationData: animationData1,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
    };

    const defaultOptions2 = {
      loop: true,
      autoplay: true,
      animationData: animationData2,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
    };

    const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
    
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
 
    const onPressButton = () =>{
      sendMessage({
        key : "Enter",
      })
    }

    const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat,
          },
          config
        );
        
        
        // setMessages([...messages, data]);
        socket.emit("message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

   useEffect(() => {
    socket = io(ENDPOINT);
  
    socket.emit("setup", user);
    socket.on("connected", () => {setSocketConnected(true) ; });
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

  }, []);

    useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);
  
  useEffect(() => {
    socket.on('message recieved', (newMessageRecieved) => {
      if (
        
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          // setFetchAgain(!fetchAgain);
          
        }
      } else {
        
        setMessages([...messages, newMessageRecieved]);
      }
    });
    socket.on("removed",(user)=>{
      setFetchAgain(!fetchAgain);
      setSelectedChat();
    })
  });

    const typingHandler = (e) => {
      setNewMessage(e.target.value);
      if (!socketConnected) return;

      if (!typing) {
        setTyping(true);
        socket.emit("typing", selectedChat._id);
      }
      const timerLength = 3000;

        if (timerId) {
            clearTimeout(timerId);
        }

        let timer = setTimeout(() => {
            socket.emit('stop typing',selectedChat._id);
               setTyping(false);

        }, timerLength);

        setTimerId(timer);
    };

    const handleDelete = (user) => {
      socket.emit("remove",user);
    }
    
  return (
    <>
        {
        selectedChat ? (
            <>
            <Box
                display="flex"
                justifyContent="space-between" 
                alignItems="center"
                fontSize={{ base: "28px", md: "30px" }}
                p={2}
                bg="#323645"
                w="100%"
                // fontFamily="Work sans"
                color={"white"}
                borderTopLeftRadius={"lg"}
                borderTopRightRadius={"lg"}
                borderBottom={"1px"}
                borderBottomColor={"#303030"}
                >  
                <IconButton
                    colorScheme="#777887"
                    display={{ base: "flex", md: "none" }}
                    icon={<ArrowBackIcon />}
                    onClick={() => setSelectedChat("")}
                    /> 
                {!selectedChat.isGroupChat ? (
                <>
                <Avatar
                    display={{ base: "none", md: "flex" }}
                    mr={2}
                    size="sm"
                    cursor="pointer"
                    name={user.name}
                    src={getSenderFull(user, selectedChat.users).pic}
                />
                  <span style={{fontSize:"23px", fontWeight:"600"}}>{getSender(user, selectedChat.users)}</span>
                  <ProfileModal fontSize={{ base: "1xl", md: "2xl", lg: "2xl" }}
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>
              ) : (
                <>
                  <span style={{fontSize:"23px", fontWeight:"600"}}>{selectedChat.chatName}</span>
                  <UpdateGroupChatModal
                    handleDelete={handleDelete}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                    fetchMessages={fetchMessages}
                  />
                </>
              )}
                </Box>
                <Box
                    
                    display="flex"
                    flexDir="column"
                    justifyContent="flex-end"
                
                    bg="#2F3142"
                    w="100%"
                    h="100%"
                    borderBottomEndRadius={"lg"}
                    borderBottomLeftRadius={"lg"}
                    overflowY="hidden"
                    p={2}
                >
                  {loading ? (
                    <MessageLoading/>
                  ) : (
                    
                    <div className='messages'>
                      <ScrollableChat messages={messages}/>
                    </div> 
                  )}
                   {istyping? <div>
                  <Lottie
                    options={defaultOptions1}
                    // height={50}
                    width={40}
                    style={{ marginBottom: 2, marginLeft: 2 }}
                    
                  />
                </div>:(<></>)}
                  <FormControl
                    display={"flex"}
                    justifyContent={'space-between'}
                    alignContent={"center"}
                    onKeyDown={sendMessage}
                    isRequired
                    mt={3}
                    
                  >
                    <Input
                      bg="#323645"
                      placeholder="Enter a message.."
                      value={newMessage}
                      onChange={typingHandler}
                      borderColor={"#323645"}
                      color={"white"}
                      borderBottomRadius={"lg"}
                      
                    />
                    <Button marginLeft={1} onClick={onPressButton} colorScheme='green'>Send</Button>
                  </FormControl>
                  
                </Box>
          </>

        ) : (
            <Box display="flex" flexDir={"column"} alignItems="center" justifyContent="center" width={"100%"} h="100%" backgroundColor={"#2F3142"} borderRadius={"2xl"}
            >
                <Lottie
                  options={defaultOptions2}
                  width={400}
                  height={400}
                  
                  
                />
                <Text color={"white"} fontSize="3xl"  >
                    Click on a user to start chatting
                </Text>
            </Box>
        )
        }
    </>
  )
}



