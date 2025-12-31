import { Link } from 'react-router-dom'
import { useGlobalContext } from '../provider/GlobalProvider';
import RealHome from './RealHome';
import { FaAngleLeft } from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa";
import { FaSquare } from "react-icons/fa6";
import { useState } from 'react';
import LoaderPage from '../utils/LoaderPage';
import { useSelector } from 'react-redux';

const Home = () => {
  const { isLogin, homeLoading } = useGlobalContext();
  const [emailValue, setEmailValue] = useState("")

  if (isLogin === null) return null;

  return (
    <section>
      {!isLogin ? (
        <div className='bg-gradient-to-l from-blue-500 to-blue-100 overflow-y-auto hide-scrollbar h-[calc(100vh-60px)]' style={{ willChange: "transform" }}>

          <div className=' xl:grid xl:grid-cols-[1fr_550px]'>

            <div className="w-full py-8 sm:py-[80px] xl:py-[14%] px-6 custom-sm:px-10  ipad_pro:px-[110px] xl:pl-[150px] ipad_pro:pl-[160px] xl:pr-10">

              <h1 className="text-2xl sm:text-[60px] font-bold mb-3 leading-[1.2] text-[#000727]">
                Streamline Your Workflow - Collaborate in Real Time with CollabDesk
              </h1>
              <p className="text-[14px] sm:text-lg text-base font-semibold text-[#000312]">
                Empower your team to work smarter, faster, and together - wherever they are.
              </p>

              <div className="lg-real:mt-[35px] mini_tab:mt-[50px] mt-[40px] flex flex-wrap justify-center items-center lg-real:justify-start mini_tab:justify-center gap-4">
                <input
                  type="email"
                  placeholder="Enter email..."
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  className="w-[310px] bg-white md:py-[9px] py-[5px] rounded px-1.5 outline-none border text-[#07014e] border-blue-500"
                />
                <Link
                  to={"/signup"} state={{ email: emailValue }}
                  className="block bg-[#005eff] md:py-[9px] py-[5px] px-2 rounded text-white transition-all duration-150 hover:bg-[#0055e8] hover:scale-105 cursor-pointer text-center"
                >
                  get started
                </Link>
              </div>

              <div className="pt-3 lg-real:block flex mini_tab:flex-row flex-col justify-center items-center lg-real:justify-start mini_tab:justify-center text-sm leading-[1.4] text-[#000726] font-semibold">
                <p>By entering my email, I acknowledge the</p>
                <span className="underline font-semibold cursor-pointer md:inline block text-[#1f009c] pl-1 xl:pl-0">
                  CollabBoard Privacy Policy
                </span>
              </div>

            </div>

            <div className="flex-col items-center justify-center  text-center p-3 xl:p-6 relative select-none flex w-full">

              {/* Decorative stars / shapes */}
              <div className='xl:block hidden'>
                <div className="absolute top-10 right-12 text-yellow-400 text-xl animate-pulse">⭐</div>
                <div className="absolute top-14 left-4 text-blue-500 text-2xl animate-bounce">✦</div>
                <div className="absolute top-[380px] -left-10 text-blue-500 text-2xl animate-pulse">✦</div>
                <div className="absolute bottom-[100px] right-5 text-pink-500 text-3xl animate-spin-slow">✧</div>
                <div className="absolute bottom-[120px] left-4 text-green-400 text-xl animate-pulse">★</div>
              </div>

              <div className="sm:hidden block py-6 text-center">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                  Get a Professional Atmosphere
                </h1>
              </div>

              {/* Phone Mockup */}
              <div className='sm:grid xl:block grid-cols-[1fr_300px] gap-6 px-10'>

                <div className="relative w-[280px] sm:w-[360px] h-[480px] rounded-[2rem] shadow-2xl overflow-hidden border-[6px] border-gray-900 xl:border-blue-800">
                  {/* Screen */}
                  <div className="absolute inset-0  bg-gradient-to-b xl:from-transparent xl:to-transparent from-blue-200 to-blue-300 p-4 flex flex-col gap-4">

                    <h3 className="text-lg font-bold text-[#00194d]">CollabDesk</h3>

                    <div className="bg-white p-3 rounded-lg shadow-md flex items-center gap-2">
                      <span className="text-green-600 text-lg">📊</span>
                      <p className="text-sm font-semibold text-[#000727]">Track tasks & progress</p>
                    </div>

                    <div className="bg-white p-3 rounded-lg shadow-md flex items-center gap-2">
                      <span className="text-blue-600 text-lg">⏱</span>
                      <p className="text-sm font-semibold text-[#000727]">Assign tasks in real time</p>
                    </div>

                    <div className="bg-white p-3 rounded-lg shadow-md flex items-center gap-2">
                      <span className="text-orange-500 text-lg">👥</span>
                      <p className="text-sm font-semibold text-[#000727]">Create & manage teams</p>
                    </div>

                    <div className="bg-white p-3 rounded-lg shadow-md flex items-center gap-2">
                      <span className="text-purple-600 text-lg">🔑</span>
                      <p className="text-sm font-semibold text-[#000727]">Role-based access</p>
                    </div>

                    <div className="bg-white p-3 rounded-lg shadow-md flex items-center gap-2">
                      <span className="text-purple-600 text-lg">💬</span>
                      <p className="text-sm font-semibold text-[#000727]">Group and private chat</p>
                    </div>

                    <div className="bg-white p-3 rounded-full shadow-md flex items-center justify-between gap-2 mt-3">
                      <FaAngleLeft />
                      <FaSquare />
                      <FaChevronRight />
                    </div>

                  </div>
                </div>

                <div className="sm:flex flex-col items-center justify-center mb-[100px] px-4 hidden xl:hidden text-center">
                  <div className="max-w-xl">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-900 leading-tight relative inline-block">
                      Get a Professional Atmosphere
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-blue-500 rounded"></span>
                    </h1>
                    <p className="mt-5 text-gray-600 text-base sm:text-lg font-medium leading-relaxed">
                      Enhance your workspace with tools and features designed to
                      <span className="text-blue-900 font-semibold"> boost productivity </span>
                      and create a professional environment wherever you work.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* Mobile-only Links to Features and About */}
          <div className="block sm:hidden mt-8 p-4 text-center">
            <h2 className="text-[22px] font-semibold text-blue-800 mb-2">
              Learn More About CollabDesk
            </h2>
            <p className="text-gray-800 text-sm mb-6 px-6">
              Discover how CollabDesk can help your team collaborate efficiently and manage tasks seamlessly.
            </p>

            <div className="flex flex-col gap-2 px-2">
              <Link
                to="/features"
                className="block bg-blue-700 text-white py-2 px-4 hover:bg-blue-700 transition-all rounded"
              >
                Explore Features
              </Link>
              <Link
                to="/about"
                className="block bg-gray-100 text-gray-900 py-2 px-4 rounded hover:bg-gray-300 transition-all"
              >
                About CollabDesk
              </Link>
            </div>
          </div>

          <p className="text-gray-800 text-center text-sm py-3 rounded-md mt-2 leading-[1.3]">
            <strong>&copy; {new Date().getFullYear()}  CollabDesk</strong> — Empower your team to work smarter, faster, and together - wherever they are.
          </p>
        </div>
      ) : (
        <RealHome />
      )}

      {homeLoading && <LoaderPage />}

    </section>
  );
};

export default Home;
