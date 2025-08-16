import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

const MobileForCollabBoard = () => {

  const user = useSelector(state => state.user)
  const boardURL = `/board/${user?.name}-${user?._id}`

  return (
    <section className='flex h-[calc(100vh-112px)] flex-col justify-center'>

      <h1 className='text-center font-bold py-1 text-3xl  text-[#024f13]'>All TEAM</h1>

      <div className='grid ipad_pro:grid-cols-4 mini_tab:grid-cols-3 grid-cols-1 gap-6 hide-scrollbar overflow-y-auto max-h-[calc(100vh-110px)] pt-4 w-full' style={{ willChange: 'transform' }}>
        {
          user?.roles?.map((v, i) => {
            return (
              <Link to={`${boardURL}/${v?.teamId}`} className='mini_tab:min-h-[160px] mini_tab:max-h-[160px] mini_tab:min-w-[200px] mini_tab:max-w-[200px]  min-h-[150px] max-h-[150px]  bg-B-color rounded p-4'>
                <h1 className='text-lg font-bold'>{v?.name}</h1>
                <p className='text-sm text-black/70 font-semibold'>{`${v.organization_type} ${v.organization_type === "other" ? "" : "Group"}`}</p>
              </Link>
            )
          })
        }
      </div>
    </section>
  )
}

export default MobileForCollabBoard
