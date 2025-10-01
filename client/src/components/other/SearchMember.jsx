import React from 'react'
import { IoIosSearch } from "react-icons/io";
import { IoIosClose } from "react-icons/io";
import searchMember from "../../assets/search-member.png"
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Axios from '../../utils/Axios';
import SummaryApi from '../../common/SummaryApi';
import { RxAvatar } from "react-icons/rx";
import { BsEmojiDizzy } from "react-icons/bs";
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGlobalContext } from '../../provider/GlobalProvider';

const SearchMember = ({ close }) => {

    const [data, setData] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [allSearchData, setallSearchData] = useState([])
    const params = useParams()

    const { socketConnection } = useGlobalContext()

    const user = useSelector(state => state.user)
    const team = useSelector(state => state.team)
    const [storeRequestTemp, setStoreRequestTemp] = useState(new Set())

    const [activeButton, setActiveButton] = useState(new Set())


    const searchUserFromServer = async (inputData) => {

        try {

            const response = await Axios({
                ...SummaryApi.user_search,
                params: {
                    searchTerm: inputData
                }
            })

            if (response?.data?.success) {
                setallSearchData(response.data?.result)
            }

            if (response?.data?.error) {
                setallSearchData(["error"])
            }

        } catch (error) {
            setallSearchData(["error"])
            console.log("error from searchUserFromServer", error)
        }
    }

    const addMember = async (userId) => {
        if (!socketConnection) return

        try {

            const newSet = new Set(activeButton)
            newSet.add(userId)
            setActiveButton(newSet)

            socketConnection.once("team_requsetSend", (data) => {
                toast.success(data?.message)
                const newSet = new Set(storeRequestTemp)
                newSet.add(userId)
                setStoreRequestTemp(newSet)
            })

            socketConnection.once("team_requestError", (data) => {
                toast.error(data?.message)
            })

            socketConnection.emit("team_request", {
                memberId: userId,
                teamId: team?._id
            })

        } catch (error) {
            console.log("sending request error", error)
        } finally {
            const newSet = new Set(activeButton)
            newSet.delete(userId)
            setActiveButton(newSet)
        }
    }

    const requestWithdrawByLeader = async (userId) => {

        if (!socketConnection) return

        try {
            const newSet = new Set(activeButton)
            newSet.add(userId)
            setActiveButton(newSet)

            socketConnection.once("request_pulled", (data) => {
                toast.success(data?.message)

                const newSet = new Set(storeRequestTemp)
                newSet.delete(userId)
                setStoreRequestTemp(newSet)
            })

            socketConnection.once("team_withDrawError", (data) => {
                toast.error(data.message)
            })

            socketConnection.emit("request_withdraw", {
                memberId : userId,
                teamId : team?._id
            })

        } catch (error) {
            console.log("error from requestWithdrawByLeader", error)
        } finally {
            const newSet = new Set(activeButton)
            newSet.delete(userId)
            setActiveButton(newSet)
        }
    }


    useEffect(() => {
        const newSet = new Set()
        team?.request_send?.forEach(element => {
            newSet.add(element?.sendTo_userId)
        });
        setStoreRequestTemp(newSet)
    }, [params?.team])


    useEffect(() => {

        const delayBounce = setTimeout(() => {
            if (data.trim()) {
                setSearchTerm(data.trim())
                searchUserFromServer(data)
                console.log("input Data", data)
            }
        }, 1500)

        return () => clearTimeout(delayBounce)

    }, [data])



    return (
        <section className='fixed right-0 left-0 top-0 bottom-0 flex flex-col items-center justify-center z-50 bg-[#152231b2] backdrop-blur-[3px]'>

            <div className='min-h-[220px] max-h-[220px] sm:min-w-[385px] min-w-[320px] bg-[#dbdbdb] px-1 relative rounded-md '>

                <h1 className='py-1 px-4 font-semibold'>Search member :</h1>

                <div className='w-fit absolute top-0.5 right-4 cursor-pointer' onClick={() => close()}>
                    <IoIosClose size={28} />
                </div>

                <div className='flex flex-col gap-y-2.5 justify-center items-center relative'>

                    <div className='absolute top-1 left-6  text-white'>
                        <IoIosSearch size={22} />
                    </div>

                    <input type="text" onChange={(e) => {
                        setData(e.target.value)
                    }}
                        className='w-[90%] bg-[#99a1afb7] outline-none h-[33px] px-2 pl-10 py-2 rounded-md'
                        placeholder='Type user-ID/name/email here ...'
                    />

                    <div className='sm:pl-[120px] pl-[100px] pr-4 w-full overflow-y-auto max-h-[145px]'>

                        <div className='px-2 w-fit'>
                            {
                                allSearchData.length > 0 && allSearchData[0] !== "error" && allSearchData.map((val, idx) => {
                                    return (
                                        <div key={`allSearchData-${idx}`} className='bg-[#bbbbbc] px-2 py-1 rounded grid sm:grid-cols-[30px_83px_1fr] grid-cols-[28px_70px_1fr] items-center sm:max-w-[226px] sm:min-w-[226px] max-w-[180px] min-w-[180px] gap-3 my-1.5'>

                                            {
                                                val?.avatar ? (
                                                    <img src={val?.avatar} alt="" className='w-[32px] h-[32px] object-cover object-center rounded-full'/>
                                                ) : (
                                                    <RxAvatar size={32} />
                                                )
                                            }

                                            <div className='flex flex-col leading-[16px] text-sm justify-start'>
                                                <p className='max-w-[11ch] truncate'>{val?.name}</p>
                                                <p className='max-w-[11ch] text-[12px] truncate'>{val?.userId}</p>
                                            </div>

                                            {
                                                storeRequestTemp.has(val?._id) ? (
                                                    <div onClick={() => requestWithdrawByLeader(val?._id)} className={`w-fit bg-[#a22d19] text-white px-1 py-0.5 rounded ${activeButton.has(val?.userId) ? "pointer-events-none" : "cursor-pointer"}`}>withdraw</div>
                                                ) : (
                                                    <div onClick={() => addMember(val?._id)} className={`text-center bg-[#19a220] text-white px-1 py-0.5 rounded cursor-pointer ${activeButton.has(val?.userId) ? "pointer-events-none" : "cursor-pointer"}`}>add</div>
                                                )
                                            }


                                        </div>
                                    )
                                })
                            }

                            {
                                allSearchData.length === 1 && allSearchData[0] === "error" && (
                                    <div className='mt-4 ml-2 flex items-center gap-1'>
                                        <p>No Result Found ?!..</p>
                                        <BsEmojiDizzy />
                                    </div>
                                )
                            }

                        </div>
                    </div>

                </div>

                <img src={searchMember} alt="" className='absolute sm:h-[140px] h-[125px] bottom-0 sm:left-0 -left-2 pointer-events-none' />

            </div>

        </section>
    )
}

export default SearchMember
