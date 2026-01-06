import React, { useEffect, useRef, useState } from 'react'
import { AiOutlineSelect } from 'react-icons/ai'
import { FaRegChartBar } from 'react-icons/fa6'
import { IoClose } from 'react-icons/io5'
import { SiStagetimer } from 'react-icons/si'
import { FaEye } from "react-icons/fa";
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import AddLink from '../../Others/Common/AddLink'
import { useParams } from 'react-router-dom'
import { useGlobalContext } from '../../../provider/GlobalProvider'
import uploadFile from '../../../utils/uploadFile'
import { MdDelete } from "react-icons/md";


const TaskEdit = ({ close, columnName, currentTask, columnId }) => {

    const team = useSelector(state => state?.team)
    const userId = useSelector(state => state?.user?.userId)
    const user_id = useSelector(state => state?.user?._id)

    const { socketConnection } = useGlobalContext()

    const params = useParams()

    const [data, setData] = useState({
        userId: user_id,
        teamId: params?.team,
        columnId: columnId,
        taskId: currentTask._id,
        title: currentTask?.title,
        description: currentTask?.description,
        assignTo: currentTask?.assignTo || [],
        status: "",
        aditional_link: currentTask?.aditional_link || [],
        dueDate: currentTask?.dueDate,
        dueTime: currentTask?.dueTime,
        labels: [],
        image: currentTask?.image,
        video: currentTask?.video
    })


    const imgRef = useRef(null)
    const videoRef = useRef(null)

    const [loadingPhoto, setloadingPhoto] = useState(false)
    const [loadingVideo, setloadingVideo] = useState(false)
    const [openMember, setOpenMember] = useState(false)

    const [loadForSubmit, setLoadForSubmit] = useState(false)
    const [addLinkOpen, setAddLinkOpen] = useState(false)

    const [selectedMember, setSelectedMember] = useState(new Set())


    const isToday = () => {
        const today = new Date().toISOString().split("T")[0];
        return data.dueDate === today;
    };

    const getCurrentTime = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    useEffect(() => {
        const set = new Set(currentTask?.assignTo)
        setSelectedMember(set)
    }, [])

    const toggleSelect = (userName) => {
        const set = new Set(selectedMember)

        if (set.has(userName)) {
            set.delete(userName)
        }
        else {
            set.add(userName)
        }

        setSelectedMember(set)
    }

    const handleChangeData = (e) => {

        const { name, value } = e.target

        setData((prev) => {
            return {
                ...prev,
                [name]: value
            }
        })
    }

    useEffect(() => {

        setData((prev) => {
            return {
                ...prev,
                assignTo: Array.from(selectedMember) || []
            }
        })

    }, [selectedMember])


    const handleOnPhoto = async (e) => {
        const file = e.target.files?.[0]

        if (!file) return

        setloadingPhoto(true)

        const response = await uploadFile(file)

        setloadingPhoto(false)

        setData((preve) => {
            return {
                ...preve,
                image: response?.secure_url
            }
        })
    }

    const handleOnVideo = async (e) => {
        const file = e.target.files?.[0]

        if (!file) return

        setloadingVideo(true)

        const response = await uploadFile(file)

        setloadingVideo(false)

        setData((preve) => {
            return {
                ...preve,
                video: response?.secure_url
            }
        })
    }

    const handleOnSubmit = (e) => {
        e.preventDefault()
        if (!socketConnection) return

        try {
            setLoadForSubmit(true)

            socketConnection.once("update_task_msg", (data) => {

                toast.success(data?.message)
                setData({
                    userId: "",
                    teamId: "",
                    columnId: "",
                    taskId: "",
                    title: "",
                    description: "",
                    assignTo: [],
                    status: "",
                    aditional_link: [],
                    dueDate: "",
                    dueTime: "",
                    labels: [],
                    image: "",
                    video: ""
                })
                close()

            })

            socketConnection.once("task_update_error", (data) => {
                toast.error(data?.message)
            })

            socketConnection.emit("update_task", data)

        } catch (error) {
            console.log("error come for handleSubmit while update task.", error)
            setLoadForSubmit(false)
        }
    }

    return (
        <section className='fixed right-0 left-0 top-0  bottom-0 flex flex-col items-center justify-center z-50 sm:bg-[#162438b2] backdrop-blur-[3px] bg-[#dbdbdb] overflow-y-auto'>

            <div className='sm:flex block items-center sm:gap-4 w-full h-full sm:w-auto sm:h-auto'>

                <div className='bg-[#efefef] rounded-md  px-1 relative sm:w-auto sm:h-auto w-full h-full transition-all duration-200'>

                    <div className='float-end p-2 sm:block hidden text-gray-500 hover:text-gray-700 transition'>
                        <IoClose size={24} onClick={() => close()} className='cursor-pointer' />
                    </div>

                    <div className='text-2xl font-bold text-center py-2 text-gray-800'>
                        <span>Edit Task</span>
                        <span className='text-gray-700'>{` ( ${columnName} ) `}</span>
                    </div>

                    <form onSubmit={handleOnSubmit} className='grid sm:grid-cols-[5fr_3fr] px-4 py-4'>

                        <div className='flex flex-col gap-4 justify-center'>

                            <div className='group text-lg'>
                                <p className='font-semibold group-hover:scale-y-105 transition-all duration-500 group-hover:-translate-y-1'>Title : </p>
                                <input type="text" name='title' value={data.title} onChange={(e) => handleChangeData(e)} placeholder='type name here....' className=' w-[300px]  h-8 text-base outline-none p-2 mt-0.5 text-[#100f0f]' />
                            </div>

                            <div className='group text-lg'>

                                <div className='flex gap-2'>

                                    <FaRegChartBar size={26} />

                                    <p className='font-semibold group-hover:scale-y-105 transition-all duration-500 group-hover:-translate-y-1'>
                                        Description :
                                    </p>

                                </div>

                                <textarea name="description" value={data.description} onChange={(e) => handleChangeData(e)} placeholder='Describe your task...' className='w-[300px] max-h-[70px] min-h-[70px] group-scrollbar text-base outline-none p-2 mt-0.5 text-[#100f0f]' />

                            </div>

                            <div className='border-t-2 border-[#696969] min-h-0.5 w-full'></div>

                            <div className='text-lg'>

                                <div className='flex gap-2 mb-1'>
                                    <SiStagetimer size={26} className='scale-x-[-1]' />
                                    <p className='font-semibold'>Expand DeadLine : </p>
                                </div>

                                <div className='flex items-center gap-4 mb-1'>

                                    <div className='group text-base '>

                                        <p className='font-semibold text-red-600 group-hover:scale-y-105 transition-all duration-500 group-hover:-translate-y-1'>Date  : </p>

                                        <input type="date"
                                            onChange={(e) => {
                                                const { value } = e.target
                                                setData((preve) => {
                                                    return {
                                                        ...preve,
                                                        dueDate: value
                                                    }
                                                })
                                            }}
                                            value={data.dueDate}
                                            name='date' required placeholder='type name here....'
                                            min={new Date().toISOString().split("T")[0]}
                                            className=' w-[140px]  h-8 text-base outline-none p-2 mt-0.5 text-[#100f0f]'
                                        />

                                    </div>

                                    <div className='group text-lg '>

                                        <p className='font-semibold text-red-600 group-hover:scale-y-105 transition-all duration-500 group-hover:-translate-y-1'>Time : </p>

                                        <input type="time"

                                            onChange={(e) => {
                                                const { value } = e.target

                                                setData((preve) => {
                                                    return {
                                                        ...preve,
                                                        dueTime: value
                                                    }
                                                })
                                            }}
                                            value={data.dueTime}
                                            name='time'
                                            placeholder='type name here....'
                                            min={isToday() ? getCurrentTime() : undefined}
                                            className=' w-[150px]  h-8 text-base outline-none p-2 mt-0.5 text-[#100f0f]'
                                        />

                                    </div>
                                </div>

                            </div>

                        </div>

                        <div className='sm:pl-[20%] pl-[4%] flex flex-col gap-5'>

                            <div className='group text-lg'>
                                <p className='font-semibold group-hover:scale-y-105 transition-all duration-500 group-hover:-translate-y-1'>Assign to : </p>

                                <div name='assignTo' className='w-[90%] sm:flex hidden bg-gray-400 h-8 text-[16px] outline-none p-2 mt-0.5 text-[#323232] rounded  gap-x-1 items-center justify-center cursor-pointer' onClick={() => setOpenMember(!openMember)}>
                                    <AiOutlineSelect size={17} className='select-none pointer-events-none' />
                                    <p className='pb-1 select-none pointer-events-none'>select member</p>
                                </div>
                                {/* onClick={() => setSelectMemberForMobile(true)} */}
                                <div className='w-[90%] sm:hidden flex bg-gray-400 h-8 text-[16px] outline-none p-2 mt-0.5 text-[#323232] rounded  gap-x-1 items-center justify-center cursor-pointer'>
                                    <AiOutlineSelect size={17} className='select-none pointer-events-none' />
                                    <p className='pb-1 select-none pointer-events-none'>select member</p>
                                </div>

                                <p className='text-sm text-[#7b7b7b] leading-4 pt-1'>By default it's set to all memeber</p>
                            </div>

                            {/* add image */}
                            <div className='group text-lg w-full'>

                                <div onClick={() => imgRef.current.click()} className={`grid ${data.image && "grid-cols-[1fr_50px]"} gap-2 items-center relative text-white text-base w-[90%] text-center`}>

                                    <div className={`bg-[#cc2929] px-1 py-1 rounded w-full cursor-pointer`}>
                                        {
                                            loadingPhoto ? (
                                                <div className='flex items-center justify-center'>
                                                    <div className='loader'></div>
                                                </div>
                                            ) : (
                                                data.image ? (
                                                    <div className='flex items-center justify-center'>
                                                        uploaded
                                                        <div className='tickForEdit'></div>
                                                    </div>
                                                ) : (
                                                    <div>Add image</div>
                                                )
                                            )
                                        }
                                    </div>

                                    {
                                        data.image && (
                                            <div className='flex items-center gap-2 w-full text-gray-700'>
                                                <FaEye size={18}
                                                    className='cursor-pointer'
                                                    title='See image'
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        if (data.image) {
                                                            const url = data.image.startsWith("http")
                                                                ? data.image
                                                                : `${window.location.origin}${data.image}`;
                                                            window.open(url, "_blank", "noopener,noreferrer");
                                                        }
                                                    }}
                                                />
                                                <MdDelete title='Remove video' size={18}
                                                    className='cursor-pointer'
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setData((prev) => {
                                                            return {
                                                                ...prev,
                                                                image: ""
                                                            }
                                                        })
                                                    }}
                                                />
                                            </div>
                                        )
                                    }


                                </div>
                                <input type="file" ref={imgRef} onChange={handleOnPhoto} accept="image/*" name='image' className='hidden' />

                            </div>

                            {/* add video */}
                            <div className='group text-lg w-full'>

                                <div onClick={() => videoRef.current.click()} className={`grid ${data.video && "grid-cols-[1fr_50px]"} gap-2 items-center relative text-white text-base w-[90%] text-center`}>

                                    <div className={`bg-[#cc2929] px-1 py-1 rounded w-full cursor-pointer`}>
                                        {
                                            loadingVideo ? (
                                                <div className='flex items-center justify-center'>
                                                    <div className='loader'></div>
                                                </div>
                                            ) : (
                                                data.video ? (
                                                    <div className='flex items-center justify-center'>
                                                        uploaded
                                                        <div className='tickForEdit'></div>
                                                    </div>
                                                ) : (
                                                    <div>Add Video</div>
                                                )
                                            )
                                        }
                                    </div>

                                    {
                                        data.video && (
                                            <div className='flex items-center gap-2 w-full text-gray-700'>
                                                <FaEye size={18}
                                                    className='cursor-pointer'
                                                    title='See video'
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        if (data.video) {
                                                            const url = data.video.startsWith("http")
                                                                ? data.video
                                                                : `${window.location.origin}${data.video}`;
                                                            window.open(url, "_blank", "noopener,noreferrer");
                                                        }
                                                    }}
                                                />
                                                <MdDelete title='Remove image' size={18}
                                                    className='cursor-pointer'
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setData((prev) => {
                                                            return {
                                                                ...prev,
                                                                video: ""
                                                            }
                                                        })
                                                    }}
                                                />
                                            </div>
                                        )
                                    }

                                </div>
                                <input type="file" ref={videoRef} onChange={handleOnVideo} accept="video/*" name='video' className='hidden' />

                            </div>

                            {/* add link */}
                            <div className='group text-lg'>
                                <div onClick={() => setAddLinkOpen(true)} className='bg-[#cc2929] text-white text-base w-[90%] text-center px-1 py-1 rounded cursor-pointer'>Add Link</div>
                            </div>

                            <button type='submit' className={`bg-[#027d2b] hover:bg-[#027127] ${loadForSubmit ? "cursor-not-allowed" : "cursor-pointer"} transition-colors duration-100 text-white w-[90%] py-2.5 px-2 rounded font-bold mb-[3%] `}>{loadForSubmit ? "Updating" : "Update Task"}</button>
                        </div>

                    </form>

                </div>

                <div className={`bg-[#dbdbdb] min-h-[400px] max-h-[400px] min-w-[150px] max-w-[150px] overflow-y-auto rounded-lg  narrow-scrollbar  p-3 ${openMember ? "sm:block hidden" : "hidden"}`}>

                    <p className='text-center pb-1'>Assign to</p>

                    {
                        Array.isArray(team?.member) && team?.member?.map((val, idx) => {


                            const isSelected = selectedMember.has(val?.userName)

                            return (
                                <div key={`team-m-${idx}`} className={`${userId === val?.userName ? "hidden" : "flex"} justify-between items-center p-3 rounded-md border transition my-1 ${isSelected ? "bg-green-100 border-green-400" : "bg-white border-gray-300"}`}>

                                    <div>
                                        <p className="text-gray-800 font-medium pb-1">{val?.userName}</p>

                                        <button
                                            onClick={() => toggleSelect(val?.userName)}
                                            className={`text-sm px-3 py-1 rounded-md font-medium transition ${isSelected
                                                ? "bg-red-500 text-white hover:bg-red-600"
                                                : "bg-blue-500 text-white hover:bg-blue-600"
                                                }`}
                                        >
                                            {isSelected ? "Unselect" : "Select"}
                                        </button>
                                    </div>

                                </div>
                            )
                        })
                    }

                </div>

            </div>

            {
                addLinkOpen && (
                    <AddLink close={() => setAddLinkOpen(false)} data={data.aditional_link} setLinkData={setData} />
                )
            }

        </section>
    )
}

export default TaskEdit