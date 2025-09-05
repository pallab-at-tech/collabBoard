import React, { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useGlobalContext } from '../../provider/GlobalProvider'
import { IoClose } from "react-icons/io5";
import { FaRegChartBar } from "react-icons/fa6";
import { SiStagetimer } from "react-icons/si";
import uploadFile from '../../utils/uploadFile';
import AddLink from './AddLink';
import { AiOutlineSelect } from "react-icons/ai";
import { useSelector } from 'react-redux';
import SelectMember from '../other/SelectMember';
import Axios from '../../utils/Axios';
import SummaryApi from '../../common/SummaryApi';
import toast from 'react-hot-toast';

const CreateNewTask = ({ columnId, close, columnName }) => {


    const params = useParams()
    const imgRef = useRef()
    const videoRef = useRef()

    const user = useSelector(state => state?.user)

    const [data, setData] = useState({
        userId : user?._id,
        teamId: params?.team,
        columnId: columnId,
        title: "",
        description: "",
        assignTo: [],
        status: "",
        aditional_link: [],
        dueDate: "",
        dueTime: "",
        labels: [],
        date: "",
        image: "",
        video: ""
    })

    const [loadingPhoto, setloadingPhoto] = useState(false)
    const [loadingVideo, setloadingVideo] = useState(false)

    const [addLinkOpen, setAddLinkOpen] = useState(false)
    const [openMember, setOpenMember] = useState(false)

    const team = useSelector(state => state?.team)
    
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [selectMemberForMobile, setSelectMemberForMobile] = useState(false)

    const [loadForSubmit, setLoadForSubmit] = useState(false)

    const toggleSelect = (userId) => {

        const updatedMembers = selectedMembers.includes(userId)
            ? selectedMembers.filter((id) => id !== userId)
            : [...selectedMembers, userId];

        setSelectedMembers(updatedMembers);

        setData((prev) => ({
            ...prev,
            assignTo: updatedMembers,
        }));
    };

    const { socketConnection } = useGlobalContext()

    const handleChange = (e) => {
        const { name, value } = e.target

        setData((preve) => {
            return {
                ...preve,
                [name]: value
            }

        })
    }

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

    const getCurrentTime = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const isToday = () => {
        const today = new Date().toISOString().split("T")[0];
        return data.dueDate === today;
    };

    const handleSubmit = async (e) => {

        if (!socketConnection) return
        e.preventDefault()

        try {

            setLoadForSubmit(true)
            let errorHandled = false;

            socketConnection.once("create_task_error", (data) => {
                toast.error(data?.message)
                errorHandled = true
            })

            setTimeout(() => {

                if (!errorHandled) {
                    socketConnection.emit("create-task", data)

                    socketConnection.once("task_create_success", (data) => {
                        toast.success(data?.message)

                        setData({
                            userId : "",
                            teamId: "",
                            columnId: "",
                            title: "",
                            description: "",
                            assignTo: [],
                            status: "",
                            aditional_link: [],
                            dueDate: "",
                            dueTime: "",
                            labels: [],
                            date: "",
                            image: "",
                            video: ""
                        })

                        close()
                    })
                }

            }, 500)

        } catch (error) {
            console.log("error come for handleSubmit while create task", error)
        } finally {
            setLoadForSubmit(false)
        }
    }


    return (
        <section className='fixed right-0 left-0 top-0 bottom-0 flex flex-col items-center justify-center z-50 sm:bg-gray-800/75 bg-[#dbdbdb] overflow-y-auto'>

            <div className='sm:flex block items-center sm:gap-4 w-full h-full sm:w-auto sm:h-auto'>

                <div className=' bg-[#dbdbdb] rounded  px-1 relative sm:w-auto sm:h-auto w-full h-full sm:pt-0 pt-[70px] transition-all duration-200'>

                    <div className='float-end p-2 sm:block hidden'>
                        <IoClose size={24} onClick={() => close()} className='cursor-pointer' />
                    </div>

                    <h1 className='text-2xl font-bold text-center py-2'>Column : {columnName}</h1>

                    <form className='grid sm:grid-cols-[5fr_3fr] px-4 py-4' onSubmit={handleSubmit}>

                        <div className='flex flex-col gap-4 justify-center'>

                            <div className='group text-lg'>
                                <p className='font-semibold group-hover:scale-y-105 transition-all duration-500 group-hover:-translate-y-1'>Title : </p>
                                <input type="text" onChange={handleChange} name='title' value={data.title} required placeholder='type name here....' className=' w-[300px]  h-8 text-base outline-none p-2 mt-0.5 text-[#100f0f]' />
                            </div>

                            <div className='group text-lg'>

                                <div className='flex gap-2'>

                                    <FaRegChartBar size={26} />

                                    <p className='font-semibold group-hover:scale-y-105 transition-all duration-500 group-hover:-translate-y-1'>
                                        Description :
                                    </p>

                                </div>

                                <textarea name="description" onChange={handleChange} value={data.description} placeholder='Describe your task...' className='w-[300px]  max-h-[70px] min-h-[70px]  text-base outline-none p-2 mt-0.5 text-[#100f0f]' />

                            </div>

                            <div className='border-t-2 border-[#696969] min-h-0.5 w-full'></div>

                            <div className='text-lg'>

                                <div className='flex gap-2 mb-1'>
                                    <SiStagetimer size={26} className='scale-x-[-1]' />
                                    <p className='font-semibold'>Set DeadLine : </p>
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
                                            name='date' value={data.dueDate} required placeholder='type name here....'
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
                                            name='time'
                                            value={data.dueTime} placeholder='type name here....'
                                            min={isToday() ? getCurrentTime() : undefined}
                                            className=' w-[150px]  h-8 text-base outline-none p-2 mt-0.5 text-[#100f0f]'
                                        />

                                    </div>

                                </div>
                            </div>

                        </div>

                        <div className='sm:pl-[20%] pl-[4%] flex flex-col gap-4'>

                            <div className='group text-lg'>
                                <p className='font-semibold group-hover:scale-y-105 transition-all duration-500 group-hover:-translate-y-1'>Assign to : </p>

                                <div onClick={() => setOpenMember(!openMember)} name='assignTo' className='w-[90%] sm:flex hidden bg-gray-400 h-8 text-[16px] outline-none p-2 mt-0.5 text-[#323232] rounded  gap-x-1 items-center justify-center cursor-pointer'>
                                    <AiOutlineSelect size={17} className='select-none pointer-events-none' />
                                    <p className='pb-1 select-none pointer-events-none'>select member</p>
                                </div>

                                <div onClick={() => setSelectMemberForMobile(true)} className='w-[90%] sm:hidden flex bg-gray-400 h-8 text-[16px] outline-none p-2 mt-0.5 text-[#323232] rounded  gap-x-1 items-center justify-center cursor-pointer'>
                                    <AiOutlineSelect size={17} className='select-none pointer-events-none' />
                                    <p className='pb-1 select-none pointer-events-none'>select member</p>
                                </div>

                                <p className='text-sm text-[#7b7b7b] leading-4 pt-1'>By default it's set to all memeber</p>
                            </div>


                            {/* add image */}
                            <div className='group text-lg'>

                                <div onClick={() => imgRef.current.click()} className='bg-[#cc2929] text-white text-base w-[90%] text-center px-1 py-1 rounded cursor-pointer'>
                                    {
                                        loadingPhoto ? (
                                            <div className='flex items-center justify-center'>
                                                <div className='loader'></div>
                                            </div>
                                        ) : (
                                            <>
                                                {
                                                    data.image ? (
                                                        <div className='flex items-center justify-center gap-1'>
                                                            uploaded
                                                            <div className='tick'></div>
                                                        </div>
                                                    ) : (
                                                        <div>Add image</div>
                                                    )
                                                }
                                            </>
                                        )
                                    }
                                </div>

                                <input type="file" ref={imgRef} onChange={handleOnPhoto} accept="image/*" name='image' className='hidden' />

                            </div>

                            {/* add video */}
                            <div className='group text-lg'>

                                <div onClick={() => videoRef.current.click()} className='bg-[#cc2929] text-white text-base w-[90%] text-center px-1 py-1 rounded cursor-pointer'>
                                    {
                                        loadingVideo ? (
                                            <div className='flex items-center justify-center'>
                                                <div className='loader'></div>
                                            </div>
                                        ) : (
                                            <>
                                                {
                                                    data.video ? (
                                                        <div className='flex items-center justify-center gap-1'>
                                                            uploaded
                                                            <div className='tick'></div>
                                                        </div>
                                                    ) : (
                                                        <div>Add Video</div>
                                                    )
                                                }
                                            </>
                                        )
                                    }
                                </div>
                                <input type="file" ref={videoRef} accept="video/*" onChange={handleOnVideo} name='video' className='hidden' />

                            </div>

                            {/* add link */}
                            <div className='group text-lg'>
                                <div onClick={() => setAddLinkOpen(true)} className='bg-[#cc2929] text-white text-base w-[90%] text-center px-1 py-1 rounded cursor-pointer'>Add Link</div>
                            </div>

                            <button type='submit' className={`bg-[#027d2b] hover:bg-[#027127] transition-colors duration-100 text-white w-[90%] py-2.5 px-2 rounded font-bold mt-[3%] ${loadForSubmit ? "pointer-events-none" : "cursor-pointer"}`}>Create Task</button>

                        </div>

                    </form>

                </div>

                <div className={`bg-[#dbdbdb] min-h-[400px] max-h-[400px] min-w-[150px] max-w-[150px] overflow-y-auto rounded-lg  narrow-scrollbar ${openMember ? "sm:block hidden" : "hidden"} p-3`}>

                    <p className='text-center pb-1'>Assign to</p>

                    {
                        Array.isArray(team?.member) && team?.member?.map((val, idx) => {
                            const isSelected = selectedMembers.includes(val?.userName);

                            return (
                                <div
                                    key={val._id}
                                    className={`${val?.userName === user?.userId ? "hidden" : "block"} flex justify-between items-center p-3 rounded-md border ${isSelected ? "bg-green-100 border-green-400" : "bg-white border-gray-300"} transition my-1`}
                                >
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

            {
                selectMemberForMobile && (
                    <SelectMember close={() => setSelectMemberForMobile(false)} data={data.assignTo} setAssignData={setData} />
                )
            }


        </section>
    )
}

export default CreateNewTask
