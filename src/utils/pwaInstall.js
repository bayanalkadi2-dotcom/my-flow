let deferredInstallPrompt = null
let installed = false
const listeners = new Set()

function notify() {
  listeners.forEach((listener) => listener())
}

if (typeof window !== 'undefined') {
  installed = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredInstallPrompt = event
    notify()
  })

  window.addEventListener('appinstalled', () => {
    installed = true
    deferredInstallPrompt = null
    notify()
  })
}

export function getInstallPrompt() {
  return deferredInstallPrompt
}

export function isPwaInstalled() {
  return installed
}

export function subscribeToInstallState(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export async function promptPwaInstall() {
  if (!deferredInstallPrompt) return 'unavailable'

  const prompt = deferredInstallPrompt
  deferredInstallPrompt = null
  await prompt.prompt()
  const choice = await prompt.userChoice

  if (choice.outcome === 'accepted') installed = true
  notify()
  return choice.outcome
}
