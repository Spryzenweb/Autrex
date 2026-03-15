import React from 'react'
import ReactDOM from 'react-dom/client'
import OverlayApp from './overlay/OverlayApp'
import './assets/main.css'

ReactDOM.createRoot(document.getElementById('overlay-root') as HTMLElement).render(
  <React.StrictMode>
    <OverlayApp />
  </React.StrictMode>
)