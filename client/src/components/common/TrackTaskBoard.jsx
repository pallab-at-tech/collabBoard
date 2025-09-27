import React, { useEffect, useState } from "react";
import { FaSearch, FaCheckCircle, FaClock, FaTasks } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useGlobalContext } from "../../provider/GlobalProvider";
import { useLocation , Link, Outlet } from "react-router-dom";


const TrackTaskBoard = () => {

  const { fetchTaskDetails } = useGlobalContext()

  const teamId = useLocation().state?.teamId
  const x = useLocation().pathname.split("/")

  const task = useSelector(state => state.task)

  const [data, setData] = useState(null)

  const manageTask = () => {
    if (!task?.column) return [];
    const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd

    const filterData = task.column.map((col) => {
      const assignsToSet = new Set();
      const submittedReport = new Set();
      let mostRecent = null;

      // collect submitted reports for this column
      col.reportSubmit.forEach((m) => submittedReport.add(m?.taskId));

      col.tasks.forEach((t) => {
        // collect assignsTo
        (t.assignTo || []).forEach((user) => assignsToSet.add(user));

        if (t?.dueDate && !submittedReport.has(t._id)) {
          if (
            !mostRecent ||
            new Date(t.dueDate) < new Date(mostRecent.dueDate)
          ) {
            mostRecent = {
              taskId: t._id,
              dueDate: t.dueDate,
              dueTime: t.dueTime || "Today , 11:59 pm",
              deadLine:
                new Date(t.dueDate) < new Date(today) ? "UNSAFE" : "SAFE",
            };
          }
        }
      });

      const recentTask = mostRecent
        ? {
          taskId: mostRecent.taskId,
          value:
            mostRecent.dueDate === today
              ? mostRecent.dueTime
              : mostRecent.dueDate,
          deadLine: mostRecent.deadLine,
        }
        : null;

      return {
        ...col,
        recentTask,
        assignsTo: [...assignsToSet],
      };
    });

    return filterData;
  };

  useEffect(() => {
    if(!teamId) return
    fetchTaskDetails(teamId)
  }, [x.length])

  useEffect(() => {
    const newData = manageTask()
    setData(newData)
  }, [task])

  console.log("Task hi", data)

  return (
    <section className="xl:border-2  xl:border-[#596982] border-white xl:bg-[#282932] xl:bg-gradient-to-r xl:from-[#0a0a1880] overflow-y-auto hide-scrollbar min-h-[calc(100vh-182px)] max-h-[calc(100vh-182px)] px-2 xl:px-6 py-8  mini_tab:mx-10 rounded-b relative text-white">

      {/* Header Controls */}
      <div className={`flex ${x[x.length-1] === "col" ? "hidden" : "block"} flex-col md:flex-row justify-between items-center mb-6 gap-3 w-full`}>

        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FaTasks className="text-indigo-400" /> Track Tasks
        </h2>

        <div className="flex sm:flex-row flex-col  gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full">
            <FaSearch size={16} className="absolute left-2 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="pl-8 pr-4 py-2 rounded-lg w-full bg-gray-800 border border-gray-600 focus:outline-none focus:ring focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Sort By */}
          <select className="px-3 py-2 cursor-pointer rounded-lg bg-gray-800 w-[120px] border border-gray-600 text-sm focus:outline-none">
            <option>Sort By</option>
            <option value="Created At">Created At</option>
            <option value="Updated">Updated At</option>
            <option value="DeadLine">DeadLine</option>
          </select>
        </div>

      </div>

      {/* Task List */}
      <div className={`grid gap-4 ${x[x.length-1] === "col" ? "hidden" : "block"}`}>

        {
          data?.map((v, i) => {
            return (
              <Link to={"col"} state={{data : v}}
                key={v?._id}
                className="bg-gray-800 border border-gray-700 shadow-md rounded-xl p-4 cursor-pointer">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">

                  <div>
                    <h3 className="text-lg font-semibold text-indigo-400">
                      {v?.name}
                    </h3>

                    <div className="text-sm text-gray-400 truncate max-w-[300px]">

                      {
                        v?.tasks.length > 0 && (
                          <p>
                            Assigned to : {
                              v.assignsTo.map((val, i) => {
                                return <span key={i} className="px-1">{`${val} ${v.assignsTo.length - 1 !== i ? "," : ""}`}</span>
                              })
                            }
                          </p>
                        )
                      }

                    </div>

                    <div className={`text-sm flex flex-row items-center ${v?.tasks.length > 0 ? !v.recentTask ? "text-green-500" : v.recentTask?.deadLine === "SAFE" ? `text-gray-400` : "text-red-500" : "text-gray-400"}`}>
                      <FaClock className="mr-1" />
                      <p>{`${v?.tasks.length > 0 ? !v.recentTask ? "Complete All Tasks" : v.recentTask?.deadLine === "SAFE" ? `Recent Deadline : ${v.recentTask.value}` : `Found Expired DeadLine at ${v.recentTask.value}` : "No Task Assigned"}`}</p>
                    </div>
                  </div>

                </div>


                <div className={`mt-3 ${v.tasks.length === 0 ? "hidden" : "block"}`}>

                  <div className={`w-full bg-gray-700 rounded-full h-2 `}>
                    <div
                      className={`h-2 rounded-full ${(v.reportSubmit.length * 100) / v.tasks.length === 100
                        ? "bg-green-500"
                        : "bg-indigo-500"
                        }`}
                      style={{ width: `${((v.reportSubmit.length * 100) / v.tasks.length).toFixed(0)}%` }}
                    ></div>
                  </div>

                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    {task.progress === 100 ? (
                      <FaCheckCircle className="text-green-500" />
                    ) : null}
                    {((v.reportSubmit.length * 100) / v.tasks.length).toFixed(0)}% completed
                  </p>

                </div>

              </Link>
            )
          })
        }

      </div>

      {
        <Outlet/>
      }

    </section>
  );
};

export default TrackTaskBoard;

