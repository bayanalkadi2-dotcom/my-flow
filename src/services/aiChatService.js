export const CHATBOT_UNAVAILABLE_MESSAGE = 'Der Chatbot ist gerade nicht erreichbar.'

export async function sendAiChatMessage({ messages, context }) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages, context }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok || !data.reply) {
    throw new Error(data.error || CHATBOT_UNAVAILABLE_MESSAGE)
  }

  return data.reply
}
