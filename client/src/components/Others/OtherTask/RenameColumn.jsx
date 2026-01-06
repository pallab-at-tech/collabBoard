import { useState } from 'react'
import { IoClose } from 'react-icons/io5'
import { useSelector } from 'react-redux'
import Axios from '../../../utils/Axios'
import SummaryApi from '../../../common/SummaryApi'
import toast from 'react-hot-toast'
import { useGlobalContext } from '../../../provider/GlobalProvider'
import { useParams } from 'react-router-dom';


const RenameColumn = ({ close, columnId, columnName }) => {

    const task = useSelector(state => state.task)

    const params = useParams()

    const [data, setData] = useState({
        columnId: columnId,
        columnName: columnName,
        taskId: task?._id,
        teamId: params?.team
    })
    const [updating, setUpdating] = useState(false)

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

            setUpdating(true)

            const response = await Axios({
                ...SummaryApi.task_column_rename,
                data: data
            })

            if (response?.data?.error) {
                toast.error(response?.data?.message)
                setUpdating(false)
            }

            if (response?.data?.success) {
                toast.success(response?.data?.message)
                fetchTaskDetails(task?.teamId)
                setUpdating(false)
                close()
            }

        } catch (error) {
            toast.error(error?.response?.data?.message)
            console.log("handleOnSubmit for rename column", error)
            setUpdating(false)
        }
    }

    return (
        <section className='fixed right-0 left-0 top-0 bottom-0 flex flex-col items-center justify-center z-50 bg-[#152231b2] backdrop-blur-[3px]'>

            <form onSubmit={handleOnSubmit} className="bg-white shadow-xl rounded-xl px-6 py-5 w-[320px] animate-scaleIn">


                <div className="flex justify-end">
                    <IoClose
                        size={22}
                        onClick={() => close()}
                        className="cursor-pointer text-gray-500 hover:text-gray-700 transition"
                    />
                </div>


                <h2 className="text-lg font-semibold text-gray-800 mb-3">Rename Column</h2>


                <div className="flex flex-col gap-2">

                    <label htmlFor="columnName" className="text-sm text-gray-600">
                        Enter new name:
                    </label>

                    <input
                        id="columnName"
                        type="text"
                        name="columnName"
                        value={data.columnName}
                        onChange={handleOnChange}
                        placeholder="Type here..."
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className={`mt-5 w-full bg-blue-600 text-white text-sm font-medium py-2 rounded-md hover:bg-blue-700 active:scale-[0.98] transition ${updating ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                    {updating ? "Submiting" : "Submit"}
                </button>
            </form>

        </section>
    )
}

export default RenameColumn
