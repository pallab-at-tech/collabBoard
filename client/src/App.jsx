import './App.css'
import Header from './components/common/Header'
import Footer from './components/common/Footer'
import { Outlet } from 'react-router-dom'
import { useGlobalContext } from './provider/GlobalProvider'

function App() {
  const { isLogin } = useGlobalContext()  // 🔹 direct from context

  if (isLogin === null) return null // optional safeguard on first render

  return (
    <>
      <Header />

      <Outlet />

      {/* <Footer/> */}
    </>
  )
}

export default App
