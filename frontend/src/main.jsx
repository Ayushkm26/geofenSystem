import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import  UserContext, { LocationProvider } from './Context/UserContext.jsx'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LocationContext } from './Context/UserContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LocationProvider>
      <UserContext>
        <BrowserRouter>
          <App />
          <ToastContainer />
        </BrowserRouter>
      </UserContext>
    </LocationProvider>
  </StrictMode>,
)

  

