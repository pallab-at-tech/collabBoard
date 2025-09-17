import React, { useEffect } from "react";
import { FaSearch, FaCheckCircle, FaClock, FaTasks } from "react-icons/fa";
import { useSelector } from "react-redux";


const dummyTasks = [
  {
    id: 1,
    title: "Design New Campaign Banner",
    assignee: "pallab@9XFm",
    status: "In Progress",
    priority: "High",
    deadline: "2025-09-20",
    progress: 40,
  },
  {
    id: 2,
    title: "Write Blog Post",
    assignee: "student@abc",
    status: "To Do",
    priority: "Medium",
    deadline: "2025-09-25",
    progress: 0,
  },
  {
    id: 3,
    title: "Backend API Integration",
    assignee: "rahul@team",
    status: "Completed",
    priority: "High",
    deadline: "2025-09-12",
    progress: 100,
  },
];

const TrackTaskBoard = () => {

  const task = useSelector(state => state.task)

  useEffect(()=>{

  },[])

  console.log("Task hi", task)

  return (
    <section className="xl:border border-white xl:border-[#596982] xl:ring-1 xl:ring-[#596982] overflow-y-auto mt-2 min-h-[calc(100vh-182px)] max-h-[calc(100vh-182px)] px-2 xl:px-6 py-8 xl:bg-[#1F2937] mini_tab:mx-10 rounded-b relative text-white">

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FaTasks className="text-indigo-400" /> Track Tasks
        </h2>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-2 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="pl-8 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none focus:ring focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Sort By */}
          <select className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-sm focus:outline-none">
            <option>Sort By</option>
            <option value="deadline">Deadline</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="grid gap-4">

        {
          task?.column?.map((v, i) => {
            return (
              <div
                key={v?._id}
                className="bg-gray-800 border border-gray-700 shadow-md rounded-xl p-4">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">

                  <div>
                    <h3 className="text-lg font-semibold text-indigo-400">
                      {v?.name}
                    </h3>
                    {/* <p className="text-sm text-gray-400">
                      Assigned to: {task.assignee}
                    </p> */}
                    
                    <p className="text-sm text-gray-400">
                      <FaClock className="inline mr-1" />Recent Deadline: {task.deadline}
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 mt-2 md:mt-0">

                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${task.status === "Completed"
                        ? "bg-green-600"
                        : task.status === "In Progress"
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                        }`}
                    >
                      {task.status}
                    </span>

                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${task.priority === "High"
                        ? "bg-red-600"
                        : task.priority === "Medium"
                          ? "bg-orange-500"
                          : "bg-blue-500"
                        }`}
                    >
                      {task.priority}
                    </span>

                  </div>
                </div>


                <div className="mt-3">

                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${task.progress === 100
                        ? "bg-green-500"
                        : "bg-indigo-500"
                        }`}
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>

                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    {task.progress === 100 ? (
                      <FaCheckCircle className="text-green-500" />
                    ) : null}
                    {task.progress}% completed
                  </p>

                </div>

              </div>
            )
          })
        }

      </div>

    </section>
  );
};

export default TrackTaskBoard;

// {dummyTasks.map((task) => (
//           <div
//             key={task.id}
//             className="bg-gray-800 border border-gray-700 shadow-md rounded-xl p-4"
//           >
//             <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
//               <div>
//                 <h3 className="text-lg font-semibold text-indigo-400">
//                   {task.title}
//                 </h3>
//                 <p className="text-sm text-gray-400">
//                   Assigned to: {task.assignee}
//                 </p>
//                 <p className="text-sm text-gray-400">
//                   <FaClock className="inline mr-1" /> Deadline: {task.deadline}
//                 </p>
//               </div>

//               {/* Badges */}
//               <div className="flex items-center gap-2 mt-2 md:mt-0">
//                 <span
//                   className={`px-2 py-1 rounded-full text-xs font-medium ${
//                     task.status === "Completed"
//                       ? "bg-green-600"
//                       : task.status === "In Progress"
//                       ? "bg-yellow-500"
//                       : "bg-gray-500"
//                   }`}
//                 >
//                   {task.status}
//                 </span>
//                 <span
//                   className={`px-2 py-1 rounded-full text-xs font-medium ${
//                     task.priority === "High"
//                       ? "bg-red-600"
//                       : task.priority === "Medium"
//                       ? "bg-orange-500"
//                       : "bg-blue-500"
//                   }`}
//                 >
//                   {task.priority}
//                 </span>
//               </div>
//             </div>

//             {/* Progress Bar */}
//             <div className="mt-3">
//               <div className="w-full bg-gray-700 rounded-full h-2">
//                 <div
//                   className={`h-2 rounded-full ${
//                     task.progress === 100
//                       ? "bg-green-500"
//                       : "bg-indigo-500"
//                   }`}
//                   style={{ width: `${task.progress}%` }}
//                 ></div>
//               </div>
//               <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
//                 {task.progress === 100 ? (
//                   <FaCheckCircle className="text-green-500" />
//                 ) : null}
//                 {task.progress}% completed
//               </p>
//             </div>
//           </div>
//         ))}
