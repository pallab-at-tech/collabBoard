import React from "react";
import { Link } from "react-router-dom";

const PageNotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-black px-6">
            <div className="text-center max-w-lg">
                <h1 className="text-8xl md:text-9xl font-extrabold text-white tracking-wider">
                    404
                </h1>

                <div className="w-24 h-1 bg-green-500 mx-auto my-6 rounded-full"></div>

                <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">
                    Oops! Page Not Found
                </h2>

                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                    The page you're looking for doesn't exist, may have been
                    moved, or the URL might be incorrect.
                </p>

                <Link
                    to="/"
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-green-600/20"
                >
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
};

export default PageNotFound;