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
      className={`${isLogin ? "bg-[#1b1c29]/90 backdrop-blur-md" : "bg-[var(--primary-color)]/90 backdrop-blur-md"} 
  min-h-[60px] grid mini_tab:grid-cols-[1fr_2fr_2fr] grid-cols-[140px_1fr] 
  items-center z-50 sticky top-0 border-b border-white/10`}
    >
      {/* Logo */}
      <Link to={"/"} className={`${isLogin ? "text-white" : ""} sm:pl-6 flex items-center gap-2`}>
        <img src={logo1} alt="logo" className="h-[50px] drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
      </Link>

      {/* Center Navigation */}
      <div
        className={`items-center justify-center md:gap-[20%] gap-8 ${isLogin ? "text-gray-200" : "text-white"
          } font-medium tracking-wide mini_tab:flex hidden`}
      >
        <Link
          to="/features"
          className="hover:text-emerald-400 transition-colors duration-200"
        >
          Features
        </Link>
        <Link
          to="/about"
          className="hover:text-emerald-400 transition-colors duration-200"
        >
          About
        </Link>
      </div>

      {/* Right Side */}
      <div className="flex items-center justify-center mini_tab:gap-10 gap-6">
        {isLogin ? (
          <>
            {/* Profile / Avatar */}
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="profile"
                className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
              />
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
          <Link
            to={"/login"}
            className="bg-emerald-600 py-[7px] px-4 rounded-xl text-white font-medium 
        transition-all duration-200 hover:bg-emerald-500 hover:scale-105 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>

  )
}

export default Header
