import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { CgProfile } from "react-icons/cg";
import { RiChatSmile2Line } from "react-icons/ri";
import { HiOutlineUserAdd } from "react-icons/hi";
import SearchNewMember from './SearchNewMember';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import { setMessageDetails, updateGroupName } from '../store/chatSlice';
import { useDispatch } from 'react-redux';
import { FiArrowUpLeft } from 'react-icons/fi'
import { RxAvatar } from 'react-icons/rx';
import { Link, useParams } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { HiUserGroup } from "react-icons/hi2";
import CreateGroup from '../components/common/CreateGroup';
import { FaUserGroup } from "react-icons/fa6";
import { useGlobalContext } from '../provider/GlobalProvider';
import { updateConversationWithNewMessage } from '../store/chatSlice';

const ChatPage = () => {

    const user = useSelector(state => state.user)
    const chat_details = useSelector(state => state.chat?.all_message)
    const location = useLocation()
    const params = useParams()

    const dispatch = useDispatch()

    const { socketConnection } = useGlobalContext()

    const [openSearchForNewMember, setOpenSearchForNewMember] = useState(false)
    const [openGroupCreateWindow, setOpenGroupCreateWindow] = useState(false)

    useEffect(() => {

        if (!socketConnection) return

        socketConnection.on("receive_message", (data) => {

            const { conversation, message } = data;

            if (conversation?.group_name) {
                dispatch(updateGroupName({
                    group_Id: conversation._id,
                    group_name: conversation.group_name,
                }));
            }

            dispatch(updateConversationWithNewMessage({
                conversation: data.conversation,
                message: data.message
            }));
        });

        return () => {
            socketConnection.off("receive_message");
        };

    }, [socketConnection, dispatch])


    useEffect(() => {
        (async () => {
            try {

                const response = await Axios({
                    ...SummaryApi.get_allChat_details
                })

                const { data: responseData } = response

                console.log("response testing", responseData)

                if (responseData.success) {
                    dispatch(setMessageDetails({ all_message: responseData?.data }))
                }

            } catch (error) {
                console.log("error from chatPage", error)
            }
        })();
    }, [])

    return (
        <section className='min-h-[calc(100vh-60px)] '>

            <div className='grid ipad_pro:grid-cols-[28%_1fr]'>

                <div className={`h-[calc(100vh-60px)] ${location.pathname !== "/chat" ? "hidden ipad_pro:block" : "block"} bg-[#21222b] text-[#f4f4f4]  overflow-y-auto scroll-smooth hide-scrollbar border-r border-[#c1c1c17e] ring-1 ring-[#c1c1c17e] relative`} style={{ willChange: 'transform' }}>

                    <div className='min-h-[65px] flex justify-between items-center px-4 max-h-[65px] bg-[#21222b] shadow-md shadow-[#57575765] sticky top-0 z-10'>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#2e2f38]">
                                <CgProfile size={24} className="text-gray-300" />
                            </div>
                            <p className="text-sm font-medium truncate sm:max-w-[15ch] max-w-[9ch] ipad_pro:hidden block lg-real:block">{`${user?.name}` || "Guest User"}</p>
                        </div>

                        <div className="flex items-center bg-[#2e2f38] rounded-full px-3 py-1.5 sm:w-[140px] w-[120px]">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent outline-none text-sm placeholder-gray-400 w-full"
                            />
                        </div>

                        <div>
                            <HiUserGroup size={28} onClick={() => setOpenGroupCreateWindow(true)} title='create group' />
                        </div>

                        <div>
                            <HiOutlineUserAdd onClick={() => setOpenSearchForNewMember(true)} size={26} className='cursor-pointer' title='find new member' />
                        </div>

                    </div>


                    {
                        chat_details?.length === 0 ? (
                            <div className='h-full w-full flex flex-col gap-2 justify-center items-center  text-[#8c8c8c] pb-[120px]'>
                                <p>Explore user to start a conversation with.</p>
                                <FiArrowUpLeft size={50} />
                            </div>
                        ) : (
                            <div className="p-3 space-y-2">
                                {
                                    chat_details?.map((v, i) => {
                                        return (
                                            <Link to={`/chat/${v?._id}`} state={{ allMessageDetails: v }} key={v?._id || `x-${v?.otherUser?._id}`}
                                                className="rounded-lg bg-[#205b67] hover:bg-[#2e4d66] transition-colors flex gap-3 items-center px-4 py-2.5 cursor-pointer"
                                            >

                                                {
                                                    v?.group_type === "GROUP" ? (
                                                        <FaUserGroup
                                                            size={38}
                                                            className="text-gray-300 border border-gray-500 rounded-full p-1"
                                                        />
                                                    ) : (
                                                        <RxAvatar
                                                            size={38}
                                                            className="text-gray-300 border border-gray-500 rounded-full p-1"
                                                        />
                                                    )
                                                }

                                                <div className='flex flex-col leading-tight text-sm text-gray-200'>

                                                    {
                                                        v?.group_type === "GROUP" ? (
                                                            <p className="font-medium text-[16px] text-white max-w-[24ch] truncate">
                                                                {v?.group_name}
                                                            </p>
                                                        ) : (
                                                            <>
                                                                <p className="font-medium text-[16px] text-white max-w-[24ch] truncate">
                                                                    {v?.otherUser?.name}
                                                                </p>
                                                                <p className="text-[12px] text-gray-400 max-w-[24ch] truncate">
                                                                    {v?.otherUser?.userId}
                                                                </p>
                                                            </>
                                                        )
                                                    }

                                                </div>
                                            </Link>
                                        )
                                    })
                                }


                            </div>
                        )
                    }


                </div>

                <div className={`h-[calc(100vh-60px)] w-full  ${location.state === null && location.pathname === `/chat` && "items-center justify-center ipad_pro:flex hidden"} overflow-hidden bg-[#282932]`} style={{ willChange: 'transform' }}>

                    {
                        location.state === null && location.pathname === `/chat` ? (
                            <div className='select-none'>

                                <p className='text-[#979797]'>Connect in confidence, knowing your messages</p>
                                <p className='text-[#979797]'> are encrypted and visible only to trusted people.</p>

                                <div className='text-[#979797] flex items-center justify-center pt-1'>
                                    <RiChatSmile2Line size={26} />
                                </div>
                            </div>
                        ) : (
                            <Outlet />
                        )
                    }

                </div>

            </div>


            {
                openSearchForNewMember && (
                    <SearchNewMember close={() => setOpenSearchForNewMember(false)} />
                )
            }

            {
                openGroupCreateWindow && (
                    <CreateGroup close={() => setOpenGroupCreateWindow(false)} />
                )
            }

        </section>
    )
}

export default ChatPage
