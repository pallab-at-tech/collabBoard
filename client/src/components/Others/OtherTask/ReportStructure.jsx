import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useGlobalContext } from '../../../provider/GlobalProvider'
import { useSearchParams } from 'react-router-dom'
import generateContent from '../../../utils/GenerateText'
import html2pdf from "html2pdf.js"


const ReportStructure = () => {

    const { fetchTaskDetails } = useGlobalContext()
    const [searchParams] = useSearchParams();

    const [data, setData] = useState(null)

    const [generatingForAll, setGeneratingForAll] = useState(false)
    const [downloading, setDownloading] = useState(false)
    const [conclusion, setConclusion] = useState("")

    const teamId = searchParams.get("teamId") || null
    const task = useSelector(state => state.task)

    const generateText = async () => {
        setGeneratingForAll(true)
        try {
            const stats = data
            const columnsOfTask = task?.column || []

            const res = await generateContent(stats, columnsOfTask)
            setGeneratingForAll(false)

            if (res) {
                setConclusion(res)
            }
            else {
                toast.error("Some error occured ! try again.")
            }
        } catch (error) {
            setGeneratingForAll(false)
            toast.error("Some error occured ! try again.")
            console.log("Text genating error", error)
        }
    }

    const handleDownloadReport = () => {
        const element = document.getElementById("report")
        html2pdf()
            .from(element)
            .set({
                margin: [10, 10, 10, 10],
                filename: "Overall_Report.pdf",
                html2canvas: {
                    scale: 3,            //KEY FOR SHARP TEXT
                    useCORS: true,
                    scrollY: 0,
                    windowWidth: element.scrollWidth,
                    windowHeight: element.scrollHeight
                },
                jsPDF: {
                    unit: "mm",
                    format: "a4",
                    orientation: "portrait"
                }
            })
            .save();
    }

    useEffect(() => {
        if (!teamId) return
        fetchTaskDetails(teamId)
    }, [])

    useEffect(() => {
        const filteredData = {
            total_submitted: { number: 0, taskIds: [] },
            total_task: { number: 0, taskIds: [] },
            total_overDue: { number: 0, taskIds: [] }, // 👈 new global overdue tracker
        };

        const currDate = new Date().toISOString().split("T")[0]; // yyyy-mm-dd

        task?.column.forEach((c) => {
            const submit = new Set(c.reportSubmit.map(v => v?.taskId));

            c?.tasks.forEach((t) => {
                // update global totals
                filteredData.total_task.number += 1;
                filteredData.total_task.taskIds = [...filteredData.total_task.taskIds, t._id];

                if (submit.has(t._id)) {
                    filteredData.total_submitted.number += 1;
                    filteredData.total_submitted.taskIds = [...filteredData.total_submitted.taskIds, t._id];
                }

                // check overdue: if task has dueDate and it's < today and not submitted
                const isOverdue = t?.dueDate && new Date(t.dueDate) < new Date(currDate) && !submit.has(t._id);

                if (isOverdue) {
                    filteredData.total_overDue.number += 1;
                    filteredData.total_overDue.taskIds = [...filteredData.total_overDue.taskIds, t._id];
                }

                // per-assignee stats
                t?.assignTo?.forEach((m) => {
                    if (!filteredData[m]) {
                        filteredData[m] = {
                            complete: {
                                numberOf: submit.has(t._id) ? 1 : 0,
                                taskIds: submit.has(t._id) ? [t._id] : [],
                            },
                            To_Do: {
                                numberOf: submit.has(t._id) ? 0 : 1,
                                taskIds: submit.has(t._id) ? [] : [t._id],
                            },
                            overDue: {
                                numberOf: isOverdue ? 1 : 0,
                                taskIds: isOverdue ? [t._id] : [],
                            },
                            Total_assigned: {
                                numberOf: 1,
                                taskIds: [t._id],
                            },
                        };
                    } else {
                        const userData = filteredData[m];

                        if (submit.has(t._id)) {
                            userData.complete.numberOf += 1;
                            userData.complete.taskIds = [...userData.complete.taskIds, t._id];
                        } else {
                            userData.To_Do.numberOf += 1;
                            userData.To_Do.taskIds = [...userData.To_Do.taskIds, t._id];
                        }

                        if (isOverdue) {
                            userData.overDue.numberOf += 1;
                            userData.overDue.taskIds = [...userData.overDue.taskIds, t._id];
                        }

                        userData.Total_assigned.numberOf += 1;
                        userData.Total_assigned.taskIds = [...userData.Total_assigned.taskIds, t._id];

                        filteredData[m] = userData;
                    }
                });
            });
        });

        setData(filteredData);
    }, [task]);


    return (
        <section id='report' className="p-6 space-y-8 bg-[#dcddde] pdf-safe">

            {/* OVERALL SUMMARY */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#1e2939]">
                        Overall Report
                    </h2>

                    <button
                        className={`
                            flex items-center gap-2
                            bg-[#068b16] hover:bg-[#087815]
                            text-[#fff] text-sm font-medium
                            px-4 py-2
                            rounded-lg
                            shadow-sm hover:shadow
                            transition ${(generatingForAll || downloading) ? "cursor-not-allowed" : "cursor-pointer"}
                        `}
                        disabled={generatingForAll || downloading}
                        onClick={() => handleDownloadReport()}
                        data-html2canvas-ignore
                    >
                        {downloading ? "Downloading..." : "Download Report"}
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                    <div className="bg-[#fff] rounded-lg shadow p-4 justify-items-center">
                        <p className="text-[#6a7282]">Total Tasks</p>
                        <p className="text-2xl font-bold">{data?.total_task?.number ?? 0}</p>
                    </div>

                    <div className="bg-[#fff] rounded-lg shadow p-4 justify-items-center">
                        <p className="text-[#6a7282]">Total Submitted</p>
                        <p className="text-2xl font-bold text-[#0b8638]">
                            {data?.total_submitted?.number ?? 0}
                        </p>
                    </div>

                    <div className="bg-[#fff] rounded-lg shadow p-4 justify-items-center">
                        <p className="text-[#6a7282]">Total Overdue</p>
                        <p className="text-2xl font-bold text-[#ca0000]">
                            {data?.total_overDue?.number ?? 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* PER MEMBER REPORT */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Member-wise Report</h2>

                <div className="overflow-x-auto bg-[#fff] rounded-lg shadow">
                    <table className="min-w-full border-collapse">
                        <thead className="bg-[#f3f4f6]">
                            <tr>
                                <th className="text-left p-3 border">Member</th>
                                <th className="text-center p-3 border">Assigned</th>
                                <th className="text-center p-3 border">Completed</th>
                                <th className="text-center p-3 border">To Do</th>
                                <th className="text-center p-3 border">Overdue</th>
                            </tr>
                        </thead>

                        <tbody>
                            {data &&
                                Object.entries(data)
                                    .filter(([key]) =>
                                        !["total_task", "total_submitted", "total_overDue"].includes(key)
                                    )
                                    .map(([member, stats]) => (
                                        <tr key={member} className="hover:bg-[#f9fafb]">
                                            <td className="p-3 border font-medium">{member}</td>

                                            <td className="p-3 border text-center">
                                                {stats.Total_assigned.numberOf}
                                            </td>

                                            <td className="p-3 border text-center">
                                                {stats.complete.numberOf}
                                            </td>

                                            <td className="p-3 border text-center">
                                                {stats.To_Do.numberOf}
                                            </td>

                                            <td className="p-3 border text-center">
                                                {stats.overDue.numberOf}
                                            </td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* SUBMISSION DETAILS */}
            <div>
                <h2 className="text-xl font-semibold mb-4">
                    Task-wise Submission Details
                </h2>

                <div className="space-y-4">

                    {
                        task?.column && task?.column?.map((v, i) => {

                            const submitSet = new Set()
                            v?.reportSubmit?.map((col) => submitSet.add(col?.taskId))

                            return (
                                v?.tasks?.map((val, idx) => {
                                    return (
                                        <div
                                            key={val?._id}
                                        >

                                            <div className="flex justify-between items-center">
                                                <h3 className="font-medium text-[#1e2939]">
                                                    {val?.title}
                                                </h3>
                                                <span className="text-sm text-[#6a7282]">
                                                    Due: {val?.dueDate}
                                                </span>
                                            </div>

                                            {/* Submitted */}
                                            <div>
                                                {submitSet.has(val?._id) ? (
                                                    <div className="text-[#067f26]">
                                                        Submitted
                                                    </div>
                                                ) : (
                                                    <p className="text-[#99a1af]">No Submissions</p>
                                                )}
                                            </div>

                                            <div>
                                                {
                                                    val?.assignTo?.length ? (
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            {
                                                                val?.assignTo?.map((assign) => (
                                                                    <span className='px-2 py-1 text-center bg-[#ffe2e2] text-[#be0000] rounded text-xs'>
                                                                        {assign}
                                                                    </span>
                                                                ))
                                                            }
                                                        </div>
                                                    ) : (
                                                        <div className='text-[#4a5565]'>
                                                            No Assignees
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    )
                                })
                            )
                        })
                    }

                </div>
            </div>

            {/* conclusion */}
            <div className='w-full'>
                <div>
                    {
                        conclusion && conclusion.trim('') ? (
                            <div>
                                <h1 className='font-bold text-lg mt-1'>Conclusion</h1>
                                <div className='text-[15px] text-[#1e2939]'>{conclusion}</div>
                            </div>
                        ) : (
                            <div className='flex items-center justify-center'>
                                <button
                                    className={`
                                        gap-2
                                        bg-[#017522] hover:bg-[#017522]
                                        text-[#fff] font-medium
                                        px-5 py-2.5
                                        rounded-lg
                                        shadow-sm hover:shadow
                                        transition
                                        ${generatingForAll ? "cursor-not-allowed" : "cursor-pointer"}
                                    `}
                                    disabled={generatingForAll}
                                    onClick={() => generateText()}
                                    data-html2canvas-ignore
                                >
                                    {generatingForAll ? "Generating..." : "Add Conclusion"}
                                </button>
                            </div>
                        )
                    }

                </div>

            </div>

        </section>
    )
}

export default ReportStructure
