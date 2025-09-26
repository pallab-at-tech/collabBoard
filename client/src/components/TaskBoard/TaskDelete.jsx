import React from 'react'
import { useGlobalContext } from '../../provider/GlobalProvider'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { updateColumnByTaskUnAssign } from '../../store/taskSlice'

const TaskDelete = ({ close, currentTask, columnId }) => {

    const [loading, setloading] = useState(false)
    const { socketConnection } = useGlobalContext()

    const teamId = useSelector(state => state?.task?.teamId)
    const user = useSelector(state => state?.user)

    const dispatch = useDispatch()

    const handleDelete = () => {

        if(loading) return
        setloading(true)

        try {
            socketConnection.once("task_delete_error", (data) => {
                toast.error(data?.message)
                setloading(false)
            })

            socketConnection.emit("delete_task", {
                teamId: teamId,
                columnId: columnId,
                taskId: currentTask?._id,
                userId: user?._id
            })

            socketConnection.once("task_delete_msg", (data) => {

                toast.success(data?.message)
                dispatch(updateColumnByTaskUnAssign({ taskId: data?.taskId, columnId: data?.columnId }))
                setloading(false)
                close()
            })

        } catch (error) {
            console.log("Error while task delete", error)
        }
    }

    return (
        <section className='fixed right-0 left-0 top-0 bottom-0 flex flex-col items-center justify-center z-50 bg-[#152231b2] backdrop-blur-[3px]'>

            <div className='bg-white shadow-xl rounded-xl px-6 py-5 w-[360px] animate-scaleIn'>

                <h2 className="text-xl font-semibold text-gray-800 mb-1 underline">Task Title</h2>

                <h2 className='text-base text-gray-800 mb-3 font-semibold line-clamp-[10]'>{`${currentTask?.title}.`}</h2>

                <h2 className="text-lg font-semibold text-gray-800 mb-3">Are you sure to Delete Task ?</h2>

                <div className="flex justify-end gap-3 mt-4">
                    <button
                        type="button"
                        onClick={() => handleDelete()}
                        className={`px-4 py-2 ${loading ? "pointer-events-none" : "cursor-pointer"} bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 active:scale-[0.98] transition`}
                    >
                        {loading ? "Deleting..." : "Confirm"}
                    </button>

                    <button
                        type="button"
                        onClick={() => close()}
                        className="px-4 py-2 cursor-pointer bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 active:scale-[0.98] transition"
                    >
                        Cancel
                    </button>
                </div>

            </div>

        </section>
    )
}

export default TaskDelete
