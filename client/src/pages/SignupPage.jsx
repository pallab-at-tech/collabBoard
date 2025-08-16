import React, { useState } from 'react'
import sign_in from "../assets/sin1.png"
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'


const SignupPage = () => {

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  const navigate = useNavigate()
  const [pointerNone, setPointerNone] = useState(false)

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
      else if(error?.response?.data?.message === "please provide name , email and password"){
        toast.error("please provide name , email and password")
      }

    } finally {
      setPointerNone(false)
    }
  }

  return (
    <section className='bg-[#00001f] relative min-h-screen min-w-screen max-w-screen max-h-screen lg-real:px-[7%] lg-real:py-[6%] grid lg-real:grid-cols-2 gap-0'>

      <div className='overflow-hidden rounded-l-2xl lg-real:block hidden relative z-50'>
        <img src={sign_in} alt="" className='h-full object-cover overflow-hidden ' />
      </div>

      <div className='w-full h-full bg-[#9fb1f3] lg-real:rounded-r-2xl lg-real:rounded-l-none  relative z-50'>

        <form onSubmit={handleOnSubmit} className='flex flex-col items-center justify-center h-full w-full gap-1'>

          <h1 className='lg-real:text-3xl lg_md:text-4xl  mini_tab:text-3xl text-2xl font-bold text-[#000727] my-2'>Welcome</h1>

          <div className='group text-lg'>
            <p className='font-semibold group-hover:scale-y-105 transition-all duration-500 group-hover:-translate-y-1'>Name : </p>
            <input type="text" onChange={handleChange} name='name' value={data.name} required className='bg-[#dce0f1] rounded lg-real:w-[320px] mini_tab:w-[320px] lg_md:w-[390px] w-[250px] h-8 text-base outline-none p-2 mt-1 text-[#100f0f]' />
          </div>

          <div className='group text-lg'>
            <p className='font-semibold group-hover:scale-y-105 transition-all duration-500 group-hover:-translate-y-1'>Email : </p>
            <input type="email" onChange={handleChange} name='email' value={data.email} required className='bg-[#dce0f1] rounded lg-real:w-[320px] mini_tab:w-[320px] lg_md:w-[390px] w-[250px] h-8 text-base outline-none p-2 mt-1 text-[#100f0f]' />
          </div>

          <div className='group text-lg'>
            <p className='font-semibold group-hover:scale-y-105 transition-all duration-500 group-hover:-translate-y-1'>Password : </p>
            <input type="text" onChange={handleChange} name='password' value={data.password} required className='bg-[#dce0f1] lg-real:w-[320px] mini_tab:w-[320px] lg_md:w-[390px] w-[250px]  h-8 text-base outline-none p-2 mt-1 text-[#100f0f]' />
          </div>

          <div className='group text-lg'>
            <p className='font-semibold group-hover:scale-y-105 transition-all duration-500 group-hover:-translate-y-1'>Confirm Password : </p>
            <input type="text" onChange={handleChange} name='confirmPassword' value={data.confirmPassword} required className='bg-[#dce0f1] rounded lg-real:w-[320px] mini_tab:w-[320px] lg_md:w-[390px] w-[250px] h-8 text-base outline-none p-2 mt-1 text-[#100f0f]' />
          </div>

          <div className='flex flex-col gap-1'>
            <button className={`p-2  lg-real:w-[320px] mini_tab:w-[320px] lg_md:w-[390px] w-[250px] bg-[#1c45a4] text-[#d1cece]  lg-real:mt-2 lg_md:mt-3 mini_tab:mt-2 mt-2 rounded  font-semibold ${pointerNone ? "pointer-events-none" : "cursor-pointer"}`}>sign up</button>

            <div className='flex text-sm gap-1'>
              <p className='text-[#1c45a4] font-semibold'>Already have account ?</p>
              <Link to={"/login"} className='underline font-semibold'>sign in</Link>
            </div>

          </div>

        </form>

      </div>

      <div className='absolute min-h-full min-w-full blur-3xl z-0  bg-gradient-to-t from-[#0f1c2e] to-[#3a4b91]'></div>

    </section>
  )
}

export default SignupPage
