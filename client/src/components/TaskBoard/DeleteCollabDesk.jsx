import React, { useState } from 'react'
import { useGlobalContext } from '../../provider/GlobalProvider'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'

const DeleteCollabDesk = ({ close, title, deskId }) => {

    const [loading, setLoading] = useState(false)
    const { socketConnection } = useGlobalContext()
    const params = useParams()


    const handleDelete = async (e) => {

        e.preventDefault();
        if (!socketConnection) return;

        try {
            setLoading(true)

            socketConnection.once("DeskDelete_success", (data) => {
                toast.success(data?.message)
                setLoading(false)
                close()
            })

            socketConnection.once("DeskDelete_error", (data) => {
                toast.error(data?.message)
                setLoading(false)
            })

            socketConnection.emit("DeskDelete", {
                deskId: deskId,
                teamId: params?.team
            })

        } catch (error) {
            console.error("handleCollabDeskDelete", error);
            setLoading(false);
        }

    }

    return (
        <section className="fixed top-[60px] bottom-0 right-0 left-0 flex items-center justify-center z-50 bg-gray-900/60 backdrop-blur-[4px]">
            <form className="bg-white shadow-2xl rounded-2xl px-8 py-6 w-[300px] sm:w-[380px] animate-scaleIn">

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                    Delete CollabDesk
                </h2>

                {/* Desk name */}
                <p className="text-base text-gray-700 mb-4 text-center line-clamp-3">
                    <span className="font-semibold">{title}</span>
                </p>

                {/* Confirmation text */}
                <p className="text-gray-600 text-center mb-6">
                    Are you sure you want to delete this CollabDesk?
                </p>

                {/* Buttons */}
                <div className="flex justify-center gap-4">
                    <button
                        type="button"
                        onClick={(e) => handleDelete(e)}
                        disabled={loading}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium text-white shadow-md transition-all
                        ${loading
                                ? "bg-red-400 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700 active:scale-95 cursor-pointer"}`}
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </button>

                    <button
                        type="button"
                        onClick={() => close()}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gray-200 text-gray-700 shadow-sm hover:bg-gray-300 active:scale-95 transition cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </section>

    )
}

export default DeleteCollabDesk
