import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import  UserContext, { LocationProvider } from './Context/UserContext.jsx'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminContext from './Context/AdminContex.jsx'
import { ChatProvider } from './Context/ChatContext.jsx';
createRoot(document.getElementById('root')).render(
  <StrictMode>
        <ChatProvider>
    <AdminContext>
      <LocationProvider>
        <UserContext>
          <BrowserRouter>
            <App />
            <ToastContainer />
        </BrowserRouter>
      </UserContext>
    </LocationProvider>
    </AdminContext>
    </ChatProvider>
  </StrictMode>,
)

  

