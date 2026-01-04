import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { FaUserGroup } from 'react-icons/fa6';
import { useGlobalContext } from '../../provider/GlobalProvider';
import Axios from '../../utils/Axios';
import SummaryApi from '../../common/SummaryApi';
import { CgProfile } from "react-icons/cg";
import { BiDotsVertical } from "react-icons/bi";
import ChatMemberSetting from './ChatMemberSetting';
import { ImExit } from "react-icons/im";
import { RiUserAddFill } from "react-icons/ri";
import { IoLink } from "react-icons/io5";
import { FiEdit3 } from "react-icons/fi";
import { LuCircleFadingPlus } from "react-icons/lu";
import GroupNameChanged from './GroupNameChanged';
import GroupImageChanged from './GroupImageChanged';
import AddMemberGroup from './AddMemberGroup';
import toast from 'react-hot-toast';


const MessageEdit = () => {
    const user = useSelector(state => state?.user)
    const { socketConnection } = useGlobalContext()

    const [all_details, setAll_details] = useState(null)

    const dotsRef = useRef(null);
    const params = useParams()
    const navigate = useNavigate()

    const [openDots, setOpenDots] = useState({
        _id: ""
    })

    const [openGroupImageChanged, setOpenGroupImageChanged] = useState(false)
    const [openGroupNameChanged, setOpenGroupNameChanged] = useState(false)
    const [openAddGRoupMember, setOpenAddGRoupMember] = useState(false)


    const fetchGroupDetails = async () => {

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
    }

    useEffect(() => {
        fetchGroupDetails()
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

    const handleExitFromGroup = async (group_id) => {

        let errorHandled = false;

        // Listen for error just once
        socketConnection.once("exit_group_error", (data) => {
            toast.error(data?.message || "Failed to exit from group.");
            errorHandled = true;
        });

        // Emit the update request group_id, my_id, my_userId
        socketConnection.emit("exit_group", {
            group_id: group_id,
            my_id: user?._id,
            my_userId: user?.userId
        });

        // Small delay to see if error is returned
        setTimeout(() => {
            if (!errorHandled) {
                toast.success("Successfully exit from group.");
                setOpenDots({
                    _id: ""
                })
                navigate("/chat")
            }
        }, 500);
    }

    console.log("all details", all_details)


    return (
        <section className='bg-[#21222b] text-white h-[calc(100vh-60px)] overflow-y-auto px-4 py-3 sm:px-6 sm:py-5'>

            <div className="flex items-center gap-8 p-4 rounded-2xl bg-[#2b2c36] shadow-lg">

                {/* Avatar with edit button */}

                {/* for tablet and desktop version */}
                <div className="relative sm:block hidden">
                    <div className="relative  rounded-full border-2 border-gray-400 h-[80px] w-[80px] flex items-center justify-center bg-[#3a3b45] overflow-hidden">
                        {
                            all_details?.group_image ? (
                                <img src={all_details?.group_image} alt="" className='w-[70px] h-[70px] rounded-full' />
                            ) : (
                                <FaUserGroup size={80} className="text-gray-200 absolute top-1.5" />
                            )
                        }
                    </div>
                    <button onClick={() => setOpenGroupImageChanged(true)} className="cursor-pointer absolute bottom-0 right-1.5 flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-black shadow-md hover:bg-green-400 transition">
                        ✏️
                    </button>
                </div>

                {/* for mobile version */}
                <div className='relative sm:hidden block'>

                    <div className="relative  rounded-full border-2 border-gray-400 h-[50px] w-[50px] flex items-center justify-center bg-[#3a3b45] overflow-hidden">
                        {
                            all_details?.group_image ? (
                                <img src={all_details?.group_image} alt="" className='w-[50px] h-[50px] rounded-full' />
                            ) : (
                                <FaUserGroup size={50} className="text-gray-200 absolute top-1.5" />
                            )
                        }
                    </div>

                    <button className='absolute -bottom-1 right-0 text-[#e3e3e3] w-fit h-fit bg-amber-950 rounded-full'>
                        <LuCircleFadingPlus size={25} onClick={() => setOpenGroupImageChanged(true)} className='cursor-pointer' />
                    </button>

                </div>

                {/* Details */}
                <div className="flex flex-col ">
                    <p className="text-sm text-gray-400">Group Name</p>

                    <div className='flex items-center gap-1'>

                        <h2 className={`sm:text-2xl text-xl font-semibold tracking-wide`}>
                            {all_details?.group_name || "Unnamed Group"}
                        </h2>

                        <FiEdit3 size={30}
                            onClick={() => {
                                setOpenGroupNameChanged(true)
                            }}
                            className='cursor-pointer sm:block hidden'
                        />

                        <FiEdit3 size={22}
                            onClick={() => {
                                setOpenGroupNameChanged(true)
                            }}
                            className='cursor-pointer sm:hidden block'
                        />

                    </div>

                    <p className="text-gray-400 text-sm">
                        {all_details?.participants?.length || 0} members
                    </p>
                </div>
            </div>

            <div className={`sm:mt-6 mt-4 flex justify-between lg-real:flex-row flex-col  bg-[#2b2c34] px-6 py-4 rounded-2xl shadow-md`}>

                {/* Left side - Title */}
                <div>

                    {/* for mobile and teblet version */}
                    <div className='lg-real:hidden flex gap-3 sm:gap-10 flex-col sm:flex-row items-start  sm:pt-1.5 pb-5'>

                        <div className='flex gap-3 items-center'>

                            <div className='bg-green-500 text-white rounded-full p-1 overflow-hidden'>
                                <RiUserAddFill size={28} className='sm:block hidden' />
                                <RiUserAddFill size={24} className='sm:hidden block' />
                            </div>

                            <p onClick={() => setOpenAddGRoupMember(true)} className='sm:text-lg text-base cursor-pointer'>Add member</p>
                        </div>

                        <div className='flex gap-3 items-center'>

                            <div className='bg-green-500 text-white rounded-full p-1 overflow-hidden'>
                                <IoLink size={28} className='sm:block hidden' />
                                <IoLink size={24} className='sm:hidden block' />
                            </div>

                            <p className='sm:text-lg text-base'>Generate group add Link</p>
                        </div>

                    </div>

                    <h1 className="text-xl font-semibold text-white mb-3">All Members</h1>

                    <div className="space-y-3 max-h-[420px] overflow-y-auto overflow-x-hidden chat-scrollbar pr-2">

                        <div className="flex items-center justify-between gap-3 p-3 lg-real:w-[700px] w-full rounded-xl bg-[#3a3b45] hover:bg-[#4a4b57] transition shadow-sm" >

                            <div className='flex items-center sm:gap-3 gap-2'>
                                {/* Avatar */}
                                <div className="flex items-center justify-center sm:w-12 sm:h-12 h-11 w-11 rounded-full bg-[#2b2c36]">
                                    <CgProfile size={32} className="text-gray-300 sm:block hidden" />
                                    <CgProfile size={30} className="text-gray-300 sm:hidden block" />
                                </div>

                                {/* User Info */}
                                <div className="flex flex-col leading-tight">
                                    <p className="text-white font-medium">{all_details?.currUser?.name || "Un-named"}</p>
                                    <p className="text-gray-400 text-sm">{all_details?.currUser?.userId}</p>
                                </div>
                            </div>

                            <div className='ml-auto flex gap-1 items-center justify-between'>

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
                                <div className='flex items-center sm:gap-3 gap-2'>
                                    {/* Avatar */}
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#2b2c36]">
                                        <CgProfile size={32} className="text-gray-300 sm:block hidden" />
                                        <CgProfile size={30} className="text-gray-300 sm:hidden block" />
                                    </div>

                                    {/* User Info */}
                                    <div className="flex flex-col leading-tight">
                                        <p className="text-white font-medium">{v?.name || "Unnamed"}</p>
                                        <p className="text-gray-400 text-sm">{v?.userId}</p>
                                    </div>
                                </div>

                                <div className='ml-auto flex gap-1 items-center justify-between'>

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
                                                    }}
                                                />

                                                {
                                                    openDots._id === v?._id && (
                                                        <div ref={dotsRef} className='w-fit h-fit'>
                                                            <ChatMemberSetting
                                                                memberId={v?._id}
                                                                memberUserId={v?.userId}
                                                                close={() => setOpenDots({ _id: "" })}
                                                                details={{
                                                                    participants: all_details?.participants || []
                                                                }}
                                                                setAll_details={setAll_details}
                                                                onUpdated={(oldObjId) => {
                                                                    setAll_details((preve) => ({
                                                                        ...preve,
                                                                        otherUser: preve?.otherUser?.filter((v) => v?._id !== oldObjId) || [],
                                                                        participants: preve?.participants?.filter((v) => v?._id !== oldObjId) || []
                                                                    }))
                                                                }}
                                                            />
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

                        <button onClick={() => setOpenAddGRoupMember(true)} className="sm:px-4 py-2.5 h-fit cursor-pointer sm:w-[150px] block bg-green-500 hover:bg-green-600 text-white  font-medium rounded-lg shadow">
                            Add Member
                        </button>
                        <button className="sm:px-4 py-2.5 h-fit sm:w-[150px] block bg-blue-500 hover:bg-blue-600 text-white  font-medium rounded-lg shadow">
                            Generate Link
                        </button>

                    </div>

                    <div onClick={() => handleExitFromGroup(all_details?._id)} className="px-4 py-2.5 h-fit w-[150px]  block bg-red-500 hover:bg-red-600 text-white  font-medium rounded-lg shadow cursor-pointer">
                        Exit Group
                    </div>

                </div>


                {/* for mobile and tablet version */}
                <div className='lg-real:hidden block pt-6 mb-1 pl-2 text-[#f43131]'>
                    <div className='flex gap-2 items-center cursor-pointer w-fit'>
                        <ImExit onClick={() => handleExitFromGroup(all_details?._id)} size={24} className='sm:block hidden' />
                        <ImExit onClick={() => handleExitFromGroup(all_details?._id)} size={22} className='sm:hidden block' />
                        <p className='sm:text-[20px] text-[17px] text-[#fe4949]'>Exit Group</p>
                    </div>
                </div>

            </div>

            {
                openGroupNameChanged && (
                    <GroupNameChanged close={() => setOpenGroupNameChanged(false)}
                        initialValue={{ value: all_details?.group_name }}
                        group_id={{ group_id: all_details?._id }}
                        onUpdated={(newName) => setAll_details(prev => ({ ...prev, group_name: newName }))}
                    />
                )
            }

            {
                openGroupImageChanged && (
                    <GroupImageChanged close={() => setOpenGroupImageChanged(false)}
                        initialValue={{ value: all_details?.group_image || "" }}
                        group_id={{ group_id: all_details?._id }}
                        onUpdated={(newImg) => setAll_details(prev => ({ ...prev, group_image: newImg }))}
                    />
                )
            }

            {
                openAddGRoupMember && (
                    <AddMemberGroup close={() => setOpenAddGRoupMember(false)}
                        onUpdated={(newData) => setAll_details((preve) => ({
                            ...preve,
                            otherUser: [...(preve?.otherUser || []), newData],
                            participants: [...(preve?.participants || []), newData]
                        }))}
                    />
                )
            }

        </section>
    )
}

export default MessageEdit