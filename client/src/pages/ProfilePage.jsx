import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import profile from "../assets/profile.png"
import { FaEdit, FaEye } from "react-icons/fa";
import { NavLink, Outlet, useParams, useLocation, useNavigate } from 'react-router-dom'
import Axios from "../utils/Axios"
import SummaryApi from '../common/SummaryApi';
import { useDispatch } from 'react-redux';
import { imageAndNameUpdate, setUserLogout } from '../store/userSlice';
import { setChatLogOut } from '../store/chatSlice';
import { setTaskLogOut } from '../store/taskSlice';
import { setTeamLogOut } from '../store/teamSlice';
import toast from 'react-hot-toast'
import ProfileEdit from '../components/other/ProfileEdit';
import { FaEnvelopeOpenText } from "react-icons/fa";
import { useGlobalContext } from '../provider/GlobalProvider';

import { FaCamera } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

import defaultProfile from "../assets/profile.png"
import uploadFile from '../utils/uploadFile';

const ProfilePage = () => {

  const user = useSelector(state => state.user)
  const params = useParams()
  const location = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { logoutUser, socketConnection } = useGlobalContext()


  const [path, setPath] = useState("")

  useEffect(() => {
    const arr = location.pathname.split("/")
    const endPoint = arr[arr.length - 1]
    setPath(endPoint)
  }, [location.pathname])

  const [editAbout, setEditAbout] = useState(false)
  const [editProfile, setEditProfile] = useState(false)

  const [loaderForImg, setloaderForImg] = useState(false)
  const [saving, setSaving] = useState(false)

  const [data, setData] = useState({
    image: user?.avatar || "",
    name: user?.name || ""
  })

  useEffect(() => {
    setData({
      image: user?.avatar || "",
      name: user?.name || ""
    })
  }, [user])

  const handleLogout = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.logout
      })

      if (response?.data?.success) {
        dispatch(setUserLogout())
        dispatch(setChatLogOut())
        dispatch(setTaskLogOut())
        dispatch(setTeamLogOut())
        localStorage.clear()

        logoutUser();

        toast.success(response?.data?.message)
        navigate("/")
      }

    } catch (error) {
      console.log("from handleLogout", error)
    }
  }

  const handleProfilePicUpload = async (e) => {

    setloaderForImg(true)

    const file = e.target.files?.[0]

    if (!file) return

    const response = await uploadFile(file)

    setData((preve) => {
      return {
        ...preve,
        image: response?.secure_url
      }
    })

    setloaderForImg(false)
  }

  const handleSave = () => {

    if (!data.name) {
      toast.error("User name required!")
      return
    }

    if (!socketConnection) return

    try {
      setSaving(true)

      socketConnection.once("user_updateSuccess", (data) => {

        toast.success(data?.message)

        dispatch(imageAndNameUpdate({
          name: data?.name,
          avatar: data?.avatar
        }))

        console.log("update data",data)

        setSaving(false)
      })

      socketConnection.once("userDeatails_error", (data) => {
        toast.error(data?.message)
        setSaving(false)
      })

      socketConnection.emit("change_userDetails", data)

    } catch (error) {
      console.log("profile update error", error)
      setSaving(false)
    }
  }



  console.log("profile data", user)



  return (
    <section className='bg-[#282932] text-white min-h-[calc(100vh-60px)] '>

      <div className='grid lg-real:grid-cols-[500px_1fr]'>

        <div className='lg-real:bg-[#21222b] bg-[#282932] lg-real:block mini_tab:flex  justify-start  px-6 py-4 lg-real:min-h-[calc(100vh-70px)] lg-real:max-h-[calc(100vh-60px)] sticky top-[60px] overflow-y-auto hide-scrollbar lg-real:shadow-md shadow-[#282828]'>

          <div className=''>

            <div className='mt-4 mini_tab:ml-16 ml-[12%] relative w-fit'>
              <img src={profile} alt="" className='h-[200px] w-[188px] rounded-2xl border-2 border-[#179709]' />
              <button onClick={() => setEditProfile(true)} className='absolute bottom-0 right-0 cursor-pointer text-white bg-[#137008] px-3 py-1.5 rounded-l-md rounded-r'>Edit</button>
            </div>

            <div className='mini_tab:ml-16 ml-[12%] mt-4 flex gap-2 items-center max-w-[220px]'>
              <p className='block'>{user?.userId}</p>
              <div className='block h-[0.5px] w-full bg-[#b4b3b3]'></div>
            </div>

            <div className='flex items-center gap-x-1 mini_tab:ml-16 ml-[12%] mt-4'>
              <p className='font-bold'>Email :</p>
              <p className='font-semibold'>{user?.email}</p>
            </div>

          </div>

          <div className='mini_tab:ml-16 ml-[12%] mt-6 max-w-[350px]'>

            <div className=''>

              <div className='flex items-center gap-x-3 mt-4 mb-1'>
                {
                  user?.about ? (
                    <p className='font-bold bg-[#179709] w-fit px-1.5 py-0.5 rounded text-white'>About</p>
                  ) : (
                    <p onClick={() => setEditAbout(true)} className='font-bold bg-[#179709] w-fit px-1.5 py-0.5 rounded text-white cursor-pointer'>add about</p>
                  )
                }

                <FaEdit onClick={() => setEditAbout(true)} size={22} className={`text-[#484848] ${user?.about ? "cursor-pointer" : "pointer-events-none"} opacity-[70%]`} title='Edit about' />

              </div>

              <div className='mini_tab:grid lg-real:block grid-rows-[2fr_1fr]'>

                {
                  user?.about && (
                    <p className='mini_tab:max-w-[400px] max-w-[270px] break-all max-h-[160px] overflow-y-auto'>{user?.about}</p>
                  )
                }

                <div className='lg-real:mt-8 mt-4'>

                  <div className='overflow-y-auto  sticky top-[70px] sm:hidden block'>

                    <div className='pt-[35px] flex items-center gap-x-10 pb-[10px] '>

                      <NavLink to={`/profile/${params?.user}`} className={({ isActive }) => `flex items-center transition-colors duration-75 ease-in-out gap-x-1 cursor-pointer relative px-2 py-0.5 ${path !== "request" && "bg-green-600  rounded"}`}>

                        <FaEye size={20} />
                        <p>Timeline</p>

                      </NavLink>

                      <NavLink to={`/profile/${params?.user}/request`}
                        className={({ isActive }) => `flex items-center transition-colors duration-75 ease-in-out gap-x-1 cursor-pointer relative px-2 py-0.5 ${path === "request" && "bg-green-600  rounded"}`}
                      >
                        <FaEnvelopeOpenText />
                        <p>Inbox</p>

                      </NavLink>

                    </div>

                    <div className='border-b-[0.5px] border-b-[#b4b3b3] shadow-md'></div>

                    {
                      <div className=''>
                        <Outlet />
                      </div>
                    }

                  </div>

                  <div className='mt-8 sm:mt-0'>
                    <button onClick={handleLogout} className='block w-fit px-1.5 py-1 bg-[#bd1c1c] text-white rounded font-bold cursor-pointer'>Logout</button>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        <div className='overflow-y-auto  sticky top-[70px] px-8 sm:block hidden ml-16 lg-real:ml-0'>

          <div className=''>

            <h1 className='pt-[40px] font-bold text-[45px]'>{user?.name}</h1>
            <h2 className='font-semibold pl-1'>student</h2>

            <div className='pt-[35px] flex items-center gap-x-10 pb-[10px] '>

              {/* <NavLink to={`/profile/${params?.user}`} className={({ isActive }) => `flex items-center transition-colors duration-75 ease-in-out gap-x-1 cursor-pointer relative px-2 py-0.5 ${path !== "request" && "bg-green-600  rounded"}`}>

                <FaEye size={20} />
                <p>Timeline</p>

              </NavLink> */}

              {/* /profile/${params?.user}/request */}

              <NavLink to={`/profile/${params?.user}`}
                className={({ isActive }) => `flex items-center transition-colors duration-75 ease-in-out gap-x-1 cursor-pointer relative px-2 py-0.5 ${path === "request" && "bg-green-600  rounded"}`}
              >
                <FaEnvelopeOpenText />
                <p>Inbox</p>

              </NavLink>

              {/* <NavLink to={`/profile/${params?.user}/chat`}
              className={`flex items-center transition-colors duration-75 ease-in-out gap-x-1 cursor-pointer relative px-2 py-0.5`}
            >
              <IoChatbubbleEllipsesSharp />
              <p>Chat</p>
            </NavLink> */}

              {/* <div className='flex items-center gap-x-1 cursor-pointer'>
              <FiMessageSquare size={20} />
              <p className='pb-1'>Message</p>
            </div>  */}

            </div>

            <div className='border-b-[0.5px] border-b-[#b4b3b3] shadow-md'></div>

          </div>

          {
            <div className=''>
              <Outlet />
            </div>
          }

        </div>

      </div>

      {
        editAbout && (
          <ProfileEdit close={() => setEditAbout(false)} />
        )
      }

      {
        editProfile && (
          <section className='fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4'>

            <div className="relative bg-[#f5f5f5] p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-[300px] sm:max-w-[400px] flex flex-col items-center gap-5 animate-in fade-in-0 zoom-in-95">

              {/* Close Button */}
              <button
                onClick={() => {
                  setEditProfile(false)
                  setData(() => {
                    return {
                      name: user?.name || "",
                      image: user?.avatar || ""
                    }
                  })
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <IoClose size={24} />
              </button>

              <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>

              {/* --- Profile Image Uploader --- */}
              <div className="relative group">

                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-400 shadow-md select-none">
                  {
                    loaderForImg ? (
                      <div className='relative'>
                        <div className='imgLoader absolute top-[36px] right-0 left-[38px] bottom-0'></div>
                      </div>
                    ) :
                      data.image ? (
                        <img src={data.image} alt="Profile Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-[#d8d8d8] text-gray-400 font-medium">
                          <img src={defaultProfile} alt="" className='mt-auto' />
                        </div>
                      )}
                </div>

                {/* Uploader Overlay */}
                <label
                  htmlFor="profile-picture-upload"
                  className={`${loaderForImg ? "hidden" : "block"} absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity`}
                >
                  <div className='text-white flex flex-col items-center gap-1'>
                    <FaCamera size={32} />
                    <p className=''>Change image</p>
                  </div>

                  <input
                    id="profile-picture-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicUpload}
                    className="hidden"
                  />
                </label>

              </div>

              {/* --- Name Input Field --- */}
              <div className="w-full">

                <label htmlFor="user-name" className="block text-sm font-medium text-gray-600 mb-1">
                  Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={data.name}
                  onChange={(e) => setData((prev) => { return { ...prev, name: e.target.value } })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                />
              </div>

              {/* --- Action Buttons --- */}
              <div className="flex justify-end gap-3 w-full mt-4">

                <button
                  onClick={() => {
                    setEditProfile(false)
                    setData(() => {
                      return {
                        name: user?.name || "",
                        image: user?.avatar || ""
                      }
                    })
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all ${saving ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {saving ? "Saving" : "Save"}
                </button>
              </div>

            </div>
          </section>
        )
      }

    </section>
  )
}

export default ProfilePage
