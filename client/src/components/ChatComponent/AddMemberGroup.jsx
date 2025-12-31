import React, { useEffect, useState } from 'react'
import { IoSearch } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import Axios from '../../utils/Axios';
import SummaryApi from '../../common/SummaryApi';
import { RxAvatar } from 'react-icons/rx';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGlobalContext } from '../../provider/GlobalProvider';


const AddMemberGroup = ({ close , onUpdated }) => {

    const chat_details = useSelector(state => state.chat?.all_message)
    const user = useSelector(state => state?.user)
    const [data, setData] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [allSearchData, setallSearchData] = useState([])

    const params = useParams()
    const [chatMembers, setChatmembers] = useState(new Set())

    const { socketConnection } = useGlobalContext()


    const searchUserFromServer = async (inputData) => {

        try {

            const response = await Axios({
                ...SummaryApi.user_search,
                params: {
                    searchTerm: inputData
                }
            })

            if (response?.data?.success) {
                setallSearchData(response.data?.result)
            }

            if (response?.data?.error) {
                setallSearchData(["error"])
            }

        } catch (error) {
            setallSearchData(["error"])
            console.log("error from searchUserFromServer", error)
        }
    }

    useEffect(() => {

        const delayBounce = setTimeout(() => {
            if (data.trim()) {
                setSearchTerm(data.trim())
                searchUserFromServer(data)
            }
        }, 1500)

        return () => clearTimeout(delayBounce)

    }, [data])

    useEffect(() => {

        const groupId = params?.conversation
        const set = new Set()

        const idx = chat_details?.findIndex((c) => c?._id === groupId)

        chat_details[idx]?.participants?.map((v, i) => {
            set.add(v?._id)
        })
        setChatmembers(set)

        
    }, [])

    // _id: '688253eb8726afbde748b097', name: 'sourav', email: 'b@gmail.com', userId: 'b@XmGx', avatar: ''
    const handleAddMember = async (memberId, memberUserId , name , memberAvatar , memberEmail , memberName) => {

        let errorHandled = false;

        // Listen for error just once
        socketConnection.once("member_error", (data) => {
            toast.error(data?.message || "Failed to add group member.");
            errorHandled = true;
        });

        // Emit the update request
        socketConnection.emit("add_member_chatGroup", {
           group_id : params?.conversation,
           memberId : memberId,
           memberUserId : memberUserId,
           adminUserId : user?.userId,
           adminId : user?._id,
           memberAvatar : memberAvatar,
           memberEmail : memberEmail,
           memberName : memberName
        });

        setTimeout(()=>{

            if(!errorHandled){
                toast.success(`${memberUserId} successfully added in group.`)

                const set = new Set(chatMembers)
                set.add(memberId)
                setChatmembers(set)

                const newObj = {
                    _id : memberId,
                    name : name,
                    userId : memberUserId,
                    avatar : memberAvatar || "",
                    admin : false
                }

                onUpdated(newObj)
            }

        },500)
    }

    return (
        <section className='fixed top-0 bottom-0 left-0 right-0 flex items-center justify-center z-50 bg-gray-800/40'>

            <div className='flex items-center relative'>

                <div className='w-fit h-fit absolute text-white -top-8 -right-2'>
                    <IoMdClose size={25} onClick={() => close()} className='hover:text-[#cbcbcb] text-white cursor-pointer' />
                </div>

                <div className='bg-[#e1e1e1] w-[330px]  rounded-md px-4 py-3 text-blue-950'>

                    <h1 className='font-semibold pb-1 text-lg'>Search Member</h1>

                    <div className='relative'>
                        <IoSearch size={25} className='absolute bottom-1 left-1' />
                        <input type="text"
                            onChange={(e) => setData(e.target.value)}
                            className='outline-none w-full border border-gray-600 h-8 rounded-sm px-2 pl-9'
                            placeholder='search here ...'
                        />
                    </div>

                    {/* search result */}
                    <div className=' max-h-[320px] overflow-y-auto py-2' style={{ willChange: 'transform' }}>

                        {
                            !data ? (
                                <p className='text-lg font-semibold pt-2 text-center'>Search By userId or Name 🧐</p>
                            ) : (
                                <div>

                                    {
                                        allSearchData.length === 1 && allSearchData[0] === "error" ? (
                                            <p className='text-lg font-semibold pt-2 text-center'>😴 No result found !?</p>
                                        ) : (
                                            <div>
                                                {
                                                    allSearchData.map((v, i) => {
                                                        console.log("bkgsjh", v)
                                                        return (
                                                            <div className="flex items-center gap-3 p-2 rounded-xl bg-[#bdc7dc] mt-2 text-black border border-gray-400 transition">
                                                                {/* Avatar */}
                                                                <div className="flex-shrink-0">
                                                                    <RxAvatar size={36} className="text-gray-600" />
                                                                </div>

                                                                {/* User Info */}
                                                                <div className="flex flex-col min-w-0">
                                                                    <p className="text-sm font-medium text-gray-800 truncate">{v?.name}</p>
                                                                    <p className="text-xs text-gray-500 truncate">{v?.userId}</p>
                                                                </div>

                                                                {/* Status */}
                                                                <div className="ml-auto">
                                                                    {
                                                                        chatMembers.has(v?._id) ? (
                                                                            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-lg">
                                                                                Already in group
                                                                            </span>
                                                                        ) : (
                                                                            <span onClick={() => handleAddMember(v?._id, v?.userId , v?.name , v?.avatar)} className="text-xs cursor-pointer font-medium text-green-600 bg-green-100 px-2 py-1 rounded-lg">
                                                                                Add member
                                                                            </span>
                                                                        )
                                                                    }
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        )
                                    }

                                </div>
                            )
                        }

                    </div>
                </div>

            </div>

        </section>
    )
}

export default AddMemberGroup