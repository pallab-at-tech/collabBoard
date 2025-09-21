import './App.css'
import Header from './components/common/Header'
import Footer from './components/common/Footer'
import { Outlet } from 'react-router-dom'
import { useGlobalContext } from './provider/GlobalProvider'
import { useSelector } from 'react-redux'

function App() {
  const { isLogin } = useGlobalContext()  // 🔹 direct from context

  const team = useSelector(state => state.team)
  const user = useSelector(state => state.user)
  const task = useSelector(state => state.task)
  const chat = useSelector(state => state.chat)

  // console.log("team",team)
  // console.log("user",user)
  // console.log("task",task)
  // console.log("chat",chat)

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
