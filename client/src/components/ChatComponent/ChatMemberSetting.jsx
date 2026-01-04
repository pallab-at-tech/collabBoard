import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGlobalContext } from '../../provider/GlobalProvider'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'


const ChatMemberSetting = ({ close, memberId, memberUserId, onUpdated, details, setAll_details }) => {

    const params = useParams()
    const { socketConnection } = useGlobalContext()

    const user = useSelector(state => state?.user)
    const [isAdmin, setIsAdmin] = useState(false)
    const [loader, setLoader] = useState(false)

    useEffect(() => {
        if (!details?.participants || !Array.isArray(details?.participants)) return
        details?.participants.map((v) => {
            if (v?._id === memberId) {
                setIsAdmin(v?.admin)
            }
        })
    }, [details])

    // remove member from group
    const removeFromGroup = async () => {

        if (loader || !socketConnection) return

        setLoader(true)

        socketConnection.once("remove_memberSuccess", (removeData) => {
            toast.success(removeData?.message)
            setLoader(false)
            onUpdated(memberId)
            close()
        })

        socketConnection.once("memberRemove_error", (removeData) => {
            toast.error(removeData?.message)
            setLoader(false)
        })

        socketConnection.emit("remove_member_chatGroup", {
            group_id: params?.conversation,
            memberId: memberId,
            memberUserId: memberUserId,
            adminUserId: user?.userId,
            adminId: user?._id
        });
    }

    // make group admin
    const handleMakeAdmin = () => {
        if (!socketConnection || loader) return

        setLoader(true)

        socketConnection.once("admin_success", (adminData) => {
            toast.success(adminData?.message)
            setAll_details((prev) => {

                if (!prev || !Array.isArray(prev?.participants) || !Array.isArray(prev?.otherUser)) return prev

                let participants = prev?.participants || []
                const findIdxP = participants?.findIndex((ip) => ip && ip?._id === memberId)
                if (findIdxP >= 0) {
                    participants[findIdxP] = {
                        ...participants[findIdxP],
                        admin: true
                    }
                }

                let otherUser = prev?.otherUser || []
                const findIdxO = otherUser?.findIndex((io) => io && io?._id === memberId)
                if (findIdxO >= 0) {
                    otherUser[findIdxO] = {
                        ...otherUser[findIdxO],
                        admin: true
                    }
                }

                return {
                    ...prev,
                    participants: participants,
                    otherUser: otherUser
                }
            })
            setLoader(false)
        })

        socketConnection.once("admin_error", (adminData) => {
            toast.error(adminData?.message)
            setLoader(false)
        })

        socketConnection.emit("make_admin", {
            group_id: params?.conversation,
            member_id: memberId,
            member_userId: memberUserId,
            my_userId: user?.userId,
            my_id: user?._id
        })
    }

    // make demote from group
    const handleMakeDemote = () => {
        if (!socketConnection || loader) return

        setLoader(true)

        socketConnection.once("demote_success", (demoteData) => {
            toast.success(demoteData?.message)
            setAll_details((prev) => {
                if (!prev || !Array.isArray(prev?.participants) || !Array.isArray(prev?.otherUser)) return prev

                let participants = prev?.participants || []
                const findIdxP = participants?.findIndex((ip) => ip && ip?._id === memberId)
                if (findIdxP >= 0) {
                    participants[findIdxP] = {
                        ...participants[findIdxP],
                        admin: false
                    }
                }

                let otherUser = prev?.otherUser || []
                const findIdxO = otherUser?.findIndex((io) => io && io?._id === memberId)
                if (findIdxO >= 0) {
                    otherUser[findIdxO] = {
                        ...otherUser[findIdxO],
                        admin: false
                    }
                }

                return {
                    ...prev,
                    participants: participants || [],
                    otherUser: otherUser || []
                }
            })

            setLoader(false)
        })

        socketConnection.once("demote_Err", (demoteData) => {
            toast.error(demoteData?.message)
            setLoader(false)
        })

        socketConnection.emit("demote_admin", {
            group_id: params?.conversation,
            member_id: memberId,
            member_userId: memberUserId,
            my_userId: user?.userId,
            my_id: user?._id
        })
    }

    return (
        <div className="absolute right-6 -top-14 w-48 bg-white rounded-xl rounded-br-md shadow-lg border border-gray-200 overflow-hidden z-50">

            <button onClick={() => removeFromGroup()} className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-100 hover:text-red-600 transition ${loader ? "cursor-not-allowed" : "cursor-pointer"}`}>
                Remove from group
            </button>

            {
                isAdmin ? (
                    <button onClick={() => handleMakeDemote()} className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition ${loader ? "cursor-not-allowed" : "cursor-pointer"}`}>
                        Demote from Admin
                    </button>
                ) : (
                    <button onClick={() => handleMakeAdmin()} className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition ${loader ? "cursor-not-allowed" : "cursor-pointer"}`}>
                        Make Group Admin
                    </button>
                )
            }
        </div>
    )
}

export default ChatMemberSetting