import React, { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useGlobalContext } from '../../provider/GlobalProvider'
import { useEffect } from 'react'
import { IoIosPersonAdd } from "react-icons/io";
import { Outlet } from 'react-router-dom'
import SearchMember from './SearchMember'
import { useDispatch } from 'react-redux'
import { addOfTeamMember, removeFromTeam, requestWithDraw, teamRequestSendInfo, updateTeamDetails, updateTeamForPromoteDemote } from '../../store/teamSlice'
import toast from 'react-hot-toast'
import { currUserteamDetailsUpdate } from '../../store/userSlice'


const TeamBoard = () => {

    const params = useParams()
    const team = useSelector(state => state?.team)
    const [openSearchMember, setOpenSearchMember] = useState(false)

    const user = useSelector(state => state?.user)

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { fetchTeamDetails, socketConnection } = useGlobalContext()

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

            // console.log("params team123",params?.team === data?.teamId)

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

        return () => {
            socketConnection.off("teamDetails_updated")
            socketConnection.off("adminSuccess")
            socketConnection.off("demoteSuccess")
            socketConnection.off("kickOutSuccess")
            socketConnection.off("join_teamSuccess")
            socketConnection.off("team_requsetSend")
            socketConnection.off("request_pulled")
        }

    }, [socketConnection, dispatch])

    // console.log("hi n", user)


    return (
        <section className='h-full w-full grid-rows-2'>

            {/* header of task desk   */}
            <div className='flex items-center justify-between 
                mini_tab:mx-10 mini_tab:px-6 px-3 py-2 mt-2 mb-1 rounded-t text-white 
                border border-white xl:border-[#596982] xl:ring-1 xl:ring-[#596982]'
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

                <div className='flex gap-x-6'>

                    <div className='cursor-pointer text-[#E2E8F0] hover:text-blue-400' title='add member' onClick={() => setOpenSearchMember(true)}>
                        <IoIosPersonAdd size={32} />
                    </div>

                    <Link to={`/board/${params.user}/${params.team}/edit`} className='bg-blue-700  transition-colors duration-200 px-3 text-white py-1 rounded-md cursor-pointer border border-white'>Edit</Link>

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

        </section>
    )
}

export default TeamBoard
