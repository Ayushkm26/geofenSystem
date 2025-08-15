import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import  UserContext from './Context/UserContext.jsx'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <UserContext>
      <BrowserRouter>
        <App />
        <ToastContainer />
      </BrowserRouter>
    </UserContext>
  </StrictMode>,
)
