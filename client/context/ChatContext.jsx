import { useContext, useState, createContext, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);

    const { socket, axios } = useContext(AuthContext);

    // Subscribe to socket events at the top to avoid closure issues
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMessage) => {
            setMessages((prevMessages) => {
                if (selectedUser && String(newMessage.senderId) === String(selectedUser._id)) {
                    newMessage.seen = true;
                    axios.put(`/api/messages/mark/${newMessage._id}`);
                    return [...prevMessages, newMessage];
                } else {
                    setUnseenMessages((prevUnseenMessages) => ({
                        ...prevUnseenMessages,
                        [newMessage.senderId]: prevUnseenMessages[newMessage.senderId]
                            ? prevUnseenMessages[newMessage.senderId] + 1
                            : 1,
                    }));
                    return prevMessages;
                }
            });
        };

        const handleMessageSeen = ({ messageId }) => {
            setMessages((prevMessages) =>
                prevMessages.map((message) =>
                    String(message._id) === String(messageId) ? { ...message, seen: true } : message
                )
            );
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("messageSeen", handleMessageSeen);

        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("messageSeen", handleMessageSeen);
        };
    }, [socket, selectedUser, axios]);

    // function to get all users from sidebar
    const getAllUsers = async () => {
        try {
            setLoadingUsers(true);
            const { data } = await axios.get("/api/messages/users");
            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoadingUsers(false);
        }
    };

    // function to get messages of selected user
    const getMessages = async (userId) => {
        try {
            setLoadingMessages(true);
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoadingMessages(false);
        }
    };

    const sendMessage = async (message) => {
        try {
            if (!selectedUser) {
                return;
            }
            setSendingMessage(true);
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, message);
            if (data.success) {
                setMessages((prevMessages) => [...prevMessages, data.message]);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSendingMessage(false);
        }
    };

    const value = {
        messages,
        users,
        selectedUser,
        getAllUsers,
        getMessages,
        sendMessage,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
        loadingUsers,
        loadingMessages,
        sendingMessage,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};