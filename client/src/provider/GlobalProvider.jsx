// GlobalProvider.js
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { setUserDetails, onlineUserDetails } from '../store/userSlice'
import { setTeamDetails } from '../store/teamSlice'
import { setTask } from '../store/taskSlice'
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'

export const GlobalContext = createContext(null)
export const useGlobalContext = () => useContext(GlobalContext)

export let setLoginGlobal = () => { }

const GlobalProvider = ({ children }) => {
    const user = useSelector(state => state.user)
    const dispatch = useDispatch()
    const [socketConnection, setSocketConnection] = useState(null)
    const [isLogin, setIsLogin] = useState(localStorage.getItem("login") === "true")

    const [slideExpand, setSlideExpand] = useState(true)
    const [homeLoading, setHomeLoading] = useState(false)
    const [teamLoading, setTeamLoading] = useState(false)

    useEffect(() => {
        setLoginGlobal = setIsLogin
    }, [setIsLogin])

    const fetchUserAllDetails = async () => {
        try {
            setHomeLoading(true)

            const response = await Axios({
                ...SummaryApi?.user_deatails
            })
            const { data: responseData } = response

            if (responseData?.success) {
                dispatch(setUserDetails(responseData?.data))
                localStorage.setItem('login', 'true')
                setIsLogin(true)
            } else {
                localStorage.setItem('login', 'false')
                setIsLogin(false)
            }
            setHomeLoading(false)
        } catch (error) {
            localStorage.setItem('login', 'false')
            setIsLogin(false)
            setHomeLoading(false)
            console.log("error from global provider", error)
        }
    }

    useEffect(() => {
        localStorage.setItem("login", isLogin);
    }, [isLogin]);

    const loginUser = () => {
        localStorage.setItem("login", "true");
        setIsLogin(true);
    };

    const logoutUser = () => {
        localStorage.removeItem("login");
        setIsLogin(false);
    };

    const fetchTeamDetails = async (teamId) => {
        setTeamLoading(true)
        try {
            const response = await Axios({
                ...SummaryApi.team_details,
                params: { teamId }
            })
            const { data: responseData } = response

            if (responseData?.error) toast.error(responseData?.message)
            if (responseData?.success) dispatch(setTeamDetails(responseData?.data))
            setTeamLoading(false)
        } catch (error) {
            setTeamLoading(false)
            console.log("error for fetchTeamDetails", error)
        }
    }

    const fetchTaskDetails = async (teamId) => {
        try {
            const response = await Axios({
                ...SummaryApi.task_details,
                params: { teamId }
            })
            const { data: responseData } = response

            if (responseData?.error) toast.error(responseData?.message)
            if (responseData?.success) dispatch(setTask(responseData?.data))
        } catch (error) {
            console.log("error occur for fetchTaskDetails", error)
        }
    }

    useEffect(() => {
        fetchUserAllDetails()
    }, [])

    // socket configure
    useEffect(() => {
        if (user?._id && localStorage.getItem("accesstoken")) {

            const token = localStorage.getItem("accesstoken")

            const socket = io(import.meta.env.VITE_BACKEND_URL,
                // { withCredentials: true }
                { auth: { token: token } }
            )

            socket.once("session_expired", (data) => {
                toast.error("Your session has expired. Please log in again!")
                localStorage.clear()
                window.location.href = "/"
            })

            socket.once("connect_error", (err) => {
                console.log("Socket connection failed:", err.message);

                if (err.message.includes("Not authenticated")) {
                    toast.error("Your session has expired. Please log in again!")
                    localStorage.clear()
                    window.location.href = "/";
                }
            });

            setSocketConnection(socket)
            socket.emit("join_room", user._id)

            socket.on("online_user", (onlineUsers) => {
                dispatch(onlineUserDetails({ onlineUser: onlineUsers }))
            })

            return () => {
                socket.off("connect")
                socket.off("online_user")
                socket.disconnect()
            }
        }
    }, [user?._id, dispatch])

    return (
        <GlobalContext.Provider value={{
            fetchUserAllDetails,
            fetchTeamDetails,
            fetchTaskDetails,
            socketConnection,
            isLogin,
            setIsLogin,
            loginUser,
            logoutUser,
            slideExpand,
            setSlideExpand,
            homeLoading,
            teamLoading
        }}>
            {children}
        </GlobalContext.Provider>
    )
}

export default GlobalProvider
