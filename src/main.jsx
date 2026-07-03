import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ProfileProvider } from './context/ProfileContext.jsx'
import { CheckinProvider } from './context/CheckinContext.jsx'
import { registerSW } from 'virtual:pwa-register'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CheckinProvider>
        <ProfileProvider>
          <App />
        </ProfileProvider>
      </CheckinProvider>
    </AuthProvider>
  </StrictMode>,
)

if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister())
  })

  if ('caches' in window) {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => caches.delete(cacheName))
    })
  }
}

if (import.meta.env.PROD) {
  registerSW({ immediate: true })
}
