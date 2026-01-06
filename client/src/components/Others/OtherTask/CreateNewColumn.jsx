import React, { useState } from 'react'
import { IoCloseSharp } from "react-icons/io5";
import { useParams } from 'react-router-dom';
import Axios from '../../../utils/Axios';
import SummaryApi from '../../../common/SummaryApi';
import toast from 'react-hot-toast';
import { useGlobalContext } from '../../../provider/GlobalProvider';


const CreateNewColumn = ({ close }) => {

    const [data, setData] = useState({
        name: ""
    })
    const [submitAvailable, setSubmitAvailable] = useState(true)

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
            setSubmitAvailable(false)

            const response = await Axios({
                ...SummaryApi.task_column_create,
                data: {
                    teamId: params?.team,
                    name: data.name
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
                close()
            }

        } catch (error) {
            console.log("error from CreateNewColumn", error)
        }
        finally {
            setSubmitAvailable(true)
        }
    }

    return (
        <section className='fixed right-0 left-0 top-0 bottom-0 flex flex-col items-center justify-center z-50 bg-[#152231b2] backdrop-blur-[2px]'>

            <form onSubmit={handleOnSubmit} className='bg-white flex justify-center items-center sm:py-6 sm:px-6 px-4 py-6 relative rounded-xl'>

                <IoCloseSharp size={26} onClick={() => close()} className='absolute right-4 top-2 cursor-pointer' />

                <div>
                    <h1 className='font-bold pb-1'>Create new column :</h1>

                    <div className='flex flex-col gap-2'>
                        <input type="text" onChange={handleOnChange} value={data.name} name='name' className='border-[2px] border-[#027127] px-2 py-0.5 rounded-md w-[250px] outline-none hover:outline-2 hover:outline-[#027127]' required placeholder='Enter column name here...' />
                        <button className={`block bg-[#1a801f] hover:bg-[#027127] transition-colors duration-100 text-white px-1.5 py-0.5 rounded-md ${submitAvailable ? "cursor-pointer" : "pointer-events-none"} `}>Submit</button>
                    </div>
                </div>

            </form>

        </section>
    )
}

export default CreateNewColumn