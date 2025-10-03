import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";


const NotificationPopbar = ({ close }) => {
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate()

    const notify = useSelector(state => state?.notification)

    useEffect(() => {

    }, []);

    const markAsRead = (id) => {
        socket.emit("mark_notification_read", { id }, (res) => {
            if (res.success) {
                setNotifications((prev) =>
                    prev.filter((n) => n._id !== id)
                );
                setUnreadCount((c) => c - 1);
            }
        });
    };

    const handleSeeMore = () => {
        close();
        navigate("/notifications");
    };

    // console.log("nnnnnnnnnn",notify)

    return (
        <div className=" max-h-[260px] w-[200px] max-w-[200px] sm:h-[150px] sm:w-[320px] sm:max-w-[320px] bg-white text-gray-900 absolute -left-[180px] sm:-left-[280px] top-9 rounded-md px-5 py-2 shadow-lg overflow-y-auto">
            {/* <div className="absolute -top-2 right-1.5 w-6 h-6 bg-white rotate-45"></div> */}

            <h1 className="text-2xl font-bold text-gray-700 mb-2">Notifications</h1>

            {notifications.length === 0 && (
                <div className="relative">
                    <div className="text-gray-500 flex flex-col justify-center items-center h-[60px] sm:h-[80px] pb-4">
                        <p className="select-none">No new notifications!</p>
                    </div>
                    <p onClick={handleSeeMore} className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 underline absolute text-[11px] sm:text-sm -bottom-0 sm:-bottom-2 right-0 cursor-pointer">See old notification</p>
                </div>
            )}

            <ul>
                {notifications.map((n) => (
                    <li
                        key={n._id}
                        className="p-2 rounded-md hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                    >
                        <span>{n.content}</span>
                        <button
                            className="text-sm text-blue-500 ml-2"
                        // onClick={() => markAsRead(n._id)}
                        >
                            Mark read
                        </button>
                    </li>
                ))}
            </ul>

            {/* {notifications.length > 0 && (
                <button
                    className="text-blue-600 font-semibold mt-2 block mx-auto"
                    // onClick={handleSeeMore}
                >
                    See more
                </button>
            )} */}
        </div>
    );
};

export default NotificationPopbar;
