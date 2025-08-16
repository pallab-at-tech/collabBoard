import React, { useEffect, useState } from 'react'
import { useGlobalContext } from '../../provider/GlobalProvider'

const Footer = () => {

  // const { fetchIsLogin } = useGlobalContext()

  // const [isLogin, setIsLogin] = useState(null)

  // useEffect(() => {
  //   setIsLogin(fetchIsLogin())
  // }, [fetchIsLogin])

  // if (isLogin === null) return null

  return (
    <footer className={`${isLogin ? "bg-A-off-color" : "bg-[var(--primary-color)]"} min-h-[30px]`}>

    </footer>
  )
}

export default Footer
