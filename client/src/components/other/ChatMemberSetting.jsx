import React from 'react'

const ChatMemberSetting = () => {
    return (
        <div className="absolute right-6 -top-14 w-48 bg-white rounded-xl rounded-br-md shadow-lg border border-gray-200 overflow-hidden z-50">
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-100 hover:text-red-600 transition">
                Remove from group
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition">
                Make Group Admin
            </button>
        </div>
    )
}

export default ChatMemberSetting
