import { useEffect, useRef, useState } from 'react'

function getSpeechRecognitionConstructor() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

function getRecognitionErrorMessage(errorCode) {
  if (errorCode === 'not-allowed' || errorCode === 'service-not-allowed') {
    return 'Der Mikrofonzugriff wurde nicht erlaubt. Du kannst deine Antwort schreiben.'
  }
  if (errorCode === 'no-speech') return 'Ich habe keine Sprache erkannt. Versuche es noch einmal.'
  if (errorCode === 'audio-capture') return 'Es wurde kein verfügbares Mikrofon gefunden.'
  if (errorCode === 'network') return 'Die Spracherkennung ist gerade nicht erreichbar. Du kannst deine Antwort schreiben.'
  return 'Die Spracheingabe konnte nicht gestartet werden. Du kannst deine Antwort schreiben.'
}

export function useSpeechRecognition() {
  const recognitionRef = useRef(null)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')
  const isSupported = Boolean(getSpeechRecognitionConstructor())

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognitionConstructor()
    if (!SpeechRecognition) return undefined

    const recognition = new SpeechRecognition()
    recognition.lang = 'de-DE'
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onstart = () => {
      setError('')
      setIsListening(true)
    }
    recognition.onresult = (event) => {
      const nextTranscript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? '')
        .join(' ')
        .trim()
      setTranscript(nextTranscript)
    }
    recognition.onerror = (event) => {
      setError(getRecognitionErrorMessage(event.error))
      setIsListening(false)
    }
    recognition.onend = () => setIsListening(false)
    recognitionRef.current = recognition

    return () => {
      recognition.onstart = null
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
      recognition.abort()
      recognitionRef.current = null
    }
  }, [])

  function startListening() {
    if (!recognitionRef.current || isListening) return
    setError('')
    try {
      recognitionRef.current.start()
    } catch (startError) {
      console.error('Spracheingabe konnte nicht gestartet werden:', startError)
      setError('Die Spracheingabe konnte nicht gestartet werden. Du kannst deine Antwort schreiben.')
      setIsListening(false)
    }
  }

  function stopListening() {
    if (!recognitionRef.current || !isListening) return
    recognitionRef.current.stop()
  }

  function resetTranscript() {
    setTranscript('')
    setError('')
  }

  return {
    isSupported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  }
}

