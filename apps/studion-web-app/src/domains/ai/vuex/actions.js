import * as services from '../services'

export const attemptCallAI = (_, data) => {
  return services.callAI(data)
}

export const attemptCallAIWithContext = (_, data) => {
  return services.callAIWithContext(data)
}

export const attemptCallAIPrompt = (_, prompt) => {
  return services.callAiPrompt(prompt)
}
