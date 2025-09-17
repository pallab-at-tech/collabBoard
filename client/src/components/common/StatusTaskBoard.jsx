import React from "react";
import { FaCheckCircle, FaHourglassHalf, FaClipboardList, FaBan, FaUsers } from "react-icons/fa";

const dummyTasks = [
  { id: 1, title: "Design Banner", assignee: "Pallab", status: "In Progress" },
  { id: 2, title: "Blog Post", assignee: "Student", status: "To Do" },
  { id: 3, title: "Backend API", assignee: "Rahul", status: "Completed" },
  { id: 4, title: "Testing", assignee: "Rahul", status: "Blocked" },
  { id: 5, title: "UI Fixes", assignee: "Pallab", status: "Completed" },
  { id: 6, title: "Marketing Copy", assignee: "Student", status: "In Progress" },
];

// Helper: count tasks by status
const countByStatus = (tasks, status) =>
  tasks.filter((t) => t.status === status).length;

// Helper: group by assignee
const groupByAssignee = (tasks) => {
  const result = {};
  tasks.forEach((task) => {
    if (!result[task.assignee]) {
      result[task.assignee] = { Completed: 0, "In Progress": 0, "To Do": 0, Blocked: 0 };
    }
    result[task.assignee][task.status]++;
  });
  return result;
};

const StatusTaskBoard = () => {
  const total = dummyTasks.length;
  const completed = countByStatus(dummyTasks, "Completed");
  const inProgress = countByStatus(dummyTasks, "In Progress");
  const todo = countByStatus(dummyTasks, "To Do");
  const blocked = countByStatus(dummyTasks, "Blocked");

  const completionRate = ((completed / total) * 100).toFixed(0);

  const teamStats = groupByAssignee(dummyTasks);

  return (
    <section className="xl:border-2 border-white overflow-y-auto min-h-[calc(100vh-182px)] max-h-[calc(100vh-182px)] px-2 xl:px-6 py-8 xl:bg-[#1F2937] mini_tab:mx-10 rounded-b relative text-white">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaUsers className="text-indigo-400" /> Task Status Overview
      </h2>

      {/* Summary Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-xl flex flex-col items-center shadow">
          <FaCheckCircle className="text-green-500 text-2xl mb-2" />
          <p className="text-lg font-bold">{completed}</p>
          <p className="text-sm text-gray-400">Completed</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl flex flex-col items-center shadow">
          <FaHourglassHalf className="text-yellow-500 text-2xl mb-2" />
          <p className="text-lg font-bold">{inProgress}</p>
          <p className="text-sm text-gray-400">In Progress</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl flex flex-col items-center shadow">
          <FaClipboardList className="text-blue-400 text-2xl mb-2" />
          <p className="text-lg font-bold">{todo}</p>
          <p className="text-sm text-gray-400">To Do</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl flex flex-col items-center shadow">
          <FaBan className="text-red-500 text-2xl mb-2" />
          <p className="text-lg font-bold">{blocked}</p>
          <p className="text-sm text-gray-400">Blocked</p>
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

      {/* Team Breakdown */}
      <h3 className="text-lg font-semibold mb-3">Team Breakdown</h3>
      <div className="grid gap-4">
        {Object.entries(teamStats).map(([member, stats]) => (
          <div key={member} className="bg-gray-800 p-4 rounded-xl shadow">
            <p className="font-semibold text-indigo-400 mb-2">{member}</p>
            <div className="flex gap-2 text-sm flex-wrap">
              <span className="bg-green-600 px-2 py-1 rounded-lg">
                ✅ {stats.Completed} Completed
              </span>
              <span className="bg-yellow-500 px-2 py-1 rounded-lg">
                ⏳ {stats["In Progress"]} In Progress
              </span>
              <span className="bg-blue-500 px-2 py-1 rounded-lg">
                📋 {stats["To Do"]} To Do
              </span>
              <span className="bg-red-600 px-2 py-1 rounded-lg">
                🚫 {stats.Blocked} Blocked
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatusTaskBoard;
