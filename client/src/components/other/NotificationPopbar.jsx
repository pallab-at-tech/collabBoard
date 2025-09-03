import React, { useEffect, useRef, useState } from 'react'

const NotificationPopbar = ({ close }) => {
    const [unread, setUnread] = useState(false)

    

    return (
        <div className='h-[240px] w-[360px] max-h-[240px] bg-white text-gray-900 absolute -left-[330px] top-9 rounded-md px-4 py-2'>

            <div className="absolute -top-2 right-1.5 w-6 h-6 bg-white rotate-45"></div>

            <h1 className='text-2xl font-bold text-gray-700'>
                Notification
            </h1>

            <div className='flex gap-10 pt-1 font-semibold text-lg pl-6 transition-all duration-300'>
                <span onClick={() => setUnread(false)} className={`${!unread && "text-blue-500"} cursor-pointer`}>All</span>
                <span onClick={() => setUnread(true)} className={`${unread && "text-blue-500"} cursor-pointer`}>Unread</span>
            </div>

            {/* all notification here */}
            <div>

                {
                    !unread ? (
                        //  all notification 
                        < div >
                            {/* all */}
                        </div>
                    ) : (
                        //  unread notification 
                        <div>
                            {/* unread */}
                        </div>
                    )
                }

            </div>


        </div >
    )
}

export default NotificationPopbar
