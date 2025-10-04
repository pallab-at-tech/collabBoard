import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MdOutlineCreateNewFolder, MdOutlinePostAdd } from "react-icons/md";
import CreateTeam from "../components/other/CreateTeam";
import { useGlobalContext } from "../provider/GlobalProvider";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { addingTeamDetails, currUserteamDetailsUpdate, teamRequestSend, teamRequestWithDraw } from "../store/userSlice";
import { useEffect } from "react";
import { fillWithNotification, setNotification } from "../store/notificationSlice";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";

const RealHome = () => {
    const [openCreateTeam, setOpenCreateTeam] = useState(false);
    const [openJoinTeam, setOpenJoinTeam] = useState(false);
    const [loadingJoin, setLoadingJoin] = useState(false)

    const { socketConnection } = useGlobalContext()

    const [codePlace, setCodePlace] = useState("")
    const user = useSelector(state => state?.user)

    const dispatch = useDispatch()

    // join team through team code
    const handleJoinTeam = (e) => {

        e.preventDefault()
        if (!socketConnection) return
        if (!codePlace) return

        try {

            setLoadingJoin(true)

            socketConnection.once("join_teamSuccess", (data) => {
                toast.success(data?.message)

                dispatch(addingTeamDetails({
                    data: data?.forUserState
                }))

                setOpenJoinTeam(false)
                setLoadingJoin(false)
                setCodePlace("")
            })

            socketConnection.once("join_teamError", (data) => {
                toast.error(data?.message)
                setLoadingJoin(false)
            })

            socketConnection.emit("join_team", {
                invite_code: codePlace
            })

        } catch (error) {
            console.log("Join team error", error)
            setLoadingJoin(false)
        }
    }

    useEffect(() => {

        if (!socketConnection) return

        socketConnection.on("kickOutSuccess", (data) => {

            if (data?.memberId === user?._id) {

                dispatch(currUserteamDetailsUpdate({
                    teamId: data?.teamId,
                    memberId: data?.memberId
                }))
            }
        })

        socketConnection.on("team_requestReceived", (data) => {
            dispatch(teamRequestSend({
                teamId: data?.teamId,
                data: data?.teamRequestData
            }))
        })

        socketConnection.on("request_targetPulled", (data) => {

            dispatch(teamRequestWithDraw({
                teamId: data?.teamId
            }))
        })

        socketConnection.on("notify", (data) => {

            dispatch(fillWithNotification({
                value: {
                    _id: data?._id,
                    recipient: data?.recipient,
                    type: data?.type,
                    content: data?.content,
                    navigation_link: data?.navigation_link,
                    isRead: data?.isRead
                }
            }))
        })

        return () => {
            socketConnection.off("kickOutSuccess")
            socketConnection.off("team_requestReceived")
            socketConnection.off("request_targetPulled")
            socketConnection.off("notify")
        }

    }, [socketConnection, dispatch])

    // fetch unread notification
    const fetchedUnread_notification = async () => {
        try {
            const response = await Axios({
                ...SummaryApi.fetch_unread_notification
            })

            const { data: responseData } = response

            console.log("response notification",responseData)

            if (responseData?.success) {
                dispatch(setNotification({
                    data: responseData?.notifications,
                    count: responseData?.count
                }))
            }

        } catch (error) {
            console.log("fetchedUnread_notification error", error)
        }
    }

    useEffect(() => {
        fetchedUnread_notification()
    }, [])

    return (
        <section className="bg-gradient-to-b from-[#1b1c29] to-[#21222b] min-h-[calc(100vh-60px)] grid place-items-center px-6">

            <div className="flex flex-col items-center gap-6 text-center sm:max-w-[420px] sm:mt-0 -mt-[70px]">

                {/* Heading */}
                <div className="pb-1">
                    <h1 className="sm:text-5xl text-4xl font-bold text-white pb-4" style={{ textShadow: "rgb(13 155 108 / 30%) 0px 0px 12px" }}>
                        Welcome to Your Workspace
                    </h1>
                    <p className="text-[#a9abaa] text-base md:text-lg">
                        Collaborate, organize, and manage your projects. Start by creating or joining a team.
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex  gap-4">
                    {/* Create Team */}
                    <div
                        onClick={() => setOpenCreateTeam(true)}
                        className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-2xl w-[140px] sm:w-[180px] py-4 cursor-pointer transition-all duration-200 hover:scale-105"
                    >
                        <MdOutlineCreateNewFolder size={26} />
                        <span>Create Team</span>
                    </div>

                    {/* Join Team */}
                    <div
                        onClick={() => setOpenJoinTeam(true)}
                        className="flex items-center justify-center gap-3 bg-[#2d2f3a] hover:bg-[#3a3c47] text-[#d1d1d1] font-medium rounded-2xl w-[140px] sm:w-[180px] py-4 cursor-pointer transition-all duration-200 hover:scale-105"
                    >
                        <MdOutlinePostAdd size={26} />
                        <span>Join Team</span>
                    </div>
                </div>

                {/* Learn More */}
                <Link className="text-[#a9abaa] text-base underline hover:text-[#c4c4c4] hover:drop-shadow-[0_0_6px_rgba(255,255,205,0.2)] transition-colors duration-150">
                    Know more about our service
                </Link>
            </div>

            {/* Create Team Modal */}
            {openCreateTeam && <CreateTeam close={() => setOpenCreateTeam(false)} />}

            {/* Join Team */}
            {openJoinTeam && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
                    <form onSubmit={handleJoinTeam} className="bg-[#1f2029] text-white rounded-2xl shadow-lg p-6 w-[90%] max-w-md relative">

                        {/* Close Button */}
                        <button
                            onClick={() => setOpenJoinTeam(false)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-white text-lg cursor-pointer"
                        >
                            ✕
                        </button>

                        {/* Heading */}
                        <h2 className="text-2xl font-bold mb-2">Join a Team</h2>
                        <p className="text-sm text-gray-400 mb-5">
                            Enter the invite code shared by your team leader.
                            The code is valid for <span className="font-semibold text-emerald-400">7 days</span> and can be used by up to <span className="font-semibold text-emerald-400">10 members</span>.
                        </p>

                        {/* Input */}
                        <input
                            type="text"
                            placeholder="Enter invite code"
                            value={codePlace}
                            onChange={(e) => setCodePlace(e.target.value)}
                            className="w-full p-3 rounded-lg bg-[#2d2f3a] text-white placeholder-gray-400 border border-[#3a3b45] focus:outline-none focus:ring-2 focus:ring-emerald-500 transition mb-4"
                            required
                        />

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setOpenJoinTeam(false)}
                                className="flex-1 py-3 rounded-lg bg-gray-600 hover:bg-gray-700 transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button type="submit"
                                className={`flex-1 py-3 rounded-lg bg-emerald-700 hover:bg-emerald-600 transition ${loadingJoin ? "cursor-not-allowed" : "cursor-pointer"}`}
                            >
                                {loadingJoin ? "Joining..." : "Join"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </section>

    );
};

export default RealHome;
