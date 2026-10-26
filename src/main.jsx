import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './styles/index.css'

// Enregistrement du Service Worker
registerSW({
  immediate: true,
  onOfflineReady() {
    console.log('App prête à fonctionner hors-ligne (shell).')
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)