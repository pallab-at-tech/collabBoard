import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaUsers, FaDownload } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useGlobalContext } from "../../provider/GlobalProvider";
import { FaExclamationTriangle } from "react-icons/fa";
import { FaClipboardList, FaChartPie } from "react-icons/fa";
import generateContent from "../../utils/GenerateText";
import toast from "react-hot-toast";
import jsPDF from "jspdf"

const StatusTaskBoard = () => {

  const task = useSelector(state => state.task)
  const { fetchTaskDetails } = useGlobalContext()
  const teamId = useLocation().state?.teamId

  const [data, setData] = useState(null)

  const [generatingForAll, setGeneratingForAll] = useState(false)
  const [generatingForAllData, setGeneratingForAllData] = useState("")

  const [downloading, setDownloading] = useState(false)

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

  const generateText = async () => {
    setGeneratingForAll(true)
    try {
      const stats = data
      const columnsOfTask = task?.column || []

      const res = await generateContent(stats, columnsOfTask)
      setGeneratingForAll(false)

      if (res) {
        setGeneratingForAllData(res)
        handleGeneratePdf(res)
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

  // const handleGeneratePdf = async (response) => {
  //   setDownloading(true)
  //   try {

  //     if(!response){
  //       setDownloading(false)
  //       toast.error("Downloading error occured , try later.")
  //       return
  //     }

  //     const doc = new jsPDF();

  //     // Split text into lines to avoid overflow
  //     const lines = doc.splitTextToSize(response, 180); // 180 = page width minus margin

  //     // Add text to PDF starting at (10, 10)
  //     doc.text(lines, 10, 10);

  //     // Save PDF
  //     doc.save("overAll-task-report.pdf");
  //     toast.success("Report downloaded")
  //     setDownloading(false)

  //   } catch (error) {
  //     console.log("Error generating error", error)
  //     toast.error("Downloading error occured , try later.")
  //     setDownloading(false)
  //   }
  // }

  const handleGeneratePdf = async (text) => {
    setDownloading(true);
    try {
      if (!text) {
        toast.error("No content to download");
        setDownloading(false);
        return;
      }

      const doc = new jsPDF();
      const lines = doc.splitTextToSize(text, 180);
      doc.text(lines, 10, 10);
      doc.save("overall-task-report.pdf");
      toast.success("Report downloaded successfully!");
      setDownloading(false);
    } catch (err) {
      console.error(err);
      toast.error("Downloading error, try again!");
      setDownloading(false);
    }
  };

  // console.log("task status", task?.column)
  console.log("task overview", generatingForAllData)

  // dummy funtion
  const generateReport = () => {
    const report = {
      totalTasks: total,
      completed,
      inProgress,
      todo,
      blocked,
      completionRate: `${completionRate}%`,
      teamStats,
      tasks: dummyTasks,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "task-report.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const completionRate = ((data?.total_submitted.number / data?.total_task.number) * 100).toFixed(0);

  return (
    <section className="xl:border-2  xl:border-[#596982] border-white xl:bg-[#282932] xl:bg-gradient-to-r xl:from-[#0a0a1880]  overflow-y-auto min-h-[calc(100vh-182px)] max-h-[calc(100vh-182px)] hide-scrollbar px-2 xl:px-6 py-4 sm:py-8 mini_tab:mx-10 rounded-b relative text-white">

      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaUsers className="text-indigo-400" /> Task Status Overview
      </h2>

      {/* Summary Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">

        <div className="bg-gray-800 p-4 rounded-xl flex flex-col items-center shadow">
          <FaChartPie className="text-yellow-500 text-2xl mb-2" />
          <p className="text-lg font-bold">{data?.total_task.number}</p>
          <p className="text-sm text-gray-400">Total</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-xl flex flex-col items-center shadow">
          <FaCheckCircle className="text-green-500 text-2xl mb-2" />
          <p className="text-lg font-bold">{data?.total_submitted.number || "N/A"}</p>
          <p className="text-sm text-gray-400">Completed</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-xl flex flex-col items-center shadow">
          <FaClipboardList className="text-blue-400 text-2xl mb-2" />
          <p className="text-lg font-bold">{data?.total_task.number - data?.total_submitted.number}</p>
          <p className="text-sm text-gray-400">To Do</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-xl flex flex-col items-center shadow">
          <FaExclamationTriangle className="text-red-600 text-2xl mb-2" />
          <p className="text-lg font-bold">{data?.total_overDue.number || "N/A"}</p>
          <p className="text-sm text-gray-400">OverDue</p>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Overall Completion</h3>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="h-3 rounded-full bg-green-500"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-400 mt-1">{completionRate}% completed</p>
      </div>

      {/* Generate report buttons */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* <button
          onClick={generateReport} // pass a param for "your report"
          className=" text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <FaDownload />
          <p>Generate Your Report</p>
        </button> */}

        <button
          onClick={() => generateText()}
          className="bg-green-600  hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <FaDownload />
          <p>{generatingForAll ? "generating..." : downloading ? "downloading..." : "Generate Overall Report"}</p>
        </button>
      </div>

      {/* Team Breakdown */}
      <h3 className="text-lg font-semibold mb-3">Team Breakdown</h3>
      <div className="grid gap-4">
        {
          data &&
          Object.keys(data)
            .filter(
              (key) =>
                key !== "total_submitted" &&
                key !== "total_task" &&
                key !== "total_overDue"
            )
            .map((key) => (
              <div key={key} className="bg-gray-800 p-4 rounded-xl shadow">
                <p className="font-semibold text-indigo-400 mb-2">{key}</p>

                <div className="flex gap-2 text-sm flex-wrap">

                  <div className="bg-green-700 px-2 py-1 rounded-lg flex items-center gap-1">
                    <FaCheckCircle size={15} />
                    {data[key].complete.numberOf}
                    <p>Completed</p>
                  </div>

                  <div className="bg-blue-700 px-2 py-1 rounded-lg flex items-center gap-1">
                    <FaClipboardList size={15} />
                    {data[key].To_Do.numberOf}
                    <p>To Do</p>
                  </div>

                  <div className="bg-red-600 px-2 py-1 rounded-lg flex items-center gap-1">
                    <FaExclamationTriangle size={15} />
                    {data[key].overDue.numberOf}
                    <p>Overdue</p>
                  </div>

                  <div className="bg-yellow-700 px-2 py-1 rounded-lg flex items-center gap-1">
                    <FaChartPie />
                    {data[key].Total_assigned.numberOf}
                    <p>Assigned</p>
                  </div>

                </div>
              </div>
            ))
        }


      </div>

    </section>
  );
};

export default StatusTaskBoard;
