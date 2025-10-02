import React, { useState } from 'react'
import sign_in from "../assets/sin1.png"
import { Link, useNavigate } from 'react-router-dom'
import Axios from "../utils/Axios"
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { setUserDetails } from '../store/userSlice'
import fetchUserDetails from '../utils/fetchUserDetails'
import { useGlobalContext } from '../provider/GlobalProvider'




const SigninPage = () => {

    const [data, setData] = useState({
        email: "",
        password: ""
    })
    const navigate = useNavigate()

    const [pointerNone, setPointerNone] = useState(false)
    const dispatch = useDispatch()
    const { loginUser } = useGlobalContext();

    const handleChange = (e) => {
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

            setPointerNone(true)

            const response = await Axios({
                ...SummaryApi.login,
                data: data
            })


            if (response?.data?.error) {
                toast.error(response?.data?.message)
            }


            if (response?.data?.success) {
                toast.success(response?.data?.message)
                localStorage.setItem('accesstoken', response.data.data.accessToken)
                localStorage.setItem('refreshToken', response.data.data.refreshToken)


                loginUser()


                const userDetails = await fetchUserDetails()
                dispatch(setUserDetails(userDetails?.data))


                setData({
                    email: "",
                    password: ""
                })

                navigate("/")
            }

        } catch (error) {

            if (error?.response?.data?.message === "please provide email and password") {
                toast.error("please provide email and password")
            }
            else if (error?.response?.data?.message === "provide email not registered") {
                toast.error("provide email not registered")
            }
            else if ("please enter right password") {
                toast.error("wrong password")
            }
        } finally {
            setPointerNone(false)
        }
    }

    return (
        <section className='bg-[#00001f] relative min-h-screen min-w-screen max-w-screen max-h-screen lg-real:px-[7%] lg-real:py-[6%]  grid lg-real:grid-cols-2 gap-0'>


            <div className='overflow-hidden rounded-l-2xl lg-real:block hidden relative z-50'>
                <img src={sign_in} alt="" className='h-full object-cover overflow-hidden ' />
            </div>

            <div className='w-full h-full bg-[#9fb1f3] lg-real:rounded-r-2xl lg-real:rounded-l-none  relative z-50'>

                <form onSubmit={handleOnSubmit} className='flex flex-col items-center justify-center h-full w-full gap-1'>
                    <h1 className='lg-real:text-3xl lg_md:text-4xl  mini_tab:text-3xl text-2xl font-bold text-[#000727] my-2'>Welcome Your Account</h1>

                    <div className='group text-lg'>
                        <p className='font-semibold group-hover:scale-y-105 transition-all duration-500 group-hover:-translate-y-1'>Email : </p>
                        <input type="email" onChange={handleChange} name='email' value={data.email} required className='bg-[#dce0f1] rounded lg-real:w-[320px] mini_tab:w-[320px] lg_md:w-[390px] w-[250px] h-8 text-base outline-none p-2 mt-1 text-[#100f0f]' />
                    </div>

                    <div className='group text-lg'>
                        <p className='font-semibold group-hover:scale-y-105 transition-all duration-500 group-hover:-translate-y-1'>Password : </p>
                        <input type="text" onChange={handleChange} name='password' value={data.password} required className='bg-[#dce0f1] lg-real:w-[320px] mini_tab:w-[320px] lg_md:w-[390px] w-[250px]  h-8 text-base outline-none p-2 mt-1 text-[#100f0f]' />
                    </div>

                    <div className='flex flex-col gap-1'>
                        <button className={`p-2  lg-real:w-[320px] mini_tab:w-[320px] lg_md:w-[390px] w-[250px]  bg-[#1c45a4] text-[#dce0f1]  lg-real:mt-2 lg_md:mt-3 mini_tab:mt-2 mt-2  rounded  font-semibold ${pointerNone ? "pointer-events-none" : "cursor-pointer"}`}>Login</button>
                        <Link className='text-[#1c45a4] text-sm pr-6 font-semibold'>Forgot Password ?</Link>

                        <div className='flex text-sm gap-1'>
                            <p className='text-[#1c45a4] font-semibold'>Don't have account ?</p>
                            <Link to={"/signup"} className='underline font-semibold'>sign up</Link>
                        </div>
                    </div>

                </form>

            </div>

            <div className='absolute min-h-full min-w-full blur-3xl z-0  bg-gradient-to-t from-[#0f1c2e] to-[#3a4b91]'>
            </div>

        </section>
    )
}

export default SigninPage
