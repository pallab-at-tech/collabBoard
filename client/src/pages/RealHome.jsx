import React , { useState } from 'react'
import { Link } from 'react-router-dom'
import { MdOutlineCreateNewFolder } from "react-icons/md";
import { MdOutlinePostAdd } from "react-icons/md";
import { MdFullscreen } from "react-icons/md";
import { RiEmojiStickerLine } from "react-icons/ri";
import CreateTeam from '../components/other/CreateTeam';
import { Outlet } from 'react-router-dom';

const RealHome = () => {

    const [openCreateTeam, setOpenCreateTeam] = useState(false)
// lg-real:grid-cols-[1fr_1fr]
    return (
        <section className='bg-gradient-to-b from-[#1b1c29] to-[#21222b] min-h-[calc(100vh-60px)]  grid  place-items-center'>

            <div className='flex flex-col gap-2  text-A-off-color text-3xl font-semibold'>

                <div onClick={()=>setOpenCreateTeam(true)} className='flex gap-1 items-center bg-[#116c20] text-white  rounded w-[250px] px-3 py-4 hover:bg-[#0f621d] transition-colors duration-150 cursor-pointer'>
                    <div className=' w-full block px-2 py-1'>create team</div>
                    <MdOutlineCreateNewFolder size={38} />
                </div>

                {/* <Link className='flex gap-1 items-center bg-[#116c20] text-white rounded w-[250px] px-3 py-4 hover:bg-[#0f621d] transition-colors duration-150'>
                    <div className=' w-full block px-2 py-1'>join team</div>
                    <MdOutlinePostAdd size={38} />
                </Link> */}

                <Link className='w-[250px] text-[#a9abaa] pt-2 text-base underline leading-[19px]'>
                    know more about our service
                </Link>

            </div>


            {/* <div className='bg-[#282932]  text-B-color text-lg font-semibold w-full h-full  lg-real:block hidden'>

                <div className='float-right p-4 cursor-pointer' title='full screen'>
                    <MdFullscreen size={28}/>
                </div>

                <div className='flex items-center justify-center h-full select-none'>

                    <div className='flex items-center gap-1'>
                        <p>You haven't join any team yet !</p>
                        <RiEmojiStickerLine size={22}/>
                    </div>
                </div>

            </div> */}


            {
                openCreateTeam && (
                    <CreateTeam close={()=>setOpenCreateTeam(false)}/>
                )
            }


        </section>
    )
}

export default RealHome
