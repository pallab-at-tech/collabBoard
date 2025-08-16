import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useGlobalContext } from '../../provider/GlobalProvider'
import { useEffect } from 'react'
import { IoIosPersonAdd } from "react-icons/io";
import { Outlet } from 'react-router-dom'
import SearchMember from './SearchMember'

const TeamBoard = () => {

    const params = useParams()
    const dispatch = useDispatch()
    const team = useSelector(state => state.team)
    const [openSearchMember, setOpenSearchMember] = useState(false)

    const { fetchTeamDetails } = useGlobalContext()

    useEffect(() => {
        fetchTeamDetails(params?.team)
    }, [params])


    return (
        <section className='h-full w-full grid-rows-2'>

            <div className='flex items-center justify-between mini_tab:mx-10 mini_tab:px-6 px-3  py-2 mt-2 mb-1  rounded-t bg-[#b7de40e1] text-white' >

                <div className='flex flex-col'>
                    <div className='flex gap-x-1 items-center'>
                        <Link to={`/board/${params.user}/${params.team}`} className='font-bold mini_tab:text-2xl text-xl text-[#191a19] mini_tab:max-w-[24ch] max-w-[16ch] line-clamp-1'>{`${team?.name}`}</Link>
                        <h2 className='text-lg mini_tab:block hidden  font-semibold text-[#191a19] select-none'>{`( ${team?.organization_type} )`}</h2>
                    </div>

                    <div>
                        <p className='text-[#2a342c] text-base mini_tab:max-w-[46ch] max-w-[20ch] line-clamp-1'>{team?.description}</p>
                    </div>
                </div>

                <div className='flex gap-x-6'>

                    <div className='cursor-pointer' title='add member' onClick={()=>setOpenSearchMember(true)}>
                        <IoIosPersonAdd size={32} />
                    </div>

                    <Link to={`/board/${params.user}/${params.team}/edit`} className='bg-[#2e322e] px-3 text-white py-1 rounded-md cursor-pointer'>edit</Link>

                </div>

            </div>
            


            <div className=''>
                {
                    <Outlet />
                }
            </div>

            {
                openSearchMember && (
                    <SearchMember close={()=>setOpenSearchMember(false)}/>
                )
            }

        </section>
    )
}

export default TeamBoard
