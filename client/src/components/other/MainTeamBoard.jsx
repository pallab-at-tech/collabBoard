import React, { useEffect, useState, useRef } from 'react'
import noTask from "../../assets/no-task.png"
import { useParams } from 'react-router-dom'
import Axios from '../../utils/Axios'
import SummaryApi from '../../common/SummaryApi'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { useGlobalContext } from '../../provider/GlobalProvider'
import CreateNewColumn from '../common/CreateNewColumn'
import VerticleLine from '../../utils/VerticleLine'
import { HiOutlineDotsVertical } from "react-icons/hi";
import CoumnAllSettings from '../common/CoumnAllSettings'
import ColumnItem from '../common/ColumnItem'


const MainTeamBoard = () => {

    const [data, setData] = useState({
        name: ""
    })
    const [openCreateColumn, setOpenCreateColumn] = useState(false)
    const [columnSetting, setColumnSetting] = useState(null)
    const params = useParams()
    const { fetchTaskDetails } = useGlobalContext()


    const handleOnChange = (e) => {
        const { name, value } = e.target

        setData((preve) => {
            return {
                ...preve,
                [name]: value
            }
        })
    }

    const handleOnSubmit = async (e) => {
        e.preventDefault()

        try {
            const response = await Axios({
                ...SummaryApi.taskBoard_create,
                data: {
                    name: data.name,
                    teamId: params.team
                }
            })

            if (response?.data?.error) {
                toast.error(response?.data?.message)
            }

            if (response?.data?.success) {
                toast.success(response?.data?.message)
                setData({
                    name: ""
                })
                fetchTaskDetails(params?.team)
            }

        } catch (error) {
            console.log("create task board error", error)
        }
    }

    useEffect(() => {
        fetchTaskDetails(params?.team)
        console.log("params?.team", params?.team)
    }, [params?.team])

    const task = useSelector(state => state.task)

    console.log("task details", task)

    return (
        <section className=''>

            <div className=' border-2 overflow-y-auto min-h-[calc(100vh-182px)] max-h-[calc(100vh-182px)] border-white px-6 py-8  bg-[#1F2937] mini_tab:mx-10 rounded-b relative'>

                {
                    !task?._id ? (
                        <form onSubmit={handleOnSubmit} className='ipad_pro:mx-6 ipad_pro:my-4 mini_tab:mx-6 mini_tab:my-4'>

                            <h1 className='font-bold mini_tab:text-[20px] text-[16px] text-[#111211] w-fit'>Enter name to create task Board :</h1>

                            <input type="text" name='name' value={data.name} onChange={handleOnChange} className='bg-[#6f6f6f90] mini_tab:w-[311px] w-[249px] mb-2 mt-1 outline-none rounded mini_tab:py-1.5 py-1 px-2' placeholder='Enter here ...' />

                            <button className='bg-[#1a801f] hover:bg-[#015f20] transition-colors text-A-off-text w-fit mini_tab:px-3 mini_tab:py-1.5 px-2 py-1 rounded cursor-pointer block'>Create</button>

                        </form>
                    ) : (
                        <div>

                            <div className='bg-[#eaeaea] w-fit p-2.5 rounded flex  items-center gap-4 sm:text-lg text-sm'>
                                <div onClick={() => setOpenCreateColumn(true)} className='bg-[#1a801f] hover:bg-[#027127] transition-colors duration-100 text-white px-1.5 py-1 rounded cursor-pointer sm:leading-normal leading-5'>
                                    New column
                                </div>

                                <div className='bg-[#1a801f] hover:bg-[#027127] transition-colors duration-100 text-white px-1.5 py-1 rounded cursor-pointer sm:leading-normal leading-5'>
                                    Track task
                                </div>

                                <div className='bg-[#1a801f] sm:block hidden hover:bg-[#027127] transition-colors duration-100 text-white px-1.5 py-1 rounded cursor-pointer'>
                                    Recent deadline
                                </div>

                                <div className='bg-[#1a801f]  hover:bg-[#027127] transition-colors duration-100 text-white px-1.5 py-1 rounded cursor-pointer'>
                                    status
                                </div>
                            </div>

                            <div className='bg-[#eaeaea] w-fit p-2.5 rounded my-1 sm:hidden block'>
                                <div className='bg-[#1a801f] s hover:bg-[#027127] transition-colors duration-100 text-white px-1.5 py-1 rounded cursor-pointer'>
                                    Recent deadline
                                </div>
                            </div>



                            <div className='ipad_pro:ml-8 mini_tab:ml-4 ml-1 mt-8'>

                                <div className='bg-orange-700 text-white mini_tab:font-bold font-semibold mini_tab:text-lg text-base w-fit px-1 py-2 rounded'>
                                    {
                                        task?.name
                                    }
                                </div>

                                <div className='ipad_pro:ml-8 mini_tab:ml-6 -ml-1 mt-4 sm:text-base text-sm'>
                                    {
                                        Array.isArray(task?.column) && (
                                            task?.column.map((val, idx) => {
                                                return (
                                                    <ColumnItem
                                                        key={val._id}
                                                        val={val}
                                                        isOpen={columnSetting === val._id}
                                                        setColumnSetting={setColumnSetting}
                                                    />
                                                )
                                            })
                                        )
                                    }
                                </div>

                            </div>


                        </div>
                    )
                }


                {
                    !task?._id && (
                        <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none'>
                            <img src={noTask} alt="No task" className='opacity-[40%]' />
                            <p className='text-gray-700'>No task create yet !?</p>
                        </div>
                    )
                }



            </div>



            {
                openCreateColumn && (
                    <CreateNewColumn close={() => setOpenCreateColumn(false)} />
                )
            }



        </section>
    )
}

export default MainTeamBoard
