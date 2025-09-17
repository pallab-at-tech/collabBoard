import React, { useEffect, useState, useRef } from 'react'
import noTask from "../../assets/no-task.png"
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { useGlobalContext } from '../../provider/GlobalProvider'
import CreateNewColumn from '../common/CreateNewColumn'
import { HiOutlineDotsVertical } from "react-icons/hi";
import ColumnItem from '../common/ColumnItem'
import { useDispatch } from 'react-redux'
import {
    updateColumnByTaskUnAssign, updateColumnByTaskAssign, sortColumnByCreatedAt,
    sortColumnByUpdatedAt, sortColumnByDeadLine, setTaskLogOut , taskBoardNameChange
} from '../../store/taskSlice'
import RenameCollabDesk from './RenameCollabDesk'
import DeleteCollabDesk from '../TaskBoard/DeleteCollabDesk'



const MainTeamBoard = () => {

    const [data, setData] = useState({
        name: ""
    })
    const [sortData, setSortData] = useState("")
    const [dotOpen, setDotOpen] = useState(false)
    const dotRef = useRef(null)


    const [openCreateColumn, setOpenCreateColumn] = useState(false)
    const [columnSetting, setColumnSetting] = useState(null)
    const [renameOpen, setRenameOpen] = useState(false)
    const [deleteColllabDeskOpen, setDeleteColllabDeskOpen] = useState(false)

    const [creatingDesk, setCreatingDesk] = useState(false)


    const params = useParams()
    const dispatch = useDispatch()
    const { fetchTaskDetails, socketConnection } = useGlobalContext()


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
        if (!socketConnection) return
        if (!data.name) return

        try {
            setCreatingDesk(true)

            socketConnection.once("createDeskSuccess", (data) => {
                toast.success(data?.message)
                setData({
                    name: ""
                })
                setCreatingDesk(false)
            })

            socketConnection.once("createDeskError", (data) => {
                toast.error(data?.message)
                setCreatingDesk(false)
            })

            socketConnection.emit("createDesk", {
                name: data.name,
                teamId: params?.team
            })

        } catch (error) {
            console.error("handleCollabDeskCreate", error);
            setCreatingDesk(false);
        }
    }

    useEffect(() => {
        fetchTaskDetails(params?.team)
    }, [params?.team])

    const task = useSelector(state => state.task)

    useEffect(() => {

        function handleClickOutside(e) {
            if (dotRef.current && !dotRef.current.contains(e.target)) {
                setDotOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }

    }, [])

    // update new task for assigned and unassign members
    useEffect(() => {

        if (!socketConnection) return

        socketConnection.on("task_assigned", (data) => {

            if (task?._id === data?.taskBoardId) {
                dispatch(updateColumnByTaskAssign({ task: data?.task, columnId: data?.columnId, columnName: data?.columnName }))
            }

        })

        socketConnection.on("task_unassigned", (data) => {

            if (task?._id === data?.taskBoardId) {
                dispatch(updateColumnByTaskUnAssign({ columnId: data?.columnId, taskId: data?.taskId }))
            }

        })

        socketConnection.on("update_task_data", (data) => {

            if (task?._id === data?.taskBoardId) {
                dispatch(updateColumn({ columnId: data?.columnId, taskId: data?.taskId, task: data?.task }))
            }

        })

        socketConnection.on("task_delete_success", (data) => {

            if (task?._id === data?.taskBoardId) {
                dispatch(updateColumnByTaskUnAssign({ columnId: data?.columnId, taskId: data?.taskId }))
            }

        })

        socketConnection.on("collabName_success", (data) => {

            if (task?._id === data?.taskBoardId) {
                dispatch(taskBoardNameChange({ newName: data?.newName }))
            }

        })

        socketConnection.on("DeskDelete_success", (data) => {

            if (task?._id === data?.deskId) {
                dispatch(setTaskLogOut())
            }
        })

        socketConnection.on("createDeskSuccess", (data) => {

            if (params?.team === data?.teamId) {
                fetchTaskDetails(data?.teamId)
            }
        })

        return () => {
            socketConnection.off("task_assigned")
            socketConnection.off("task_unassigned")
            socketConnection.off("update_task_data")
            socketConnection.off("task_delete_success")
            socketConnection.off("collabName_success")
            socketConnection.off("DeskDelete_success")
            socketConnection.off("createDeskSuccess")
        }

    }, [socketConnection, dispatch, task?._id])

    // control task by sorting
    useEffect(() => {

        if (!sortData) return

        if (sortData === "createdAt") dispatch(sortColumnByCreatedAt())
        else if (sortData === "updatedAt") dispatch(sortColumnByUpdatedAt())
        else if (sortData === "deadline") dispatch(sortColumnByDeadLine())

    }, [sortData, task])

    console.log("task details hi", task)

    return (
        <section className=''>

            <div className='xl:border-1 xl:bg-[#282932] xl:bg-gradient-to-r xl:from-[#0a0a1880] xl:to-transparent mt-2 xl:border-[#596982] xl:ring-1 xl:ring-[#596982] border-white overflow-y-auto min-h-[calc(100vh-182px)] max-h-[calc(100vh-182px)] px-0.5 xl:px-6 py-8  mini_tab:mx-10 rounded-b relative '>

                {
                    !task?._id ? (
                        <form onSubmit={handleOnSubmit} className='ipad_pro:mx-6 ipad_pro:my-4 mini_tab:mx-6 mini_tab:my-4'>

                            <h1 className='font-bold mini_tab:text-[20px] text-[16px] text-[#e6e8e5] w-fit '>Enter name to create task Board :</h1>

                            <input type="text" name='name' value={data.name} onChange={handleOnChange} className='bg-[#e6e8e5d0] mini_tab:w-[311px] w-[249px] mb-2 mt-1 outline-none rounded mini_tab:py-1.5 py-1 px-2' placeholder='Enter here ...' />

                            <button className={`${creatingDesk ? "bg-[#4dc118ad] hover:bg-[#3f9f13] " : "bg-[#3f9f13]  hover:bg-[#3b9311]"} transition-colors text-A-off-text w-fit mini_tab:px-3 mini_tab:py-1.5 px-2 py-1 rounded ${creatingDesk ? "cursor-not-allowed" : "cursor-pointer"} block`}>{creatingDesk ? "Creating" : "Create"}</button>

                        </form>
                    ) : (
                        <div className='pr-2 sm:pr-4 xl:pr-2'>

                            <div className="rounded-lg">
                                {/* Main Controls */}
                                <div className="w-full sm:w-fit p-3 rounded-lg flex flex-wrap items-center gap-3 sm:text-lg text-sm bg-[#374151] shadow-md">

                                    {/* Create Column */}
                                    <div
                                        onClick={() => setOpenCreateColumn(true)}
                                        className="text-center bg-green-600 hover:bg-green-700 transition-colors duration-150 text-white px-3 py-1.5 rounded-lg cursor-pointer shadow-sm"
                                    >
                                        <span className="hidden sm:block">New Column</span>
                                        <span className="block sm:hidden">Column</span>
                                    </div>

                                    {/* Track Task */}
                                    <div
                                        className="text-center bg-green-600 hover:bg-green-700 transition-colors duration-150 text-white px-3 py-1.5 rounded-lg cursor-pointer shadow-sm"
                                    >
                                        <Link to={`/board/${params.user}/${params.team}/track`} className="hidden sm:block">Track Task</Link>
                                        <Link to={`/board/${params.user}/${params.team}/track`} className="block sm:hidden">Track</Link>
                                    </div>

                                    {/* Deadline */}
                                    <Link to={`/board/${params.user}/${params.team}/deadline`}
                                        className="text-center bg-blue-600 hover:bg-blue-700 transition-colors duration-150 text-white px-3 py-1.5 rounded-lg cursor-pointer shadow-sm sm:block hidden"
                                    >
                                        Deadline
                                    </Link>

                                    {/* Status */}
                                    <Link to={`/board/${params.user}/${params.team}/status`}
                                        className="text-center bg-purple-600 hover:bg-purple-700 transition-colors duration-150 text-white px-3 py-1.5 rounded-lg cursor-pointer shadow-sm"
                                    >
                                        Status
                                    </Link>
                                </div>

                                {/* Mobile-Only Extra (Deadline) */}
                                <div className="sm:hidden mt-3">
                                    <Link to={`/board/${params.user}/${params.team}/deadline`} className="text-center bg-blue-600 hover:bg-blue-700 transition-colors duration-150 text-white px-3 py-1.5 rounded-lg block cursor-pointer shadow-sm">
                                        Deadline
                                    </Link>
                                </div>
                            </div>

                            <div className='ipad_pro:ml-8 mini_tab:ml-4 ml-1 mt-8'>

                                <div className='flex sm:flex-row flex-col sm:items-center sm:justify-between'>

                                    <div className='w-fit flex gap-2 relative items-center cursor-pointer text-gray-300 hover:text-white'>
                                        <div className='bg-orange-700 text-white mini_tab:font-bold font-semibold mini_tab:text-lg text-base w-fit px-1.5 py-2 rounded'>
                                            {
                                                task?.name
                                            }
                                        </div>

                                        <div className='relative'>
                                            <HiOutlineDotsVertical size={22}
                                                onClick={() => setDotOpen(!dotOpen)}
                                            />

                                            {
                                                dotOpen && (
                                                    <div ref={dotRef} className="absolute top-10 -left-[60px] sm:-top-[90px] sm:left-[20px] z-10 w-36 bg-[#c5c6c9] text-gray-800 rounded-lg shadow-lg border border-gray-700 outline-none">
                                                        <button onClick={() => setRenameOpen(true)}
                                                            className="w-full text-left px-4 py-2 text-sm hover:text-gray-200 hover:bg-gray-600 rounded-t-lg cursor-pointer shadow-sm"
                                                        >
                                                            Rename
                                                        </button>
                                                        <button onClick={() => setDeleteColllabDeskOpen(true)}
                                                            className="w-full text-left px-4 py-2 text-sm  hover:bg-red-500 hover:text-white rounded-b-lg cursor-pointer"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>

                                                )
                                            }

                                        </div>

                                    </div>

                                    <div className="flex items-center gap-2 sm:bg-gray-700  sm:px-2.5 sm:py-2.5 py-1.5 mt-1 rounded-lg sm:shadow-md">
                                        <select
                                            name="sort-task"
                                            id="sort-task"
                                            defaultValue=""
                                            className="bg-[#1c1c21] xl:bg-[#1c1c26] cursor-pointer text-gray-200 text-sm px-3 py-1.5 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
                                            onChange={(e) => {
                                                const val = e.target.value
                                                setSortData(val)
                                            }}
                                        >
                                            <option value="" disabled className=''>Sorted By</option>
                                            <option value="createdAt">Created At</option>
                                            <option value="updatedAt">Updated At</option>
                                            <option value="deadline">Deadline</option>
                                            <option value="urgency">Urgency</option>
                                        </select>
                                    </div>

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
                            <img src={noTask} alt="No task" className='w-[180px]  pb-2 opacity-[40%]' />
                            <p className='text-[#c2c2c2] text-lg font-semibold'>No task create yet !?</p>
                        </div>
                    )
                }

            </div>


            {
                openCreateColumn && (
                    <CreateNewColumn close={() => setOpenCreateColumn(false)} />
                )
            }

            {
                renameOpen && (
                    <RenameCollabDesk close={() => setRenameOpen(false)} deskId={task?._id} />
                )
            }

            {
                deleteColllabDeskOpen && (
                    <DeleteCollabDesk
                        close={() => setDeleteColllabDeskOpen(false)}
                        title={task?.name}
                        deskId={task?._id}
                    />
                )
            }

        </section>
    )
}

export default MainTeamBoard
