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
        <section className="h-[calc(100vh-60px)] w-full flex flex-col relative bg-[#18191f]">

            {/* Header */}
            <div className="bg-[#21222b] fixed top-0 z-50 py-3 px-4 flex justify-between items-center w-full text-white shadow-md shadow-[#57575765]">
                <div className="flex items-center gap-3">
                    <RxAvatar size={38} />
                    {isGroup ? (
                        <p className="text-lg font-medium">{location?.allMessageDetails?.group_name}</p>
                    ) : (
                        <div className="flex flex-col text-sm">
                            <p className="font-medium">{location?.allMessageDetails?.otherUser?.name}</p>
                            <p className="text-xs opacity-70">{location?.allMessageDetails?.otherUser?.userId}</p>
                        </div>
                    )}
                </div>
                <MdManageSearch size={28} className="cursor-pointer" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto pt-[70px] pb-[80px] px-3 chat-scrollbar">
                {messages.map((msg, i) => {
                    const isSelf = msg?.senderId?._id === user?._id || msg?.senderId === user?._id
                    const time = new Date(msg?.createdAt).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit"
                    })
                    return (
                        <div key={i} className={`max-w-[85%] sm:max-w-[70%] md:max-w-[60%] break-words p-2 rounded-md text-sm mb-2 ${isSelf ? "bg-blue-500 text-white self-end ml-auto" : "bg-gray-200 text-blue-950 self-start mr-auto"}`}>
                            {isGroup && !isSelf && <p className="text-xs font-semibold mb-1">{msg?.senderName}</p>}
                            {msg?.image && <img src={msg.image} alt="" className="max-w-full rounded-lg mb-1" />}
                            {msg?.video && <video src={msg.video} controls className="max-w-full rounded-lg mb-1"></video>}
                            {msg?.other_fileUrl_or_external_link && (
                                <button onClick={() => window.open(msg.other_fileUrl_or_external_link, "_blank")}
                                    className="bg-blue-600 text-white text-xs px-3 py-1 rounded">
                                    Open File
                                </button>
                            )}
                            {msg?.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                            <p className="text-[10px] opacity-70 mt-1">{time}</p>
                            <div ref={messagesEndRef}></div>
                        </div>
                    )
                })}
            </div>

            {/* Input */}
            <div className="bg-[#1f2029] fixed bottom-0 w-full py-3 px-2 flex items-center gap-3">
                <div className="relative" ref={attachRef}>
                    <MdAttachment size={28} onClick={() => setOpenAttach(!openAttach)} className="cursor-pointer text-white" />
                    {openAttach && (
                        <div className="absolute bottom-10 left-0 bg-white text-blue-950 p-3 rounded-lg shadow-md flex gap-4 flex-wrap w-[200px] sm:w-[250px]">
                            <div onClick={() => imgRef.current.click()} className="cursor-pointer flex flex-col items-center">
                                <IoImage size={36} /><p className="text-xs">Image</p>
                                <input ref={imgRef} onChange={handleAllAtachFile} type="file" accept="image/*" name="image" hidden />
                            </div>
                            <div onClick={() => videoRef.current.click()} className="cursor-pointer flex flex-col items-center">
                                <RiFolderVideoFill size={36} /><p className="text-xs">Video</p>
                                <input ref={videoRef} onChange={handleAllAtachFile} type="file" accept="video/*" name="video" hidden />
                            </div>
                            <div onClick={() => fileUrlRef.current.click()} className="cursor-pointer flex flex-col items-center">
                                <FaFileAlt size={36} /><p className="text-xs">File</p>
                                <input ref={fileUrlRef} onChange={handleAllAtachFile} type="file" accept="application/pdf" name="other_fileUrl_or_external_link" hidden />
                            </div>
                        </div>
                    )}
                </div>

                <input
                    type="text"
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            isGroup ? handleGroupMessageSend() : handleOnClick();
                        }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent outline-none text-white text-sm px-2"
                />

                <IoSendOutline size={28} onClick={() => isGroup ? handleGroupMessageSend() : handleOnClick()} className="cursor-pointer text-white" />
            </div>

            {/* Loading */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="loader"></div>
                </div>
            )}

            {/* Preview Image */}
            {attachData.image && (
                <section className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
                    <div className="relative">
                        <IoClose size={30} onClick={() => setAttachData(prev => ({ ...prev, image: "" }))} className="absolute -top-10 right-0 text-white cursor-pointer" />
                        <img src={attachData.image} alt="" className="max-h-[70vh] max-w-full rounded-lg" />
                    </div>
                </section>
            )}

            {/* Preview Video */}
            {attachData.video && (
                <section className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
                    <div className="relative">
                        <IoClose size={30} onClick={() => setAttachData(prev => ({ ...prev, video: "" }))} className="absolute -top-10 right-0 text-white cursor-pointer" />
                        <video src={attachData.video} className="max-h-[70vh] max-w-full rounded-lg" controls></video>
                    </div>
                </section>
            )}

        </section>
    )
}

export default MessagePage
