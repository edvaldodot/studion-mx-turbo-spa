import * as services from '../services'
import * as TYPES from './mutations-types'

export const attemptSessionListRetrieval = (_, searchParams = {}) => {
  return services.getSessions(searchParams).then((response) => {
    response.data.data = response.data.data.filter(({ type }) => type !== 'global')
    return response
  })
}

export const attemptSessionsBatchListRetrieval = (_, ids) => {
  return services.getSessionsBatch(ids)
}

export const attemptSessionDependenciesRetrieval = (_, sessionId) => {
  return services.getSessionDependencies(sessionId)
}

export const attemptCreateSession = (_, data) => {
  return services.createSession(data)
}

export const attemptSessionUpdate = (_, data) => {
  return services.updateSession(data)
}

export const attemptSessionRemoval = (_, sessionId) => {
  return services.removeSession(sessionId)
}

export const attemptEnrollment = (_, { userUuid, sessionId }) => {
  return services.enrollUser(userUuid, sessionId)
}

export const attemptUnenrollment = (_, enrollmentId) => {
  return services.unenrollUser(enrollmentId)
}

export const attemptSessionUserListRetrieval = (_, { searchParams = {}, sessionId }) => {
  return services.retrieveSessionUserList(sessionId, searchParams)
}

export const attemptExaminationUserListRecovery = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_RECOVERY_LIST, data.fromCache)
    return
  }
  let response = await services.recoverySessionUserList(data.params.sessionId, data.params)
  commit(TYPES.SET_RECOVERY_LIST, response.data.data)
  return response.data
}

export const attemptToolListRetrieval = () => {
  return services.retrieveToolList()
}

export const attemptMyselfDownloadCertificate = (_, payload) => {
  return services.downloadCertificate(payload.hash, payload.isHistory)
}

export const attemptMyselfDownloadPathCertificate = (_, payload) => {
  return services.downloadPathCertificate(payload.hash, payload.isHistory)
}

export const attemptSearchStudent = (_, { filter, sessionUuid }) => {
  return services.searchStudent(filter, sessionUuid)
}

export const attemptEnrollmentStatusUpdate = (_, { enrollmentId, payload }) => {
  return services.editEnrollmentStatus(enrollmentId, payload)
}

export const attemptEnrolledSessionsByOfferingRetrieval = (_, enrollmentId) => {
  return services.retrieveEnrolledSessionsByOffering(enrollmentId)
}

export const attemptEnrollmentStatusListRetrieval = (_, sessionId) => {
  return services.retrieveEnrollmentStatusList(sessionId)
}

export const attemptGetEnrollmentLogs = (_, enrollmentId) => {
  return services.getEnrollmentLogs(enrollmentId)
}

export const attemptEnrollmentReasonListRetrieval = async ({ commit, state }) => {
  let data
  const alreadyLoaded = state.reasonList.data

  if (!alreadyLoaded) {
    data = await services.enrollmentReasonListRetrieval()
    commit(TYPES.SET_REASON_LIST, data.data)
  }

  return data
}

export const attemptEnrollmentReasonAdd = async ({ commit }, name) => {
  const data = await services.enrollmentReasonAdd(name)
  commit(TYPES.ADD_REASON, data.data)
  return data
}

export const attemptUploadEnrollmentSheet = (_, { sessionId, file }) => {
  return services.uploadEnrollmentSheet(sessionId, file)
}

export const attemptGetProgressEnrollment = (_, { processId }) => {
  return services.getProgressEnrollment(processId)
}

export const attemptListBatchProcess = (_, { sessionId, status, params }) => {
  return services.listBatchProcess(sessionId, status, params)
}

export const attemptCancelBatchProcess = (_, { processId }) => {
  return services.cancelBatchProcess(processId)
}

export const attemptDownloadBatchEnrollmentTemplate = () => {
  return services.downloadBatchEnrollmentTemplate()
}

export const attemptDownloadBatchProcessReport = (_, { processId, fileName }) => {
  return services.downloadBatchProcessReport(processId, fileName)
}

export const attemptSessionTeamsRetrieval = (_, { profileId, userId }) => {
  return services.retrieveSessionTeams(profileId, userId)
}

export const attemptSessionUsersRetrieval = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_MEDIATION_LIST, data.fromCache)
    return
  }
  let response = await services.retrieveSessionUsers(data)
  commit(TYPES.SET_SHEET_LIST, response.data.data)
  return response.data
}

export const attemptSessionRetrieval = (_, sessionId) => {
  return services.getSession(sessionId)
}

export const setSessionsData = ({ commit }, data) => {
  commit(TYPES.SET_DATA, data)
}

export const addSessionsItems = ({ commit }, data) => {
  commit(TYPES.ADD_SESSIONS_ITEMS, data)
}

export const setSessionsCurrentItemData = ({ commit }, data) => {
  commit(TYPES.SET_CURRENT_ITEM_DATA, data)
}

export const removeSessionsItem = ({ commit }, data) => {
  commit(TYPES.REMOVE_SESSION_ITEM, data)
}

export const attemptSessionReenrollment = (_, { sessionId, userUuid }) => {
  return services.reenrollUser(sessionId, userUuid)
}

export const getSessionsListResource = async ({ commit }, data) => {
  if (data && data.fromCache) return commit(TYPES.SET_SESSIONS_LIST, data.fromCache)

  const filter = data.params.filter
  if (filter && (!filter.categories || filter.categories.length === 0)) {
    delete data.params.filter.categories
  }

  const response = await services.getSessionsV2(data.params)
  commit(TYPES.SET_SESSIONS_LIST, response.data.data)
  return response.data
}

export const mediationSessionListResource = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_MEDIATION_LIST, data.fromCache)
    return
  }
  let response = await services.getSessionMediationList(data)
  commit(TYPES.SET_MEDIATION_LIST, response.data.data)
  return response.data
}

export const resetMediationSessionList = async ({ commit }) => {
  commit(TYPES.SET_MEDIATION_LIST, [])
}

export const attemptGetTopicsPeriods = async (_, id) => {
  return services.getTopicsPeriods(id)
}

export const attemptSaveTopicsPeriods = async (_, { sessionId, data }) => {
  return services.saveTopicsPeriods(sessionId, data)
}

export const sessionsBatchDateListResources = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_SESSIONS_BATCH_DATE_LIST, data.fromCache)
    return
  }
  let response = await services.getSessionsBatchDate(data)
  commit(TYPES.SET_SESSIONS_BATCH_DATE_LIST, response.data.data)
  return response.data
}

export const attemptPostTopicPeriodsSchedulesMass = (_, { topicId, data }) => {
  return services.postTopicPeriodsSchedulesMass(topicId, data)
}

export const attemptAddSessionGroup = (_, data) => {
  return services.addSessionGroup(data)
}

export const groupSessionListResource = (_, payload) => {
  return services.groupSessionList(payload)
}

export const attemptRemoveSessionGroup = (_, sessionGroupId) => {
  return services.removeSessionGroup(sessionGroupId)
}

export const attemptPostStudentRecovery = (_, { id, data }) => {
  return services.saveStudentRecovery(id, data)
}
