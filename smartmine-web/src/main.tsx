import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app/App'
import { AppStateProvider } from './context/AppStateContext'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <AppStateProvider>
      <App />
    </AppStateProvider>
  </React.StrictMode>,
)
