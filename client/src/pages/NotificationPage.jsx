import React, { useState, useEffect } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { FaAngleLeft } from "react-icons/fa";
import { FaAngleRight } from "react-icons/fa";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setEmptyAllNotification, updateNotification } from "../store/notificationSlice";

const NotificationPage = () => {

  const [activeTab, setActiveTab] = useState("all");
  const [data, setData] = useState(null)
  const [markedLoading, setMarkedLoading] = useState(new Set())
  const [temp, setTemp] = useState(new Set())

  const [markedAllLoading, setMarkedAllLoading] = useState(false)

  const dispatch = useDispatch()

  // function for fetch all notification
  const fetch_all_notify = async (page = 1) => {
    try {
      const response = await Axios({
        ...SummaryApi.fetch_all_notification,
        data: {
          page: page
        }
      })

      const { data: responseData } = response

      if (responseData?.success) {
        setData({
          notifications: responseData?.notifications,
          total: responseData?.total,
          total_page: responseData?.total_page,
          curr_page: responseData?.curr_page
        })
      }
    } catch (error) {
      console.log("fetch all notification error", error)
    }
  }

  // function for fetch all unread notification
  const fetch_unread_notify = async (page = 1) => {
    try {
      const response = await Axios({
        ...SummaryApi.fetch_unread_notification,
        data: {
          page: page
        }
      })

      const { data: responseData } = response

      if (responseData?.success) {
        setData({
          notifications: responseData?.notifications,
          total: responseData?.count,
          total_page: responseData?.total_page,
          curr_page: responseData?.curr_page
        })
      }

    } catch (error) {
      console.log("fetchedUnread_notification error", error)
    }
  }

  // fetch notification
  useEffect(() => {

    // fetch all notification
    if (activeTab === "all") {
      fetch_all_notify()
    }
    // fetch all unread notification
    else if (activeTab === "unread") {
      fetch_unread_notify()
    }

  }, [activeTab])

  function timeLeftFromNow(targetDate) {

    if (!targetDate) return "N/A"

    const now = new Date();
    const target = new Date(targetDate);
    let diff = target - now; // in ms

    // if negative, make positive (you can adjust logic if you only want "time left")
    const isPast = diff < 0;
    diff = Math.abs(diff);

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    let result;
    if (seconds < 60) result = `${seconds}s`;
    else if (minutes < 60) result = `${minutes}m`;
    else if (hours < 24) result = `${hours}h`;
    else if (days < 30) result = `${days}d`;
    else if (months < 12) result = `${months}Mon`;
    else result = `${years}Y`;

    return isPast ? `${result} ago` : `in ${result}`;
  }

  const markOneRead = async (notify_id) => {

    if (!notify_id) return

    try {

      const set = new Set(markedLoading)
      set.add(notify_id)
      setMarkedLoading(set)

      const response = await Axios({
        ...SummaryApi.markedOne,
        data: {
          notify_id: notify_id
        }
      })

      const { data: responseData } = response

      if (responseData?.success) {
        const updateSet = new Set(markedLoading)
        updateSet.delete(notify_id)
        setMarkedLoading(updateSet)

        const updateTempSet = new Set(temp)
        updateTempSet.add(notify_id)
        setTemp(updateTempSet)

        dispatch(updateNotification({
          notify_id: notify_id
        }))
      }

    } catch (error) {
      const updateSet = new Set(markedLoading)
      updateSet.delete(notify_id)
      setMarkedLoading(updateSet)
      console.log("marked one error", error)
    }
  }

  const markedAllRead = async () => {
    try {
      setMarkedAllLoading(true)

      const response = await Axios({
        ...SummaryApi.markedAll
      })

      const { data: responseData } = response

      if (responseData?.success) {
        toast.success(responseData?.message)
        setMarkedAllLoading(false)
        setData(null)

        dispatch(setEmptyAllNotification())
      }

    } catch (error) {
      console.log("marked all read error", error)
      setMarkedAllLoading(false)
    }
  }


  // console.log("all n data", data)
  // console.log("temp set", temp)

  return (
    <section className="bg-[#202128] relative min-h-[calc(100vh-60px)] max-h-[calc(100vh-60px)] px-4 sm:px-10 py-4 sm:grid sm:grid-cols-[200px_1fr]  gap-4">

      {/* Sidebar */}
      <div className="bg-[#2a2b33] sticky top-[70px] rounded-lg p-0 sm:p-4 flex sm:flex-col flex-row justify-around sm:justify-start w-full sm:gap-2 gap-4 text-gray-300 font-medium h-fit">

        {/* for tablet and desktop version */}
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 py-2 rounded-md hidden sm:block  transition text-sm w-full cursor-pointer  ${activeTab === "all"
            ? "bg-emerald-600 text-white"
            : "hover:bg-[#35363f]"
            }`}
        >
          All Notifications
        </button>

        <button
          onClick={() => setActiveTab("unread")}
          className={`px-3 py-2 hidden sm:block rounded-md transition text-sm w-full cursor-pointer  ${activeTab === "unread"
            ? "bg-emerald-600 text-white"
            : "hover:bg-[#35363f]"
            }`}
        >
          Unread Notifications
        </button>

        {/* for mobile version */}
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 py-2 block sm:hidden rounded-md  transition text-sm w-full cursor-pointer  ${activeTab === "all"
            ? "bg-emerald-600 text-white"
            : "hover:bg-[#35363f]"
            }`}
        >
          All
        </button>

        <button
          onClick={() => setActiveTab("unread")}
          className={`px-3 py-2 block sm:hidden rounded-md transition text-sm w-full cursor-pointer  ${activeTab === "unread"
            ? "bg-emerald-600 text-white"
            : "hover:bg-[#35363f]"
            }`}
        >
          Unread
        </button>

      </div>

      {/* Notification list (only this scrolls) 60 110*/}
      <div className={`bg-[#2a2b33]  rounded-lg p-5 ${activeTab === "unread" && data && data?.notifications.length > 0 ? "mt-12 sm:mt-9 max-h-[calc(100vh-190px-32px)] sm:max-h-[calc(100vh-135px-32px)]" : "mt-4 sm:mt-0 max-h-[calc(100vh-160px-32px)] sm:max-h-[calc(100vh-110px-32px)]"}  overflow-y-auto decrease-Width-slidebar`}>

        {
          !data || data?.notifications.length === 0 ? (
            <div className="w-full h-full flex justify-center items-center text-gray-200 text-[16px] sm:text-lg select-none">
              No Notification have ?!
            </div>
          ) : (
            <div className="">
              {
                activeTab === "unread" && (
                  <div className="flex justify-start sm:justify-end items-center w-full text-blue-600 text-sm fixed top-[122px] sm:top-[73px] sm:right-14 -right-[17px]">
                    <button onClick={() => markedAllRead()} className={`w-fit px-2 py-1 bg-white rounded-md ${markedAllLoading ? "cursor-not-allowed" : "cursor-pointer"}`}>
                      Mark all read
                    </button>
                  </div>
                )
              }
              {
                data?.notifications?.map((v, i) => {
                  return (
                    <div
                      key={v?._id}
                      className="bg-[#343540] p-4 rounded-md mb-3 hover:bg-[#3d3e4a] transition flex justify-between"
                    >

                      <div className="text-gray-200">

                        <h1 className="font-bold text-blue-500">{v?.type}</h1>
                        <p className="text-gray-200 text-sm">
                          {v?.content}
                        </p>

                      </div>

                      <div className="flex flex-col-reverse sm:flex-row gap-3 items-center justify-end text-sm">

                        <span className="text-xs text-gray-400 whitespace-nowrap">{timeLeftFromNow(v?.createdAt)}</span>

                        {v?.isRead || temp.has(v?._id) ? (
                          <span className="text-gray-400 italic">Read</span>
                        ) : (
                          <button
                            onClick={() => {
                              markOneRead(v._id)
                            }}
                            className={`text-blue-800 hover:text-blue-600 bg-gray-200 px-2 py-1 rounded ${markedLoading.has(v._id) ? "cursor-not-allowed" : "cursor-pointer"} transition`}
                          >
                            Mark
                          </button>
                        )}
                      </div>

                    </div>
                  )
                })
              }

            </div>
          )
        }
      </div>

      {
        data && data?.notifications.length !== 0 && (
          <div className="text-gray-100 flex pl-0 sm:pl-[270px] items-center sm:justify-end w-full absolute right-5 sm:right-10 bottom-5">
            <div className="flex justify-center w-full sm:w-auto pt-4 sm:pt-0">

              <FaAngleLeft
                onClick={() => {
                  if (data.curr_page <= 1) {
                    return
                  }
                  else {
                    data.curr_page -= 1
                    if (activeTab === "all") {
                      fetch_all_notify(data.curr_page)
                    }
                    else {
                      fetch_unread_notify(data.curr_page)
                    }
                  }
                }}
                size={28} className={`${data.curr_page <= 1 ? "text-gray-500 cursor-none" : "cursor-pointer"}`}
              />

              <div>
                {`${data?.curr_page} / ${data?.total_page}`}
              </div>

              <FaAngleRight
                onClick={() => {
                  if (data?.curr_page >= data.total_page) {
                    return
                  } else {
                    data.curr_page += 1
                    if (activeTab === "all") {
                      fetch_all_notify(data.curr_page)
                    }
                    else {
                      fetch_unread_notify(data.curr_page)
                    }
                  }
                }}
                size={28} className={`${data?.curr_page >= data.total_page ? "text-gray-500 cursor-none" : "cursor-pointer"}`}
              />

            </div>
          </div>
        )
      }

    </section>
  );
};

export default NotificationPage;
