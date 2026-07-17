const DEFAULT_MODEL = 'llama-3.1-8b-instant'

const COACH_INSTRUCTIONS = `Du bist MyFlow Coach, ein aufmerksamer, warmherziger und praktisch hilfreicher Begleiter.

Gesprächsführung:
- Lies den gesamten verfügbaren Gesprächsverlauf und beziehe dich auf konkrete Aussagen der Person.
- Erkenne Ursache, zeitlichen Zusammenhang und Widersprüche. Wiederhole keine bereits beantwortete Frage.
- Beginne mit einem kurzen Satz, der zeigt, dass du das konkrete Problem verstanden hast.
- Stelle höchstens eine gezielte Rückfrage, wenn wichtige Informationen fehlen.
- Gib danach maximal 2 bis 3 passende, konkrete Schritte. Keine allgemeinen Floskeln und keine langen Standardlisten.
- Schreibe natürliches, korrektes Deutsch. Nutze Aufzählungen nur, wenn sie wirklich helfen.
- Frage am Ende nur dann nach, wenn die Antwort für den nächsten sinnvollen Schritt gebraucht wird.

MyFlow-Kontext:
- Hilf bei Routinen, Motivation, Tagesplanung, Check-ins, Kalender, Tagebuch und gesunden Gewohnheiten.
- Nutze die bereitgestellten Profildaten und Routinen, erfinde aber keine persönlichen Fakten.
- Bei Rückschlägen nicht urteilen. Schlage einen kleinen, realistischen nächsten Schritt vor.

Gesundheit und Sicherheit:
- Stelle keine Diagnose und ersetze keine medizinische Beratung.
- Nimm neue körperliche Symptome wie Zittern, Schwindel, Schwäche, Verwirrtheit, Atemnot oder Schmerzen ernst.
- Bei solchen Symptomen nicht nur Entspannungsübungen empfehlen. Weise ruhig auf eine mögliche körperliche Ursache hin und frage kurz nach Schweregrad, Dauer sowie relevanten Erkrankungen oder Medikamenten.
- Empfehle bei starken, plötzlich auftretenden, zunehmenden oder anhaltenden Beschwerden zeitnahe medizinische Hilfe; bei akuter Gefahr den Notruf.
- Bei Ernährungsänderungen keine extremen Einschränkungen fördern. Empfehle schrittweise, ausgewogene Veränderungen und professionelle Abklärung, wenn Beschwerden auftreten.

Antworte normalerweise in 3 bis 7 kurzen Sätzen.`

function readBody(request) {
  if (request.body && typeof request.body === 'object') {
    return request.body
  }

  return new Promise((resolve, reject) => {
    let rawBody = ''
    request.on('data', (chunk) => {
      rawBody += chunk
    })
    request.on('end', () => {
      try {
        resolve(rawBody ? JSON.parse(rawBody) : {})
      } catch (error) {
        reject(error)
      }
    })
    request.on('error', reject)
  })
}

function sanitizeMessages(messages = []) {
  return messages
    .filter((message) => message && ['user', 'assistant'].includes(message.role))
    .slice(-10)
    .map((message) => ({
      role: message.role,
      content: String(message.text || message.content || '').slice(0, 1200),
    }))
    .filter((message) => message.content.trim())
}

function buildContextText(context = {}) {
  return [
    `Name: ${context.name || 'nicht angegeben'}`,
    `Ziele: ${context.goals || 'nicht angegeben'}`,
    `Tagesablauf: ${context.dailyRoutine || 'nicht angegeben'}`,
    `Offene Routinen: ${(context.openHabits || []).join(', ') || 'keine'}`,
    `Erledigte Routinen: ${(context.doneHabits || []).join(', ') || 'keine'}`,
    `Heutige Tagebuchnotiz: ${context.todayNote || 'keine'}`,
  ].join('\n')
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GROQ_API_KEY || process.env.MYFLOW_AI_API_KEY
  if (!apiKey) {
    return response.status(500).json({ error: 'AI key is not configured' })
  }

  try {
    const body = await readBody(request)
    const messages = sanitizeMessages(body.messages)

    if (!messages.length) {
      return response.status(400).json({ error: 'No message provided' })
    }

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || DEFAULT_MODEL,
        temperature: 0.45,
        max_tokens: 320,
        messages: [
          {
            role: 'system',
            content: COACH_INSTRUCTIONS,
          },
          {
            role: 'system',
            content: `Aktueller MyFlow-Kontext:\n${buildContextText(body.context)}`,
          },
          ...messages,
        ],
      }),
    })

    const data = await groqResponse.json().catch(() => ({}))

    if (!groqResponse.ok) {
      return response.status(groqResponse.status).json({
        error: data.error?.message || 'AI request failed',
      })
    }

    const reply = data.choices?.[0]?.message?.content?.trim()
    if (!reply) {
      return response.status(502).json({ error: 'AI response was empty' })
    }

    return response.status(200).json({ reply })
  } catch (error) {
    console.error('MyFlow KI-Chat Fehler:', error)
    return response.status(500).json({ error: 'Chatbot unavailable' })
  }
}

