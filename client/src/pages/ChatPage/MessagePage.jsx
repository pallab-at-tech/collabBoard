import React, { useEffect, useRef, useState } from 'react'
import { IoSendOutline, IoImage } from "react-icons/io5";
import { MdAttachment, MdManageSearch, MdOutlineFileCopy } from "react-icons/md";
import { RxAvatar } from "react-icons/rx";
import { useSelector, useDispatch } from 'react-redux';
import { Outlet, useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import { useGlobalContext } from '../../provider/GlobalProvider';
import Axios from '../../utils/Axios';
import SummaryApi from '../../common/SummaryApi';
import { updateConversationWithNewMessage, updateGroupImage, updateGroupName } from '../../store/chatSlice';
import { FaFileAlt } from "react-icons/fa";
import { RiFolderVideoFill } from "react-icons/ri";
import uploadFile from '../../utils/uploadFile';
import { FaUserGroup } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import { AiOutlineClose } from "react-icons/ai";
import { HiOutlineDotsVertical } from "react-icons/hi";


const MessagePage = () => {

    const { socketConnection } = useGlobalContext()
    const chat_details = useSelector(state => state.chat?.all_message)
    const user = useSelector(state => state.user)

    const location = useLocation().state
    const pathname = useLocation().pathname
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const params = useParams()

    const chatRef = useRef(null);
    const messagesEndRef = useRef(null);
    const attachRef = useRef(null)
    const dataSetRef = useRef(null)

    const [messages, setMessages] = useState([])
    const [conversation, setConversation] = useState(null)

    const [messageText, setMessageText] = useState("")
    const [deletIdSet, setDeletIdSet] = useState(new Set())
    const [attachData, setAttachData] = useState({
        image: "",
        video: "",
        other_fileUrl_or_external_link: "",
    })

    const [editEnable, setEditEnable] = useState({
        enable: false,
        loader: false,
        text: "",
        textId: ""
    })

    const [deleteMsg, setDeleteMsg] = useState({
        enable: false,
        textId: "",
        loader: false
    })

    const [isGroup, setIsGroup] = useState(true)
    const [loading, setLoading] = useState(false)
    const [messageLoading, setMessageLoading] = useState(false)

    const [loadBlocker, setLoadBlocker] = useState({
        messageLoader: false,
        scrollEnding: false
    })

    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [openAttach, setOpenAttach] = useState(false)

    // Handle external files and media
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
                img.src = response?.secure_url;

                img.onload = () => setLoading(false);
                img.onerror = () => {
                    console.error("Image failed to load");
                    setLoading(false);
                };

            } else if (name === "video") {
                const video = document.createElement("video");
                video.src = response?.secure_url;

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

    // send private message
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

    // send message in group conversation
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

    // edit message
    const handleEdit = async () => {

        if (!editEnable.enable || !editEnable.text || !editEnable.text.trim('') || !socketConnection) return

        setEditEnable((prev) => {
            return {
                ...prev,
                loader: true
            }
        })

        socketConnection.on("edit_msgSuccess", (editData) => {
            toast.success(editData?.message)
            setEditEnable(() => {
                return {
                    enable: false,
                    loader: false,
                    text: "",
                    textId: ""
                }
            })
        })

        socketConnection.on("edit_msgErr", (editData) => {
            toast.error(editData?.message)
            setEditEnable(() => {
                return {
                    enable: false,
                    loader: false,
                    text: "",
                    textId: ""
                }
            })
        })

        socketConnection.emit("edit_msg", {
            textId: editEnable.textId,
            text: editEnable.text,
            conversationId: params?.conversation
        })
    }

    // delete message
    const handleDeleteMsg = async () => {
        if (!deleteMsg.enable || !deleteMsg.textId || !socketConnection) return

        setDeleteMsg((prev) => {
            return {
                ...prev,
                loader: true
            }
        })

        socketConnection.on("delete_msgErr", (deleteData) => {
            toast.error(deleteData?.message)
            setDeleteMsg({
                enable: false,
                textId: "",
                loader: false
            })
        })

        socketConnection.on("delete_msgSuccess", (deleteData) => {
            toast.success(deleteData?.message)
            setDeleteMsg({
                enable: false,
                textId: "",
                loader: false
            })
        })

        socketConnection.emit("delete_msg", {
            textId: deleteMsg.textId,
            conversationId: params?.conversation
        })
    }

    // load more for message for scrolling at top / pagination
    const loadMoreMessages = async () => {

        if (!chat_details || !chatRef.current) return
        setLoadingMore(true);

        const prevScrollHeight = chatRef.current.scrollHeight;
        const prevScrollTop = chatRef.current.scrollTop;

        try {
            const matchingChats = chat_details?.filter(chat =>
                chat?._id === params?.conversation
            );

            const response = await Axios({
                ...SummaryApi.get_all_messages,
                data: {
                    allMessageId: matchingChats[0]?.messages || [],
                    before: (messages && messages.length !== 0) ? messages[0]?.createdAt : null
                }
            })

            const { data: responseData } = response

            if (responseData?.success) {
                setLoadBlocker((prev) => {
                    return {
                        ...prev,
                        scrollEnding: true
                    }
                })
                setMessages((prev) => {
                    return [...responseData?.data, ...prev]
                })
                setHasMore(responseData?.hasMore)

                requestAnimationFrame(() => {
                    const newScrollHeight = chatRef.current.scrollHeight;
                    chatRef.current.scrollTop =
                        newScrollHeight - prevScrollHeight + prevScrollTop;
                });
            }

            setLoadingMore(false);
        } catch (error) {
            console.log("error for fetching all messages", error)
            setLoadingMore(false);
        }
    }

    // handle scroll
    const handleScroll = async () => {
        if (!chatRef.current || loadingMore || !hasMore) {
            return
        }

        if (chatRef.current.scrollTop === 0) {
            loadMoreMessages();
        }
    }

    // fetch all messages
    useEffect(() => {

        if (loadBlocker.messageLoader) {
            setLoadBlocker((prev) => {
                return {
                    ...prev,
                    messageLoader: false
                }
            })
            return
        }

        (async () => {
            try {

                setMessageLoading(true)

                const matchingChats = chat_details?.filter(chat =>
                    chat?._id === params?.conversation
                );

                const response = await Axios({
                    ...SummaryApi.get_all_messages,
                    data: {
                        allMessageId: matchingChats[0]?.messages || []
                    }
                })

                const { data: responseData } = response

                if (responseData.success) {
                    setMessages(responseData?.data)
                }

                setMessageLoading(false)

            } catch (error) {
                setMessageLoading(false)
                setMessages([])
                console.log("error for fetching all messages", error)
            }

        })()
    }, [params?.conversation, chat_details])

    // recieved message , edit message and update globally [ all chat member ]
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

            setLoadBlocker((prev) => {
                return {
                    ...prev,
                    messageLoader: true
                }
            })

        });

        socketConnection.on("edited_msg", (data) => {
            const { textId, conversationId, updatedAt, text } = data || {}

            const url = params.conversation === conversationId

            if (url) {

                setMessages((prev) => {
                    const msg = [...prev]
                    const findIdx = msg.findIndex((i) => i && i?._id === textId)

                    if (findIdx >= 0) {
                        msg[findIdx] = {
                            ...msg[findIdx],
                            updatedAt: updatedAt,
                            text: text
                        }
                    }
                    return msg
                })

                setLoadBlocker((prev) => {
                    return {
                        ...prev,
                        messageLoader: true
                    }
                })
            }
        })

        socketConnection.on("deleted_msg", (data) => {
            const { textId, conversationId } = data || {}

            const url = params.conversation === conversationId

            if (url) {
                setMessages((prev) => {
                    let msg = [...prev]
                    msg = msg.filter((m) => m && m._id !== textId)
                    return msg
                })

                setLoadBlocker((prev) => {
                    return {
                        ...prev,
                        messageLoader: true
                    }
                })
            }
        })

        return () => {
            socketConnection.off("receive_message");
            socketConnection.off("edited_msg")
            socketConnection.off("deleted_msg")
        };
    }, [socketConnection, dispatch]);

    // Scroll ending at last load message handler
    useEffect(() => {

        if (loadBlocker.scrollEnding) {
            setLoadBlocker((prev) => {
                return {
                    ...prev,
                    scrollEnding: false
                }
            })
            return
        }

        if (messagesEndRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // App resize dynamically
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

    // set particular conversation and conversation type
    useEffect(() => {
        const conversation_details = chat_details?.find(c => c._id === params?.conversation)
        setConversation(conversation_details)

        if (conversation_details?.group_type === "GROUP") {
            // console.log("conversation_details", conversation_details)
            setIsGroup(true);
        }
        else {
            setIsGroup(false)
        }
    }, [chat_details, params?.conversation])

    // close media window if click outside of section 
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (attachRef.current && !attachRef.current.contains(event.target)) {
                setOpenAttach(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // remove all data set if click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dataSetRef.current && !dataSetRef.current.contains(event?.target)) {
                setDeletIdSet(() => new Set())
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
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
                                        location?.allMessageDetails?.group_image ? (
                                            <img src={location?.allMessageDetails?.group_image} alt="" className='h-[36px] w-[36px] rounded-full object-cover' />
                                        ) : (
                                            <FaUserGroup size={30} />
                                        )
                                    ) : (
                                        <RxAvatar size={38} />
                                    )
                                }

                                {location?.allMessageDetails?.group_type === "GROUP" ? (
                                    <p className="text-lg">{location?.allMessageDetails?.group_name || conversation?.group_name}</p>
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

                                        location?.allMessageDetails?.otherUser?.avatar ? (
                                            <img src={location?.allMessageDetails?.otherUser?.avatar} alt="" className='h-[40px] w-[40px] border-2 border-[#205b67] p-1 rounded-full object-cover' />
                                        ) : (
                                            <RxAvatar size={38} />
                                        )
                                    )
                                }

                                {location?.allMessageDetails?.group_type === "GROUP" ? (
                                    <p className="text-lg">{location?.allMessageDetails?.group_name || conversation?.group_name}</p>
                                ) : (
                                    <div className="flex flex-col text-base">
                                        <p>{location?.allMessageDetails?.otherUser?.name || conversation?.otherUser?.name}</p>
                                        <p className="text-sm opacity-75">{location?.allMessageDetails?.otherUser?.userId || conversation?.otherUser?.userId}</p>
                                    </div>
                                )}
                            </div>
                        )
                    }

                    {/* right */}
                    <MdManageSearch size={30} className="cursor-pointer" />
                </div>

                {/* Messages */}
                <div
                    ref={chatRef}
                    onScroll={handleScroll}
                    className="overflow-y-auto h-[var(--message-heigh)] px-2.5 py-4 flex flex-col gap-2.5 chat-scrollbar min-h-0 messages-container"
                >
                    {
                        messageLoading ? (
                            <div className='flex flex-col gap-4 items-center justify-center mt-[180px]'>
                                <div className='team_loader'></div>
                                <div className='text-gray-300 text-[18px] pl-2'>fetching...</div>
                            </div>
                        ) : (
                            Array.isArray(messages) &&
                            messages.map((value, index) => {
                                const isSelfMessage = value?.senderId?._id === user?._id || value?.senderId === user?._id;
                                const date = new Date(value?.createdAt);
                                const indianTime = date.toLocaleString("en-IN", {
                                    timeZone: "Asia/Kolkata",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                });

                                const isEdited = new Date(value?.createdAt) < new Date(value?.updatedAt)

                                return (
                                    <div
                                        ref={messagesEndRef}
                                        key={`msg-${index}`}
                                        className={`relative max-w-[75%] break-words text-base rounded ${value?.optional_msg ? "text-gray-400" : "text-blue-950"} px-2.5 py-1.5  ${(value?.optional_msg) ? "self-center" : isSelfMessage ? "self-end bg-[#f1f1f1]" : "self-start bg-[#f1f1f1]"
                                            }`}
                                    >
                                        {
                                            (isSelfMessage || value?.image || value?.video) && (!value?.optional_msg) && (
                                                <HiOutlineDotsVertical
                                                    onClick={() => {
                                                        setDeletIdSet(() => {
                                                            const set = new Set()
                                                            set.add(value?._id)
                                                            return set
                                                        })
                                                    }}
                                                    size={15}
                                                    className='absolute top-1.5 right-1 cursor-pointer'
                                                />
                                            )
                                        }

                                        {
                                            deletIdSet.has(value?._id) && (
                                                <div ref={dataSetRef}
                                                    className="
                                                    absolute top-10 right-4 z-50
                                                    w-32
                                                    bg-white
                                                    rounded-lg
                                                    shadow-lg
                                                    border border-gray-200
                                                    overflow-hidden
                                                    animate-scaleIn
                                                "
                                                >
                                                    {/* Edit button */}
                                                    {
                                                        value?.text && (
                                                            <button
                                                                className="
                                                                    w-full px-4 py-2
                                                                    text-sm text-left
                                                                    hover:bg-gray-100
                                                                    transition cursor-pointer
                                                                "
                                                                onClick={() => {
                                                                    setEditEnable((prev) => {
                                                                        return {
                                                                            ...prev,
                                                                            enable: true,
                                                                            text: value?.text || "",
                                                                            textId: value?._id || ""
                                                                        }
                                                                    })
                                                                }}
                                                            >
                                                                ✏️ Edit
                                                            </button>
                                                        )
                                                    }

                                                    {/* Copy button */}
                                                    {
                                                        value?.text && (
                                                            <button
                                                                className="
                                                                    w-full px-4 py-2
                                                                    text-sm text-left
                                                                    hover:bg-green-50
                                                                    transition flex gap-1
                                                                    cursor-pointer
                                                                "
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(value?.text)
                                                                    toast.success("Copied!")
                                                                    setDeletIdSet(new Set())
                                                                }}
                                                            >
                                                                <MdOutlineFileCopy size={18} className='text-green-600' />
                                                                <span>Copy</span>
                                                            </button>
                                                        )
                                                    }

                                                    {/* delete button */}
                                                    <button
                                                        className="
                                                        w-full px-4 py-2
                                                        text-sm text-left
                                                        text-red-600
                                                        hover:bg-red-50
                                                        transition cursor-pointer
                                                    "
                                                        onClick={() => {
                                                            setDeleteMsg((prev) => {
                                                                return {
                                                                    ...prev,
                                                                    enable: true,
                                                                    textId: value?._id
                                                                }
                                                            })
                                                        }}
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            )
                                        }

                                        {isGroup && !isSelfMessage && (
                                            <p className="text-xs font-medium text-gray-600 -mb-1">{value?.senderName}</p>
                                        )}

                                        <div className={`p-1 rounded-md text-[13px] select-none ${value?.optional_msg ? "block" : "hidden"}`}>
                                            <p className='text-center'>
                                                {value?.optional_msg} <span>{` - ${indianTime}`}</span>
                                            </p>
                                        </div>

                                        {value?.image && <img src={value.image} alt="" className={`w-[200px] rounded-md py-1 pr-2.5`} />}
                                        {value?.video && <video src={value.video} controls className={`w-[200px] rounded-md pr-2.5`}></video>}
                                        {value?.other_fileUrl_or_external_link && (
                                            <button
                                                onClick={() => window.open(value.other_fileUrl_or_external_link, "_blank")}
                                                className={`bg-blue-500 text-white px-3 py-1 rounded mt-1 ${isSelfMessage && "pr-2.5"}`}
                                            >
                                                Open File
                                            </button>
                                        )}

                                        {value?.text && <div className={`mt-1 ${isSelfMessage ? "pr-2" : "pr-3"}`}>
                                            {value.text}
                                            <span className='text-gray-500 select-none text-[12px]'>{isEdited && " (edited)"}</span>
                                        </div>}
                                        <p className={`text-xs opacity-60 ${value?.optional_msg ? "hidden" : "block"} ${isSelfMessage ? "text-right" : "text-left"}`}>{indianTime}</p>
                                    </div>
                                );
                            })
                        )
                    }
                </div>

                {/* Footer */}
                <div className="bg-[#1f2029] py-3 w-full grid grid-cols-[60px_1fr_60px] items-center text-white shadow-md shadow-[#154174]">
                    {/* Attachments */}
                    <div className="flex items-center justify-center relative">
                        <MdAttachment size={26} onClick={() => {
                            setOpenAttach(true)
                        }}
                            className="cursor-pointer"
                        />
                        {openAttach && (
                            <div ref={attachRef} className="absolute z-40 bottom-12 left-6 bg-white text-blue-950 rounded-lg p-3 flex gap-4">

                                <label htmlFor="image" className="cursor-pointer flex flex-col items-center">
                                    <IoImage size={32} />
                                    <p className="text-xs">Image</p>
                                    <input onChange={handleAllAtachFile} type="file" accept="image/*" id='image' name="image" hidden />
                                </label>

                                <label htmlFor="video">
                                    <RiFolderVideoFill size={32} />
                                    <p className="text-xs">Video</p>
                                    <input onChange={handleAllAtachFile} type="file" accept="video/*" id='video' name="video" hidden />
                                </label>

                                {/* <label htmlFor="other_fileUrl_or_external_link">
                                    <FaFileAlt size={32} />
                                    <p className="text-xs">File</p>
                                    <input onChange={handleAllAtachFile} type="file" accept="application/pdf" id='other_fileUrl_or_external_link' name="other_fileUrl_or_external_link" hidden />
                                </label> */}
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                            if (!messageText) return
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                isGroup ? handleGroupMessageSend() : handleOnClick();
                            }
                        }}
                        className="w-full bg-transparent outline-none px-2 text-white"
                        placeholder="Type a message..."
                    />

                    {/* Send */}
                    < div className={`flex items-center justify-center cursor-pointer`}>
                        <IoSendOutline size={26}
                            onClick={() => {
                                if (!messageText) return
                                (isGroup ? handleGroupMessageSend() : handleOnClick())
                            }}
                        />
                    </div>

                </div>

                {
                    deleteMsg.enable && (
                        <section
                            className='fixed top-0 left-0 right-0 bottom-0 z-50
                                flex items-end sm:items-center justify-center
                                bg-[#2b2b2b]/15 backdrop-blur-[2px]
                                px-4 py-14 sm:py-0'
                        >

                            <div className="w-full max-w-md rounded-xl bg-white shadow-xl p-6">
                                {/* Title */}
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Delete Message?
                                </h2>

                                {/* Description */}
                                <p className="text-sm text-gray-600 mt-2">
                                    Are you sure you want to delete this message? This action cannot be undone.
                                </p>

                                {/* Actions */}
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        disabled={deleteMsg.loader}
                                        className={`px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition ${deleteMsg.loader ? "cursor-not-allowed" : "cursor-pointer"}`}
                                        onClick={() => {
                                            setDeleteMsg({
                                                enable: false,
                                                textId: "",
                                                loader: false
                                            })
                                        }}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        disabled={deleteMsg.loader}
                                        className={`px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 transition ${deleteMsg.loader ? "cursor-not-allowed" : "cursor-pointer"}`}
                                        onClick={() => handleDeleteMsg()}
                                    >
                                        {deleteMsg.loader ? "Deleting" : "Delete"}
                                    </button>
                                </div>
                            </div>

                        </section>
                    )
                }

                {
                    editEnable.enable && (
                        <section
                            className='fixed top-0 left-0 right-0 bottom-0 z-50
                                flex items-end sm:items-center justify-center
                                bg-[#2b2b2b]/15 backdrop-blur-[2px]
                                px-4 py-14 sm:py-0'
                        >

                            <div className="w-full max-w-md rounded-xl overflow-hidden bg-white shadow-xl">

                                {/* HEADER */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-[#cbd4e7]">
                                    <div className="flex items-center gap-2">
                                        <button
                                            disabled={editEnable.loader}
                                            onClick={() => {
                                                setEditEnable(() => {
                                                    return {
                                                        enable: false,
                                                        text: "",
                                                        textId: "",
                                                        loader: false
                                                    }
                                                })
                                            }}
                                            className="text-gray-600 hover:text-black cursor-pointer"
                                        >
                                            ✕
                                        </button>
                                        <h2 className="text-sm font-semibold text-gray-800">
                                            Edit message
                                        </h2>
                                    </div>
                                </div>

                                {/* BODY */}
                                <div className="px-4 py-4 bg-white">
                                    <textarea
                                        value={editEnable.text}
                                        onChange={(e) =>
                                            setEditEnable((prev) => {
                                                return {
                                                    ...prev,
                                                    text: e.target.value
                                                }
                                            })
                                        }
                                        rows={3}
                                        className="w-full resize-none rounded-md border border-gray-300
                                        px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#868d9a]"
                                    />
                                </div>

                                {/* FOOTER */}
                                <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-[#cbd4e7]">
                                    <button
                                        onClick={() => {
                                            setEditEnable(() => {
                                                return {
                                                    enable: false,
                                                    text: "",
                                                    textId: "",
                                                    loader: false
                                                }
                                            })
                                        }}
                                        className="text-sm px-4 py-2 rounded-md text-gray-700 hover:bg-gray-200 cursor-pointer"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        disabled={editEnable.loader}
                                        onClick={() => handleEdit()}
                                        className={`text-sm px-4 py-2 rounded-md
                                        bg-green-500 text-white hover:bg-green-600
                                        disabled:opacity-60 ${editEnable.loader ? "cursor-not-allowed" : "cursor-pointer"}`}
                                    >
                                        {editEnable.loader ? "Saving..." : "Save"}
                                    </button>
                                </div>

                            </div>

                        </section>
                    )
                }

                {
                    loading && (
                        <section className='fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50 bg-[#1e293979]'>
                            <div className='team_loader'></div>
                        </section>
                    )
                }

                {attachData.image && (
                    <section className="
                        fixed top-0 left-0 right-0 bottom-[60px] z-50
                        flex items-end sm:items-center justify-center
                        bg-[#2b2b2b]/15 backdrop-blur-[2px]
                        px-4 py-14 sm:py-0
                    ">
                        <div className="
                            relative
                            max-w-[80vw] max-h-[85vh]
                            rounded-xl overflow-hidden
                            shadow-2xl
                            animate-fadeIn
                        ">
                            {/* Close Button */}
                            <button
                                onClick={() =>
                                    setAttachData(prev => ({ ...prev, image: "" }))
                                }
                                className="
                                    absolute top-3 right-3 z-10
                                    h-9 w-9
                                    rounded-full
                                    bg-black/60 hover:bg-black/80
                                    flex items-center justify-center
                                    transition cursor-pointer
                                "
                            >
                                <AiOutlineClose size={20} className="text-white" />
                            </button>

                            {/* Image */}
                            <img
                                src={attachData.image}
                                alt="Preview"
                                className="
                                    max-w-full max-h-[65vh]
                                    object-contain
                                    bg-black
                                "
                            />
                        </div>
                    </section>
                )}

                {
                    attachData.video && (
                        <section
                            className='
                            fixed top-0 left-0 right-0 bottom-[60px] z-50
                            flex items-end sm:items-center justify-center
                            bg-[#2b2b2b]/15 backdrop-blur-[2px]
                            px-4 py-14 sm:py-0'
                        >
                            <div className="
                                relative
                                max-w-[80vw] max-h-[85vh]
                                rounded-xl overflow-hidden
                                shadow-2xl
                                animate-fadeIn
                            ">
                                {/* Close Button */}
                                <button
                                    onClick={() =>
                                        setAttachData(prev => ({ ...prev, video: "" }))
                                    }
                                    className="
                                    absolute top-3 right-3 z-10
                                    h-9 w-9
                                    rounded-full
                                    bg-black/60 hover:bg-black/80
                                    flex items-center justify-center
                                    transition cursor-pointer
                                "
                                >
                                    <AiOutlineClose size={20} className="text-white" />
                                </button>

                                <video src={attachData.video}
                                    className='max-w-full max-h-[65vh] object-contain bg-black'
                                    controls
                                    controlsList="nofullscreen noremoteplayback nodownload"
                                    disablePictureInPicture
                                    preload="metadata"
                                    playsInline
                                >
                                </video>
                            </div>
                        </section>
                    )
                }
            </section >

            <div className={`${`/chat/${params?.conversation}/edit` !== pathname && "hidden"} w-full`}>
                {
                    <Outlet />
                }
            </div>
        </>
    )
}

export default MessagePage