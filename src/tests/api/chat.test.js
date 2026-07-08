import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import chatHandler from '../../../api/chat'

function createResponse() {
  return {
    code: 200,
    headers: {},
    payload: null,
    setHeader(name, value) {
      this.headers[name] = value
    },
    status(code) {
      this.code = code
      return this
    },
    json(payload) {
      this.payload = payload
      return this
    },
  }
}

describe('api/chat endpoint', () => {
  beforeEach(() => {
    delete process.env.GROQ_API_KEY
    delete process.env.MYFLOW_AI_API_KEY
    delete process.env.GROQ_MODEL
  })

  afterEach(() => {
    delete process.env.GROQ_API_KEY
    delete process.env.MYFLOW_AI_API_KEY
    delete process.env.GROQ_MODEL
    vi.unstubAllGlobals()
  })

  it('rejects requests when no server-side key is configured', async () => {
    const response = createResponse()

    await chatHandler({ method: 'POST', body: { messages: [{ role: 'user', text: 'Hallo' }] } }, response)

    expect(response.code).toBe(500)
    expect(response.payload.error).toBe('AI key is not configured')
  })

  it('calls Groq with the server-side key and returns the assistant reply', async () => {
    process.env.GROQ_API_KEY = 'server-test-key'
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Heute reicht ein kleiner Schritt.' } }],
      }),
    })
    vi.stubGlobal('fetch', fetchMock)
    const response = createResponse()

    await chatHandler({
      method: 'POST',
      body: {
        context: { goals: 'Fokus' },
        messages: [{ role: 'user', text: 'Motiviere mich' }],
      },
    }, response)

    expect(response.code).toBe(200)
    expect(response.payload.reply).toBe('Heute reicht ein kleiner Schritt.')
    expect(fetchMock).toHaveBeenCalledWith('https://api.groq.com/openai/v1/chat/completions', expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: 'Bearer server-test-key',
      }),
    }))
  })
})
