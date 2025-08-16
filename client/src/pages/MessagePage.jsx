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

    console.log("chat_details",chat_details)


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
    }, [socketConnection,dispatch]);


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
        <section className='h-[calc(100vh-60px)] w-full  flex flex-col relative'>

            <div className='bg-[#21222b]  fixed top-0 z-50 pt-[13px] pb-[13px] px-4 grid grid-cols-[300px_1fr] w-full items-center text-white shadow-md shadow-[#57575765]'>

                <div className={`flex gap-2.5 ${location?.allMessageDetails?.group_type === "GROUP" ? "items-center" : "items-start"} pl-2`}>
                    <div className='flex items-center justify-center'>
                        <RxAvatar size={38} />
                    </div>

                    {
                        location?.allMessageDetails?.group_type === "GROUP" ? (
                            <div className='text-lg'>
                                <p>{location?.allMessageDetails?.group_name}</p>
                            </div>
                        ) : (
                            <div className='flex flex-col leading-tight text-base items-start'>
                                <p>{location?.allMessageDetails?.otherUser?.name}</p>
                                <p>{location?.allMessageDetails?.otherUser?.userId}</p>
                            </div>
                        )
                    }

                </div>

                <div className='flex items-center justify-end'>
                    <MdManageSearch size={30} className='cursor-pointer' />
                </div>
            </div>

            <div className='h-full mb-[55px] pt-[140px] overflow-y-scroll px-2.5 flex flex-col gap-2.5 py-4 chat-scrollbar relative' style={{ willChange: 'transform' }}>
                {
                    Array.isArray(messages) && messages.map((value, index) => {

                        const isSelfMessage = value?.senderId?._id === user?._id || value?.senderId === user?._id
                        const date = new Date(value?.createdAt)
                        const indianTime = date.toLocaleString("en-IN", {
                            timeZone: "Asia/Kolkata",
                            hour: "2-digit",
                            minute: "2-digit",
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit"
                        })


                        return (
                            <div key={`new key-${index}`} className={`bg-[#f1f1f1] w-fit text-base rounded text-blue-950  px-1 py-0.5 ${location?.allMessageDetails?.group_type === "GROUP" && index === 0 ? "self-center" : `${isSelfMessage ? "self-end" : "self-start"}`} `}>

                                {
                                    (index !== 0 && user?._id && value?.senderId !== user?._id) && (
                                        isGroup && <div className='sm:-mb-0.5 -mb-1.5 text-sm'>
                                            {value?.senderName}
                                        </div>

                                    )
                                }

                                <div className='pt-1 r'>
                                    {
                                        value?.image && <img src={value?.image} alt="" className='w-[200px]' />
                                    }

                                    {
                                        value?.video && <video src={value?.video} controls className='w-[200px]'></video>
                                    }

                                    {value?.other_fileUrl_or_external_link && (
                                        <button
                                            onClick={() => window.open(value.other_fileUrl_or_external_link, "_blank")}
                                            className="bg-blue-500 text-white px-3 py-1 rounded"
                                        >
                                            Open PDF
                                        </button>
                                    )}
                                </div>
                                <p className={`${(location?.allMessageDetails?.group_type === "GROUP" && index === 0) ? "text-[13px]" : "font-semibold"} `}>
                                    {value?.text}
                                </p>

                                <p className={`text-sm opacity-[60%] ${isSelfMessage ? "text-end" : "text-start"} `}>
                                    {indianTime}
                                </p>

                                <div ref={messagesEndRef} />
                            </div>
                        )
                    })
                }
            </div>


            <div className='bg-[#1f2029] fixed bottom-0 py-3 w-full rounded-t-md grid grid-cols-[100px_1fr_100px] items-center text-white shadow-md shadow-[#154174]'>

                <div className='flex items-center justify-center relative'>
                    <MdAttachment size={29} onClick={() => setOpenAttach(true)} className='cursor-pointer' />

                    {
                        openAttach && (
                            <div ref={attachRef} className='bg-[#f1f1f1] text-blue-950 absolute bottom-10 left-8 min-h-[110px] min-w-[100px] flex flex-col items-start px-4 gap-2 py-2 rounded-t-2xl rounded-r-2xl rounded-l-md'>

                                <div className='flex gap-4 items-center justify-center'>

                                    <div onClick={() => {
                                        imgRef.current.click()
                                    }}
                                        className='cursor-pointer'
                                    >
                                        <IoImage size={42} />
                                        <p >image</p>
                                        <input ref={imgRef} onChange={handleAllAtachFile} type="file" accept="image/*" name='image' hidden />
                                    </div>

                                    <div onClick={() => videoRef.current.click()}
                                        className='cursor-pointer'
                                    >
                                        <RiFolderVideoFill size={42} />
                                        <p className='text-center'>video</p>
                                        <input type="file" ref={videoRef} onChange={handleAllAtachFile} accept="video/*" name='video' hidden />
                                    </div>
                                </div>

                                <div className='flex gap-4 items-start justify-center'>
                                    <div onClick={() => fileUrlRef.current.click()} className='cursor-pointer'>
                                        <FaFileAlt size={42} />
                                        <p className='text-center'>file</p>
                                        <input type="file" ref={fileUrlRef} onChange={handleAllAtachFile} accept="application/pdf" name='other_fileUrl_or_external_link' hidden />
                                    </div>

                                    {/* <div className='cursor-pointer'>
                                        <HiOutlineUserGroup size={42}/>
                                        <p className='leading-[1] text-center'>Create group</p>
                                    </div> */}
                                </div>
                            </div>
                        )
                    }
                </div>


                {
                    location?.allMessageDetails?.group_type === "PRIVATE" ? (
                        <>

                            <div>
                                <input type="text" value={messageText}

                                    onChange={e => setMessageText(e.target.value)}

                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleOnClick();
                                        }
                                    }}

                                    className='w-full text-[#f3f3f3] outline-none' placeholder='Type a message...'
                                />
                            </div>

                            <div className='flex items-center justify-center cursor-pointer'>
                                <IoSendOutline size={29} onClick={() => handleOnClick()} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <input type="text" value={messageText}

                                    onChange={e => setMessageText(e.target.value)}

                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleGroupMessageSend();
                                        }
                                    }}

                                    className='w-full text-[#f3f3f3] outline-none' placeholder='Type a message...'
                                />
                            </div>

                            <div className='flex items-center justify-center cursor-pointer'>
                                <IoSendOutline size={29} onClick={() => handleGroupMessageSend()} />
                            </div>
                        </>
                    )
                }

            </div>


            <div className={`absolute  left-[40%] bottom-0 top-[40%] ${loading ? "block" : "hidden"}`}>
                <div className='loader'></div>
            </div>

            {

                attachData.image && (
                    <section className='fixed right-0 left-0 top-0 bottom-[58px] flex flex-col items-center justify-center z-50 bg-gray-800/75'>
                        <div className='relative w-fit h-fit'>
                            <IoClose size={30}
                                onClick={() => {
                                    setAttachData((pre) => {
                                        return {
                                            ...pre,
                                            image: ""
                                        }
                                    })
                                    setLoading(false)
                                }}
                                className='absolute text-[#cbcbcb] hover:text-[#e7e5e5] z-40 -top-10 -right-8'
                            />
                            <img src={attachData.image} alt="" className='h-[300px]' />
                        </div>
                    </section>
                )
            }

            {
                attachData?.video && (
                    <section className='fixed right-0 left-0 top-0 bottom-[58px] flex flex-col items-center justify-center z-50 bg-gray-800/75'>
                        <div className='relative w-fit h-fit'>
                            <IoClose size={30}
                                onClick={() => {
                                    setAttachData((pre) => {
                                        return {
                                            ...pre,
                                            video: ""
                                        }
                                    })

                                    setLoading(false)
                                }}

                                className='absolute text-[#cbcbcb] hover:text-[#e7e5e5] z-40 -top-10 -right-8'
                            />
                            <video src={attachData.video} className='h-[350px]' controls></video>
                        </div>
                    </section>
                )
            }

        </section>
    )
}

export default MessagePage
