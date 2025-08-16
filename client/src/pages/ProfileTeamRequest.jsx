import React from 'react'
import { useSelector } from 'react-redux'
import { SiTicktick } from "react-icons/si";
import { RxCross2 } from "react-icons/rx";
import Axios from "../utils/Axios"
import SummaryApi from '../common/SummaryApi';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useGlobalContext } from '../provider/GlobalProvider';

const ProfileTeamRequest = () => {

    const user = useSelector(state => state.user)

    const [loading, setLoading] = useState(false)

    const { fetchUserAllDetails } = useGlobalContext()

    const handleRequestAccept = async (requestedBy_id, requestedBy_userId, teamId, teamName) => {
        try {

            setLoading(true)

            const response = await Axios({
                ...SummaryApi.request_acceptBY_user,
                data: {
                    requestedBy_id: requestedBy_id,
                    requestedBy_userId: requestedBy_userId,
                    teamId: teamId,
                    teamName: teamName
                }
            })

            const { data: responseData } = response

            if (responseData?.error) {
                toast.error(responseData?.message)
            }

            if (responseData?.success) {

                toast.success(responseData?.message)
                fetchUserAllDetails()
            }


        } catch (error) {
            console.log("error from handleRequestAccept", error)
        } finally {
            setLoading(false)
        }
    }

    const handleRequestCancel = async (requestedBy_id, requestedBy_userId, teamId, teamName) => {
        try {

            setLoading(true)

            const response = await Axios({
                ...SummaryApi.request_cancelBY_user,
                data: {
                    requestedBy_id: requestedBy_id,
                    requestedBy_userId: requestedBy_userId,
                    teamId: teamId,
                    teamName: teamName
                }
            })

            const { data: responseData } = response

            if (responseData?.error) {
                toast.error(responseData?.message)
            }

            if (responseData?.success) {
                toast.success(responseData?.message)
                fetchUserAllDetails()
            }


        } catch (error) {
            console.log("error from handleRequestCancel", error)
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className='py-3 px-1'>

            <h1 className='text-2xl pt-2 pb-4 font-bold'>Team request</h1>

            {
                user?.request?.length === 0 ? (
                    <div className='text-[#9e9e9e]'>
                        Have no request yet !
                    </div>
                ) : (
                    <div className='max-w-[400px]'>
                        {
                            user?.request?.map((v, i) => {
                                return (
                                    <div className='px-6 py-3 bg-[#a31083] hover:bg-[#9c0b7d] border border-[#ded5dc] transition-colors duration-150 rounded-xl flex sm:flex-row flex-col sm:items-center sm:justify-between max-w-[72%] my-2.5'>

                                        <div className='flex flex-col justify-between'>
                                            <h1 className='font-semibold text-[22px] pb-[1px]'>{v?.teamName}</h1>
                                            <div className='text-[13px] sm:leading-[14px] leading-[14px] text-[#d6d6d6] opacity-[70%] font-[600] sm:mb-0 mb-2.5'>
                                                <p>{`request send by ,`}</p>
                                                <p>{v?.requestedBy_userId}</p>
                                            </div>
                                        </div>

                                        <div className='flex sm:flex-col gap-2 text-sm items-center'>

                                            <div onClick={() => {
                                                handleRequestAccept(v?.requestedBy_id, v?.requestedBy_userId, v?.teamId, v?.teamName)
                                            }}
                                                className={`flex items-center justify-center gap-2 bg-[#ebbeec] hover:bg-[#eab1eb] transition-colors duration-150 text-black px-2 py-1 rounded-md sm:rounded-lg ${loading ? "pointer-events-none" : "cursor-pointer"} w-full`}
                                            >
                                                <p>accept</p>
                                                <SiTicktick size={16} />
                                            </div>

                                            <div onClick={() => {
                                                handleRequestCancel(v?.requestedBy_id, v?.requestedBy_userId, v?.teamId, v?.teamName)
                                            }}
                                                className={`flex items-center gap-1 justify-center bg-[#ebbeec] hover:bg-[#eab1eb] transition-colors duration-150 text-black px-2 py-1 rounded-md sm:rounded-lg ${loading ? "pointer-events-none" : "cursor-pointer"} w-full`}
                                            >
                                                <p>reject</p>
                                                <RxCross2 size={18} />
                                            </div>
                                        </div>

                                    </div>
                                )
                            })
                        }
                    </div>
                )
            }

        </div>
    )
}

export default ProfileTeamRequest
