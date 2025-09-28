import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { HiOutlineDotsVertical } from "react-icons/hi";
import { useGlobalContext } from '../../provider/GlobalProvider';
import toast from 'react-hot-toast';


const TeamBoardEdit = () => {

  const teamDetails = useSelector(state => state?.team)

  const { socketConnection } = useGlobalContext()

  const [data, setData] = useState({
    teamId: teamDetails?._id,
    teamName: teamDetails?.name,
    teamAbout: teamDetails?.description
  })

  const [openSettings, setOpenSettings] = useState(new Set())
  const closeSettingWindow = useRef(null)

  const [savingDetails, setSavingDetails] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (closeSettingWindow.current && !closeSettingWindow.current.contains(event.target)) {
        const set = new Set()
        setOpenSettings(set)
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [])

  useEffect(() => {
    setData({
      teamId: teamDetails?._id,
      teamName: teamDetails?.name,
      teamAbout: teamDetails?.description
    })
  }, [teamDetails])

  // console.log("team board edit", teamDetails)

  const handleSave = async (e) => {

    e.preventDefault()
    if (!socketConnection) return

    try {
      setSavingDetails(true)

      socketConnection.once("teamDetails_updated", (data) => {
        toast.success(data?.message)
        setSavingDetails(false)
      })

      socketConnection.once("teamDetailsError", (data) => {
        toast.error(data?.message)
        setSavingDetails(false)
      })

      socketConnection.emit("updateTeamDetails", data)

    } catch (error) {
      console.log("Team details update error", error)
    }
  };

  const handleRemoveMember = (memberId) => {

  };

  const handlePromoteMember = (memberId) => {

  };

  return (
    <section className='xl:border-2 xl:bg-[#282932] xl:bg-gradient-to-r xl:from-[#0a0a1880] xl:to-transparent mt-2 xl:border-[#596982] xl:ring-1 xl:ring-[#596982] border-white overflow-y-auto hide-scrollbar min-h-[calc(100vh-182px)] max-h-[calc(100vh-182px)] px-0.5 xl:px-6 py-8 mini_tab:mx-10 rounded-b relative'>

      {/* Team Info */}
      <form onSubmit={handleSave} className='mb-6'>

        <h2 className='text-xl font-semibold text-white mb-2'>Edit Team Info</h2>
        <input
          type='text'
          value={data.teamName}
          onChange={(e) => setData((preve) => { return { ...preve, teamName: e.target.value } })}
          placeholder='Team Name'
          className='w-full p-3 mb-3 rounded-lg bg-[#32333a] text-white placeholder-gray-400 border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500  transition'
        />

        <textarea
          value={data.teamAbout}
          onChange={(e) => setData((preve) => { return { ...preve, teamAbout: e.target.value } })}
          placeholder='About Team'
          className='w-full p-3 mb-3 rounded-lg bg-[#32333a] text-white placeholder-gray-400 border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500  transition max-h-[70px] min-h-[70px]'
        />

        <button
          onClick={handleSave}
          className={`mt-2 px-4 py-2  text-white rounded-md  ${savingDetails ? "cursor-not-allowed bg-blue-500 hover:bg-blue-600" : "cursor-pointer bg-blue-600 hover:bg-blue-700"}`}
        >
          {savingDetails ? "Saving..." : "Save"}
        </button>
      </form>

      {/* generate group add link*/}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            Generate Invite Link
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <input
              type="text"
              readOnly
              // value={inviteLink}
              placeholder="Click Generate to create invite link"
              className="flex-1 p-3 rounded-lg bg-[#32333a] text-white placeholder-gray-400 border border-[#3a3b45] focus:outline-none"
            />

            <div className='flex gap-2 items-center'>
              <button
                // onClick={handleGenerateLink}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
              >
                Generate
              </button>
              <button
                // onClick={handleCopyLink}
                // disabled={!inviteLink}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 cursor-pointer"
              >
                Copy
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Team Members */}
      <div>
        <h2 className='text-xl font-semibold text-white mb-2'>Team Members</h2>
        <ul className='space-y-2'>

          {
            teamDetails?.member.map((m, i) => {
              return (
                <li key={m?._id} className='flex items-center justify-between bg-[#203264] px-4 py-3 rounded-lg'>
                  <div>
                    <span className='font-semibold text-white'>{m?.userName}</span>{' '}
                    <span className='text-[#819196]'>({m?.role})</span>
                  </div>

                  <div className='flex gap-2'>

                    {
                      m?.role !== "LEADER" && (
                        <>
                          <button
                            // onClick={() => handlePromoteMember(member.id)}
                            className='px-2 py-1 hidden sm:block bg-green-700 text-white rounded-lg hover:bg-green-800 transition duration-200 cursor-pointer'
                          >
                            Make Leader
                          </button>

                          <div className='relative block sm:hidden'>
                            <HiOutlineDotsVertical size={20} className='text-white text-[20px]'
                              onClick={() => {
                                const set = new Set(openSettings)
                                set.add(m?._id)
                                setOpenSettings(set)
                              }}
                            />
                            <div ref={closeSettingWindow} className={`absolute bg-white -top-12 -left-[100px] px-3 py-3 rounded-md ${openSettings.has(m?._id) ? "block" : "hidden"}`}>
                              <p className='border-b-1 border-b-gray-300 pb-1'>Make Admin</p>
                              <p>Remove</p>
                            </div>
                          </div>
                        </>
                      )
                    }

                    {
                      m?.role !== "LEADER" && (
                        <button
                          // onClick={() => handleRemoveMember(member.id)}
                          className='px-2 py-1 hidden sm:block bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 cursor-pointer'
                        >
                          Remove
                        </button>
                      )
                    }

                  </div>
                </li>
              )
            })
          }

        </ul>
      </div>
    </section>
  );
};

export default TeamBoardEdit;
