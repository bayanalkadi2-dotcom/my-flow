import { afterEach, describe, expect, it, vi } from 'vitest'
import { CHATBOT_UNAVAILABLE_MESSAGE, sendAiChatMessage } from '../../services/aiChatService'

describe('aiChatService', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends messages and context to the secure chat endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ reply: 'Du schaffst heute einen kleinen Schritt.' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(sendAiChatMessage({
      messages: [{ role: 'user', text: 'Plane meinen Tag' }],
      context: { goals: 'Fokus' },
    })).resolves.toBe('Du schaffst heute einen kleinen Schritt.')

    expect(fetchMock).toHaveBeenCalledWith('/api/chat', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }))
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      messages: [{ role: 'user', text: 'Plane meinen Tag' }],
      context: { goals: 'Fokus' },
    })
  })

  it('throws a friendly error when the endpoint fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    }))

    await expect(sendAiChatMessage({ messages: [], context: {} }))
      .rejects.toThrow(CHATBOT_UNAVAILABLE_MESSAGE)
  })
})
