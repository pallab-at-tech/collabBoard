import React, { useState } from 'react'
import { IoCloseSharp } from 'react-icons/io5'
import { useGlobalContext } from '../../provider/GlobalProvider'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'

const RenameCollabDesk = ({ close, deskId }) => {

    const [data, setData] = useState({
        name: ""
    })
    const [submitAvailable, setSubmitAvailable] = useState(false)
    const params = useParams()

    const { socketConnection } = useGlobalContext()

    const handleCollabDeskNameChange = (e) => {
        e.preventDefault();

        if (!socketConnection) return;
        if (!data.name) return;

        try {
            setSubmitAvailable(true);

            // Listen for success
            socketConnection.once("collabName_success", (res) => {
                toast.success(res?.message);
                setData({ name: "" });
                close();
                setSubmitAvailable(false);
            });

            // Listen for error
            socketConnection.once("collabNameChange_error", (res) => {
                toast.error(res?.message);
                setSubmitAvailable(false);
            });

            // Emit event
            socketConnection.emit("collabDeskNameChange", {
                deskId,
                teamId: params?.team,
                newName: data.name,
            });

        } catch (error) {
            console.error("handleCollabDeskNameChange", error);
            setSubmitAvailable(false);
        }
    };


    return (
        <section className='fixed right-0 left-0 top-0 bottom-0 flex flex-col items-center justify-center z-50 bg-gray-800/70'>

            <form onSubmit={handleCollabDeskNameChange} className='bg-white flex justify-center items-center sm:py-6 sm:px-6 px-4 py-6 relative rounded-xl'>

                <IoCloseSharp size={26} onClick={() => close()} className='absolute right-4 top-2 cursor-pointer' />

                <div>
                    <h1 className='font-bold pb-1'>Give new column name :</h1>

                    <div className='flex flex-col gap-2'>
                        <input type="text" onChange={(e) => setData({ name: e.target.value })} value={data.name} name='name' className='border-[2px] border-[#027127] px-2 py-0.5 rounded-md w-[250px] outline-none hover:outline-2 hover:outline-[#027127]' required placeholder='Enter new name here...' />
                        <button className={`block bg-[#1a801f] hover:bg-[#027127] transition-colors duration-100 text-white px-1.5 py-0.5 rounded-md ${submitAvailable ? "pointer-events-none" : "cursor-pointer"} `}>{submitAvailable ? "Submiting..." : "Submit"}</button>
                    </div>
                </div>

            </form>

        </section>
    )
}

export default RenameCollabDesk
