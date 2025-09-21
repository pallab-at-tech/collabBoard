import React, { useEffect, useState } from "react";
import { FaPlus, FaTrash, FaPaperPlane } from "react-icons/fa6";
import uploadFile from "../utils/uploadFile";
import { RxCross2 } from "react-icons/rx";
import { useGlobalContext } from "../provider/GlobalProvider";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const SubmitTaskReport = () => {

    const [links, setLinks] = useState([{ name: "", url: "" }]);
    const [loading, setLoading] = useState(false);
    const { socketConnection } = useGlobalContext()

    const user = useSelector(state => state?.user)

    const location = useLocation()

    const [data, setData] = useState({
        teamId: location.state?.teamId || "",
        columnId: location.state?.columnId || "",
        taskId: location.state?.taskId || "",
        userName: user?.userId || "",
        text: "",
        image: "",
        video: "",
        links: {},
    })

    useEffect(() => {
        setData((preve) => {
            return {
                ...preve,
                userName: user?.userId
            }
        })
    }, [user])

    const navigate = useNavigate()

    const [loadingPhoto, setloadingPhoto] = useState(false)
    const [loadingVideo, setloadingVideo] = useState(false)

    const handleLinkChange = (index, field, value) => {
        const updatedLinks = [...links];
        updatedLinks[index][field] = value;
        setLinks(updatedLinks);
    };

    const addLink = () => setLinks([...links, { name: "", url: "" }]);
    const removeLink = (index) => setLinks(links.filter((_, i) => i !== index));

    const handleOnPhoto = async (e) => {
        const file = e.target.files?.[0]

        if (!file) return

        setloadingPhoto(true)

        const response = await uploadFile(file)

        setloadingPhoto(false)

        setData((preve) => {
            return {
                ...preve,
                image: response?.secure_url
            }
        })
    }

    const handleOnVideo = async (e) => {
        const file = e.target.files?.[0]

        if (!file) return

        setloadingVideo(true)

        const response = await uploadFile(file)

        setloadingVideo(false)

        setData((preve) => {
            return {
                ...preve,
                video: response?.secure_url
            }
        })
    }

    const filterGoodObject = () => {
        const goodObj = links.filter((m) => m.name && m.url)

        setData((preve) => {
            return {
                ...preve,
                links: goodObj
            }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!socketConnection) return
        setLoading(true);
        filterGoodObject()

        try {

            socketConnection.once("report-submitted", (data) => {
                // console.log("data message",data)
                toast.success(data?.message)
                setLoading(false)
                setData({
                    teamId: "",
                    columnId: "",
                    taskId: "",
                    userName: "",
                    text: "",
                    image: "",
                    video: "",
                    links: {},
                })
                navigate(-1)
                localStorage.setItem("success", "success")
            })

            socketConnection.once("reportError", (data) => {
                toast.error(data?.message)
                setLoading(false)
            })

            socketConnection.emit("report-submit", data)

        } catch (err) {
            console.error(err);
            setLoading(false)
        }
    };


    // console.log("report data", location.state)

    return (
        <section className="min-h-[calc(100vh-60px)] bg-gradient-to-r from-[#21242e] xl:from-[#181b29] via-[#21232d] to-[#22232b] px-8 py-4 text-gray-200">
            <h1 className="text-2xl font-bold text-[#6f89ef] mb-5 text-center">
                Submit Task Report
            </h1>

            <form className="max-w-3xl mx-auto space-y-6" onSubmit={handleSubmit}>
                {/* Text */}
                <div>
                    <label className="block mb-2 font-semibold">Report Text</label>
                    <textarea
                        value={data.text}
                        onChange={(e) => setData((preve) => { return { ...preve, text: e.target.value } })}
                        placeholder="Describe your work..."
                        className="w-full p-3 rounded-md bg-gray-800 text-gray-200  border-2 border-gray-500 hover:border-[#6f89ef] resize-none outline-none"
                        rows={6}
                        required
                    />
                </div>

                {/* Image and video*/}
                <div className="flex gap-4 mt-6">
                    {/* Image Upload */}
                    <label className="flex flex-col items-center bg-gray-800 justify-center w-40 h-28 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-[#6f89ef] hover:bg-gray-800/40 transition relative overflow-hidden">

                        {loadingPhoto ? (
                            <div className="flex flex-col items-center justify-center h-full w-full text-gray-400">
                                <svg
                                    className="animate-spin h-6 w-6 text-[#6f89ef]"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    ></path>
                                </svg>
                                <span className="text-sm mt-2">Uploading...</span>
                            </div>
                        ) : data.image ? (
                            <div className="relative h-full w-full">
                                <img
                                    src={data.image}
                                    alt="Uploaded preview"
                                    className="h-full w-full object-cover rounded-lg"
                                />

                                {/* Remove button */}
                                <button
                                    type="button"
                                    onClick={() => setData((prev) => ({ ...prev, image: "" }))}
                                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-red-500 transition"
                                >
                                    <RxCross2 />
                                </button>

                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center text-sm text-white rounded-lg transition">
                                    Change Image
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-gray-400">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8 text-[#6f89ef] mb-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 7l6-4 6 4 6-4v14a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                                    />
                                </svg>
                                <span className="text-sm font-medium">Add Image</span>
                            </div>
                        )}

                        {/* Hidden File Input */}
                        <input
                            onChange={handleOnPhoto}
                            type="file"
                            accept="image/*"
                            className="hidden"
                        />
                    </label>


                    {/* Video Upload */}
                    <label className="flex flex-col bg-gray-800 items-center justify-center w-40 h-28 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-[#6f89ef] hover:bg-gray-800/40 transition relative overflow-hidden">

                        {loadingVideo ? (
                            // 🔄 Loading spinner
                            <div className="flex flex-col items-center justify-center h-full w-full text-gray-400">
                                <svg
                                    className="animate-spin h-6 w-6 text-[#6f89ef]"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    ></path>
                                </svg>
                                <span className="text-sm mt-2">Uploading...</span>
                            </div>
                        ) : data.video ? (
                            // 🎥 Video Preview
                            <div className="relative h-full w-full">
                                <video
                                    src={data.video}
                                    className="h-full w-full object-cover rounded-lg"
                                ></video>

                                {/* Remove button */}
                                <button
                                    type="button"
                                    onClick={() => setData((prev) => ({ ...prev, video: "" }))}
                                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-red-500 transition"
                                >
                                    <RxCross2 />
                                </button>

                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center text-sm text-white rounded-lg transition">
                                    Change Video
                                </div>
                            </div>
                        ) : (
                            // 📥 Upload Placeholder
                            <div className="flex flex-col items-center text-gray-400">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8 text-[#6f89ef] mb-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6h8M4 10h8M4 14h4"
                                    />
                                </svg>
                                <span className="text-sm font-medium">Add Video</span>
                            </div>
                        )}

                        {/* Hidden File Input */}
                        <input
                            onChange={handleOnVideo}
                            type="file"
                            accept="video/*"
                            className="hidden"
                        />
                    </label>

                </div>

                {/* Additional Links */}
                <div>
                    <label className="block mb-2 font-semibold text-gray-200">
                        Additional Links
                    </label>

                    {links.map((link, index) => (
                        <div
                            key={index}
                            className="flex flex-col sm:flex-row gap-2 mb-2 w-full"
                        >
                            {/* Link Name */}
                            <input
                                type="text"
                                value={link.name}
                                onChange={(e) => handleLinkChange(index, "name", e.target.value)}
                                placeholder="Link name"
                                className="w-full sm:w-1/3 p-2 rounded-md bg-gray-800 text-gray-200 border border-gray-500 hover:border-[#6f89ef] outline-none"
                            />

                            {/* Link URL */}
                            <input
                                type="text"
                                value={link.url}
                                onChange={(e) => handleLinkChange(index, "url", e.target.value)}
                                placeholder="Link URL"
                                className="w-full sm:flex-1 p-2 rounded-md bg-gray-800 text-gray-200 border border-gray-500 hover:border-[#6f89ef] outline-none"
                            />

                            {/* Delete Button */}
                            <button
                                type="button"
                                onClick={() => removeLink(index)}
                                className="text-red-500 hover:text-red-400  self-start sm:self-center"
                            >
                                <FaTrash className="sm:block hidden" />
                                <button className="sm:hidden block">Delete</button>
                            </button>
                        </div>
                    ))}

                    {/* Add Button */}
                    <button
                        type="button"
                        onClick={addLink}
                        className="mt-2 flex items-center gap-2 text-[#6f89ef] hover:text-[#5d77dd] cursor-pointer"
                    >
                        <FaPlus /> Add Link
                    </button>
                </div>


                {/* Submit Button */}
                <div>
                    <p className="text-sm py-1.5 text-[#97aaf7]">Once you submit you can't remove submit again , may you edit later.</p>
                    <button
                        type="submit"
                        className={`w-full bg-[#2a48c1] hover:bg-[#243c9c] ${(loading || loadingPhoto || loadingVideo) ? "cursor-not-allowed" : "cursor-pointer"} text-white py-3 px-4 rounded-lg mt-0 flex items-center justify-center gap-2 font-bold `}
                    >
                        <FaPaperPlane />
                        {loading ? "Submitting..." : "Submit Report"}
                    </button>
                </div>

            </form>

        </section>
    );
};

export default SubmitTaskReport;
