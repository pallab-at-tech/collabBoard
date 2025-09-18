import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    FaCalendarAlt,
    FaClock,
    FaUser,
    FaFileAlt,
    FaPaperPlane,
    FaLink,
    FaImage,
    FaVideo,
    FaUsers,
} from "react-icons/fa";

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
    const navigate = useNavigate();
    const location = useLocation();
    const task = location.state;

    // Handles the case where no task data is passed
    if (!task) {
        return (
            <section className="bg-gray-900 h-screen w-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white">Task Not Found</h1>
                    <p className="text-gray-400 mt-2">
                        No task data was provided. Please go back and select a task.
                    </p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </section>
        );
    }

    return (
        // Main container now fills the entire screen
        <section className="min-h-[calc(100vh-60px)] bg-red-900 w-full text-white">

            <div className="grid grid-cols-[3fr_1fr] bg-[#282932] w-full h-full">

                {/* Main Content Column - now independently scrollable */}
                <div className="p-6 sm:p-8 overflow-y-auto h-full">
                    {/* Header */}
                    <div className="pb-4 mb-6 border-b border-gray-700">
                        <h1 className="text-3xl font-bold text-emerald-400">{task.title}</h1>
                        <p className="text-xs text-gray-500 mt-2">Task ID: {task._id}</p>
                    </div>

                    {/* Description */}
                    <div className="mb-8">
                        <h2 className="flex items-center gap-3 text-xl font-semibold text-gray-200">
                            <FaFileAlt className="text-emerald-400" />
                            Description
                        </h2>
                        <p className="text-gray-300 mt-3 text-sm leading-relaxed">
                            {task.description}
                        </p>
                    </div>

                    {/* Attachments Section */}
                    <div className="mb-8">
                        <h2 className="flex items-center gap-3 text-xl font-semibold text-gray-200 mb-4">
                            Attachments
                        </h2>
                        {task.image && (
                            <div className="mb-6">
                                <h3 className="flex items-center gap-2 text-md font-medium text-emerald-300 mb-2"><FaImage /> Image</h3>
                                <img
                                    src={task.image}
                                    alt="Task attachment"
                                    className="rounded-lg w-full max-h-[400px] object-cover border-2 border-gray-700"
                                />
                            </div>
                        )}
                        {task.video && (
                            <div className="mb-6">
                                <h3 className="flex items-center gap-2 text-md font-medium text-emerald-300 mb-2"><FaVideo /> Video</h3>
                                <video
                                    src={task.video}
                                    controls
                                    className="w-full rounded-lg border-2 border-gray-700"
                                />
                            </div>
                        )}
                        {!task.image && !task.video && (
                            <p className="text-gray-400 text-sm">No image or video attached.</p>
                        )}
                    </div>

                    {/* Additional Links */}
                    <div>
                        <h2 className="flex items-center gap-3 text-xl font-semibold text-gray-200">
                            <FaLink className="text-emerald-400" />
                            Additional Links
                        </h2>
                        {task.aditional_link?.length > 0 ? (
                            <ul className="mt-3 space-y-2">
                                {task.aditional_link.map((link, i) => (
                                    <li key={i}>
                                        <a
                                            href={link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-emerald-400 hover:text-emerald-300 hover:underline transition-colors break-all"
                                        >
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400 mt-3 text-sm">No links provided.</p>
                        )}
                    </div>
                </div>

                {/* Sidebar Column - also independently scrollable */}
                <div className=" bg-gray-800/50 p-6 sm:p-8 overflow-y-auto lg:border-l lg:border-gray-700 h-full">
                    <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-600 pb-3">
                        Task Details
                    </h2>

                    <MetadataItem
                        icon={<FaCalendarAlt className="text-emerald-400" />}
                        label="Due Date"
                        value={task.dueDate}
                    />
                    <MetadataItem
                        icon={<FaClock className="text-emerald-400" />}
                        label="Due Time"
                        value={task.dueTime}
                    />
                    <MetadataItem
                        icon={<FaUser className="text-emerald-400" />}
                        label="Assigned By"
                        value={task.assignby}
                    />

                    {/* Assignees */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <FaUsers className="text-emerald-400" />
                            <span>Assigned To</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {task.assignTo?.length > 0 ? (
                                task.assignTo.map((assignee, i) => (
                                    <span
                                        key={i}
                                        className="bg-emerald-900/70 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full"
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
                    <div className="mt-auto pt-6 border-t border-gray-700">
                        <button
                            onClick={() =>
                                navigate(`/task/report/${task._id}`, { state: task })
                            }
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-md transition-transform hover:scale-105"
                        >
                            <FaPaperPlane /> Send Report
                        </button>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default SeparateTabForTask;