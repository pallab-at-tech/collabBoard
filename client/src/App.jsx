import './App.css'
import Header from './components/Others/Common/Header'
import Footer from './components/Others/Common/Footer'
import { Outlet } from 'react-router-dom'
import { useGlobalContext } from './provider/GlobalProvider'

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
