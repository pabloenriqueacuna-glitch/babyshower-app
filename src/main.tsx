import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { RegalosProvider } from './context/RegalosContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RegalosProvider>
      <App />
    </RegalosProvider>
  </StrictMode>,
)
