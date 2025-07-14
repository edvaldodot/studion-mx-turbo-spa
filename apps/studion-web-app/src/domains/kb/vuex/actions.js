import * as services from '../services'

export const attemptKbQuestionFeedback = (_, { sessionUuid, interactionId, feedback }) => {
  return services.setQuestionFeedback(sessionUuid, interactionId, feedback)
}

export const attemptSessionTeamRetrieval = (_, sessionUuid) => {
  return services.getSessionTeam(sessionUuid)
}

export const attemptForwardResponsible = (_, { id, payload }) => {
  return services.forwardResponsible(id, payload)
}
