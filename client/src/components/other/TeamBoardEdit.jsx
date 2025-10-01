import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { HiOutlineDotsVertical } from "react-icons/hi";
import { useGlobalContext } from '../../provider/GlobalProvider';
import toast from 'react-hot-toast';


const TeamBoardEdit = () => {

  const teamDetails = useSelector(state => state?.team)
  const user = useSelector(state => state?.user)

  const { socketConnection } = useGlobalContext()

  const [data, setData] = useState({
    teamId: teamDetails?._id,
    teamName: teamDetails?.name,
    teamAbout: teamDetails?.description
  })

  const [openSettings, setOpenSettings] = useState(new Set())
  const closeSettingWindow = useRef({})

  const [currUserLeader, setCurrUserLeader] = useState(false)

  const [savingDetails, setSavingDetails] = useState(false)
  const [adminLoading, setAdminLoading] = useState(false)
  const [demoteLoading, setDemoteLoading] = useState(false)
  const [removeLoading, setRemoveLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const [generatingInvite, setGeneratingInvite] = useState({
    loading: false,
    token: ""
  })

  // close setting of admin , remove window.
  useEffect(() => {
    const handleClickOutside = (event) => {
      let clickedInside = false

      // loop through all refs
      Object.values(closeSettingWindow.current).forEach((ref) => {
        if (ref && ref.contains(event.target)) {
          clickedInside = true
        }
      })

      if (!clickedInside) {
        setOpenSettings(new Set()) // close all menus
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // manage data accoding to changes
  useEffect(() => {
    setData({
      teamId: teamDetails?._id,
      teamName: teamDetails?.name,
      teamAbout: teamDetails?.description
    })
  }, [teamDetails])

  useEffect(() => {
    if (!teamDetails) return
    const isLeader = teamDetails.member.some((m) => m.userId === user._id && m.role === "LEADER")

    if (isLeader) {
      setCurrUserLeader(true)
    }
    else {
      setCurrUserLeader(false)
    }
  }, [teamDetails])

  // edit the team info
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
      setSavingDetails(false)
    }
  };

  // promote team members
  const handlePromoteMember = (memberId) => {

    if (!socketConnection) return

    try {

      setAdminLoading(true)

      socketConnection.once("adminSuccess", (data) => {
        toast.success(data?.message)
        const set = new Set()
        setOpenSettings(set)
        setAdminLoading(false)
      })

      socketConnection.once("adminMakeError", (data) => {
        toast.error(data?.message)
        setAdminLoading(false)
      })

      socketConnection.emit("makeAdminOfTeam", {
        memberId: memberId,
        teamId: teamDetails?._id
      })

    } catch (error) {
      console.log("Error for promote member", error)
      setAdminLoading(false)
    }
  };

  // demote team members
  const handleDemoteMember = (memberId) => {

    if (!socketConnection) return

    try {

      setDemoteLoading(true)

      socketConnection.once("demoteSuccess", (data) => {
        toast.success(data?.message)
        const set = new Set()
        setOpenSettings(set)
        setDemoteLoading(false)
      })

      socketConnection.once("demotedError", (data) => {
        toast.error(data?.message)
        setDemoteLoading(false)
      })

      socketConnection.emit("demoteOfMember", {
        memberId: memberId,
        teamId: teamDetails?._id
      })

    } catch (error) {
      console.log("Demoted member error", error)
      setDemoteLoading(false)
    }
  };

  // removed from the team
  const handleRemoveMember = (memberId) => {

    if (!socketConnection) return

    try {
      setRemoveLoading(true)

      socketConnection.once("kickOutSuccess", (data) => {
        toast.success(data?.message)
        setRemoveLoading(false)
      })

      socketConnection.once("kickedOutError", (data) => {
        toast.error(data?.message)
        setRemoveLoading(false)
      })

      socketConnection.emit("KickedOUtFromTeam", {
        memberId: memberId,
        teamId: teamDetails?._id
      })

    } catch (error) {
      console.log("Exit from the team Error", error)
      setRemoveLoading(false)
    }
  }

  // generate code
  const handleGenerateCode = () => {

    if (!socketConnection) return

    try {

      setGeneratingInvite((prev) => {
        return {
          ...prev,
          loading: true
        }
      })

      socketConnection.once("invited_link", (data) => {
        toast.success(data?.message)
        setGeneratingInvite({
          loading: false,
          token: data?.token
        })
        localStorage.setItem("inviteToken", data?.token)
      })

      socketConnection.once("team_inviteError", (data) => {
        toast.error(data?.message)
        setGeneratingInvite((prev) => {
          return {
            ...prev,
            loading: false
          }
        })
      })

      socketConnection.emit("generate_team_link", {
        teamId: data.teamId
      })

    } catch (error) {
      console.log("Generate Code Error", error)
    }
  }

  // copy in clipBoard
  const copyInClipBoard = async (text) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
      toast.success("Copied to clipboard!")
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy")
    }
  }

  useEffect(() => {
    setGeneratingInvite((prev) => {
      return {
        ...prev,
        token: localStorage.getItem("inviteToken") || ""
      }
    })

    return () => localStorage.removeItem("inviteToken")
  }, [])


  console.log("team board edit", teamDetails)

  return (
    <section className='xl:border-2 xl:bg-[#282932] xl:bg-gradient-to-r xl:from-[#0a0a1880] xl:to-transparent mt-2 xl:border-[#596982] xl:ring-1 xl:ring-[#596982] border-white overflow-y-auto hide-scrollbar min-h-[calc(100vh-182px)] max-h-[calc(100vh-182px)] px-0.5 xl:px-6 py-8 mini_tab:mx-10 rounded-b relative'>

      {/* Team Info */}
      <form onSubmit={handleSave} className='mb-6'>

        <h2 className='text-xl font-semibold text-white mb-2'>Team Info</h2>

        {
          !currUserLeader ? (
            <>
              <div className='w-full p-3 mb-3 rounded-lg bg-[#32333a] text-white'>
                {data.teamName}
              </div>

              <div className='w-full p-3 mb-3 rounded-lg bg-[#32333a] text-white'>
                {data.teamAbout}
              </div>
            </>
          ) : (
            <>
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
            </>
          )
        }

      </form>

      {/* generate group add link*/}
      {
        currUserLeader && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">
                Generate Invite Code
              </h2>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <input
                  type="text"
                  readOnly
                  value={generatingInvite.token}
                  placeholder="Click Generate to create invite code"
                  className="flex-1 p-3 rounded-lg bg-[#32333a] text-white placeholder-gray-400 border border-[#3a3b45] focus:outline-none"
                />

                <div className='flex gap-2 items-center'>
                  <div
                    className="px-3 py-3 w-[140px] flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {
                      generatingInvite.loading ? (
                        <div className='loadingCircle cursor-not-allowed'></div>
                      ) : (
                        <button className='cursor-pointer' onClick={handleGenerateCode}>
                          {generatingInvite.token ? "Generate Again" : "Generate"}
                        </button>
                      )
                    }

                  </div>
                  <button
                    onClick={() => copyInClipBoard(generatingInvite.token)}
                    className={`px-4 py-3 bg-green-600 text-white rounded-lg transition cursor-pointer duration-300 relative 
                                ${copied ? "bg-green-700 scale-105" : "hover:bg-green-700"}
                              `}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>

                </div>

              </div>

              <p className="text-[13px] text-gray-400 mb-2 pt-1">
                ** This invite code is valid for <span className="font-semibold text-gray-200">7 days</span> and can be used by up to <span className="font-semibold text-gray-200">10 members</span>.
              </p>
            </div>

          </div>
        )
      }

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
                      currUserLeader && user?._id !== m?.userId && (
                        <>

                          {
                            m?.role === "MEMBER" ? (
                              <button
                                onClick={() => handlePromoteMember(m?.userId)}
                                className={`px-2 py-1 hidden sm:block bg-green-700 text-white rounded-lg hover:bg-green-800 transition duration-200 ${adminLoading ? "cursor-not-allowed" : "cursor-pointer"}`}
                              >
                                Promote role
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDemoteMember(m?.userId)}
                                className={`px-2 py-1 hidden sm:block bg-green-700 text-white rounded-lg hover:bg-green-800 transition duration-200 ${demoteLoading ? "cursor-not-allowed" : "cursor-pointer"}`}
                              >
                                Demote role
                              </button>
                            )
                          }


                          <div className='relative block sm:hidden'>
                            <HiOutlineDotsVertical size={20} className='text-white text-[20px]'
                              onClick={() => {
                                const set = new Set(openSettings)
                                set.add(m?._id)
                                setOpenSettings(set)
                              }}
                            />
                            <div ref={(el) => (closeSettingWindow.current[m?._id] = el)} className={`absolute bg-white -top-12 -left-[100px] px-3 py-3 rounded-md h-[77px] w-[125px] ${openSettings.has(m?._id) ? "block" : "hidden"}`}>
                              {
                                m?.role === "MEMBER" ? (
                                  <p onClick={() => handlePromoteMember(m?.userId)} className={`border-b-1 border-b-gray-300 pb-1 block ${(adminLoading || removeLoading || demoteLoading) ? "cursor-not-allowed" : "cursor-pointer"}`}>Promote role</p>
                                ) : (
                                  <p onClick={() => handleDemoteMember(m?.userId)} className={`border-b-1 border-b-gray-300 pb-1 block ${(adminLoading || removeLoading || demoteLoading) ? "cursor-not-allowed" : "cursor-pointer"}`}>Demote role</p>
                                )
                              }

                              <p onClick={() => handleRemoveMember(m?.userId)} className={`${(adminLoading || removeLoading || demoteLoading) ? "cursor-not-allowed" : "cursor-pointer"}`}>Remove</p>
                            </div>
                          </div>
                        </>
                      )
                    }

                    {
                      currUserLeader && user?._id !== m?.userId && (
                        <button
                          onClick={() => handleRemoveMember(m?.userId)}
                          className={`px-2 py-1 hidden sm:block bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 ${(adminLoading || removeLoading || demoteLoading) ? "cursor-not-allowed" : "cursor-pointer"}`}
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
