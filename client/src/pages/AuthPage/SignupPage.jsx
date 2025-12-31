import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Axios from '../../utils/Axios'
import SummaryApi from '../../common/SummaryApi'
import yourLogo from "../../assets/logo1.png"
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';
import { HiOutlineUser } from 'react-icons/hi'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useLocation } from 'react-router-dom'

const SignupPage = () => {

    const location = useLocation()

    const [data, setData] = useState({
        name: "",
        email: location.state?.email || "",
        password: "",
        confirmPassword: ""
    })

    const navigate = useNavigate()
    const [pointerNone, setPointerNone] = useState(false)
    const [passwordShow, setPasswordShow] = useState(false)

    const [boxTick, setBoxTick] = useState(false)

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

        if (!boxTick) return

        if (data.password !== data.confirmPassword) {
            toast.error("Password and confirm password must be same")
            return
        }

        try {

            setPointerNone(true)

            const response = await Axios({
                ...SummaryApi.register,
                data: data
            })

            if (response.data?.error) {
                toast.error(response?.data?.message)
            }

            if (response.data?.success) {
                toast.success(response?.data?.message)
                setData({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: ""
                })
                navigate("/login")
            }

        } catch (error) {
            if (error?.response?.data?.message === "user already registered with your provided email") {
                toast.error("user already registered with your provided email")
            }
            else if (error?.response?.data?.message === "please provide name , email and password") {
                toast.error("please provide name , email and password")
            }

        } finally {
            setPointerNone(false)
        }
    }

    return (
        <section className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">

            {/* Left Side - Sign Up Form */}
            <div className="flex items-center justify-center p-8">
                <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 space-y-6">

                    {/* Logo */}
                    <div className="flex items-center gap-x-2 mb-4">
                        <img src={yourLogo} alt="CollabDesk Logo" className="h-12 w-12" />
                        <h1 className="text-3xl font-bold text-[#000727] mb-1.5">CollabDesk</h1>
                    </div>

                    {/* Welcome */}
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800">Create Your Account</h2>
                        <p className="text-gray-500 text-sm">Sign up to get started with CollabDesk.</p>
                    </div>

                    {/* Sign Up Form */}
                    <form onSubmit={handleOnSubmit} className="flex flex-col space-y-4">
                        {/* Name */}
                        <div className="relative">
                            <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                value={data.name}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#005eff] focus:border-[#005eff] transition"
                            />
                        </div>

                        {/* Email */}
                        <div className="relative">
                            <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={data.email}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#005eff] focus:border-[#005eff] transition"
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
                                        placeholder="Password"
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#005eff] focus:border-[#005eff] transition"
                                    />
                                ) : (
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Password"
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#005eff] focus:border-[#005eff] transition"
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

                        {/* Confirm Password */}
                        <div className="relative">
                            <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            {
                                !passwordShow ? (
                                    <input
                                        type="text"
                                        name="confirmPassword"
                                        placeholder="Confirm Password"
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#005eff] focus:border-[#005eff] transition"
                                    />
                                ) : (
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirm Password"
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#005eff] focus:border-[#005eff] transition"
                                    />
                                )
                            }

                        </div>

                        {/* Terms & Conditions */}
                        <label className="flex flex-col sm:flex-row gap-2 text-gray-600 text-sm">

                            <div className='flex gap-2'>
                                <input type="checkbox" required onChange={() => setBoxTick(true)} className="h-4 w-4 text-[#005eff] border-gray-300 rounded mt-0.5" />
                                <p>I agree to the <span className="text-[#005eff] hover:underline cursor-pointer">Terms & Conditions</span></p>
                            </div>

                        </label>

                        {/* Sign Up Button */}
                        <button className={`w-full ${pointerNone || !data.name || !data.email || !data.password || !data.confirmPassword || !boxTick ? "cursor-not-allowed bg-[#1f6ef6]" : "cursor-pointer bg-[#005eff]"}  text-white py-3 rounded-lg font-semibold hover:bg-[#0040b3] hover:scale-105 transition-transform duration-300 shadow-md hover:shadow-lg`}>
                            Sign Up
                        </button>
                    </form>

                    {/* Already have an account */}
                    <div className="text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-[#005eff] hover:underline">
                            Sign In
                        </Link>
                    </div>

                </div>
            </div>

            {/* Right Side - Hero Section */}
            <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-[#000727] to-[#000d4a] p-12 text-center">
                <div className="max-w-md">
                    <h3 className="text-white text-4xl font-bold">Collaborate Smarter</h3>
                    <p className="text-gray-300 mt-4 text-sm">
                        Create teams, manage projects, and track tasks efficiently—all in one platform.
                    </p>
                    <Link
                        to="/login"
                        className="mt-6 inline-block bg-white text-[#000727] px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 hover:scale-105 transition-transform duration-300 shadow-md hover:shadow-lg"
                    >
                        Sign In
                    </Link>
                </div>
            </div>

        </section>
    )
}


export default SignupPage