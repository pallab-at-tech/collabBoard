import React from 'react'

const UnderLine = ({size}) => {
  return (
    <div className='min-h-[5px] bg-[#30bf20e5] rounded-2xl transition-[width] duration-500 ease-in-out' style={{ minWidth: `${size}`, maxWidth: `${size}` }}></div>
  )
}

export default UnderLine
