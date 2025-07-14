import * as services from '../services'

export const attemptPollQuestionListRemoval = ({ commit }, pollQuestionId) => {
  return services.removePollQuestion(pollQuestionId)
}

export const attemptPollQuestionCreation = ({ commit }, data) => {
  return services.createPollQuestion(data)
}

export const attemptPollQuestionCreationMultipleSessions = ({ commit }, data) => {
  return services.createPollQuestion(data, true)
}

export const attemptPollQuestionUpdate = ({ commit }, { questionId, data }) => {
  return services.updatePollQuestion(questionId, data)
}
