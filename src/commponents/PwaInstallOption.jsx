import { useEffect, useState } from 'react'
import logo from '../assets/Icon Gruppe H.png'
import {
  getInstallPrompt,
  isPwaInstalled,
  promptPwaInstall,
  subscribeToInstallState,
} from '../utils/pwaInstall'

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
    || (/macintosh/i.test(window.navigator.userAgent) && window.navigator.maxTouchPoints > 1)
}

function PwaInstallOption() {
  const [installPrompt, setInstallPrompt] = useState(getInstallPrompt)
  const [installed, setInstalled] = useState(isPwaInstalled)
  const [isIos] = useState(isIosDevice)

  useEffect(() => {
    function updateInstallState() {
      setInstallPrompt(getInstallPrompt())
      setInstalled(isPwaInstalled())
    }

    return subscribeToInstallState(updateInstallState)
  }, [])

  async function installApp() {
    if (!installPrompt) return

    await promptPwaInstall()
  }

  if (installed) return null

  if (isIos) {
    return (
      <div className="profile-edit-panel pwa-install-panel">
        <strong>App installieren</strong>
        <p>Öffne das Teilen-Menü in Safari und wähle „Zum Home-Bildschirm“.</p>
      </div>
    )
  }

  if (!installPrompt) return null

  return (
    <div className="pwa-install-option">
      <span className="setting-row-icon" aria-hidden="true">
        <img src={logo} alt="" />
      </span>
      <span>App installieren</span>
      <button type="button" onClick={installApp}>Installieren</button>
    </div>
  )
}

export default PwaInstallOption
