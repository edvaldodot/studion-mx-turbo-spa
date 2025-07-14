import { http } from '@/support/http'

export const callAI = (data) => {
  return http.post('ai/operation-with-custom-prompt', data)
}

export const callAIWithContext = (data) => {
  return http.post('ai/generate-text-by-prompt-and-context', data)
}

export const callAiPrompt = (prompt) => {
  return http.post('mediation-plans/ai/prompt/generate-message', prompt)
}
