import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGlobalContext } from "../../provider/GlobalProvider"
import { IoIosNotifications } from "react-icons/io"
import { useSelector } from 'react-redux'
import { CgProfile } from "react-icons/cg"
import { IoChatbubbleEllipsesSharp } from "react-icons/io5"
import { FaChartBar } from "react-icons/fa6"
import logo1 from "../../assets/logo1.png"
import NotificationPopbar from '../other/NotificationPopbar'

const Header = () => {
  const { isLogin } = useGlobalContext()
  const user = useSelector(state => state.user)

  const [NotificationbarOpen, setNotificationbarOpen] = useState(false)

  const dropdownRef = useRef(null)

  useEffect(() => {

    const clickOutSide = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNotificationbarOpen(false)
      }
    }

    document.addEventListener("mousedown", clickOutSide)

    return () => {
      document.removeEventListener("mousedown", clickOutSide)
    }

  }, [])


  const boardURL = `/board/${user?.name}-${user?._id}/${user?.roles[0]?.teamId}`
  const mobileBoardURL = `/board/${user?.name}-${user?._id}`
  const profileURL = `/profile/${user?.name}`

  if (isLogin === null) return null

  return (
    <header
      className={`${isLogin ? "bg-[#1b1c29]/90 backdrop-blur-md" : "bg-white backdrop-blur-md shadow-md"} 
  min-h-[60px] grid sm:grid-cols-[1fr_4fr_2fr] grid-cols-[140px_1fr] 
  items-center z-50 sticky top-0 border-b border-white/10`}
    >
      {/* Logo */}
      <Link to={"/"} className={`sm:pl-6 flex items-center gap-2 w-fit`}>
        <img src={logo1} alt="logo" className="h-[50px] drop-shadow-[0_0_10px_rgba(16,185,110,0.1)]" />
        <div className='text-[24px] pb-1 font-bold -ml-1.5 relative'>
          <span className={`${isLogin ? "text-yellow-400" : "text-yellow-500"}`}>Col</span>
          <span className={`${isLogin ? "text-green-500" : "text-green-600"}`}>lab</span>
          <span className={`${isLogin ? "text-cyan-500" : "text-cyan-600"}`}>Desk</span>
          <span className='w-[70px] h-[3px] bg-green-600 absolute left-[2px] bottom-[7px]' style={{textShadow: "rgb(0 114 42 / 80%) 0px 0px 12px"}}></span>
        </div>
      </Link>

      {/* Center Navigation */}
      <div
        className={`items-center justify-center xl:gap-[20%] gap-8 ${isLogin ? "text-gray-200" : "text-white"
          } font-medium tracking-wide mini_tab:flex hidden`}
      >
        <Link
          to=""
          className={`${isLogin ? "hover:text-emerald-400" : "text-gray-600 hover:text-indigo-600"} transition-colors duration-200`}
        >
          Features
        </Link>

        <Link
          to=""
          className={`${isLogin ? "hover:text-emerald-400" : "text-gray-600 hover:text-indigo-600"} transition-colors duration-200`}
        >
          About
        </Link>
      </div>

      {/* Right Side */}
      <div className="flex items-center justify-center  gap-6">
        {isLogin ? (
          <>
            {/* Profile / Avatar */}
            {user.avatar ? (
              <Link to={profileURL}>
                <img
                  src={user.avatar}
                  alt="profile"
                  className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                />
              </Link>
            ) : (
              <Link to={profileURL} className="text-gray-200 hover:text-emerald-400 transition-colors">
                <CgProfile size={24} />
              </Link>
            )}

            {/* Board Links */}
            {user?.roles?.length !== 0 && (
              <>
                <Link
                  to={boardURL}
                  className="text-gray-200 hover:text-emerald-400 font-medium lg-real:block hidden"
                >
                  Board
                </Link>
                <Link
                  to={mobileBoardURL}
                  className="text-gray-200 hover:text-emerald-400 font-medium lg-real:hidden block"
                >
                  Board
                </Link>
              </>
            )}

            {/* Chat */}
            <Link to={"/chat"} className="text-gray-200 hover:text-emerald-400 transition-colors">
              <IoChatbubbleEllipsesSharp size={22} />
            </Link>

            {/* Notifications */}
            <div
              ref={dropdownRef}
              onClick={() => setNotificationbarOpen(true)}
              className="text-gray-200 hover:text-emerald-400 relative cursor-pointer"
            >
              <IoIosNotifications size={24} />
              {NotificationbarOpen && (
                <NotificationPopbar close={() => setNotificationbarOpen(false)} />
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="bg-indigo-600 text-white font-semibold px-5 py-2 rounded-full hover:bg-indigo-700 transition-colors duration-300"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>

    </header>

  )
}

export default Header
