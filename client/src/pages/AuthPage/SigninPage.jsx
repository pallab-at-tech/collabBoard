import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Axios from '../../utils/Axios'
import SummaryApi from '../../common/SummaryApi'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { setUserDetails } from '../../store/userSlice'
import fetchUserDetails from '../../utils/fetchUserDetails'
import { useGlobalContext } from '../../provider/GlobalProvider'
import yourLogo from "../../assets/logo1.png"
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';

const SigninPage = () => {

    const [data, setData] = useState({
        email: "",
        password: ""
    })
    const navigate = useNavigate()

    const [pointerNone, setPointerNone] = useState(false)
    const dispatch = useDispatch()
    const { loginUser } = useGlobalContext();
    const [passwordShow, setPasswordShow] = useState(false)

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
        <section className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
            {/* Left Side - Form */}
            <div className="flex items-center justify-center p-8">
                <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 space-y-6">

                    {/* Logo */}
                    <div className="flex items-center gap-x-2 mb-6">
                        <img src={yourLogo} alt="CollabDesk Logo" className="h-12 w-12" />
                        <h1 className="text-3xl font-bold text-[#000727] mb-1.5">CollabDesk</h1>
                    </div>

                    {/* Welcome */}
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800">Welcome Back!</h2>
                        <p className="text-gray-500 text-sm">Sign in to continue to your account.</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleOnSubmit} className="flex flex-col space-y-4">
                        {/* Email */}
                        <div className="relative">
                            <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={handleChange}
                                required
                                placeholder="Email Address"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#005eff] focus:border-[#005eff] transition-all"
                            />
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />

                            {
                                !passwordShow ? (
                                    <input
                                        type="text"
                                        name="password"
                                        value={data.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="Password"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#005eff] focus:border-[#005eff] transition-all"
                                    />
                                ) : (
                                    <input
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="Password"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#005eff] focus:border-[#005eff] transition-all"
                                    />
                                )
                            }
                            {
                                passwordShow ? (
                                    <FaEye onClick={() => setPasswordShow(!passwordShow)} size={20} className='absolute right-6 top-4 cursor-pointer' />
                                ) : (
                                    <FaEyeSlash onClick={() => setPasswordShow(!passwordShow)} size={20} className='absolute right-6 top-4 cursor-pointer' />
                                )
                            }
                        </div>

                        {/* Options */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-gray-600">
                                <input type="checkbox" className="h-4 w-4 text-[#005eff] border-gray-300 rounded" />
                                Remember me
                            </label>
                            <Link to="" className="font-medium text-[#005eff] hover:underline">
                                Forgot Password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button className={`w-full bg-[#005eff] text-white py-3 rounded-lg font-semibold hover:bg-[#0040b3] transition ${pointerNone ? "cursor-not-allowed" : "cursor-pointer"}`}>
                            Sign In
                        </button>
                    </form>

                    {/* Signup Link */}
                    <div className="text-center text-sm text-gray-600">
                        Don’t have an account?{" "}
                        <Link to="/signup" className="font-semibold text-[#005eff] hover:underline">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Hero Section */}
            <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-[#000727] to-[#000d4a] p-12 text-center">
                <div className="max-w-md flex items-center flex-col">
                    <h3 className="text-white text-4xl font-bold">Join the Future of Collaboration</h3>
                    <p className="text-gray-300 mt-4 mb-6 text-sm">Manage your tasks, teams, and projects seamlessly in one place.</p>
                    <Link to={"/signup"} className="bg-white block w-1/3 text-[#000727] px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 hover:scale-[102%] transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg">
                        Get Started
                    </Link>
                </div>
            </div>
        </section>

    )

}

export default SigninPage