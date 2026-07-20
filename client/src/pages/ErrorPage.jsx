import React from "react";

const ErrorPage = () => {
    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#140101] via-slate-900 to-black px-6">
            <div className="max-w-lg w-full bg-white/5 backdrop-blur-md border border-red-500/20 rounded-2xl p-8 text-center shadow-2xl">
                <div className="text-6xl mb-4">⚠️</div>

                <h1 className="text-3xl md:text-4xl font-bold text-white">
                    Something went wrong
                </h1>

                <p className="mt-4 text-gray-400 leading-relaxed">
                    An unexpected error occurred while loading this page.
                    Please try refreshing the page. If the problem persists,
                    contact support.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                    <button
                        onClick={handleRefresh}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                    >
                        Refresh Page
                    </button>

                    <button
                        onClick={() => (window.location.href = "/")}
                        className="px-6 py-3 border border-gray-600 hover:border-gray-400 text-gray-200 rounded-lg transition-all duration-300 hover:bg-white/10 cursor-pointer"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;