import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './index.css'

// Initialize OneSignal Web Push SDK
const onesignalAppId = import.meta.env.VITE_ONESIGNAL_APP_ID;
if (onesignalAppId && onesignalAppId !== 'your-onesignal-app-id-here') {
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal) => {
    await OneSignal.init({
      appId: onesignalAppId,
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

