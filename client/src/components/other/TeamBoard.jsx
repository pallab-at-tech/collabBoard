import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useGlobalContext } from '../../provider/GlobalProvider'
import { useEffect } from 'react'
import { IoIosPersonAdd } from "react-icons/io";
import { Outlet } from 'react-router-dom'
import SearchMember from './SearchMember'

const TeamBoard = () => {

    const params = useParams()
    const team = useSelector(state => state.team)
    const [openSearchMember, setOpenSearchMember] = useState(false)

    const { fetchTeamDetails } = useGlobalContext()

    useEffect(() => {
        fetchTeamDetails(params?.team)
    }, [params])


    return (
        <section className='h-full w-full grid-rows-2'>

            {/* header of task desk  */}
            <div className='flex items-center justify-between 
                mini_tab:mx-10 mini_tab:px-6 px-3 py-2 mt-2 mb-1 rounded-t text-white 
                border border-white xl:border-[#596982] xl:ring-1 xl:ring-[#596982] 
                xl:bg-gradient-to-r xl:from-purple-600/1 xl:via-purple-500/2 xl:to-transparent' >

                <div className='flex flex-col'>
                    <div className='flex gap-x-1 items-center'>
                        <Link to={`/board/${params.user}/${params.team}`} className={`font-bold mini_tab:text-2xl text-xl text-white xl:text-[#813ded] mini_tab:max-w-[24ch] max-w-[16ch] line-clamp-1`}>{`${team?.name}`}</Link>
                        <h2 className='text-lg mini_tab:block hidden  font-semibold text-[#60A5FA]   select-none'>{`( ${team?.organization_type} )`}</h2>
                    </div>

                    <div className='-mt-1 xl:mt-0'>
                        <p className='text-base mini_tab:max-w-[46ch] max-w-[20ch] line-clamp-1 text-indigo-400'>{team?.description}</p>
                    </div>
                </div>

                <div className='flex gap-x-6'>

                    <div className='cursor-pointer text-[#E2E8F0] hover:text-blue-400' title='add member' onClick={() => setOpenSearchMember(true)}>
                        <IoIosPersonAdd size={32} />
                    </div>

                    <Link to={`/board/${params.user}/${params.team}/edit`} className='bg-blue-700 xl:bg-[#6d28d9] xl:hover:bg-[#5e1bc9] transition-colors duration-200 px-3 text-white py-1 rounded-md cursor-pointer border border-white'>Edit</Link>

                </div>

            </div>


            {/* body of task desk */}
            <div className='w-full'>
                {
                    <Outlet />
                }
            </div>

            {
                openSearchMember && (
                    <SearchMember close={() => setOpenSearchMember(false)} />
                )
            }

        </section>
    )
}

export default TeamBoard
