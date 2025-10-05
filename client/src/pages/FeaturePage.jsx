import React from "react";
import { useGlobalContext } from "../provider/GlobalProvider";

const FeaturePage = () => {
  const { isLogin } = useGlobalContext();

  return (
    <section
      className={`min-h-[calc(100vh-60px)] py-4 sm:py-12 px-5 md:px-[100px] ${isLogin ? "bg-[#202128] text-gray-50" : "bg-gray-50 text-gray-800"
        }`}
    >
      <div>
        {/* Header */}
        <h1
          className={`text-2xl md:text-4xl font-bold mb-3 sm:mb-5 text-center ${isLogin ? "text-[#4365ff]" : "text-blue-700"
            }`}
        >
          Features of Our CollabDesk
        </h1>
        <p
          className={`text-center mb-8 sm:mb-12 max-w-2xl mx-auto ${isLogin ? "text-gray-400" : "text-gray-600"
            }`}
        >
          A collaborative task management platform designed to help teams organize, assign, and track work efficiently — all in one place.
        </p>

        {/* Section: Team Management */}
        <div className="mb-10">
          <h2
            className={`text-2xl font-semibold mb-2 ${isLogin ? "text-blue-500" : "text-blue-600"
              }`}
          >
            🧑‍🤝‍🧑 Team Management
          </h2>
          <p className={isLogin ? "text-gray-300 leading-relaxed" : "text-gray-700 leading-relaxed"}>
            Users can <strong>create or join teams</strong> to collaborate on projects. The system supports a
            <strong> role-based structure</strong> ensuring proper access control and accountability.
            <br />
            <br />
            <span className="font-semibold">Roles include:</span>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                <strong>Team Leader:</strong> Creates and assigns tasks, monitors progress, and reviews reports.
              </li>
              <li>
                <strong>Member:</strong> Accesses assigned tasks, completes them, and submits progress or final reports.
              </li>
            </ul>
          </p>
        </div>

        {/* Section: Task Management */}
        <div className="mb-10">
          <h2
            className={`text-2xl font-semibold mb-2 ${isLogin ? "text-blue-500" : "text-blue-600"
              }`}
          >
            ✅ Task Management (Custom Column-Based System)
          </h2>
          <p className={isLogin ? "text-gray-300 leading-relaxed" : "text-gray-700 leading-relaxed"}>
            Tasks are managed using a flexible <strong>column-based layout</strong> that provides
            a clear, visual overview of the team’s workflow.
            <br />
            <br />
            Each <strong>team leader</strong> can create their own set of columns to organize
            work based on their team’s structure — for example:
            <span className="italic text-gray-400"> “Planning”, “Design”, “Development”, “Review”, or “Completed”.</span>
            <br />
            <br />
            <span className="font-semibold">Leaders can:</span>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Create, name, and customize workflow columns.</li>
              <li>
                Assign different tasks within each column, and later access or sort them
                based on <strong>Created By</strong>, <strong>Updated At</strong>, or <strong>Deadline</strong>.
              </li>
              <li>Track overall task flow and monitor member progress easily.</li>
            </ul>
            <br />
            <span className="font-semibold">Members can:</span>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Access and view tasks assigned to them under specific columns.</li>
              <li>Update task status and submit completion reports directly to the leader.</li>
            </ul>
          </p>
        </div>

        {/* Section: Chat System */}
        <div className="mb-10">
          <h2
            className={`text-2xl font-semibold mb-2 ${isLogin ? "text-blue-500" : "text-blue-600"
              }`}
          >
            💬 Chat & Communication System
          </h2>
          <p className={isLogin ? "text-gray-300 leading-relaxed" : "text-gray-700 leading-relaxed"}>
            The application includes a <strong>real-time chat system</strong> for better team communication.
            <br />
            <br />
            <span className="font-semibold">Supports:</span>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                <strong>Private Conversations:</strong> Direct messages between individual users.
              </li>
              <li>
                <strong>Group Chats:</strong> Team-based or topic-based discussion spaces.
              </li>
            </ul>
          </p>
        </div>

        {/* Section: Notifications */}
        <div className="mb-10">
          <h2
            className={`text-2xl font-semibold mb-2 ${isLogin ? "text-blue-500" : "text-blue-600"
              }`}
          >
            🔔 Notification System
          </h2>
          <p className={isLogin ? "text-gray-300 leading-relaxed" : "text-gray-700 leading-relaxed"}>
            Stay updated with instant notifications for:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>New task assignments or updates</li>
            <li>Team invitations and changes</li>
            <li>New chat messages or group activity</li>
          </ul>
        </div>

        {/* Section: Reports */}
        <div className="mb-10">
          <h2
            className={`text-2xl font-semibold mb-2 ${isLogin ? "text-blue-500" : "text-blue-600"
              }`}
          >
            📊 Reports & Tracking
          </h2>
          <p className={isLogin ? "text-gray-300 leading-relaxed" : "text-gray-700 leading-relaxed"}>
            Members can submit detailed reports or progress updates for review.
            <br />
            Leaders can track team performance, task completion rates, and overall productivity.
            <br />
            <br />
            Both <strong>leaders</strong> and <strong>members</strong> can generate a comprehensive
            <strong> overall status report</strong> to analyze task progress, performance, and deadlines.
            These reports can also be <strong>downloaded</strong> for record keeping or sharing within the team.
          </p>
        </div>

        {/* Footer */}
        <p className={isLogin ? "text-gray-400 text-center text-sm mt-12" : "text-gray-500 text-center text-sm mt-12"}>
          &copy; {new Date().getFullYear()} CollabDesk — Empower your team to work smarter, faster, and together - wherever they are.
        </p>
      </div>
    </section>
  );
};

export default FeaturePage;
