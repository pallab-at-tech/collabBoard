import React, { useEffect, useRef, useState } from 'react'
import { IoSendOutline } from "react-icons/io5";
import { MdAttachment } from "react-icons/md";
import { RxAvatar } from "react-icons/rx";
import { MdManageSearch } from "react-icons/md";
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useGlobalContext } from '../provider/GlobalProvider';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import { updateConversationWithNewMessage } from '../store/chatSlice';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { FaFileAlt } from "react-icons/fa";
import { RiFolderVideoFill } from "react-icons/ri";
import { IoImage } from "react-icons/io5";
import { HiOutlineUserGroup } from "react-icons/hi";
import uploadFile from '../utils/uploadFile';
import { useNavigate } from 'react-router-dom';
import { IoClose } from "react-icons/io5";

const MessagePage = () => {

    const chat_details = useSelector(state => state.chat?.all_message)
    const location = useLocation().state
    const navigate = useNavigate()

    const imgRef = useRef()
    const videoRef = useRef()
    const fileUrlRef = useRef()
    const [messageText, setMessageText] = useState("")
    const [attachData, setAttachData] = useState({
        image: "",
        video: "",
        other_fileUrl_or_external_link: "",
    })

    const [isGroup, setIsGroup] = useState(true)

    const dispatch = useDispatch()
    const user = useSelector(state => state.user)
    const messagesEndRef = useRef(null);
    const params = useParams()

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setIsGroup(location?.allMessageDetails?.group_type === "GROUP");
    }, [location?.allMessageDetails?.group_type]);



    const [messages, setMessages] = useState([])
    const [openAttach, setOpenAttach] = useState(false)
    const attachRef = useRef(null)

    const { socketConnection } = useGlobalContext()

    const handleAllAtachFile = async (e) => {

        try {
            setLoading(true)

            const { name } = e.target
            const file = e.target.files?.[0]

            if (!file) return

            const response = await uploadFile(file)

            setAttachData((preve) => {
                return {
                    ...preve,
                    [name]: response?.secure_url
                }
            })

            if (name === "image") {
                const img = new Image();
                img.src = attachData.image;

                img.onload = () => setLoading(false);
                img.onerror = () => {
                    console.error("Image failed to load");
                    setLoading(false);
                };

            } else if (name === "video") {
                const video = document.createElement("video");
                video.src = attachData.video;

                video.onloadeddata = () => setLoading(false);
                video.onerror = () => {
                    console.error("Video failed to load");
                    setLoading(false);
                };

            } else {
                setLoading(false);
            }

            setOpenAttach(false)

        } catch (error) {
            console.log("Error from handleAllAtachFile", error)
        }
    }

    const handleOnClick = async () => {

        if (!messageText.trim() && !attachData.image && !attachData.video && !attachData.other_fileUrl_or_external_link.trim()) return

        socketConnection.emit("send_message", {
            senderId: user?._id,
            receiverId: location?.allMessageDetails?.otherUser?._id,
            text: messageText,
            image: attachData.image,
            video: attachData.video,
            other_fileUrl_or_external_link: attachData.other_fileUrl_or_external_link,
        })

        setMessageText("")
        setAttachData({
            image: "",
            video: "",
            other_fileUrl_or_external_link: ""
        })

    }

    const handleGroupMessageSend = async () => {
        if (!messageText.trim() && !attachData.image && !attachData.video && !attachData.other_fileUrl_or_external_link.trim()) return

        socketConnection.emit("send_message_group", {
            senderId: user?._id,
            conversationId: location?.allMessageDetails?._id,
            text: messageText,
            image: attachData.image,
            video: attachData.video,
            other_fileUrl_or_external_link: attachData.other_fileUrl_or_external_link,
            senderName: user?.name.split(" ")[0]
        })

        setMessageText("")
        setAttachData({
            image: "",
            video: "",
            other_fileUrl_or_external_link: ""
        })
    }

    // fetch all messages
    useEffect(() => {

        (async () => {
            try {

                const matchingChats = chat_details?.filter(chat =>
                    chat?._id === params?.conversation
                );

                const response = await Axios({
                    ...SummaryApi.get_all_messages,
                    data: {
                        allMessageId: matchingChats[0]?.messages
                    }
                })

                const { data: responseData } = response

                if (responseData.success) {
                    setMessages(responseData?.data)
                }

            } catch (error) {
                setMessages([])
                console.log("error for fetching all messages", error)
            }

        })()
    }, [params?.conversation])

    console.log("chat_details", chat_details)


    // recieved message and update globally [ all chat member ]
    useEffect(() => {
        if (!socketConnection) return;

        socketConnection.on("receive_message", (data) => {

            dispatch(updateConversationWithNewMessage({ conversation: data.conversation, message: data?.message }))
            setMessages(prev => [...prev, data?.message]);

            const url = params.conversation === data?.conversation?._id

            if (!url) {
                navigate(`/chat/${data?.conversation?._id}`, {
                    state: {
                        allMessageDetails: data.conversation
                    }
                })

            }
        });

        return () => {
            socketConnection.off("receive_message");
        };
    }, [socketConnection, dispatch]);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (attachRef.current && !attachRef.current.contains(event.target)) {
                setOpenAttach(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);



    return (
        <section className="flex flex-col h-[calc(100vh-60px)] overflow-hidden">

            {/* Fixed Top Bar */}
            <div className="bg-red-700 h-[100px] w-full z-40">
                Top Bar
            </div>

            {/* Scrollable Middle */}
            <div className="flex-1 overflow-y-auto bg-gray-800 text-white">
                <div className="h-[2000px]">
                    <p>hi</p>
                </div>
            </div>

            {/* Fixed Bottom Bar */}
            <div className="bg-green-800 h-[100px] w-full z-40">
                Bottom Bar
            </div>

        </section>


    )
}

export default MessagePage
