import React from "react";
import { useGlobalContext } from "../provider/GlobalProvider";
import my_pic from "../assets/my_pic.jpg";

const AboutPage = () => {
  const { isLogin } = useGlobalContext();

  return (
    <section
      className={`min-h-[calc(100vh-60px)] py-5 sm:py-12 px-5 md:px-[100px] ${isLogin ? "bg-[#202128] text-gray-50" : "bg-gray-50 text-gray-800"
        }`}
    >
      <div>
        {/* Header */}
        <h1
          className={`text-3xl md:text-4xl font-bold mb-3 sm:mb-6 text-center ${isLogin ? "text-blue-600" : "text-blue-700"
            }`}
        >
          About CollabDesk
        </h1>
        <p
          className={`text-center mb-12 max-w-2xl mx-auto ${isLogin ? "text-gray-400" : "text-gray-600"
            }`}
        >
          CollabDesk is built to help teams collaborate, communicate, and complete tasks efficiently — all in one unified workspace.
        </p>

        {/* Section: Our Story */}
        <div className="mb-10">
          <h2
            className={`text-2xl font-semibold mb-2 ${isLogin ? "text-blue-500" : "text-blue-600"
              }`}
          >
            📖 Our Story
          </h2>
          <p className={isLogin ? "text-gray-300 leading-relaxed" : "text-gray-700 leading-relaxed"}>
            It all started with a simple observation — teams often struggle to stay aligned when managing tasks,
            communicating updates, and maintaining accountability across multiple tools.
            <br />
            <br />
            CollabDesk was created to bridge that gap by combining <strong>task management, team collaboration,</strong>
            and <strong>real-time communication</strong> in one seamless platform.
            Today, it empowers leaders to organize and track progress effortlessly, while allowing members to focus on what matters most — getting work done.
          </p>
        </div>

        {/* Section: Our Mission */}
        <div className="mb-10">
          <h2
            className={`text-2xl font-semibold mb-2 ${isLogin ? "text-blue-500" : "text-blue-600"
              }`}
          >
            🎯 Our Mission
          </h2>
          <p className={isLogin ? "text-gray-300 leading-relaxed" : "text-gray-700 leading-relaxed"}>
            Our mission is to simplify teamwork through intuitive tools that bring structure and clarity to every project.
            We aim to help teams:
          </p>
          <ul className={`list-disc ml-6 mt-2 space-y-1 ${isLogin ? "text-gray-300" : "text-gray-700"}`}>
            <li>Stay organized with role-based task assignments.</li>
            <li>Communicate effortlessly via group and private chats.</li>
            <li>Boost productivity through real-time tracking and notifications.</li>
            <li>Collaborate transparently and achieve shared goals faster.</li>
          </ul>
        </div>

        {/* Section: Our Vision */}
        <div className="mb-10">
          <h2
            className={`text-2xl font-semibold mb-2 ${isLogin ? "text-blue-500" : "text-blue-600"
              }`}
          >
            🌍 Our Vision
          </h2>
          <p className={isLogin ? "text-gray-300 leading-relaxed" : "text-gray-700 leading-relaxed"}>
            We envision a world where every team — from startups to enterprises — can work together seamlessly,
            regardless of distance or time zone.
            By uniting task organization with instant communication,
            we strive to make collaboration smarter, simpler, and more connected.
          </p>
        </div>

        {/* Section: Our Values */}

        <div className="mb-10">
          <h2
            className={`text-2xl font-semibold mb-2 ${isLogin ? "text-blue-500" : "text-blue-600"
              }`}
          >
            💬 Our Values
          </h2>
          <ul className={`list-disc ml-6 mt-2 space-y-1 ${isLogin ? "text-gray-300" : "text-gray-700"}`}>
            <li>
              <strong>Collaboration:</strong> Great ideas are born when people work together.
            </li>
            <li>
              <strong>Transparency:</strong> Open communication builds trust and accountability.
            </li>
            <li>
              <strong>Efficiency:</strong> Every feature should help you work faster, not harder.
            </li>
            <li>
              <strong>Innovation:</strong> We continuously evolve to meet modern team challenges.
            </li>
          </ul>
        </div>

        {/* Section: What Makes Us Different */}
        <div className="border-t border-gray-300 pt-6 mt-8">
          <h2
            className={`text-2xl font-semibold mb-2 ${isLogin ? "text-blue-500" : "text-blue-600"
              }`}
          >
            🚀 What Makes Us Different
          </h2>
          <p className={isLogin ? "text-gray-300 leading-relaxed" : "text-gray-700 leading-relaxed"}>
            CollabDesk isn’t just another task manager — it’s a complete teamwork ecosystem.
            From <strong>integrated chat</strong> and <strong>role-based task controls</strong> to
            <strong>report generation</strong> and <strong>progress tracking</strong>,
            our platform connects every part of your workflow.
            We help teams move from scattered tools to a single, focused, and productive environment.
          </p>
        </div>

        {/* Section: Meet the Developer */}
        <div className="border-t border-gray-300 pt-10 mt-12">
          <h2
            className={`text-2xl font-semibold mb-4 text-center ${isLogin ? "text-blue-400" : "text-blue-600"
              }`}
          >
            👨‍💻 Meet the Developer
          </h2>

          <div className="flex flex-col md:flex-row items-center md:items-start md:justify-center gap-8 md:gap-16 text-center md:text-left">
            <img
              src={my_pic}
              alt="Developer"
              className="w-[150px] h-[150px] rounded-full border-4 border-blue-500 shadow-md object-cover scale-x-[-1] object-center"
            />

            <div className="max-w-xl">
              <h3 className={isLogin ? "text-xl font-semibold text-gray-100" : "text-xl font-semibold text-gray-800"}>
                Pallab Bag
              </h3>
              <p className={isLogin ? "text-gray-300 mt-2 leading-relaxed" : "text-gray-600 mt-2 leading-relaxed"}>
                I’m a passionate MERN-stack developer who loves building intuitive, scalable,
                and user-friendly web applications. CollabDesk was created with the goal of
                simplifying teamwork through elegant design and seamless functionality.
              </p>

              <a
                href="https://portfolio-cyan-pi-92.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-full transition-all duration-200"
              >
                View Portfolio
              </a>
            </div>
          </div>
        </div>

        {/* Section: Contact Us */}
        <div className="border-t border-gray-300 pt-10 mt-12 text-center">
          <h2
            className={`text-2xl font-semibold mb-4 ${isLogin ? "text-blue-400" : "text-blue-600"
              }`}
          >
            📬 Contact Us
          </h2>
          <p className={isLogin ? "text-gray-300 mb-4" : "text-gray-700 mb-4"}>
            Have questions, feedback, or collaboration ideas? Let’s connect!
          </p>
          <div className="space-y-2 text-gray-700 flex flex-col items-center justify-start">
            <p className={isLogin ? "text-gray-300" : "text-gray-700"}>
              📧 Email:{" "}
              <a
                href="mailto:pallab861774@gmail.com"
                className="text-blue-600 hover:underline"
              >
                pallab861774@gmail.com
              </a>
            </p>
            <p className={isLogin ? "text-gray-300" : "text-gray-700"}>
              💼 LinkedIn:{" "}
              <a
                href="https://www.linkedin.com/in/pallab-bag-35115a2b1/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                linkedin.com/in/pallab-bag
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className={isLogin ? "text-gray-400 text-center text-sm mt-12" : "text-gray-500 text-center text-sm mt-12"}>
          &copy; {new Date().getFullYear()} CollabDesk — Empowering teams to work smarter, faster, and together — anywhere, anytime.
        </p>
      </div>
    </section>
  );
};

export default AboutPage;
