const DEFAULT_MODEL = 'llama-3.1-8b-instant'

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
        temperature: 0.7,
        max_tokens: 180,
        messages: [
          {
            role: 'system',
            content:
              'Du bist der freundliche MyFlow KI-Coach. Antworte immer auf Deutsch, sehr kurz, ruhig und motivierend. Starte bei der ersten freien Nachricht nicht direkt mit einer langen Anleitung. Wenn die Frage unklar ist, stelle zuerst eine kurze Rückfrage. Wenn du Tipps gibst, nutze maximal 2 bis 3 kurze Punkte mit je einem Satz. Keine langen Listen, keine langen Erklärungen. Hilf bei Routinen, Motivation, Tagesplanung, Check-ins, Kalender, Tagebuch und gesunden Gewohnheiten. Gib keine medizinischen Diagnosen und keine Therapie. Bei ernsten, akuten oder gesundheitlich riskanten Beschwerden verweise freundlich auf Ärztinnen/Ärzte, Notruf oder professionelle Hilfe.',
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

