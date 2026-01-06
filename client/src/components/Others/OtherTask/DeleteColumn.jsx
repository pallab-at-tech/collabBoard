import { useState } from 'react'
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux'
import Axios from '../../../utils/Axios'
import SummaryApi from '../../../common/SummaryApi'
import toast from 'react-hot-toast'
import { useGlobalContext } from '../../../provider/GlobalProvider'


const DeleteColumn = ({ close, columnId, columnName }) => {

    const task = useSelector(state => state.task)
    const { fetchTaskDetails } = useGlobalContext()

    const [loading, setloading] = useState(false)

    const params = useParams()

    const handleDelete = async () => {
        try {

            setloading(true)

            const response = await Axios({
                ...SummaryApi.task_column_delete,
                data: {
                    taskId: task?._id,
                    columnId: columnId,
                    teamId: params?.team
                }
            })

            if (response?.data?.error) {
                toast.error(response?.data?.message)
                setloading(false)
            }

            if (response?.data?.success) {
                toast.success(response?.data?.message)
                fetchTaskDetails(task?.teamId)
                setloading(false)
                close()
            }

        } catch (error) {
            toast.error(error?.response?.data?.message)
            console.log("handleDelete from DeleteColumn", error)
            setloading(false)
        }
    }

    return (
        <section className='fixed right-0 left-0 top-0 bottom-0 flex flex-col items-center justify-center z-50 bg-[#152231b2] backdrop-blur-[3px]'>

            <div className='bg-white shadow-xl rounded-xl px-6 py-5 w-[320px] animate-scaleIn'>

                <h2 className="text-lg font-semibold text-gray-800 mb-3">Are you sure to Delete Column ?</h2>

                <div className="flex justify-end gap-3 mt-4">
                    <button
                        type="button"
                        onClick={() => handleDelete()}
                        className={`px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 active:scale-[0.98] transition ${loading ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                        Confirm
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

export default DeleteColumn