import React from 'react'

const LoaderPage = () => {
    return (
        <section className='fixed right-0 left-0 top-0 bottom-0 flex flex-col items-center justify-center z-50 bg-[#152231ea] backdrop-blur-[2px]'>

            <div className='flex flex-col gap-4'>
                <div className='home_loader'></div>
                <div className='text-gray-200'>Redirecting...</div>
            </div>

        </section>
    )
}

export default LoaderPage