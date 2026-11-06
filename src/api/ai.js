import { LIVE, request, delay } from './client.js'

/**
 * POST /ai/secret-message { occasion, recipient, tone, idea, language } -> { suggestions, maxChars }
 * Hidden in the UI unless GET /settings says features.ai is on.
 */
export async function suggestSecretMessages(input) {
  if (LIVE) return request('/ai/secret-message', { method: 'POST', body: input })
  await delay(900)
  return { suggestions: ['Will you marry me?', 'You are my sunshine', 'Sorry. Still yours.', 'Happy birthday, Maa!', 'Forever starts now'], maxChars: 24 }
}
