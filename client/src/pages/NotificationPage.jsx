import React, { useState, useEffect } from "react";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";

const NotificationPage = () => {

  const [activeTab, setActiveTab] = useState("all");
  const [data, setData] = useState(null)

  // function for fetch all notification
  const fetch_all_notify = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.fetch_all_notification
      })

      const { data: responseData } = response

      if (responseData?.success) {
        setData({
          notifications: responseData?.notifications,
          total: responseData?.total,
          total_page: responseData?.total_page
        })
      }
    } catch (error) {
      console.log("fetch all notification error", error)
    }
  }

  useEffect(() => {

    // fetch all notification
    if (activeTab === "all") {
      fetch_all_notify()
    }

  }, [activeTab])

  console.log("all n data", data)

  return (
    <section className="bg-[#202128] min-h-[calc(100vh-60px)] max-h-[calc(100vh-60px)] px-4 sm:px-10 py-4 sm:grid sm:grid-cols-[200px_1fr]  gap-4">

      {/* Sidebar */}
      <div className="bg-[#2a2b33] sticky top-[70px] rounded-lg p-4 flex sm:flex-col flex-row justify-around sm:justify-start w-full sm:gap-2 gap-4 text-gray-300 font-medium h-fit">

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

        <button
          onClick={() => setActiveTab("old")}
          className={`px-3 py-2 hidden sm:block rounded-md capitalize transition text-sm w-full cursor-pointer ${activeTab === "old"
            ? "bg-emerald-600 text-white"
            : "hover:bg-[#35363f]"
            }`}
        >
          Old Notifications
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

        <button
          onClick={() => setActiveTab("old")}
          className={`px-3 py-2 block sm:hidden rounded-md capitalize transition text-sm w-full cursor-pointer ${activeTab === "old"
            ? "bg-emerald-600 text-white"
            : "hover:bg-[#35363f]"
            }`}
        >
          Old
        </button>

      </div>

      {/* Notification list (only this scrolls) */}
      <div className="bg-[#2a2b33] rounded-lg p-5 mt-4 sm:mt-0 overflow-y-auto decrease-Width-slidebar max-h-[calc(100vh-140px-32px)] sm:max-h-[calc(100vh-70px-32px)]">

        {
          !data ? (
            <div className="w-full h-full flex justify-center items-center text-gray-200 text-[16px] sm:text-lg select-none">
              No Notification have ?!
            </div>
          ) : (
            <>
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

                        <span className="text-xs text-gray-400 whitespace-nowrap">2h ago</span>
                        
                        {v?.isRead ? (
                          <span className="text-gray-400 italic">Read</span>
                        ) : (
                          <button
                            // onClick={() => handleMarkAsRead(v._id)} // optional handler
                            className="text-blue-800 hover:text-blue-600 bg-gray-200 px-2 py-1 rounded cursor-pointer transition"
                          >
                            Mark
                          </button>
                        )}
                      </div>

                    </div>
                  )
                })
              }

            </>
          )
        }
      </div>

    </section>
  );
};

export default NotificationPage;
