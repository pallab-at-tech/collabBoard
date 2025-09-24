import React, { useEffect, useRef, useState } from 'react'
import { FaCalendarAlt, FaFileAlt } from 'react-icons/fa'
import { FaClock, FaImage, FaLink, FaPaperPlane, FaUser, FaVideo } from 'react-icons/fa6'
import { LuFullscreen } from "react-icons/lu";
import { useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import UpdateReport from './UpdateReport';
import { PiEyesBold } from "react-icons/pi";
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import { RxCross2 } from "react-icons/rx";

// A small, reusable component for displaying metadata in the sidebar
const MetadataItem = ({ icon, label, value }) => (
  <div className="mb-4">
    <div className="flex items-center gap-2 text-sm text-gray-400">
      {icon}
      <span>{label}</span>
    </div>
    <p className="mt-1 text-md font-semibold text-gray-200">{value || "N/A"}</p>
  </div>
);

const SeparateTabForTask = () => {

  const data = useLocation().state.val
  const columnId = useLocation().state.columnId
  const teamId = useLocation().state.teamId
  const report = useLocation().state.report
  const isLeader = useLocation().state.isLeader

  const navigate = useNavigate()

  const [fullImage, setFullImage] = useState(false)
  const imageDropRef = useRef(null)

  const [fullVideo, setFullVideo] = useState(false)
  const videoDropRef = useRef(null)

  const [lineClampConfig, setLineClampConfig] = useState(false)
  const [isReportSubmitted, setIsReportSubmitted] = useState(false)
  const [openReportWindow, setOpenReportWindow] = useState(false)

  const [seeReport, setSeeReport] = useState(false)
  const reportRef = useRef(null)

  const user = useSelector(state => state.user)

  const [reportData, setReportData] = useState(null)
  const [updateData, setUpdateData] = useState({
    update: false
  })

  if (!data) {
    return (
      <section className="bg-gray-900 min-h-[calc(100vh-60px)]  flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Task Not Found</h1>
          <p className="text-gray-400 mt-2">
            No task data was provided. Please go back and select a task.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 bg-emerald-600 hover:bg-emerald-700 cursor-pointer text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </section>
    );
  }

  useEffect(() => {
    const clickOutSideOfImage = (event) => {
      if (imageDropRef.current && !imageDropRef.current.contains(event.target)) {
        setFullImage(false)
      }
    }

    document.addEventListener("mousedown", clickOutSideOfImage);
    return () => {
      document.removeEventListener("mousedown", clickOutSideOfImage);
    };
  }, [])

  useEffect(() => {
    const clickOutSideOfVideo = (event) => {
      if (videoDropRef.current && !videoDropRef.current.contains(event.target)) {
        setFullVideo(false)
      }
    }

    document.addEventListener("mousedown", clickOutSideOfVideo);
    return () => {
      document.removeEventListener("mousedown", clickOutSideOfVideo);
    };
  }, [])

  // handle click outside
  useEffect(() => {

    const handleClickOutside = (event) => {
      if (reportRef.current && !reportRef.current.contains(event.target)) {
        setSeeReport(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }

  }, [])

  useEffect(() => {
    const x = report.some((m) => m?.taskId === data?._id)
    setIsReportSubmitted(x)
    return () => {
      localStorage.removeItem("success")
      localStorage.removeItem("report")
    }
  }, [])

  // fetch report data
  useEffect(() => {

    const fetchReport = async () => {
      if (!report) return

      try {
        const response = await Axios({
          ...SummaryApi.fetch_task_report,
          params: {
            reportId: report[0]?.report_id || ""
          }
        })
        const { data: responseData } = response

        if (responseData.success) {
          setReportData(responseData?.report)
        }

      } catch (error) {
        console.log("report fetch error", error)
      }
    }

    fetchReport()

  }, [updateData.update,updateData])

  useEffect(() => {

    const x = localStorage.getItem("report")
    const reportObj = x ? JSON.parse(x) : null;

    if (reportObj) {
      setReportData(reportObj)
    }

  }, [isReportSubmitted])



  return (
    <section className='bg-gradient-to-r from-[#21242e] xl:from-[#181b29] via-[#21232d] to-[#22232b] min-h-[calc(100vh-60px)] xl:grid xl:grid-cols-[3fr_1fr] relative '>

      {/* main Description section */}
      <div className='py-6 xl:pb-10 pb-5 xl:px-10 px-5'>

        {/* Header */}
        <div className="pb-4 mb-6 border-b border-gray-600">
          <h1 className="text-3xl font-bold text-[#6f89ef]">{data?.title}</h1>
          {/* <p className="text-xs text-gray-500 mt-2">Task ID: {data?._id}</p> */}
        </div>

        {/* Description */}
        <div className="mb-8">

          <h2 className="flex items-center gap-3 text-xl sm:text-[22px] font-semibold text-gray-200">
            <FaFileAlt className="text-[#6f89ef]" />
            Description
          </h2>

          <p className={`text-gray-300 mt-3 text-[14px] sm:text-[17px] leading-relaxed ${!lineClampConfig && "line-clamp-6"}`}>
            {data?.description || "N/A"}
          </p>

          {/* Toggle Button */}
          {data?.description?.length > 200 && (
            <button
              onClick={() => setLineClampConfig(!lineClampConfig)}
              className="mt-2 text-blue-400 hover:text-emerald-300 text-sm font-medium cursor-pointer"
            >
              {lineClampConfig ? "Show Less" : "Read More"}
            </button>
          )}

        </div>

        {/* Attachments Section */}
        <div className='mb-8'>

          <h2 className="flex items-center gap-3 text-xl sm:text-[22px] font-semibold text-gray-200 mb-4">
            Attachments
          </h2>

          {data?.image && (
            <div className="mb-6">

              <h3 className="flex w-[250px] items-center justify-between gap-2 text-md font-medium text-[#6f89ef] mb-2">
                <div className='flex gap-2 items-center'>
                  <FaImage size={25} /> Image
                </div>
                <LuFullscreen size={22} className='mr-14 cursor-pointer' title='full Screen' onClick={() => setFullImage(true)} />
              </h3>

              <img
                src={data?.image}
                alt="Task attachment"
                className="rounded-lg w-[200px] object-contain border-2 border-gray-700"
              />
            </div>
          )}

          {data?.video && (
            <div className="mb-6">

              <h3 className="flex w-[250px] items-center justify-between gap-2 text-md font-medium text-[#6f89ef] mb-2">
                <div className='flex gap-2 items-center'>
                  <FaVideo /> Video
                </div>
                <LuFullscreen size={22} className='mr-14 cursor-pointer' title='full Screen' onClick={() => setFullVideo(true)} />
              </h3>

              <video
                src={data?.video}
                controls
                className="rounded-lg w-[200px] object-contain border-2 border-gray-700"
              />
            </div>
          )}

          {!data?.image && !data?.video && (
            <p className="text-gray-400 text-sm">No image or video attached.</p>
          )}

        </div>

        {/* Additional Links */}
        <div>

          <h2 className="flex items-center gap-3 text-xl sm:text-[22px] font-semibold text-gray-200">
            <FaLink className="text-[#6f89ef]" />
            Additional Links
          </h2>

          {data?.aditional_link?.length > 0 ? (
            <ul className="mt-3 space-y-2 list-disc list-inside marker:text-emerald-400 pl-8">
              {data?.aditional_link.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 hover:underline transition-colors break-all"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 mt-3 text-sm">No links provided.</p>
          )}

        </div>

      </div>

      {/* Other section */}
      <div className='xl:min-h-[calc(100vh-60px)] xl:max-h-[calc(100vh-60px)] xl:sticky top-[60px] bg-gradient-to-r from-[#21242e] via-[#21232d] to-[#22232b]  xl:from-[#1b1e2d] xl:via-[#171923] xl:to-[#171923] sm:p-8 xl:px-10 px-5 py-8  overflow-y-auto lg:border-l lg:border-gray-700 '>

        <h2 className="text-[22px] font-bold text-white text-center mb-6 border-b border-gray-600 pb-2">
          Task Details
        </h2>

        <MetadataItem
          icon={<FaCalendarAlt className="text-[#91a6fd]" />}
          label="Due Date"
          value={data?.dueDate}
        />
        <MetadataItem
          icon={<FaClock className="text-[#91a6fd]" />}
          label="Due Time"
          value={data?.dueTime}
        />
        <MetadataItem
          icon={<FaUser className="text-[#91a6fd]" />}
          label="Assigned By"
          value={data?.assignby}
        />

        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <FaUser className="text-[#91a6fd]" />
            <span>Assigned To</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.assignTo?.length > 0 ? (
              data.assignTo.map((assignee, i) => (
                <span
                  key={i}
                  className="text-blue-200 bg-[#1e379d]  text-xs font-semibold px-3 py-1 rounded-full"
                >
                  {assignee}
                </span>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No one assigned</p>
            )}
          </div>
        </div>

        {/* Report Button */}
        <div className="mb-auto pt-6 border-t border-gray-700">
          {
            isLeader ? (
              isReportSubmitted ? (

                <div className="flex items-center justify-between flex-wrap bg-[#1f2230] border border-gray-700 p-3 rounded-md">
                  {/* Left section */}
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-400">Report Status</span>
                    <span className="text-green-400 font-semibold">{`Submitted by ${reportData?.submitByUserId}`}</span>
                  </div>

                  {/* Right action */}
                  <button onClick={() => setSeeReport(true)}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-500 text-sm font-medium cursor-pointer"
                  >
                    <PiEyesBold className="text-lg" />
                    See Report
                  </button>
                </div>

              ) : (
                <div className="flex items-center justify-between bg-[#1f2230] border border-gray-700 p-3 rounded-md">
                  <span className="text-red-400 font-medium">❌ No submission yet</span>
                </div>
              )
            ) : (
              <>
                <Link to={`report`} state={{ columnId: columnId, taskId: data?._id, teamId: teamId }}

                  className={`w-full ${isReportSubmitted || localStorage.getItem("success") === "success" ? "hidden" : "block"} cursor-pointer bg-[#3751b8] hover:bg-[#243c9c] text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-md transition-transform hover:scale-105`}
                >
                  <FaPaperPlane /> Submit Report
                </Link>

                <div
                  className={`${isReportSubmitted || localStorage.getItem("success") === "success"
                    ? "block"
                    : "hidden"
                    } bg-[#1f2230] border border-gray-700 rounded-md p-4 space-y-2`}
                >
                  {/* Preview button */}
                  <div
                    onClick={() => setOpenReportWindow(true)}
                    className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md flex items-center justify-center gap-2 text-sm transition-transform hover:scale-105"
                  >
                    <PiEyesBold className="text-lg" />
                    Preview
                  </div>

                  {/* Submitted by info */}
                  <div className="text-gray-300 text-sm">
                    Submitted by <span className="font-medium text-white">{`${user?._id === reportData?.submitBy ? "you" : reportData?.submitByUserId}`}</span>
                  </div>
                </div>

              </>
            )
          }
        </div>

      </div>

      {
        fullImage && data?.image && (
          <section className='fixed inset-0 flex items-center justify-center z-50 bg-black/60'>

            <div className=''>
              <img ref={imageDropRef} src={data?.image} alt="" className='sm:w-[600px] w-[330px] transform transition duration-[300ms] scale-100' />
            </div>

          </section>
        )
      }

      {
        fullVideo && data?.video && (
          <section className='fixed inset-0 flex items-center justify-center z-50 bg-black/60'>

            <div>
              <video ref={videoDropRef} src={data?.video} controls className='sm:w-[600px] w-[330px] transform transition duration-[300ms] scale-100' ></video>
            </div>

          </section>
        )
      }

      {/* report window for update report */}
      {
        openReportWindow && (
          <UpdateReport
            onClose={() => setOpenReportWindow(false)}
            data={reportData}
            setUpdateData={setUpdateData}
            externalData={{
              teamId: teamId,
              columnId: columnId,
              taskId: data?._id,
              userName: user?.userId
            }}
          />
        )
      }

      {/* see report for who assign ( leader ) */}
      {
        seeReport && (
          <section className="fixed right-0 left-0 top-[60px] bottom-0 flex flex-col items-center justify-center z-50 bg-[#1e2e465e]">

            <div ref={reportRef} className="bg-[#f5f9ff] max-h-[500px] relative rounded-2xl shadow-lg p-6 w-[90%] sm:w-[450px] max-w-2xl overflow-y-auto hide-scrollbar">

              <RxCross2 size={25} className='absolute top-2 right-2 text-blue-950 hover:text-blue-700 transition-colors duration-300 cursor-pointer' onClick={() => setSeeReport(false)} />

              <h2 className="text-xl font-semibold mb-4">Report</h2>

              {/* Text */}
              {reportData?.text && (
                <p className="text-gray-700 mb-3">
                  <span className="font-medium text-gray-950">Message: </span>
                  {reportData?.text}
                </p>
              )}

              {/* Image */}
              {reportData?.image && reportData?.image !== "" && (
                <div className="mb-3">
                  <span className="font-medium text-gray-950">Image: </span>
                  <a
                    href={reportData?.image}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 hover:text-emerald-500 hover:underline transition-colors break-all underline"
                  >
                    See image
                  </a>
                </div>
              )}

              {/* Video */}
              {reportData?.video && reportData?.video !== "" && (
                <div className="mb-3">
                  <span className="font-medium text-gray-950">Video: </span>
                  <a
                    href={reportData?.video}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 hover:text-emerald-500 hover:underline transition-colors break-all underline"
                  >
                    See Video
                  </a>
                </div>
              )}

              {/* Additional Links */}
              {reportData.aditional_link &&
                reportData.aditional_link.filter((link) => link.url && link.name).length > 0 && (
                  <ul className="list-disc list-inside my-2">
                    <h1>Provided links</h1>
                    {reportData.aditional_link
                      .filter((link) => link.url && link.name)
                      .map((link, i) => (
                        <li key={i}>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            {link.name}
                          </a>
                        </li>
                      ))}
                  </ul>
                )
              }

              {/* Meta Info */}
              <div className="text-sm text-gray-500 border-t border-t-[#2536764e] pt-3">
                <p>
                  <span className="font-medium">Submitted By:</span>{" "}
                  {reportData?.submitByUserId}
                </p>
                <p>
                  <span className="font-medium">Created At:</span>{" "}
                  {new Date(reportData?.createdAt).toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Updated At:</span>{" "}
                  {new Date(reportData?.updatedAt).toLocaleString()}
                </p>
              </div>

            </div>

          </section>
        )
      }


    </section>
  )
}

export default SeparateTabForTask
