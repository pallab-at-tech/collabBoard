import React, { useEffect, useRef, useState } from 'react'
import { HiOutlineDotsVertical } from 'react-icons/hi'
import CoumnAllSettings from './CoumnAllSettings'
import ArrowSymbol from "../../utils/ArrowSymbol"
import { FaImages } from "react-icons/fa6";
import { RiFolderVideoFill } from "react-icons/ri";
import { LuLink2 } from "react-icons/lu";
import { FaExternalLinkAlt } from "react-icons/fa";
import { FaAngleDown } from "react-icons/fa6";
import { MdMovieEdit, MdAutoDelete } from "react-icons/md";
import TaskEdit from '../TaskBoard/TaskEdit';
import TaskDelete from '../TaskBoard/TaskDelete';
import { useNavigate , Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ColumnItem = ({ val, isOpen, setColumnSetting }) => {
    const dropdownRef = useRef(null);
    const imageDropRef = useRef(null)
    const linkDropRef = useRef(null)
    const videoDropRef = useRef(null)

    const navigate = useNavigate()

    const [imageOpen, setImageOpen] = useState({
        open: false,
        image: ""
    })

    const [linkWindowOpen, setLinkWindowOpen] = useState({
        open: false,
        data: []
    })

    const [videoOpen, setVideoOpen] = useState({
        open: false,
        video: ""
    })

    const team = useSelector(state => state.team)

    const [columnId, setColumnId] = useState(val?._id)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setColumnSetting(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {

        const handleClickOutside = (event) => {
            if (imageDropRef.current && !imageDropRef.current.contains(event.target)) {
                setImageOpen(() => {
                    return {
                        open: false,
                        image: ""
                    }
                })
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [])

    useEffect(() => {

        const handleClickOutside = (event) => {
            if (linkDropRef.current && !linkDropRef.current.contains(event.target)) {
                setLinkWindowOpen(() => {
                    return {
                        open: false,
                        data: []
                    }
                })
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (videoDropRef.current && !videoDropRef.current.contains(event.target)) {
                setVideoOpen(() => {
                    return {
                        open: false,
                        video: ""
                    }
                })
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [])


    const handleOpenImage = (src) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            setImageOpen({ open: true, image: src });
        };
    };

    const [taskOpen, setTaskOpen] = useState(true)
    const [editTaskOpen, setEditTaskOpen] = useState(false)
    const [currentTaskToEdit, setCurrentTaskToEdit] = useState(null)

    const [taskDeleteOpen, setTaskDeleteOpen] = useState(false)

    const [taskLabel, setTaskLabel] = useState(new Set())



    return (
        <section>

            <div className='w-fit px-1 py-2  text-white my-2 rounded flex gap-x-1 items-center relative'>

                <div>

                    <div className='flex gap-1 items-center'>

                        <h1 className='font-bold'>{val?.name}</h1>

                        <HiOutlineDotsVertical
                            className='cursor-pointer text-gray-300 hover:text-white'
                            onClick={() =>
                                setColumnSetting(prev =>
                                    prev === val._id ? null : val._id
                                )
                            }
                        />
                    </div>

                    <FaAngleDown onClick={() => setTaskOpen(!taskOpen)} className={`mt-1 mb-2 text-[#dbdbdb] cursor-pointer transform transition-transform duration-500 ${taskOpen ? "rotate-180" : "rotate-0"}`} size={20} />
                </div>

                {isOpen && (
                    <div ref={dropdownRef} className='absolute sm:-right-12 -right-[120px]  sm:-top-[115px] -top-[110px] z-10'>
                        <CoumnAllSettings columnId={val?._id} columnName={val?.name} />
                    </div>
                )}
            </div>

            {
                taskOpen ? (
                    val?.tasks?.length === 0 ? (
                        <div className={`sm:ml-10 flex justify-center items-center transition-opacity duration-500 ease-in-out  bg-[#1c1c21] xl:bg-[#1c1c26] border-gray-700  border  backdrop-blur-md min-h-[200px] min-w-10 sm:max-w-[550px] xl:max-w-[640px]  rounded-md pr-8 pt-2 pb-6 ${taskOpen ? "opacity-100" : "opacity-0 h-0"}`}>
                            <p className='text-[#dbdbdb] font-semibold text-lg'>No task assigned yet ?!</p>
                        </div>
                    ) : (
                        <div className={`sm:ml-10 transition-opacity duration-500 ease-in-out bg-[#1c1c21] xl:bg-[#1c1c26] border-gray-700 border-2  backdrop-blur-md min-h-[150px] min-w-10 sm:max-w-[550px] xl:max-w-[640px]  rounded-md pr-8 pt-2 pb-6 ${taskOpen ? "opacity-100" : "opacity-0 h-0"}`}>

                            {
                                val?.tasks?.map((val, idx) => {
                                    return (
                                        <div key={`task-assign-${idx}`} className='flex my-4 gap-0 items-center justify-start relative'>

                                            <div className='absolute top-2 left-2 sm:block hidden'>
                                                <ArrowSymbol />
                                            </div>

                                            {/* for desktop and tablet version */}
                                            <div className='absolute top-0 left-[50px] text-[#e9e9e9e5] sm:block hidden'>
                                                <FaAngleDown size={24}
                                                    onClick={() => {
                                                        const set = new Set(taskLabel)

                                                        if (!set.has(val?._id)) {
                                                            set.add(val?._id)
                                                        }
                                                        else {
                                                            set.delete(val?._id)
                                                        }

                                                        setTaskLabel(set)
                                                    }}

                                                    className={`${taskLabel.has(val?._id) ? "rotate-180" : "rotate-0"} cursor-pointer transform transition-transform duration-500`}
                                                />
                                            </div>

                                            {/* only for mobile version */}
                                            <div className='absolute top-6 left-2 text-[#e9e9e9e5] sm:hidden block'>
                                                <FaAngleDown size={16}
                                                    onClick={() => {
                                                        const set = new Set(taskLabel)

                                                        if (!set.has(val?._id)) {
                                                            set.add(val?._id)
                                                        }
                                                        else {
                                                            set.delete(val?._id)
                                                        }

                                                        setTaskLabel(set)
                                                    }}

                                                    className={`${taskLabel.has(val?._id) ? "rotate-180" : "rotate-0"} cursor-pointer transform transition-transform duration-500`}
                                                />
                                            </div>

                                            {/* edit options */}
                                            <div className='text-white absolute sm:top-2 sm:-right-2.5 top-0 -right-6 flex sm:flex-col flex-row items-center'>
                                                
                                                <Link to={`/task/task-assign-${val?._id}`} state={{val : val , columnId : columnId , teamId : team?._id}} className='h-fit w-fit'>
                                                    <FaExternalLinkAlt
                                                        size={17}
                                                        className='my-1.5 mx-1.5 cursor-pointer text-[#cccdcc] hover:text-[#f0f1f0] transition-colors'
                                                        title='Open in new window'
                                                    />
                                                </Link>

                                                <MdMovieEdit
                                                    onClick={() => {
                                                        setEditTaskOpen(true)
                                                        setCurrentTaskToEdit(val)
                                                    }}
                                                    size={20}
                                                    className='my-1.5 mx-1.5 cursor-pointer text-[#50c900] hover:text-[#409f00] transition-colors' title='Edit task'
                                                />

                                                <MdAutoDelete
                                                    onClick={() => {
                                                        setTaskDeleteOpen(true)
                                                        setCurrentTaskToEdit(val)
                                                    }}
                                                    className='my-1.5 mx-1.5 cursor-pointer text-[#f36900] hover:text-red-500 transition-colors' title='Delete task'
                                                    size={20}
                                                />
                                            </div>

                                            {
                                                !taskLabel.has(val?._id) ? (
                                                    <div className='relative w-full transition-all duration-500 ease-in-out sm:ml-20 ml-10 sm:mt-3 mt-8 max-w-[400px] xl:max-w-[500px] bg-gradient-to-l from-[#263b5480] to-[#494b4e61]  border-2 border-gray-400 rounded-md px-2 py-2 ' >

                                                        <div className='flex sm:flex-row flex-col gap-1 font-semibold text-[#d68408b9] absolute sm:-top-[26px] -top-[40px] sm:right-4 sm:left-auto left-0 text-sm'>

                                                            <div className='flex flex-row gap-1 w-full'>
                                                                <p>Created At : </p>
                                                                <p className='sm:block hidden'>{`${val?.createdAt?.split("T")[0]} , ${val?.createdAt?.split("T")[1]?.split(".")[0]}`}</p>
                                                                <p className='sm:hidden block'>{`${val?.createdAt?.split("T")[0]}`}</p>
                                                            </div>

                                                            <p className='sm:hidden block -mt-2'>{`${val?.createdAt?.split("T")[1]?.split(".")[0]}`}</p>
                                                        </div>

                                                        <div className='text-[#acca03] text-[20px] font-bold'>
                                                            <h1>{val?.title}</h1>
                                                        </div>

                                                        <div className='text-white'>
                                                            <h1 className='font-bold'>Description : </h1>
                                                            <h2 className='leading-[20px] text-[#ccccccd4] text-base'>{val?.description}</h2>
                                                        </div>

                                                        <div className='flex justify-between items-center mt-2'>

                                                            <div className='flex gap-3 text-[#1F2937] items-center'>
                                                                {
                                                                    val?.image && (
                                                                        <FaImages onClick={() => {
                                                                            handleOpenImage(val?.image)
                                                                        }}
                                                                            size={20}
                                                                            className='cursor-pointer' title='image'
                                                                        />
                                                                    )
                                                                }

                                                                {
                                                                    val?.video && (
                                                                        <RiFolderVideoFill onClick={() => {
                                                                            setVideoOpen(() => {
                                                                                return {
                                                                                    open: true,
                                                                                    video: val?.video
                                                                                }
                                                                            })
                                                                        }}
                                                                            size={20}
                                                                            className='cursor-pointer' title='video'
                                                                        />
                                                                    )
                                                                }

                                                                {
                                                                    Array.isArray(val?.aditional_link) && val?.aditional_link?.length !== 0 && (
                                                                        <LuLink2 onClick={() => {
                                                                            setLinkWindowOpen(() => {
                                                                                return {
                                                                                    open: true,
                                                                                    data: val?.aditional_link
                                                                                }
                                                                            })
                                                                        }}
                                                                            size={26}
                                                                            className='cursor-pointer'
                                                                            title='Aditional link'
                                                                        />
                                                                    )
                                                                }

                                                            </div>

                                                        </div>

                                                        <div className='flex flex-wrap sm:flex-row flex-col justify-between sm:items-center items-start mt-3'>
                                                            <div className='text-white font-bold leading-[19px]'>
                                                                <p>Due Date</p>

                                                                <div className=''>

                                                                    <p className='ml-2 text-[14px] text-[#ccccccd4]'>{`${val?.dueDate} ${val?.dueTime && ","}`}</p>

                                                                    {
                                                                        val?.dueTime && (
                                                                            <p className='ml-2 text-[14px] text-[#ccccccd4]'>{val?.dueTime}</p>
                                                                        )
                                                                    }

                                                                </div>

                                                            </div>

                                                            <div className='text-white font-bold leading-[19px] pt-2'>
                                                                <p>Assigned by</p>
                                                                <p className='ml-3 text-[14px] text-[#ccccccd4]'>{val?.assignby}</p>
                                                            </div>
                                                        </div>

                                                    </div>
                                                ) : (
                                                    <div className='h-[60px] xl:h-[100px] w-full transition-all duration-500 ease-in-out flex items-center relative sm:ml-20 ml-10 sm:mt-3 mt-8 max-w-[400px] xl:max-w-[500px] bg-gradient-to-l from-[#263b5480] to-[#494b4e61] border-2 border-gray-400 rounded-md px-2 py-2 '>
                                                        <h1 className='text-[#acca03] sm:text-[20px] text-[19px] font-semibold xl:pl-5'>{val?.title}</h1>

                                                        <div className='flex sm:flex-row flex-col gap-1 font-semibold text-[#d68408b9] absolute sm:-top-[26px] -top-[40px] sm:right-4 sm:left-auto left-0 text-sm'>

                                                            <div className='flex flex-row gap-1 w-full'>
                                                                <p>Created At : </p>
                                                                <p className='sm:block hidden'>{`${val?.createdAt?.split("T")[0]} , ${val?.createdAt?.split("T")[1]?.split(".")[0]}`}</p>
                                                                <p className='sm:hidden block'>{`${val?.createdAt?.split("T")[0]}`}</p>
                                                            </div>

                                                            <p className='sm:hidden block -mt-2'>{`${val?.createdAt?.split("T")[1]?.split(".")[0]}`}</p>
                                                        </div>
                                                    </div>
                                                )
                                            }

                                        </div>
                                    )
                                })
                            }

                        </div>
                    )
                ) : (
                    <div className={`sm:ml-10 flex items-center justify-center transition-all duration-500 ease-in-out bg-[#1c1c21] xl:bg-[#1c1c26] border-gray-700  border backdrop-blur-md min-h-[50px] xl:min-h-[80px] min-w-10  max-w-[250px] xl:max-w-[350px]  rounded-md pr-8 pt-2 pb-6 -mt-4 ${taskOpen ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
                        <p className='text-[#dbdbdb] mt-2 font-semibold'>{`${val?.tasks?.length === 0 ? "No task assigned yet ?!" : `${val?.tasks?.length} assignment available ....`}`}</p>
                    </div>
                )
            }


            {

                imageOpen.open && (
                    <section className='fixed inset-0 flex items-center justify-center z-50 bg-black/60'>

                        <div className=''>
                            <img ref={imageDropRef} src={imageOpen?.image} alt="" className='sm:w-[600px] w-[330px] transform transition duration-[300ms] scale-100' />
                        </div>

                    </section>
                )
            }

            {
                linkWindowOpen.open && (
                    <section className='fixed inset-0 flex items-center justify-center z-50 bg-black/60'>

                        <div ref={linkDropRef} className='bg-white w-full sm:max-w-md max-w-[340px] rounded-2xl px-6 py-6 flex flex-col gap-6 shadow-lg'>

                            <h2 className='text-xl font-semibold text-gray-800'>All Links</h2>

                            <div className="grid gap-4 max-h-[300px] overflow-y-auto">
                                {linkWindowOpen.data.map((v, i) => (
                                    <div
                                        key={`linkWindowOpenidx-${i}`}
                                        className="bg-white rounded-xl shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow"
                                    >
                                        <div className="mb-3">
                                            <h1 className="text-sm font-semibold text-green-600 mb-1">Name</h1>
                                            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                                                {v?.name || "—"}
                                            </div>
                                        </div>

                                        <div>
                                            <div className='flex gap-1 items-center'>
                                                <h1 className="text-sm font-semibold text-green-600">URL</h1>
                                                <a href={v?.url} target='_blank'><FaExternalLinkAlt size={13} className='text-gray-500' /></a>
                                            </div>

                                            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                                                {v?.url || "—"}
                                            </div>

                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>

                    </section>
                )
            }

            {
                videoOpen.open && (
                    <section className='fixed inset-0 flex items-center justify-center z-50 bg-black/60'>

                        <div>
                            <video onPlay={true} controls ref={videoDropRef} src={videoOpen?.video} className='sm:w-[600px] w-[330px] transform transition duration-[300ms] scale-100'></video>
                        </div>

                    </section>
                )
            }

            {
                editTaskOpen && (
                    <TaskEdit
                        columnName={val?.name}
                        close={() => setEditTaskOpen(false)}
                        currentTask={currentTaskToEdit}
                        columnId={val?._id}
                    />
                )
            }

            {
                taskDeleteOpen && (
                    <TaskDelete
                        close={() => setTaskDeleteOpen(false)}
                        currentTask={currentTaskToEdit}
                        columnId={val?._id}
                    />
                )
            }

        </section>
    )
}

export default ColumnItem
