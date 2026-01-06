import React, { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { FaTrash } from "react-icons/fa";
import uploadFile from "../../utils/uploadFile";
import { useGlobalContext } from "../../provider/GlobalProvider";
import toast from "react-hot-toast";


const UpdateReport = ({ data, onClose, setUpdateData, externalData }) => {

    const [formData, setFormData] = useState({

        columnId: externalData.columnId,
        teamId: externalData.teamId,
        taskId: externalData.taskId,
        userName: externalData.userName,
        reportId: data?._id,

        text: data?.text || "",
        image: data?.image || "",
        video: data?.video || "",
        aditional_link: data?.aditional_link || [],
    });

    const [loadingPhoto, setloadingPhoto] = useState(false)
    const [loadingVideo, setloadingVideo] = useState(false)
    const [loading, setLoading] = useState(false)

    const { socketConnection } = useGlobalContext()

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleOnPhoto = async (e) => {
        const file = e.target.files?.[0]

        if (!file) return

        setloadingPhoto(true)

        const response = await uploadFile(file)

        setloadingPhoto(false)

        setFormData((preve) => {
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

        setFormData((preve) => {
            return {
                ...preve,
                video: response?.secure_url
            }
        })
    }

    const handleLinkChange = (index, field, value) => {
        const updatedLinks = [...formData.aditional_link];
        updatedLinks[index][field] = value
        setFormData((prev) => ({ ...prev, aditional_link: updatedLinks }));
    };

    const addLink = () => {
        setFormData((prev) => ({
            ...prev,
            aditional_link: [...prev.aditional_link, { name: "", url: "" }],
        }));
    };

    const removeLink = (index) => {
        const updatedLinks = [...formData.aditional_link];
        const x = updatedLinks.filter(((_, i) => i !== index))
        setFormData((prev) => ({ ...prev, aditional_link: x }));
    };

    const handleSubmit = (e) => {

        e.preventDefault();
        if (!socketConnection) return

        setLoading(true)

        const filteredLinks = formData.aditional_link.filter(
            (l) => l && (l.name || "").trim() && (l.url || "").trim()
        );


        const finalData = {
            ...formData,
            aditional_link: filteredLinks,
        };

        try {

            socketConnection.once("report-updatted", (data) => {

                setLoading(false)
                toast.success(data?.message)

                setUpdateData({
                    update: true
                })
                onClose()
            })

            socketConnection.once("reportSubmitError", (data) => {
                console.log("reportSubmitError", data)
                toast.error(data?.message)
                setLoading(false)
            })

            socketConnection.emit("update-report", finalData)

        } catch (error) {
            console.log("Report update error", error)
            setLoading(false)
        }
    };

    return (
        <section className="fixed top-[60px] right-0 left-0 bottom-0 z-50 flex items-center justify-center bg-blue-950/10 backdrop-blur-sm px-8">

            <div className="bg-[#f8f8f9] rounded-2xl shadow-lg p-6 w-full max-h-[450px] sm:max-h-[540px] overflow-y-auto hide-scrollbar max-w-lg animate-fadeIn">

                {/* Header */}
                <h2 className="text-2xl font-semibold mb-6 text-center text-blue-800">
                    Update Report
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">

                    {/* Text */}
                    <div>
                        <label className="block text-[18px] font-medium text-blue-800 mb-1">
                            Text
                        </label>
                        <input
                            type="text"
                            name="text"
                            value={formData.text}
                            onChange={handleChange}
                            className="w-full border-2 text-[#121212] text-[18px] border-blue-600 rounded-lg px-3 py-2 focus:ring-1 focus:ring-blue-600 outline-none"
                            placeholder="Enter Text here ..."
                            required
                        />
                    </div>

                    {/* upload image and video */}
                    <div className="flex gap-4 mt-6">

                        <label className="flex flex-col items-center justify-center w-40 h-28 border-2 border-dashed border-blue-800 bg-[#dde4fb] rounded-xl cursor-pointer  transition relative overflow-hidden">

                            {loadingPhoto ? (
                                <div className="flex flex-col items-center justify-center h-full w-full ">
                                    <svg
                                        className="animate-spin h-6 w-6 text-blue-800"
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
                                    <span className="text-sm mt-2 text-blue-800">Uploading...</span>
                                </div>
                            ) : formData.image ? (
                                <div className="relative h-full w-full">
                                    <img
                                        src={formData.image}
                                        alt="Uploaded preview"
                                        className="h-full w-full object-cover rounded-lg"
                                    />

                                    {/* Remove button */}
                                    <button
                                        type="button"
                                        onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                                        className="absolute top-2 right-2 z-10 cursor-pointer bg-black/60 text-white rounded-full p-1 hover:bg-red-500 transition"
                                    >
                                        <RxCross2 />
                                    </button>

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center text-sm text-white rounded-lg transition">
                                        Change Image
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-8 w-8 text-blue-800 mb-2"
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
                                    <span className="text-sm font-medium text-blue-800">Add Image</span>
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

                        <label className="flex flex-col bg-[#dde4fb] items-center justify-center w-40 h-28 border-2 border-dashed border-blue-800 rounded-xl cursor-pointer transition relative overflow-hidden">

                            {loadingVideo ? (
                                <div className="flex flex-col items-center justify-center h-full w-full">
                                    <svg
                                        className="animate-spin h-6 w-6 text-blue-800"
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
                                    <span className="text-sm mt-2 text-blue-800">Uploading...</span>
                                </div>
                            ) : formData.video ? (
                                <div className="relative h-full w-full">
                                    <video
                                        src={formData.video}
                                        className="h-full w-full object-cover rounded-lg"
                                    ></video>

                                    {/* Remove button */}
                                    <button
                                        type="button"
                                        onClick={() => setFormData((prev) => ({ ...prev, video: "" }))}
                                        className="absolute z-10 top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-red-500 transition"
                                    >
                                        <RxCross2 className="cursor-pointer" />
                                    </button>

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center text-sm text-white rounded-lg transition">
                                        Change Video
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-blue-800">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-8 w-8 text-blue-800 mb-2"
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
                        <label className="block text-[18px] font-medium text-blue-800 mb-2">
                            Additional Links
                        </label>

                        {formData?.aditional_link.map((link, index) => (
                            <div
                                key={index}
                                className="w-full sm:grid sm:grid-cols-[1fr_20px] justify-center items-center gap-x-2"
                            >
                                <div className="flex flex-col sm:flex-row gap-2 mb-2 w-full">

                                    {/* Link Name */}
                                    <input
                                        type="text"
                                        value={link.name}
                                        onChange={(e) => handleLinkChange(index, "name", e.target.value)}
                                        placeholder="Link name"
                                        className="w-full block border-2 text-[#121212] text-[18px] border-blue-600  p-2 rounded-md focus:ring-1 focus:ring-blue-600  outline-none"
                                    />

                                    {/* Link URL */}
                                    <input
                                        type="text"
                                        value={link.url}
                                        onChange={(e) => handleLinkChange(index, "url", e.target.value)}
                                        placeholder="Link URL"
                                        className="w-full block border-2 text-[#121212] text-[18px] border-blue-600  p-2 rounded-md focus:ring-1 focus:ring-blue-600  outline-none"
                                    />
                                </div>

                                {/* Delete Button */}
                                <div
                                    type="button"
                                    onClick={() => removeLink(index)}
                                    className="text-red-500 hover:text-red-400 sm:mt-0 mt-2 cursor-pointer"
                                >
                                    <FaTrash className="sm:block hidden" />
                                    <button className="sm:hidden block">Delete</button>
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addLink}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mt-3 rounded-lg transition cursor-pointer"
                        >
                            + Add Link
                        </button>

                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-lg transition cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className={`bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition ${loading ? "cursor-not-allowed" : "cursor-pointer"}`}
                        >
                            {loading ? "Updating ..." : "Update"}
                        </button>
                    </div>

                </form>
            </div>
        </section>
    );
};

export default UpdateReport;