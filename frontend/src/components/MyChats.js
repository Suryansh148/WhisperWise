import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModel"
import { Button } from "@chakra-ui/react";
import { ChatState } from "../context/chatProvider"
import { Avatar } from "@chakra-ui/avatar";
import { getSenderFull } from '../config/ChatLogics';
const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const [loading, setLoading] = useState(true);
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const toast = useToast();

  const fetchChats = async () => {
    
    setLoading(true)
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setLoading(false);
      setChats(data);
      
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    
  }, [fetchAgain]);
  
  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="#323645"
      w={{ base: "100%", md: "31%" }}
      borderRadius="xl"
      
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        // fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
        color={"white"}
      >
        Chats
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
            colorScheme={"green"}
            color={"white"}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#2F3142"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {loading ? (
          <ChatLoading/>
        ) : (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
                
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#288ADD" : "#424657"}
                color={selectedChat === chat ? "white" : "white"}
                _hover={{
                  background:selectedChat === chat ? "#288ADD" : "#525669"
                }}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
                display={"flex"}
                alignItems="center"
                width={"100%"}
                
              >
                {chat.isGroupChat ? 
                <Avatar
                    mr={2}
                    size="sm"
                    cursor="pointer"
                    name={user.name}
                />
                : <Avatar
                    mr={2}
                    size="sm"
                    cursor="pointer"
                    name={user.name}
                    src={getSenderFull(user, chat.users).pic}
                />}
                <Box>
                    <Text fontSize={17} >
                 <b>{!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}</b>
                </Text>
                {/* {chat.latestMessage && (
                  <Text fontSize="xs" fontWeight={15}>
                    <b>{chat.latestMessage.sender.name} : </b>
                    {chat.latestMessage.content.length > 31
                      ? chat.latestMessage.content.substring(0, 30) + "..."
                      : chat.latestMessage.content}
                  </Text>
                )} */}
                </Box>
                
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
