import React, { useEffect, useState } from 'react'
import { IoIosClose, IoIosSearch } from 'react-icons/io'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { RxAvatar } from 'react-icons/rx'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

const SearchNewMember = ({ close }) => {

    const [data, setData] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [allSearchData, setallSearchData] = useState([])

    const userId = useSelector(state => state.user?.userId)
    const chatData = useSelector(state => state.chat?.all_message)


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

    useEffect(() => {

        const delayBounce = setTimeout(() => {
            if (data.trim()) {
                setSearchTerm(data.trim())
                searchUserFromServer(data)
            }
        }, 1500)

        return () => clearTimeout(delayBounce)

    }, [data])


    console.log("url xheck chat",chatData)
    const urlFind = (val) =>{

        const filterData = chatData.filter(preve => {
           return preve.group_type === "PRIVATE" && preve?.otherUser?.userId === val?.userId
        })

        return filterData[0]?._id
    }


    return (
        <section className='fixed inset-0 flex items-center justify-center z-50 bg-black/60'>

            <form className='bg-[#e2e2e2] min-h-[220px] max-h-[220px]  sm:min-w-[385px] min-w-[350px] rounded-2xl  px-1 relative'>

                <h1 className='py-1 pt-2 px-5 font-semibold text-lg'>Find New Member :</h1>

                <div className='w-fit absolute top-0.5 right-4 cursor-pointer' onClick={() => close()}>
                    <IoIosClose size={32} />
                </div>

                <div className='flex flex-col gap-y-2.5 justify-center items-center relative'>

                    <div className='absolute top-1 left-6  text-white'>
                        <IoIosSearch size={22} />
                    </div>

                    <input type="text" onChange={(e) => {
                        setData(e.target.value)
                    }}
                        className='w-[90%] bg-[#8b8b8b6c] outline-none h-[30px] px-2 pl-10 py-2 rounded-md'
                        placeholder='Type user-ID/name/email here ...'
                    />

                    <div className="w-full overflow-y-auto max-h-[145px] px-4 py-2  rounded-lg shadow-inner">
                        {allSearchData.length > 0 && allSearchData[0] !== "error" ? (
                            allSearchData.map((val, idx) => {

                                const url = urlFind(val)

                                return (
                                    (
                                        val?.userId !== userId ? (
                                            <Link to={`/chat/${url || val?._id}`}

                                                onClick={() => {
                                                    close()
                                                }}

                                                key={`new member - ${idx}`}
                                                state={{
                                                    allMessageDetails: {
                                                        otherUser: val
                                                    }
                                                }}

                                                className="flex items-center gap-3 p-2 rounded-md bg-[#2a2a32] hover:bg-[#3b3b46] transition-colors cursor-pointer my-1.5"
                                            >

                                                <RxAvatar
                                                    size={36}
                                                    className="text-gray-300 border border-gray-500 rounded-full p-1"
                                                />

                                                <div className="flex flex-col leading-tight text-sm text-gray-200">
                                                    <p className="font-medium text-white max-w-[14ch] truncate">
                                                        {val?.name}
                                                    </p>
                                                    <p className="text-[12px] text-gray-400 max-w-[14ch] truncate">
                                                        {val?.userId}
                                                    </p>
                                                </div>
                                            </Link>
                                        ) : (
                                            <p className="text-gray-400 text-sm p-2">No results found</p>
                                        )
                                    )
                                )
                            })
                        ) : (
                            <p className="text-gray-400 text-sm p-2">No results found</p>
                        )}


                    </div>

                </div>

            </form>

        </section>
    )
}

export default SearchNewMember
