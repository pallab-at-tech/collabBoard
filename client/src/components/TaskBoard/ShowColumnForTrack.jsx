import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BsColumnsGap } from "react-icons/bs";
import { FaClock } from 'react-icons/fa';
import { FaRegFaceDizzy } from "react-icons/fa6";
import { FaExclamationTriangle } from 'react-icons/fa';

const ShowColumnForTrack = () => {
    const location = useLocation().state;
    const column = location?.data;

    const today = new Date().toISOString().split("T")[0];

    const [submitted, setSubmitted] = useState(new Set())

    useEffect(()=>{
        const set = new Set()
        column.reportSubmit.map((m)=>{
            set.add(m.taskId)
        })
        setSubmitted(set)
    },[])

    if (!column || column.tasks.length === 0) return <div className="text-gray-400 flex items-center gap-2 text-xl"><p>No column data available</p> <FaRegFaceDizzy size={22} className='pt-1'/></div>;


    return (
        <section>
            {/* Column Name */}
            <div className="flex gap-2 items-center mb-4">
                <BsColumnsGap size={24} className="pb-1 text-indigo-400" />
                <h2 className="text-[25px] font-bold mb-2 text-white">{column.name}</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                {column.tasks.map((task, i) => {
                    // deadline check
                    const isOverdue = new Date(task.dueDate) < new Date(today);
                    const isToday = task.dueDate === today;

                    const deadlineStatus = isOverdue ? "( Due Time exceed )" : "";
                    const deadlineColor = isOverdue ? "text-red-500" : "text-green-400";

                    return (
                        <div
                            key={task._id || i}
                            className="bg-gray-800 border border-gray-700 shadow-md rounded-xl p-4"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                <div>
                                    {/* Task title */}
                                    <h3 className="text-[22px] font-semibold text-indigo-400 pb-2">
                                        {task?.title}
                                    </h3>

                                    {/* Assigned to */}
                                    <div className="text-sm flex items-center text-gray-400 truncate max-w-[300px]">
                                        <p className="text-[#bcbbbb] font-bold">Assigned To :</p>
                                        {task.assignTo.map((val, idx) => (
                                            <span key={idx} className="px-1">
                                                {`${val}${task.assignTo.length - 1 > idx ? "," : ""}`}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Due Date */}
                                    <div className="text-sm flex items-start sm:items-center py-1">
                                        
                                        {
                                            deadlineColor === "text-red-500" ? (
                                                <FaExclamationTriangle size={18} className='mr-1 pt-0.5 text-[#bcbbbb]'/>
                                            ) : (
                                                <div>
                                                    <FaClock size={18} className="mr-1 pt-0.5 text-[#bcbbbb]" />
                                                </div>
                                            )
                                        }
                                        <p>
                                            DueDate :{" "}
                                            <span className={deadlineColor}>
                                                {isToday
                                                    ? `Today at ${task.dueTime || "11:59pm"}`
                                                    : task.dueDate}
                                            </span>{" "}
                                            <span className='text-red-300'>{`${deadlineStatus}`}</span>
                                            <span className='text-green-600'>{`${submitted.has(task._id) ? "(Report submitted)": ""}`}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default ShowColumnForTrack;
