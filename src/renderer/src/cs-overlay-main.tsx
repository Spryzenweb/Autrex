import React from 'react'
import ReactDOM from 'react-dom/client'
import CSOverlayApp from './overlay/CSOverlayApp'
import './assets/main.css'

ReactDOM.createRoot(document.getElementById('cs-overlay-root') as HTMLElement).render(
  <React.StrictMode>
    <CSOverlayApp />
  </React.StrictMode>
)