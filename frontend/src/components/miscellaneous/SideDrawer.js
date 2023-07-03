import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/toast";
import ChatLoading from "../ChatLoading";
import { Spinner } from "@chakra-ui/spinner";
import ProfileModal from "./ProfileModal";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";
import { getSender } from "../../config/ChatLogics";
import UserListItem from "../userAvatar/UserListItem";
import { ChatState } from "../../context/chatProvider"
import Lottie from "react-lottie";
import animationData from "../../animations/logo.json"

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const defaultOptions = {
      loop: true,
      autoplay: true,
      animationData: animationData,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
    };

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    setSelectedChat();
    navigate("/");
  };
  const handleClose =()=>{
    onClose();
    setSearchResult([]);
    setSearch("");
  }
  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);
      
      setSearchResult(data);
      setLoading(false);
      
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userId) => {
    

    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return (
    <>
      <Box
        display={"flex"}
        flexDir='row'
        justifyContent="space-between"
        alignItems="center"
        bg="#2F3142"
        w="100%"
        h="9%"
        p="5px 10px 5px 10px"
        
        
      >
        <Button color={"white"} colorScheme="#2b2a2a" variant="solid" onClick={onOpen} >
            <i className="fas fa-search text-white "></i>
            <Text color={"white"} display={{ base: "none", md: "flex" }} px={4}>
              Search User
            </Text>
          </Button>
          <Box 
           display={"flex"}
           flexDir={"row"}
           justifyContent={"space-between"}
           alignItems={"center"}
          >
          <Lottie
              options={defaultOptions}
              // height={50}
              width={53}
              style={{ marginBottom: 2, marginRight: 2 }}
              
            />
        <Text fontSize={{ base: "20px", md: "2xl", lg: "2xl" }} fontWeight={"bold"} color={"white"}>
          WhisperWise
        </Text>
        </Box>
        <div>
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize={{ base: "1xl", md: "2xl", lg: "2xl" }}  color={"#777887"}/>
            </MenuButton>
            <MenuList pl={1} bg={"#424657"} color="white">
              {!notification.length && "No New Messages"}
              {notification.map((notif) => (
                <MenuItem bg={"#424657"} color="white"
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} bg="#2F3142" colorScheme="blue" rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
              
            </MenuButton>
            <MenuList bg={"#424657"}>
              <ProfileModal user={user}>
                <MenuItem bg={"#424657"} color="white">My Profile</MenuItem>{" "}
              </ProfileModal>
        
              <MenuDivider />
              <MenuItem bg={"#424657"}  color="white" onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement="left" onClose={handleClose} isOpen={isOpen} >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader bg={"#2F3142"}
            color={"white"}  >Search Users</DrawerHeader>
          <DrawerBody bg={"#2F3142"}
            color={"white"}>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                
                }}
              />
              <Button colorScheme="green" onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  group={true}
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;
