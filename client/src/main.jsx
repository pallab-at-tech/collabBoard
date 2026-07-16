import { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import router from './routes/index.jsx'
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux'
import { store } from './store/configStore.js'
import GlobalProvider from './provider/GlobalProvider.jsx'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>

    <GlobalProvider>

      <Toaster />

      <Suspense fallback={null}>
        <RouterProvider router={router} />
      </Suspense>

    </GlobalProvider>

  </Provider>
)
