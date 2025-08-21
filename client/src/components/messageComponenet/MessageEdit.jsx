import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { data, useLocation, useParams } from 'react-router-dom'
import { FaUserGroup } from 'react-icons/fa6';
import { useGlobalContext } from '../../provider/GlobalProvider';
import Axios from '../../utils/Axios';
import SummaryApi from '../../common/SummaryApi';
import { CgProfile } from "react-icons/cg";
import { BiDotsVertical } from "react-icons/bi";
import ChatMemberSetting from '../other/ChatMemberSetting';
import { ImExit } from "react-icons/im";
import { RiUserAddFill } from "react-icons/ri";
import { IoLink } from "react-icons/io5";
import { FiEdit3 } from "react-icons/fi";

const MessageEdit = () => {
    const chat_details = useSelector(state => state.chat?.all_message)
    const user = useSelector(state => state?.user)
    const [all_details, setAll_details] = useState(null)



    const dotsRef = useRef(null);
    const location = useLocation()
    const params = useParams()

    const [openDots, setOpenDots] = useState({
        _id: ""
    })

    const { socketConnection } = useGlobalContext()

    // fetch details of group
    useEffect(() => {
        (async () => {
            if (!params?.conversation) return

            try {

                const response = await Axios({
                    ...SummaryApi.get_group_details,
                    params: {
                        conversationID: params?.conversation
                    }
                })

                const { data: responseData } = response

                if (responseData?.success) {
                    setAll_details(responseData?.data)
                }

            } catch (error) {
                console.log('group details error', error)
            }

        })()
    }, [])


    // Close if clicked outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (dotsRef.current && !dotsRef.current.contains(e.target)) {
                setOpenDots({
                    _id: ""
                });
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    console.log("all_details", all_details)

    return (
        <section className='bg-[#21222b] text-white h-[calc(100vh-60px)] overflow-y-auto px-4 py-3 sm:px-6 sm:py-5'>

            <div className="flex items-center gap-8 p-4 rounded-2xl bg-[#2b2c36] shadow-lg">

                {/* Avatar with edit button */}
                <div className="relative">
                    <div className="relative  rounded-full border-2 border-gray-400 h-[80px] w-[80px] flex items-center justify-center bg-[#3a3b45] overflow-hidden">
                        <FaUserGroup size={80} className="text-gray-200 absolute top-1.5" />
                    </div>
                    <button className="absolute bottom-0 right-1.5 flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-black shadow-md hover:bg-green-400 transition">
                        ✏️
                    </button>
                </div>

                {/* Details */}
                <div className="flex flex-col ">
                    <p className="text-sm text-gray-400">Group Name</p>

                    <div className='flex items-center gap-1'>
                        <h2 className="text-2xl font-semibold tracking-wide">
                            {all_details?.group_name || "Unnamed Group"}
                        </h2>
                        <FiEdit3 size={30} className='cursor-pointer'/>
                    </div>

                    <p className="text-gray-400 text-sm">
                        {all_details?.participants?.length || 0} members
                    </p>
                </div>
            </div>

            <div className={`mt-6 flex justify-between lg-real:flex-row flex-col  bg-[#2b2c34] px-6 py-4 rounded-2xl shadow-md`}>

                {/* Left side - Title */}
                <div>

                    {/* for mobile and teblet version */}
                    <div className='lg-real:hidden flex gap-5 sm:gap-10 flex-col sm:flex-row items-start  pt-1.5 pb-5'>

                        <div className='flex gap-3 items-center'>

                            <div className='bg-green-500 text-white rounded-full p-1 overflow-hidden'>
                                <RiUserAddFill size={28} className='' />
                            </div>

                            <p className='text-lg'>Add member</p>
                        </div>

                        <div className='flex gap-3 items-center'>

                            <div className='bg-green-500 text-white rounded-full p-1 overflow-hidden'>
                                <IoLink size={28} className='' />
                            </div>

                            <p className='text-lg'>Generate group add Link</p>
                        </div>

                    </div>

                    <h1 className="text-xl font-semibold text-white mb-3">All Members</h1>

                    <div className="space-y-3 max-h-[420px] overflow-y-auto chat-scrollbar pr-2">

                        <div className="flex items-center justify-between gap-3 p-3 lg-real:w-[700px] w-full rounded-xl bg-[#3a3b45] hover:bg-[#4a4b57] transition shadow-sm" >

                            <div className='flex items-center gap-3'>
                                {/* Avatar */}
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#2b2c36]">
                                    <CgProfile size={32} className="text-gray-300" />
                                </div>

                                {/* User Info */}
                                <div className="flex flex-col leading-tight">
                                    <p className="text-white font-medium">{all_details?.currUser?.name || "Un-named"}</p>
                                    <p className="text-gray-400 text-sm">{all_details?.currUser?.userId}</p>
                                </div>
                            </div>

                            <div className='w-[20%] flex gap-1 items-center justify-between'>

                                {
                                    all_details?.currUser?.admin && (
                                        <p className=''>Admin</p>
                                    )
                                }

                            </div>

                        </div>

                        {all_details?.otherUser?.map((v, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between gap-3 p-3 lg-real:w-[700px] w-full rounded-xl bg-[#3a3b45] hover:bg-[#4a4b57] transition shadow-sm"
                            >
                                <div className='flex items-center gap-3'>
                                    {/* Avatar */}
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#2b2c36]">
                                        <CgProfile size={32} className="text-gray-300" />
                                    </div>

                                    {/* User Info */}
                                    <div className="flex flex-col leading-tight">
                                        <p className="text-white font-medium">{v?.name || "Unnamed"}</p>
                                        <p className="text-gray-400 text-sm">{v?.userId}</p>
                                    </div>
                                </div>


                                <div className='w-[20%] flex gap-1 items-center justify-between'>

                                    {
                                        v?.admin && (
                                            <p className=''>Admin</p>
                                        )
                                    }

                                    {
                                        all_details?.currUser?._id === user?._id && (
                                            <div className='ml-auto float-right relative'>

                                                <BiDotsVertical size={22} className='cursor-pointer'
                                                    onClick={() => {
                                                        setOpenDots((preve) => {
                                                            return {
                                                                ...preve,
                                                                _id: v?._id
                                                            }
                                                        })
                                                    }} />

                                                {
                                                    openDots._id === v?._id && (
                                                        <div ref={dotsRef} className='w-fit h-fit'>
                                                            <ChatMemberSetting />
                                                        </div>
                                                    )
                                                }

                                            </div>
                                        )
                                    }
                                </div>



                            </div>
                        ))}

                    </div>

                </div>


                {/* Right side - Actions for desktop mode */}
                <div className="lg-real:flex hidden flex-col justify-between gap-5 pr-[6%] text-base pt-[4%] pb-[1%]">


                    <div className='flex flex-col gap-5'>

                        <button className="sm:px-4 py-2.5 h-fit sm:w-[150px] block bg-green-500 hover:bg-green-600 text-white  font-medium rounded-lg shadow">
                            Add Member
                        </button>
                        <button className="sm:px-4 py-2.5 h-fit sm:w-[150px] block bg-blue-500 hover:bg-blue-600 text-white  font-medium rounded-lg shadow">
                            Generate Link
                        </button>

                    </div>

                    <div className="px-4 py-2.5 h-fit w-[150px]  block bg-red-500 hover:bg-red-600 text-white  font-medium rounded-lg shadow">
                        Exit Group
                    </div>

                </div>


                {/* for mobile and tablet version */}
                <div className='lg-real:hidden block pt-6 mb-1 pl-2 text-[#f43131]'>
                    <div className='flex gap-2 items-center'>
                        <ImExit size={24} />
                        <p className='text-[20px] text-[#fe4949]'>Exit Group</p>
                    </div>
                </div>

            </div>

        </section>
    )
}

export default MessageEdit
