import React, { useEffect, useRef, useState } from 'react'
import { HiOutlineDotsVertical } from 'react-icons/hi'
import CoumnAllSettings from './CoumnAllSettings'
import ArrowSymbol from "../../utils/ArrowSymbol"
import { FaImages } from "react-icons/fa6";
import { RiFolderVideoFill } from "react-icons/ri";
import { LuLink2 } from "react-icons/lu";
import { FaExternalLinkAlt } from "react-icons/fa";
import { FaAngleDown } from "react-icons/fa6";

const ColumnItem = ({ val, isOpen, setColumnSetting }) => {
    const dropdownRef = useRef(null);
    const imageDropRef = useRef(null)
    const linkDropRef = useRef(null)
    const videoDropRef = useRef(null)

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
                    <div ref={dropdownRef} className='absolute sm:-right-12 -right-[80px]  sm:-top-[115px] -top-[110px] z-10'>
                        <CoumnAllSettings columnId={val?._id} columnName={val?.name} />
                    </div>
                )}
            </div>


            {
                taskOpen ? (
                    val?.tasks?.length === 0 ? (
                        <div className={`sm:ml-10 flex justify-center items-center transition-opacity duration-500 ease-in-out  bg-gray-700 border border-gray-600 min-h-[200px] min-w-10 max-w-[550px]  rounded-md pr-8 pt-2 pb-6 ${taskOpen ? "opacity-100" : "opacity-0 h-0"}`}>
                            <p className='text-[#dbdbdb] font-semibold text-lg'>No task assigned yet ?!</p>
                        </div>
                    ) : (
                        <div className={`sm:ml-10 transition-opacity duration-500 ease-in-out  bg-gray-700 border border-gray-600 min-h-[200px] min-w-10 max-w-[550px]  rounded-md pr-8 pt-2 pb-6 ${taskOpen ? "opacity-100" : "opacity-0 h-0"}`}>

                            {
                                val?.tasks?.map((val, idx) => {
                                    return (
                                        <div key={`task-assign-${idx}`} className='flex my-4 gap-0 items-center justify-start relative'>

                                            <div className='absolute top-2 left-2 sm:block hidden'>
                                                <ArrowSymbol />
                                            </div>

                                            <div className='relative sm:ml-20 ml-6 sm:mt-3 mt-8 w-fit max-w-[400px] bg-gradient-to-l from-[#273e5b80] to-[#7e828761] border-2 border-gray-400 rounded-md px-2 py-2 '>

                                                <div className='flex sm:flex-row flex-col gap-1 font-semibold text-[#d68408b9] absolute sm:-top-[26px] -top-[40px] sm:right-4 sm:left-auto left-0 text-sm'>

                                                    <div className='flex flex-row gap-1'>
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

                                        </div>
                                    )
                                })
                            }

                        </div>
                    )
                ) : (
                    <div className={`sm:ml-10 flex items-center justify-center transition-all duration-500 ease-in-out bg-gray-700 border border-gray-600 min-h-[50px] min-w-10 max-w-[250px]  rounded-md pr-8 pt-2 pb-6 -mt-4 ${taskOpen ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
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

        </section>
    )
}

export default ColumnItem
