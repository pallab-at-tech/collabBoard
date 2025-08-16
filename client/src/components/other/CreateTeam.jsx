import React from 'react'
import design_bg from "../../assets/design-page.jpg"
import { IoMdCloseCircleOutline } from "react-icons/io";
import { useState } from 'react';
import toast from 'react-hot-toast'
import Axios from '../../utils/Axios';
import SummaryApi from '../../common/SummaryApi';
import { useDispatch } from 'react-redux';
import { setUserDetails } from '../../store/userSlice';
import fetchUserDetails from '../../utils/fetchUserDetails';

const CreateTeam = ({ close }) => {

    const [data, setData] = useState({
        name: "",
        description: "",
        organization_type: ""
    })
    const [activeButton, setactiveButton] = useState(true)
    const dispatch = useDispatch()

    const allOrganizationTypes = [
        "Engineering-IT", "Student", "Healthcare-Dept", "Government employee", "Manufacturing-Dept", "other"
    ]

    const handleOnChange = (e) => {

        const { name, value } = e.target

        setData((preve) => {
            return {
                ...preve,
                [name]: value
            }
        })
    }

    const handleOnSubmit = async (e) => {
        e.preventDefault()

        try {
            setactiveButton(false)

            const response = await Axios({
                ...SummaryApi.team_create,
                data: data
            })

            if (response?.data?.error) {
                toast.error(response?.data?.message)
            }

            if (response?.data?.success) {
                toast.success(response?.data?.message)
                setData({
                    name: "",
                    description: "",
                    organization_type: ""
                })

                const userDetails = await fetchUserDetails()
                dispatch(setUserDetails(userDetails?.data))
                close()
            }

        } catch (error) {
            toast.error(error?.response?.data?.message)
        }
        finally {
            setactiveButton(true)
        }
    }

    return (
        <section className='fixed top-0 bottom-0 left-0 right-0 bg-neutral-900/70 z-50 flex items-center justify-center'>

            <div
                className='bg-[#fff] text-black grid ipad_pro:grid-cols-[600px_200px] overflow-hidden ipad_pro:min-h-[470px] mx-10 relative'
                style={{
                    backgroundImage: `url(${design_bg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: '35px center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <div className='flex justify-center items-center mini_tab:pr-[40%] mini_tab:p-12 p-6'>
                    <form onSubmit={handleOnSubmit} className='flex flex-col gap-2.5'>

                        <div>
                            <h1 className='font-bold text-xl pb-0.5'>Let's build a team,</h1>
                            <p className='text-sm leading-[18px] opacity-[80%]'>Bring together passionate minds, collaborate with purpose, and build something meaningful — one team, one vision, one goal.</p>
                        </div>

                        <div>
                            <p className='font-semibold pb-1'>Team Name : </p>
                            <input onChange={handleOnChange} type="text" placeholder='Enter team name...' name='name' value={data.name} required className='border-[1px] px-2 py-0.5 rounded border-black/50 w-full' />
                        </div>

                        <div>
                            <p className='font-semibold pb-2'>organization type :</p>
                            <select onChange={(e) => {
                                const val = e.target.value
                                setData((preve) => {
                                    return {
                                        ...preve,
                                        organization_type: val
                                    }
                                })
                            }} name="description"
                                required
                                className='border-[1px] border-black/50 px-1 py-0.5'
                            >

                                <option value="select one" disabled selected>select one</option>

                                {
                                    allOrganizationTypes.map((v, i) => {
                                        return (
                                            <option key={`Organization-${v}-${i}`} value={`${v}`}>{v}</option>
                                        )
                                    })
                                }

                            </select>
                        </div>

                        <div>
                            <p className='font-semibold pb-1'>Team description <span className='text-black/50 select-none'>optional</span></p>
                            <textarea onChange={handleOnChange} name="description" value={data.description} className='border-[1px] px-2 py-2 rounded border-black/50 w-full max-h-[80px] min-h-[80px]' placeholder='Enter description...'></textarea>
                        </div>

                        <button className={`${activeButton ? "bg-[#086444]   hover:bg-[#07583c] transition-colors duration-150 cursor-pointer" : "bg-[#0b855a] hover:bg-[#09714d] pointer-events-none"} py-2 rounded mt-1  font-semibold text-gray-200`}>Continue</button>
                    </form>
                </div>

                <div className='w-fit absolute right-0 pr-6 pt-2'>
                    <IoMdCloseCircleOutline className='float-right cursor-pointer' size={28} onClick={() => close()} />
                </div>
            </div>

        </section>
    )
}

export default CreateTeam
