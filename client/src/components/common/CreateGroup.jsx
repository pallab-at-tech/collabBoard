import React, { useEffect, useRef, useState } from 'react'
import { RxAvatar } from "react-icons/rx";
import { MdUpload } from "react-icons/md";
import uploadFile from '../../utils/uploadFile';
import { useSelector } from 'react-redux';
import { IoMdClose } from "react-icons/io";
import { updateConversationWithNewMessage } from '../../store/chatSlice';
import { useGlobalContext } from '../../provider/GlobalProvider';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';

const CreateGroup = ({ close }) => {

    const { socketConnection } = useGlobalContext()

    const imageRef = useRef()
    const dispatch = useDispatch()
    const chat_details = useSelector(state => state.chat?.all_message)?.filter((v, i) => {
        return v?.group_type === "PRIVATE"
    })
    const user = useSelector(state => state.user)



    const [memberSearchSpace, setMemberSearchSpace] = useState([...chat_details])
    const [searchData, setSearchData] = useState("")

    useEffect(() => {

        const delay = setTimeout(() => {

            if (searchData.trim()) {

                const lowerSearch = searchData.toLowerCase();

                const search = chat_details.filter(v => {
                    const name = v?.otherUser?.name?.toLowerCase() || "";
                    const userId = v?.otherUser?.userId?.toLowerCase() || "";
                    return name.includes(lowerSearch) || userId.includes(lowerSearch);
                })

                setMemberSearchSpace(search)
            }
            else {
                setMemberSearchSpace(chat_details)
            }

        }, 1500)

        return () => clearTimeout(delay)

    }, [searchData])

    const [data, setData] = useState({
        group_image: "",
        group_name: "",
        participants: []
    })

    const [chooseUserIds, setChooseUserIds] = useState(new Set());
    const [chooseUserData, setChooseUserData] = useState([]);


    const handleProfilePicUpload = async (e) => {

        const file = e.target.files?.[0]

        if (!file) return

        const response = await uploadFile(file)

        setData((preve) => {
            return {
                ...preve,
                group_image: response?.secure_url
            }
        })
    }

    const removeUser = (id) => {

        setChooseUserIds(prev => {
            const updated = new Set(prev);
            if (updated.has(id)) {
                updated.delete(id);

                setChooseUserData(chooseUserData.filter(val => val._id !== id))
            }
            return updated;
        });

    }

    const handleCreateGroup = () => {
        try {

            if (!socketConnection) return

            if (!data.group_name.trim()) {
                toast.error("please ! , give group name")
                return
            }

            const extractId = chooseUserData.map(prev => prev?.user_id)

            socketConnection.emit("create_group", {
                createrId: user?._id,
                participants: extractId || [],
                group_image: data.group_image,
                group_name: data.group_name,
                createrUserName : user?.userId
            })

            socketConnection.on("receive_message", (data) => {
                dispatch(updateConversationWithNewMessage({ conversation: data.conversation, message: data?.message }))
            })

            setData({
                group_image: "",
                group_name: "",
                participants: []
            })

            close()

        } catch (error) {
            console.log("Error from handleCreateGroup", error)
        }
    }

    // console.log("choose user in set", user)

    return (
        <section className="fixed inset-0 flex gap-4 items-center justify-center z-50 bg-black/60">

            <div className="bg-[#f1f1f1] text-blue-950 px-6 py-5 rounded-2xl max-w-[380px] shadow-lg sm:mx-0 mx-6">

                <h1 className="text-xl font-bold mb-4">
                    Secret group for planning the surprise party 🎉
                </h1>

                <div className="flex items-center gap-4 mb-4">

                    {
                        data.group_image ? (
                            <div className='h-[55px] w-[55px] overflow-hidden rounded-full'>
                                <img src={data.group_image} alt="" className='object-cover h-[50px] w-[50px]' />
                            </div>
                        ) : (
                            <div className="bg-blue-200 p-1 rounded-full">
                                <RxAvatar size={50} />
                            </div>
                        )
                    }
                    <button onClick={() => imageRef.current.click()} className="flex items-center gap-1.5 bg-blue-950 text-white rounded-md px-3 py-1.5 hover:bg-[#262d66] transition-colors">
                        <MdUpload size={20} /> Upload Image
                    </button>

                    <input ref={imageRef} onChange={handleProfilePicUpload} type="file" accept="image/*" hidden />
                </div>


                <div className="mb-3">
                    <label className="font-semibold text-sm mb-1 block">Group Name</label>
                    <input
                        type="text"
                        value={data.group_name}
                        onChange={(e) => {
                            setData((preve) => {
                                return {
                                    ...preve,
                                    group_name: e.target.value
                                }
                            })
                        }}
                        placeholder="Enter group name..."
                        className="bg-[#2c3475] w-full text-white rounded px-3 py-2 outline-none placeholder-gray-300"
                        required
                    />
                </div>


                {/* Search Member */}
                <div className="mb-3">
                    <label className="font-semibold text-sm mb-1 block">Add Members</label>
                    <input
                        type="text"
                        value={searchData}
                        onChange={(e) => setSearchData(e.target.value)}
                        placeholder="Search members..."
                        className="bg-gray-200 w-full rounded px-3 py-2 outline-none"
                    />


                    {
                        chooseUserData.length !== 0 && (
                            <div className='py-2 flex gap-2.5 flex-wrap'>
                                {
                                    chooseUserData.map((v, i) => {
                                        return (
                                            <div className='w-fit flex flex-col items-center'>

                                                {
                                                    v.avatar ? (
                                                        <div className='overflow-hidden rounded-full h-[30px] w-[30px]  relative'>
                                                            <img src="" alt="" className='object-cover h-[30px] w-[30px]' />
                                                            <IoMdClose onClick={() => removeUser(v?._id)} size={18} className='absolute -top-1 -right-1.5 hover:text-red-500' />
                                                        </div>
                                                    ) : (
                                                        <div className="bg-blue-200 p-1 rounded-full w-fit  relative">
                                                            <RxAvatar size={30} />
                                                            <IoMdClose onClick={() => removeUser(v?._id)} size={18} className='absolute -top-1 -right-1.5 hover:text-red-500' />
                                                        </div>
                                                    )
                                                }

                                                <p className='text-gray-900 text-sm font-semibold'>{v.name}</p>
                                                <p className="text-gray-600 text-xs">{v.userId}</p>

                                            </div>
                                        )
                                    })
                                }
                            </div>
                        )
                    }

                    {/* Search Results */}
                    <div className="mt-2 max-h-[120px] min-h-[80px] overflow-y-auto bg-white border-4 border-[#5c659c] rounded shadow-sm group-scrollbar px-2">
                        {
                            memberSearchSpace?.map((chat_data, idx) => {

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            setChooseUserIds(prev => {
                                                const updated = new Set(prev);
                                                if (!updated.has(chat_data._id)) {
                                                    updated.add(chat_data._id);
                                                    setChooseUserData(dataPrev => [...dataPrev, {
                                                        _id: chat_data._id,
                                                        user_id : chat_data?.otherUser?._id,
                                                        name: chat_data.otherUser?.name,
                                                        userId: chat_data.otherUser?.userId,
                                                        avatar: chat_data.otherUser?.avatar || ""
                                                    }]);
                                                }
                                                return updated;
                                            });
                                        }}
                                        className="px-4 py-3 flex gap-2 items-start cursor-pointer leading-tight bg-[#8ca0c2] hover:bg-[#7390bf] my-2 rounded-xl font-medium transition-colors duration-150 shadow-sm border border-gray-200"
                                    >

                                        {
                                            chat_data?.otherUser?.avatar ? (
                                                <div className='overflow-hidden rounded-full h-[30px] w-[30px]'>
                                                    <img src="" alt="" className='object-cover h-[30px] w-[30px]' />
                                                </div>
                                            ) : (
                                                <div className="bg-blue-200 p-1 rounded-full">
                                                    <RxAvatar size={30} />
                                                </div>
                                            )
                                        }

                                        <div>
                                            <p className='text-gray-900 text-sm font-semibold'>{chat_data?.otherUser?.name}</p>
                                            <p className="text-gray-600 text-xs">{chat_data?.otherUser?.userId}</p>
                                        </div>

                                    </div>
                                )
                            })
                        }
                    </div>
                </div>


                <div className="flex justify-end gap-2">
                    <button onClick={() => close()} className="px-3 py-1.5 rounded bg-gray-300 hover:bg-gray-400 transition">
                        Cancel
                    </button>
                    <button onClick={() => handleCreateGroup()} className="px-3 py-1.5 rounded bg-blue-950 text-white hover:bg-[#262d66] transition-colors">
                        Create
                    </button>
                </div>

            </div>

        </section>

    )
}

export default CreateGroup
