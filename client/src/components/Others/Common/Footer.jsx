import React, { useEffect, useState } from 'react'
import { useGlobalContext } from '../../../provider/GlobalProvider'

const Footer = () => {

    return (
        <footer className={`${isLogin ? "bg-A-off-color" : "bg-[var(--primary-color)]"} min-h-[30px]`}>

        </footer>
    )
}

export default Footer
