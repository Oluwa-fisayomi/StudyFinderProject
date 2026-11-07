
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GroupProvider } from './context/GroupContext'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <GroupProvider>
          <App />
        </GroupProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
