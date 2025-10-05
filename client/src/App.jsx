import './App.css'
import Header from './components/common/Header'
import Footer from './components/common/Footer'
import { Outlet } from 'react-router-dom'
import { useGlobalContext } from './provider/GlobalProvider'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'

function App() {
  const { isLogin } = useGlobalContext()  // direct from context

  if (isLogin === null) return null // optional safeguard on first render

  return (
    <div className=''>
      <Header />

      <Outlet />

      {/* <Footer/> */}
    </div>
  )
}

export default App
