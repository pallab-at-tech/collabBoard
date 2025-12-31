import React, { useState } from 'react'
import { useGlobalContext } from '../../provider/GlobalProvider'
import { useSelector , useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { updateGroupName } from '../../store/chatSlice'


const GroupNameChanged = ({ close, initialValue, group_id, onUpdated }) => {

    const { socketConnection } = useGlobalContext()
    const [name, setName] = useState(initialValue?.value)
    const user = useSelector(state => state.user)
    const dispatch = useDispatch()

    const handleOnSubmit = async (e) => {

        e.preventDefault()

        let errorHandled = false;

        // Listen for error just once
        socketConnection.once("update_error", (data) => {
            toast.error(data?.message || "Failed to update group name");
            errorHandled = true;
            close();
        });

        // Emit the update request
        socketConnection.emit("update_group_details", {
            group_id: group_id?.group_id,
            userId: user?._id,
            userName: user?.name,
            group_name: name
        });

        // Small delay to see if error is returned
        setTimeout(() => {
            if (!errorHandled) {
                toast.success("Group name successfully updated");
                dispatch(updateGroupName({
                    group_Id: group_id?.group_id,
                    group_name: name
                }));
                onUpdated(name);
                setName("");
                close();
            }
        }, 500);
    };

    return (
        <section className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800/40">

            <form onSubmit={handleOnSubmit} className="bg-white w-[90%] max-w-md p-6 rounded-2xl shadow-xl space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">Change Group Name</h2>

                <input
                    type="text"
                    placeholder="Enter new group name"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value)
                    }}
                    autoFocus
                    className="w-full border text-[#232323] font-semibold rounded-xl px-4 py-2 outline-1 outline-blue-500  focus:ring-blue-500 focus:border-blue-500"
                />

                <div className="flex justify-end gap-3 pt-2">

                    <div
                        onClick={close}
                        className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                    >
                        Cancel
                    </div>

                    <button
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-md cursor-pointer"
                    >
                        Save
                    </button>
                </div>
            </form>

        </section>
    )
}

export default GroupNameChanged