import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { BsDot } from "react-icons/bs";
import { useDispatch } from "react-redux";
import Axios from "../../utils/Axios";
import SummaryApi from "../../common/SummaryApi";
import { setEmptyAllNotification, updateNotification } from "../../store/notificationSlice";
import toast from "react-hot-toast";

const NotificationPopbar = ({ close }) => {

    const navigate = useNavigate()
    const notifyData = useSelector(state => state?.notification)
    const dispatch = useDispatch()

    const handleSeeMore = () => {
        navigate("/notifications");
        close();
    };

    const markedOne = async (notify_id) => {
        if (!notify_id) return

        try {
            const response = await Axios({
                ...SummaryApi.markedOne,
                data : {
                    notify_id : notify_id
                }
            })

            const { data: responseData } = response

            if(responseData?.success){

                toast.success("Marked")
                dispatch(updateNotification({
                    notify_id : notify_id
                }))
            }
            
        } catch (error) {
            console.log("Marked one read error from header",error)
        }
    }

    const markedAll = async()=>{
        try {
            const response = await Axios({
                ...SummaryApi.markedAll
            })

            const { data: responseData } = response

            if(responseData?.success){
                toast("Marked All")
                dispatch(setEmptyAllNotification())
            }
            
        } catch (error) {
            console.log("Marked all notification error",error)
        }
    }


    return (
        <div onClick={(e) => e.stopPropagation()} className={`${notifyData.data.length === 0 ? "h-[180px]" : "h-[250px] sm:h-[250px]"}  w-[250px] sm:w-[350px] grid grid-rows-[40px_1fr_30px] bg-white text-gray-900 absolute -left-[230px] sm:-left-[300px] top-9 rounded-md sm:px-5 px-3 py-2 shadow-lg overflow-y-auto`}>

            <div className="sm:flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-700">Notifications</h1>
                <h2 onClick={()=>markedAll()} className={`text-[15px] text-blue-600 hover:text-blue-500 cursor-pointer ${notifyData.data.length === 0 ? "hidden" : "hidden sm:block"}`}>Marked all read</h2>
            </div>

            {notifyData.data.length === 0 && (
                <div className="relative">
                    <div className="text-gray-500 flex flex-col justify-center items-center h-[60px] sm:h-[80px] pb-4">
                        <p className="select-none">No new notifications!</p>
                    </div>
                    <p onClick={() => handleSeeMore()} className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 underline absolute text-[11px] sm:text-sm -bottom-4 sm:-bottom-2 right-2 cursor-pointer">See old notification</p>
                </div>
            )}

            <ul className="overflow-y-auto decrease-Width-slidebar">
                {notifyData.data?.map((n) => (
                    <li
                        key={n._id}
                        className="px-2 py-2.5 rounded-md bg-blue-50 hover:bg-cyan-100 transition-colors duration-200 cursor-pointer flex justify-between gap-y-2 items-start  mb-1.5"
                    >
                        {/* to={n?.navigation_link} */}
                        <BsDot size={20} className="text-blue-600" />
                        <div className="max-w-[180px] sm:max-w-[190px] leading-tight">{n.content}</div>
                        <button
                            className="text-sm text-blue-600 ml-2 cursor-pointer sm:block hidden sm:self-center"
                        onClick={() =>markedOne(n._id)}
                        >
                            Mark read
                        </button>
                    </li>
                ))}
            </ul>

            {notifyData?.data?.length > 0 && (
                <div className="flex justify-between sm:justify-center items-center px-2 text-sm">
                    <button
                        className="text-blue-600 hover:text-blue-500 font-semibold block underline cursor-pointer"
                        onClick={() => handleSeeMore()}
                    >
                        See more
                    </button>

                    <button onClick={()=>markedAll()} className="sm:hidden block text-blue-600 hover:text-blue-500 font-semibold underline cursor-pointer">Marked all read</button>
                </div>
            )}

        </div>
    );
};

export default NotificationPopbar;
