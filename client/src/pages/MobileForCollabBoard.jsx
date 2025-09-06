import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

const MobileForCollabBoard = () => {

  const user = useSelector(state => state.user)
  const boardURL = `/board/${user?.name}-${user?._id}`

  return (
    <section className="flex h-[calc(100vh-112px)] flex-col items-center px-6">
      {/* Heading */}
      <h1
        className="text-center font-extrabold py-3 text-4xl text-emerald-600 pr-4"
        style={{ textShadow: "0 0 12px rgba(16,185,129,0.3)" }}
      >
        All Teams
      </h1>

      {/* Teams Grid */}
      <div
        className="grid ipad_pro:grid-cols-4 mini_tab:grid-cols-3 grid-cols-1 gap-6 
     overflow-y-auto max-h-[calc(100vh-150px)] pt-6 w-full pr-4"
        style={{ willChange: "transform" }}
      >
        {user?.roles?.map((v, i) => (
          <Link
            key={i}
            to={`${boardURL}/${v?.teamId}`}
            className="bg-gradient-to-br from-[#4f5068] to-[#363748] rounded-2xl p-5 shadow-md border-2 border-white/10 
        flex flex-col justify-between transition-all duration-200 
        hover:scale-105 hover:shadow-[0_0_18px_rgba(16,185,129,0.3)] cursor-pointer"
          >
            <h1 className="text-lg font-semibold text-white truncate">{v?.name}</h1>
            <p className="text-sm text-gray-400 mt-2">
              {`${v.organization_type} ${v.organization_type === "other" ? "" : "Group"
                }`}
            </p>
          </Link>
        ))}
        
      </div>
    </section>

  )
}

export default MobileForCollabBoard
