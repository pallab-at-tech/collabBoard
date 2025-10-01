import React, { useEffect, useState, useMemo } from "react";
import { FaSearch, FaCheckCircle, FaClock, FaTasks } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useGlobalContext } from "../../provider/GlobalProvider";
import { useLocation, Link, Outlet } from "react-router-dom";


const TrackTaskBoard = () => {

  const { fetchTaskDetails } = useGlobalContext()

  const teamId = useLocation().state?.teamId
  const x = useLocation().pathname.split("/")

  const task = useSelector(state => state.task)
  const [data, setData] = useState(null)

  const [sortOption, setSortOption] = useState("")
  const [searchValue, setSearchValue] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("");

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
    if (!teamId) return
    fetchTaskDetails(teamId)
  }, [x.length])

  useEffect(() => {
    const newData = manageTask()
    setData(newData)
  }, [task])

  // sort data
  useMemo(() => {
    if (!sortOption) return
    if (!data) return

    let newData = [...data];

    if (sortOption === "Created-At") {

      newData.sort((a, b) => {
        const dateA = a.tasks.length
          ? Math.min(...a.tasks.map(t => new Date(t.createdAt).getTime()))
          : -Infinity;
        const dateB = b.tasks.length
          ? Math.min(...b.tasks.map(t => new Date(t.createdAt).getTime()))
          : -Infinity;
        return dateB - dateA;
      });
    }
    else if (sortOption === "Updated-At") {

      newData.sort((a, b) => {
        const dateA = a.tasks.length
          ? Math.max(...a.tasks.map(t => new Date(t.updatedAt).getTime()))
          : -Infinity;
        const dateB = b.tasks.length
          ? Math.max(...b.tasks.map(t => new Date(t.updatedAt).getTime()))
          : -Infinity;
        return dateB - dateA;
      });
    }
    else if (sortOption === "DeadLine") {
      newData.sort((a, b) => {
        const dateA = a.recentTask?.value ? new Date(a.recentTask.value).getTime() : Infinity;
        const dateB = b.recentTask?.value ? new Date(b.recentTask.value).getTime() : Infinity;
        return dateA - dateB;
      });
    }

    setData(newData)

  }, [sortOption])


  // debouncing effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchValue]);

  // searching controller
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchValue) return [];

    const lowerSearch = searchValue.toLowerCase();

    return data.filter((col) => {
      
      const matchColumn = col.name.toLowerCase().includes(lowerSearch);

      const matchTask = col.tasks?.some((t) =>
        t.title?.toLowerCase().includes(lowerSearch)
      );

      return matchColumn || matchTask;
    });
  }, [data, searchValue]);

  console.log("Task hi", data)

  return (
    <section className="xl:border-2  xl:border-[#596982] border-white xl:bg-[#282932] xl:bg-gradient-to-r xl:from-[#0a0a1880] overflow-y-auto hide-scrollbar min-h-[calc(100vh-182px)] max-h-[calc(100vh-182px)] px-2 xl:px-6 py-8  mini_tab:mx-10 rounded-b relative text-white">

      {/* Header Controls */}
      <div className={`flex ${x[x.length - 1] === "col" ? "hidden" : "block"} flex-col md:flex-row justify-between items-center mb-6 gap-3 w-full`}>

        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FaTasks className="text-indigo-400" /> Track Tasks
        </h2>

        <div className="flex sm:flex-row flex-col  gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full">
            <div>
              <FaSearch size={16} className="absolute left-2 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by tasks or column ..."
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-8 pr-4 py-2 rounded-lg w-full bg-gray-800 border border-gray-600 focus:outline-none focus:ring focus:ring-indigo-500 text-sm"
              />
            </div>

            <div className={`absolute top-[50px] sm:-left-[30px] -left-[5px] right-0 w-full sm:w-[280px] overflow-y-scroll hide-scrollbar max-h-[200px] bg-[#fffffff1] sm:bg-[#ffffffbc] rounded-xl ${searchValue && "border-[3px] border-blue-400"}`}>
              {
                searchValue && (
                  <div className="px-3 py-2 w-full">
                    {
                      filteredData && filteredData.length > 0 ? filteredData.map((v,i) => {

                        return (
                          <Link
                            to={"col"}
                            state={{ data: v }}
                            key={v?._id}
                            className={`flex items-center justify-between gap-3 ${i < 1 ? "mt-0" : "mt-2"} w-full p-3 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-750 transition-colors duration-150 shadow-sm`}
                            aria-label={`Open column ${v?.name}`}
                          >
                            <div className="flex items-center gap-3 min-w-0">

                              {/* Title + meta */}
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-indigo-300 truncate">{v?.name}</div>
                                <div className="text-xs text-gray-400 truncate">
                                  {v?.tasks?.length ?? 0} task{(v?.tasks?.length ?? 0) === 1 ? "" : "s"} • {v?.assignsTo?.length ?? 0} members
                                </div>
                              </div>
                            </div>

                            {/* Right: progress badge */}
                            <div className="flex items-center gap-3">
                              <div className="text-xs px-2 py-1 rounded-md bg-gray-700 border border-gray-600 text-gray-200">
                                {Math.round(((v?.reportSubmit?.length ?? 0) / (v?.tasks?.length || 1)) * 100)}%
                              </div>
                              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                          </Link>

                        )

                      }) : (
                        <p className="text-gray-800 text-center text-lg font-semibold">No data found ?!</p>
                      )
                    }
                  </div>
                )
              }
            </div>
          </div>

          {/* Sort By */}
          <select onChange={(e) => setSortOption(e.target.value)} className="px-3 py-2 cursor-pointer rounded-lg bg-gray-800 w-[120px] border border-gray-600 text-sm focus:outline-none">
            <option>Sort By</option>
            <option value="Created-At">Created At</option>
            <option value="Updated-At">Updated At</option>
            <option value="DeadLine">DeadLine</option>
          </select>
        </div>

      </div>

      {/* Task List */}
      <div className={`grid gap-4 ${x[x.length - 1] === "col" ? "hidden" : "block"}`}>

        {
          data?.map((v, i) => {
            return (
              <Link to={"col"} state={{ data: v }}
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
        <Outlet />
      }

    </section>
  );
};

export default TrackTaskBoard;

