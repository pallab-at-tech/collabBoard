import React from 'react'
import collab_banner from "../assets/collab-banner.png"
import { Link } from 'react-router-dom'
import { useGlobalContext } from '../provider/GlobalProvider';
import RealHome from './RealHome';

const Home = () => {
  const { isLogin } = useGlobalContext(); 

  if (isLogin === null) return null; 

  return (
    <section
      className={`${isLogin
          ? "bg-A-color"
          : "bg-gradient-to-t to-[var(--primary-color)] from-[#aab8ed]"
        } lg_md:min-h-[calc(100vh-60px)] min-h-[calc(100vh-60px)] relative`}
    >
      {!isLogin ? (
        <div>
          <div className="lg-real:p-[4%] lg_md:pl-[140px] lg-real:max-w-[75%] w-full lg_md:px-[15%] md:px-[10%] md:py-[8%] px-[5%] py-[10%]">
            <h1 className="md:text-5xl font-bold mb-3 leading-[1.2] text-2xl text-[#000727]">
              Streamline Your Workflow - Collaborate in Real Time with CollabDesk
            </h1>
            <p className="md:text-lg text-base font-semibold text-[#000312]">
              Empower your team to work smarter, faster, and together - wherever they are.
            </p>

            <div className="lg-real:mt-[35px] mini_tab:mt-[50px] mt-[40px] flex flex-wrap justify-center items-center lg-real:justify-start mini_tab:justify-center gap-4">
              <input
                type="email"
                placeholder="Enter email..."
                className="w-[310px] bg-white md:py-[9px] py-[5px] rounded px-1.5 outline-[#00061d]"
              />
              <Link
                to={"/signup"}
                className="block bg-[#005eff] md:py-[9px] py-[5px] px-2 rounded text-white transition-all duration-150 hover:bg-[#0055e8] hover:scale-105 cursor-pointer text-center"
              >
                get started
              </Link>
            </div>

            <div className="pt-3 lg-real:block flex mini_tab:flex-row flex-col justify-center items-center lg-real:justify-start mini_tab:justify-center text-sm leading-[1.5] text-[#000312]">
              <p>By entering my email, I acknowledge the</p>
              <span className="underline font-semibold cursor-pointer pl-1 md:inline block">
                CollabBoard Privacy Policy
              </span>
            </div>
          </div>

          {/* for window version */}
          <div className="lg-real:block hidden">
            <div className="absolute top-[50px] right-0">
              <div className="w-fit">
                <img src={collab_banner} alt="" className="h-[75vh]" />
              </div>
            </div>
          </div>

          {/* for tab version */}
          <div className="mini_tab:flex justify-center lg-real:hidden hidden w-full">
            <div>
              <img src={collab_banner} alt="" className="h-[55vh]" />
            </div>
          </div>

          {/* for mobile version */}
          <div className="flex md:hidden justify-center">
            <div>
              <img src={collab_banner} alt="" className="h-[45vh]" />
            </div>
          </div>
        </div>
      ) : (
        <RealHome />
      )}
    </section>
  );
};

export default Home;
