import React, { useEffect, useState } from "react";
import { FaClock, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";

const dummyDeadlines = [
  {
    id: 1,
    title: "Design New Campaign Banner",
    assignee: "pallab@9XFm",
    status: "In Progress",
    priority: "High",
    deadline: "2025-09-20T15:00:00", // ISO format
  },
  {
    id: 2,
    title: "Write Blog Post",
    assignee: "student@abc",
    status: "To Do",
    priority: "Medium",
    deadline: "2025-09-25T12:00:00",
  },
  {
    id: 3,
    title: "Backend API Integration",
    assignee: "rahul@team",
    status: "Completed",
    priority: "High",
    deadline: "2025-09-12T23:59:00",
  },
];

// Helper: calculate remaining time
const getTimeLeft = (deadline) => {
  const now = new Date();
  const end = new Date(deadline);
  const diff = end - now;

  if (diff <= 0) return "Overdue";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
};

const DeadlineTaskBoard = () => {
  const [tasks, setTasks] = useState([]);

  // Update countdown every minute
  useEffect(() => {
    setTasks(dummyDeadlines);
    const timer = setInterval(() => {
      setTasks([...dummyDeadlines]);
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="xl:border-2 border-white overflow-y-auto min-h-[calc(100vh-182px)] max-h-[calc(100vh-182px)] px-2 xl:px-6 py-8 xl:bg-[#1F2937] mini_tab:mx-10 rounded-b relative text-white">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaClock className="text-indigo-400" /> Deadlines
      </h2>

      <div className="grid gap-4">
        {tasks.map((task) => {
          const timeLeft = getTimeLeft(task.deadline);

          // Deadline urgency color
          let deadlineColor = "bg-green-600";
          if (timeLeft === "Overdue") {
            deadlineColor = "bg-red-600";
          } else if (timeLeft.includes("h") || timeLeft.includes("m")) {
            deadlineColor = "bg-yellow-500";
          }

          return (
            <div
              key={task.id}
              className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-md"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h3 className="text-lg font-semibold text-indigo-400">
                    {task.title}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Assigned to: {task.assignee}
                  </p>
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <FaClock /> {new Date(task.deadline).toLocaleString()}
                  </p>
                </div>

                {/* Status & Priority */}
                <div className="flex gap-2 mt-2 md:mt-0">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.status === "Completed"
                        ? "bg-green-600"
                        : task.status === "In Progress"
                        ? "bg-yellow-500"
                        : "bg-gray-500"
                    }`}
                  >
                    {task.status}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.priority === "High"
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

              {/* Deadline Countdown */}
              <div className="mt-3 flex items-center gap-2 text-sm">
                {timeLeft === "Overdue" ? (
                  <FaExclamationTriangle className="text-red-500" />
                ) : task.status === "Completed" ? (
                  <FaCheckCircle className="text-green-500" />
                ) : (
                  <FaClock className="text-yellow-400" />
                )}
                <span
                  className={`px-2 py-1 rounded-lg text-xs font-medium ${deadlineColor}`}
                >
                  {timeLeft}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default DeadlineTaskBoard;
