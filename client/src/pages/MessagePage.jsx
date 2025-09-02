import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { IoSendOutline } from "react-icons/io5";
import { MdAttachment } from "react-icons/md";
import { RxAvatar } from "react-icons/rx";
import { MdManageSearch } from "react-icons/md";
import { useSelector } from 'react-redux';
import { Outlet, useLocation } from 'react-router-dom';
import { useGlobalContext } from '../provider/GlobalProvider';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import { updateConversationWithNewMessage, updateGroupImage, updateGroupName } from '../store/chatSlice';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { FaFileAlt } from "react-icons/fa";
import { RiFolderVideoFill } from "react-icons/ri";
import { IoImage } from "react-icons/io5";
import { HiOutlineUserGroup } from "react-icons/hi";
import uploadFile from '../utils/uploadFile';
import { useNavigate } from 'react-router-dom';
import { IoClose } from "react-icons/io5";
import { FaUserGroup } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const MessagePage = () => {

    const chat_details = useSelector(state => state.chat?.all_message)
    const location = useLocation().state
    const pathname = useLocation().pathname
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

    const [conversation, setConversation] = useState(null)

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

        socketConnection.once("send_message_error", async (data) => {
            toast.error(data?.message || "Fail to send message.")
            navigate("/chat")
            return
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
    }, [params?.conversation, chat_details])


    // recieved message and update globally [ all chat member ]
    useEffect(() => {
        if (!socketConnection) return;

        socketConnection.on("receive_message", (data) => {

            const { conversation, message } = data;
            dispatch(updateConversationWithNewMessage({ conversation: data.conversation, message: data?.message }))
            setMessages(prev => [...prev, data?.message]);

            if (conversation?.group_name) {
                dispatch(updateGroupName({
                    group_Id: conversation?._id,
                    group_name: conversation?.group_name,
                }));
            }

            if (conversation?.group_image) {
                dispatch(updateGroupImage({
                    group_Id: conversation?._id,
                    group_image: conversation?.group_image
                }))
            }

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
        if (messagesEndRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: 'end' });
        }
    }, [messages]);


    useEffect(() => {
        const setAppHeight = () => {
            document.documentElement.style.setProperty('--app-height', `${window.innerHeight - 60}px`);
        };

        setAppHeight();
        window.addEventListener('resize', setAppHeight);
        return () => window.removeEventListener('resize', setAppHeight);
    }, []);


    useEffect(() => {
        const setAppHeight = () => {
            document.documentElement.style.setProperty('--message-heigh', `${window.innerHeight - 184}px`);
        };

        setAppHeight();
        window.addEventListener('resize', setAppHeight);
        return () => window.removeEventListener('resize', setAppHeight);
    }, []);

    useEffect(() => {
        const conversation = chat_details?.find(c => c._id === params?.conversation)
        setConversation(conversation)
    }, [])


    return (
        <>
            <section className={`h-[var(--app-height)] ${`/chat/${params?.conversation}` !== pathname ? "hidden" : "block"}  w-full grid grid-rows-[64px_1fr_60px] relative overflow-hidden`}>
                {/* Header */}
                <div className="bg-[#21222b] z-50 px-4 flex items-center justify-between text-white shadow-md shadow-[#57575765]">
                    {/* left */}

                    {
                        isGroup ? (
                            <Link to={`/chat/${params?.conversation}/edit`} className="flex gap-2.5 items-center">

                                {
                                    isGroup ? (
                                        conversation?.group_image || location?.allMessageDetails?.group_image ? (
                                            <img src={conversation?.group_image || location?.allMessageDetails?.group_image} alt="" className='h-[36px] w-[36px] rounded-full' />
                                        ) : (
                                            <FaUserGroup size={30} />
                                        )
                                    ) : (
                                        <RxAvatar size={38} />
                                    )
                                }

                                {location?.allMessageDetails?.group_type === "GROUP" ? (
                                    <p className="text-lg">{conversation?.group_name || location?.allMessageDetails?.group_name}</p>
                                ) : (
                                    <div className="flex flex-col text-base">
                                        <p>{location?.allMessageDetails?.otherUser?.name}</p>
                                        <p className="text-sm opacity-75">{location?.allMessageDetails?.otherUser?.userId}</p>
                                    </div>
                                )}
                            </Link>
                        ) : (
                            <div className="flex gap-2.5 items-center">
                                {
                                    isGroup ? (
                                        <FaUserGroup size={30} />
                                    ) : (
                                        <RxAvatar size={38} />
                                    )
                                }

                                {location?.allMessageDetails?.group_type === "GROUP" ? (
                                    <p className="text-lg">{conversation?.group_name || location?.allMessageDetails?.group_name}</p>
                                ) : (
                                    <div className="flex flex-col text-base">
                                        <p>{conversation?.otherUser?.name || location?.allMessageDetails?.otherUser?.name}</p>
                                        <p className="text-sm opacity-75">{conversation?.otherUser?.userId || location?.allMessageDetails?.otherUser?.userId}</p>
                                    </div>
                                )}
                            </div>
                        )
                    }

                    {/* right */}
                    <MdManageSearch size={30} className="cursor-pointer" />
                </div>

                {/* Messages */}
                <div className="overflow-y-auto  h-[var(--message-heigh)] px-2.5 py-4 flex flex-col gap-2.5 chat-scrollbar min-h-0 messages-container" >
                    {Array.isArray(messages) &&
                        messages.map((value, index) => {
                            const isSelfMessage =
                                value?.senderId?._id === user?._id || value?.senderId === user?._id;
                            const date = new Date(value?.createdAt);
                            const indianTime = date.toLocaleString("en-IN", {
                                timeZone: "Asia/Kolkata",
                                hour: "2-digit",
                                minute: "2-digit",
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                            });

                            return (
                                <div
                                    ref={messagesEndRef}
                                    key={`msg-${index}`}
                                    className={` max-w-[75%] break-words text-base rounded text-blue-950 px-2.5 py-1  ${(isGroup && index === 0) || value?.optional_msg ? "self-center" : isSelfMessage ? "self-end bg-[#f1f1f1]" : "self-start bg-[#f1f1f1]"
                                        }`}
                                >
                                    {isGroup && !isSelfMessage && (
                                        <p className="text-xs font-medium text-gray-600 -mb-1">{value?.senderName}</p>
                                    )}

                                    <div className={`bg-[#f1f1f1] p-1 rounded-md text-sm ${value?.optional_msg ? "block" : "hidden"}`}>
                                        <p className='text-center'>
                                            {value?.optional_msg}
                                        </p>
                                        <p>
                                            {indianTime}
                                        </p>
                                    </div>

                                    {value?.image && <img src={value.image} alt="" className="w-[200px] rounded-md" />}
                                    {value?.video && <video src={value.video} controls className="w-[200px] rounded-md"></video>}
                                    {value?.other_fileUrl_or_external_link && (
                                        <button
                                            onClick={() => window.open(value.other_fileUrl_or_external_link, "_blank")}
                                            className="bg-blue-500 text-white px-3 py-1 rounded mt-1"
                                        >
                                            Open File
                                        </button>
                                    )}

                                    {value?.text && <p className={`mt-1 ${isGroup && index === 0 && "text-[#dedede] leading-[19px]"}`}>{value.text}</p>}

                                    <p className={`text-xs opacity-60 ${value?.optional_msg ? "hidden" : "block"} ${isSelfMessage ? "text-right" : "text-left"}`}>{indianTime}</p>
                                </div>
                            );
                        })}
                </div>

                {/* Footer */}
                <div className="bg-[#1f2029] py-3 w-full grid grid-cols-[60px_1fr_60px] items-center text-white shadow-md shadow-[#154174]">
                    {/* Attachments */}
                    <div className="flex items-center justify-center relative">
                        <MdAttachment size={26} onClick={() => setOpenAttach(!openAttach)} className="cursor-pointer" />
                        {openAttach && (
                            <div ref={attachRef} className="absolute bottom-12 left-6 bg-white text-blue-950 rounded-lg p-3 flex gap-4">
                                <div onClick={() => imgRef.current.click()} className="cursor-pointer flex flex-col items-center">
                                    <IoImage size={32} />
                                    <p className="text-xs">Image</p>
                                    <input ref={imgRef} onChange={handleAllAtachFile} type="file" accept="image/*" name="image" hidden />
                                </div>
                                <div onClick={() => videoRef.current.click()} className="cursor-pointer flex flex-col items-center">
                                    <RiFolderVideoFill size={32} />
                                    <p className="text-xs">Video</p>
                                    <input ref={videoRef} onChange={handleAllAtachFile} type="file" accept="video/*" name="video" hidden />
                                </div>
                                <div onClick={() => fileUrlRef.current.click()} className="cursor-pointer flex flex-col items-center">
                                    <FaFileAlt size={32} />
                                    <p className="text-xs">File</p>
                                    <input ref={fileUrlRef} onChange={handleAllAtachFile} type="file" accept="application/pdf" name="other_fileUrl_or_external_link" hidden />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                isGroup ? handleGroupMessageSend() : handleOnClick();
                            }
                        }}
                        className="w-full bg-transparent outline-none px-2 text-white"
                        placeholder="Type a message..."
                    />

                    {/* Send */}
                    <div className="flex items-center justify-center cursor-pointer">
                        <IoSendOutline size={26} onClick={() => (isGroup ? handleGroupMessageSend() : handleOnClick())} />
                    </div>
                </div>
            </section>

            <div className={`${`/chat/${params?.conversation}/edit` !== pathname && "hidden"} w-full`}>
                {
                    <Outlet />
                }
            </div>
        </>
    )
}

export default MessagePage
