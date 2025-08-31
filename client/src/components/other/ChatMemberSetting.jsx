import React from 'react'
import { useParams } from 'react-router-dom'
import { useGlobalContext } from '../../provider/GlobalProvider'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'

const ChatMemberSetting = ({ close , memberId , memberUserId , onUpdated }) => {

    const params = useParams()
    const { socketConnection } = useGlobalContext()

    const user = useSelector(state => state?.user)

    const removeFromGroup = async () => {

        let errorHandled = false;

        // Listen for error just once
        socketConnection.once("memberRemove_error", (data) => {
            toast.error(data?.message || "Failed to remove member");
            errorHandled = true;
            close();
        });

        socketConnection.emit("remove_member_chatGroup", {
            group_id: params?.conversation,
            memberId: memberId,
            memberUserId: memberUserId,
            adminUserId: user?.userId,
            adminId: user?._id
        });

        setTimeout(()=>{

            if(!errorHandled){
                toast.success(`${memberUserId} successfully removed from group.`)
                onUpdated(memberId)
                close()
            }

        },500)

    }


    return (
        <div className="absolute right-6 -top-14 w-48 bg-white rounded-xl rounded-br-md shadow-lg border border-gray-200 overflow-hidden z-50">

            <button onClick={()=>removeFromGroup()} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-100 hover:text-red-600 transition">
                Remove from group
            </button>

            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition">
                Make Group Admin
            </button>
        </div>
    )
}

export default ChatMemberSetting
