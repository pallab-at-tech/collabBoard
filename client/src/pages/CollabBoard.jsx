import React from 'react'
import { useSelector } from 'react-redux'
import student from "../assets/test-student-banner1.png"
import engineering from "../assets/engineering-banner.png"
import Healthcare from "../assets/Healthcare-banner.png"
import government from "../assets/government-banner.png"
import manufacture from "../assets/manufacture-banner.png"
import other from "../assets/other-banner.png"
import { Outlet } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { VscTriangleRight } from "react-icons/vsc";
import { useGlobalContext } from '../provider/GlobalProvider'

const CollabBoard = () => {

  const user = useSelector(state => state.user)

  const bannerCombo = {
    "Engineering-IT": engineering,
    "Student": student,
    "Healthcare-Dept": Healthcare,
    "Government employee": government,
    "Manufacturing-Dept": manufacture,
    "other": other
  }
  const boardURL = `/board/${user?.name}-${user?._id}`

  const { slideExpand, setSlideExpand } = useGlobalContext()


  return (
    <section className={`bg-[#202128]  min-h-[calc(100vh-60px)] lg-real:px-[50px] px-6 py-4 grid ${slideExpand ? "lg-real:grid-cols-[1fr_500px]" : "lg-real:grid-cols-[1fr_60px]"} transform-view duration-500`}>

      <div className=''>
        {
          <Outlet />
        }
      </div>

      <div className="pl-4 scroll-smooth relative lg-real:block hidden mt-5">
        {/* Toggle Button */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setSlideExpand(!slideExpand)
          }}
          className={`absolute top-4 -left-0.5 cursor-pointer 
                text-[#a78bfa] ${slideExpand ? "rotate-0" : "rotate-180"} 
                transition-transform duration-300`}
          title={slideExpand ? "Hide team list" : "Show team list"}
        >
          <VscTriangleRight size={28} />
        </div>

        {/* Heading */}
        <h1
          className={`ml-4 text-center font-extrabold py-3 text-xl tracking-wide 
                text-[#f5f3ff] border-b-2 border-[#000107]
                shadow-[0_2px_0_#6d28d9] 
                ${slideExpand ? "opacity-100" : "opacity-0"} 
                transition-opacity duration-300`}
        >
          ▓ ALL TEAMS ▓
        </h1>

        {/* Teams List */}
        <div
          className={`h-[calc(100vh-170px)] transition-transform duration-300 
                ${slideExpand ? "block" : "hidden"} 
                overflow-y-auto px-3 py-4 space-y-3 
                scrollbar-thin scrollbar-thumb-[#6d28d9]/60 scrollbar-track-transparent`}
          style={{ willChange: "transform" }}
        >
          {user?.roles?.map((v) => (
            <Link
              to={`${boardURL}/${v?.teamId}`}
              key={v?.teamId}
              className="relative flex items-center justify-between 
                   from-[#424248] to-[#0c0d23] bg-gradient-to-br border-2 border-gray-600
                   rounded-sm px-4 py-3 shadow-[3px_3px_0_#111] 
                   hover:translate-x-[2px] hover:translate-y-[2px] 
                   hover:shadow-[1px_1px_0_#111] 
                   transition-all duration-150 cursor-pointer"
            >
              <div>
                <h1 className="text-sm font-bold text-[#f9fafb]">{v?.name}</h1>
                <p className="text-xs text-[#d1d5db] mt-1">
                  {`${v.organization_type} ${v.organization_type === "other" ? "" : "Group"
                    }`}
                </p>
              </div>

              <img
                src={bannerCombo[v?.organization_type]}
                alt=""
                className="h-[80%] absolute right-2 bottom-1 opacity-70"
              />
            </Link>
          ))}
        </div>
      </div>

    </section>
  )
}

export default CollabBoard

