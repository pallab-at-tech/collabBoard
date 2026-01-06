import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate, Outlet } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useGlobalContext } from '../../provider/GlobalProvider'
import { IoIosPersonAdd } from "react-icons/io";
import SearchMember from '../../components/Others/OtherBoard/SearchMember';
import { addOfTeamMember, leftTeamMember, removeFromTeam, requestWithDraw, teamRequestSendInfo, updateTeamDetails, updateTeamForPromoteDemote } from '../../store/teamSlice';
import toast from 'react-hot-toast'
import { currUserteamDetailsUpdate , leftFromTeamUpdate } from '../../store/userSlice';
import { MdExitToApp } from "react-icons/md";


const TeamBoard = () => {

    const params = useParams()
    const team = useSelector(state => state?.team)
    const [openSearchMember, setOpenSearchMember] = useState(false)
    const [exitWindow, setExitWindow] = useState(false)

    const [teamLeftLoading, setTeamLeftLoading] = useState(false)

    const user = useSelector(state => state?.user)

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { fetchTeamDetails, socketConnection, isTeamLeader } = useGlobalContext()

    const handleLeftTeam = async () => {

        if (!socketConnection) return
        if (!team?._id) return

        try {

            setTeamLeftLoading(true)

            socketConnection.once("team_exited", (data) => {
                toast.success(data?.message)
                setTeamLeftLoading(false)
                setExitWindow(false)
                navigate("/")
            })

            socketConnection.once("exitError", (data) => {
                toast.error(data?.message)
                setTeamLeftLoading(false)
            })

            socketConnection.emit("team_exit", {
                teamId: team?._id
            })

        } catch (error) {
            console.log("Left team error", error)
            setTeamLeftLoading(false)
        }
    }

    useEffect(() => {
        fetchTeamDetails(params?.team)
    }, [params])

    useEffect(() => {
        if (!socketConnection) return

        socketConnection.on("teamDetails_updated", (data) => {

            if (params?.team === data?.teamId) {
                dispatch(updateTeamDetails({ name: data?.name, description: data?.description }))
            }
        })

        socketConnection.on("adminSuccess", (data) => {

            if (params?.team === data?.teamId) {
                dispatch(updateTeamForPromoteDemote({
                    teamId: data?.teamId,
                    role: data?.role,
                    memberId: data?.memberId
                }))
            }
        })

        socketConnection.on("demoteSuccess", (data) => {

            if (params?.team === data?.teamId) {
                dispatch(updateTeamForPromoteDemote({
                    teamId: data?.teamId,
                    role: data?.role,
                    memberId: data?.memberId
                }))
            }
        })

        socketConnection.on("kickOutSuccess", (data) => {

            if (params?.team === data?.teamId) {

                dispatch(removeFromTeam({
                    teamId: data?.teamId,
                    memberId: data?.memberId
                }))

                if (data?.memberId === user?._id) {

                    dispatch(currUserteamDetailsUpdate({
                        teamId: data?.teamId,
                        memberId: data?.memberId
                    }))

                    toast(`You are removed from team "${data?.teamName}"`, {
                        icon: "😑"
                    })
                    navigate("/")
                }
            }

            if (data?.memberId === user?._id) {

                dispatch(currUserteamDetailsUpdate({
                    teamId: data?.teamId,
                    memberId: data?.memberId
                }))
            }
        })

        socketConnection.on("join_teamSuccess", (data) => {

            if (params?.team === data?.teamId) {
                dispatch(addOfTeamMember({
                    teamId: data?.teamId,
                    newMember: data?.newMember
                }))
            }
        })

        socketConnection.on("team_requsetSend", (data) => {

            if (params?.team === data?.teamId) {
                dispatch(teamRequestSendInfo({
                    teamId: data?.teamId,
                    data: data?.requestData
                }))
            }
        })

        socketConnection.on("request_pulled", (data) => {

            if (params?.team === data?.teamId) {
                dispatch(requestWithDraw({
                    teamId: data?.teamId,
                    memberId: data?.memberId
                }))
            }
        })

        socketConnection.on("team_exited", (data) => {

            if (params?.team === data?.teamId) {
                dispatch(leftTeamMember({
                    teamId: data?.teamId,
                    left_userId: data?.left_userId
                }))
            }

            if (user?._id === data?.left_userId) {
                dispatch(leftFromTeamUpdate({
                    teamId: data?.teamId,
                    left_userId: data?.left_userId
                }))
            }
        })

        return () => {
            socketConnection.off("teamDetails_updated")
            socketConnection.off("adminSuccess")
            socketConnection.off("demoteSuccess")
            socketConnection.off("kickOutSuccess")
            socketConnection.off("join_teamSuccess")
            socketConnection.off("team_requsetSend")
            socketConnection.off("request_pulled")
            socketConnection.off("team_exited")
        }

    }, [socketConnection, dispatch])


    return (
        <section className='h-full w-full grid-rows-2'>

            {/* header of task desk   */}
            <div className={`flex items-center justify-between 
                mini_tab:mx-10 mini_tab:px-6 px-3 ${team?.description ? "py-2" : "py-[19px]"}  mt-2 mb-1 rounded-t text-white 
                border border-white xl:border-[#596982] xl:ring-1 xl:ring-[#596982]`}
            >

                <div className='flex flex-col'>
                    <div className='flex gap-x-1 items-center'>
                        <Link to={`/board/${params.user}/${params.team}`} className={`font-bold mini_tab:text-2xl text-xl text-white  mini_tab:max-w-[24ch] max-w-[16ch] line-clamp-1`}>{`${team?.name}`}</Link>
                        <h2 className='text-lg mini_tab:block hidden  font-semibold text-[#60A5FA]   select-none'>{`( ${team?.organization_type} )`}</h2>
                    </div>

                    <div className='-mt-1 xl:mt-0'>
                        <p className='text-base mini_tab:max-w-[46ch] max-w-[20ch] line-clamp-1 text-indigo-400'>{team?.description}</p>
                    </div>
                </div>

                <div className={`flex gap-x-4 sm:gap-x-8`}>

                    <Link to={`/board/${params.user}/${params.team}/edit`} className={`bg-blue-700  transition-colors duration-200 px-3 text-white py-1 rounded-md cursor-pointer border border-white ${isTeamLeader ? "block" : "hidden"}`}>Edit</Link>

                    <div className='cursor-pointer text-[#E2E8F0] hover:text-blue-400' title='add member' onClick={() => setOpenSearchMember(true)}>
                        <IoIosPersonAdd size={32} />
                    </div>

                    <div className={`cursor-pointer text-[#E2E8F0] hover:text-blue-400`} onClick={() => setExitWindow(true)} title='Exit from the team'>
                        <MdExitToApp size={32} />
                    </div>
                </div>

            </div>

            {/* body of task desk */}
            <div className='w-full'>
                {
                    <Outlet />
                }
            </div>

            {
                openSearchMember && (
                    <SearchMember close={() => setOpenSearchMember(false)} />
                )
            }

            {
                exitWindow && (
                    <section className="fixed inset-0 flex items-center justify-center z-50 bg-[#152231b2] backdrop-blur-[3px]">

                        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 text-center">
                            {/* Header */}
                            <h2 className="text-xl font-bold text-gray-900 mb-3">
                                Are you sure you want to leave the team?
                            </h2>
                            <p className="text-gray-600 mb-6">
                                This action cannot be undone.
                            </p>

                            {/* Action Buttons */}
                            <div className="flex justify-center gap-4">
                                <button onClick={() => setExitWindow(false)}
                                    className={`px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold ${teamLeftLoading ? "cursor-not-allowed" : "cursor-pointer"}`}
                                >
                                    Cancel
                                </button>
                                <button onClick={() => handleLeftTeam()}
                                    className={`px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold ${teamLeftLoading ? "cursor-not-allowed" : "cursor-pointer"}`}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </section>
                )
            }

        </section>
    )
}

export default TeamBoard