import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MdOutlineCreateNewFolder, MdOutlinePostAdd } from "react-icons/md";
import CreateTeam from "../components/other/CreateTeam";

const RealHome = () => {
    const [openCreateTeam, setOpenCreateTeam] = useState(false);
    const [openJoinTeam, setOpenJoinTeam] = useState(false); // for future modal

    return (
        <section className="bg-gradient-to-b from-[#1b1c29] to-[#21222b] min-h-[calc(100vh-60px)] grid place-items-center px-6">
            <div className="flex flex-col items-center gap-6 text-center sm:max-w-[420px]">

                {/* Heading */}
                <div className="pb-1">
                    <h1 className="sm:text-5xl text-4xl font-bold text-white pb-4" style={{ textShadow: "rgb(13 155 108 / 30%) 0px 0px 12px" }}>
                        Welcome to Your Workspace
                    </h1>
                    <p className="text-[#a9abaa] text-base md:text-lg">
                        Collaborate, organize, and manage your projects. Start by creating or joining a team.
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex  gap-4">
                    {/* Create Team */}
                    <div
                        onClick={() => setOpenCreateTeam(true)}
                        className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-2xl w-[140px] sm:w-[180px] py-4 cursor-pointer transition-all duration-200 hover:scale-105"
                    >
                        <MdOutlineCreateNewFolder size={26} />
                        <span>Create Team</span>
                    </div>

                    {/* Join Team */}
                    <div
                        onClick={() => setOpenJoinTeam(true)}
                        className="flex items-center justify-center gap-3 bg-[#2d2f3a] hover:bg-[#3a3c47] text-[#d1d1d1] font-medium rounded-2xl w-[140px] sm:w-[180px] py-4 cursor-pointer transition-all duration-200 hover:scale-105"
                    >
                        <MdOutlinePostAdd size={26} />
                        <span>Join Team</span>
                    </div>
                </div>

                {/* Learn More */}
                <Link className="text-[#a9abaa] text-base underline hover:text-[#c4c4c4] hover:drop-shadow-[0_0_6px_rgba(255,255,205,0.2)] transition-colors duration-150">
                    Know more about our service
                </Link>
            </div>

            {/* Create Team Modal */}
            {openCreateTeam && <CreateTeam close={() => setOpenCreateTeam(false)} />}

            {/* Join Team Modal (placeholder for now) */}
            {/* {openJoinTeam && (
                    <div className="text-white">Join Team modal goes here</div>
                )} */}
        </section>

    );
};

export default RealHome;
