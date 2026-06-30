export function speakText(text) {
  if (!text || typeof window === 'undefined' || !('speechSynthesis' in window) || !window.SpeechSynthesisUtterance) {
    return false
  }

  try {
    window.speechSynthesis.cancel()
    const utterance = new window.SpeechSynthesisUtterance(text)
    utterance.lang = 'de-DE'
    utterance.rate = 0.92
    utterance.pitch = 1
    utterance.onerror = () => {
      // Die sichtbare Textanweisung bleibt bei Ausgabefehlern vollständig nutzbar.
    }
    window.speechSynthesis.speak(utterance)
    return true
  } catch (error) {
    console.error('Sprachausgabe konnte nicht gestartet werden:', error)
    return false
  }
}

export function stopSpeaking() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  try {
    window.speechSynthesis.cancel()
  } catch (error) {
    console.error('Sprachausgabe konnte nicht beendet werden:', error)
  }
}

