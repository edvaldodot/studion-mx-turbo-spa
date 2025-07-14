import { http } from '@/support/http'
import { parse } from '@/support/payloadParser'

export const setQuestionFeedback = (sessionUuid, interactionId, feedback) => {
  return http.post(
    `classroom/${sessionUuid}/kb/${interactionId}/feedback`,
    parse({ useful: Number(feedback) })
  )
}

export const getSessionTeam = (sessionUuid) => {
  return http.get(`classroom/${sessionUuid}/team`)
}

export const forwardResponsible = (id, payload) => {
  return http.put(`knowledge_base/issue/${id}`, payload)
}
