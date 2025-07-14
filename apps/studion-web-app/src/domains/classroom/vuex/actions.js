import * as TYPES from './mutations-types'
import * as services from '../services'

import { pgtrCreateResource } from '@/support/utils/paginator'

export const openModalReadMoreAnnouncement = ({ commit }, payload) => {
  commit(TYPES.SET_CLASSROOM_ANNOUNCEMENT_TO_READ, payload)
  commit(TYPES.SET_CLASSROOM_MODAL_READ_ANNOUNCEMENT, true)
}

export const closeModalReadMoreAnnouncement = ({ commit }) => {
  commit(TYPES.SET_CLASSROOM_MODAL_READ_ANNOUNCEMENT, false)
  commit(TYPES.SET_CLASSROOM_ANNOUNCEMENT_TO_READ, null)
}

export const attemptClassroomResourcesRetrieval = async (
  { state, commit, dispatch },
  { sessionUuid, params }
) => {
  try {
    commit(TYPES.SET_FLOATING_NOTES_ACTIVE, false)

    const biometricToken = state.facialRecognition.token

    if (biometricToken) {
      params = {
        ...params,
        token: biometricToken,
      }
    }

    const classroom = await services.getClassroomResources({ sessionUuid, params })
    const currentSession = classroom.data

    commit(TYPES.SET_CLASSROOM, {
      ...currentSession,
    })

    if (currentSession.path) {
      dispatch('attemptClassroomTrailNextSolution', {
        currentSessionUuid: currentSession.uuid,
        trailId: currentSession.path.id,
      })
    }

    return classroom
  } catch (error) {
    const errData = error && error.response && error.response.data

    if (errData && errData.message === 'biometric_capture_required') {
      return dispatch('setActiveFacialRecognition', true)
    }

    throw error.response
  }
}
export const attemptClassroomTrailNextSolution = ({ commit }, { trailId, currentSessionUuid }) => {
  services.getTrailSolutions(trailId).then(({ data }) => {
    if (!data || !data.length) return

    let classroomIndex = data.findIndex(
      (classroom) => classroom.session_uuid === currentSessionUuid
    )

    if (classroomIndex === -1 || data.length <= classroomIndex + 1) return

    commit(TYPES.SET_CLASSROOM_NEXT_SOLUTION, data[classroomIndex + 1])
  })
}

export const fetchStudentProgress = async ({ commit }, sessionUUID) => {
  const response = await services.getStudentProgress(sessionUUID)
  commit(TYPES.SET_CLASSROOM_STUDENT_PROGRESS, response.data)
}

export const fetchStudentProgressDetails = async ({ commit }, sessionUUID) => {
  const response = await services.getStudentProgressDetails(sessionUUID)
  commit(TYPES.SET_CLASSROOM_STUDENT_PROGRESS_DETAILS, response.data)
}

export const attemptCourseTopicsRetrieval = (_, { sessionUuid, enableExamination }) => {
  return services.getCourseTopics({ sessionUuid, enableExamination })
}

export const attemptDownloadTopicAsset = async (_, { assetId, filename }) => {
  const data = await services.getTopicAssetBlob(assetId)
  let link = document.createElement('a')
  link.href = window.URL.createObjectURL(data)
  link.download = filename
  link.click()
}

export const attemptMakeExamination = (_, { sessionUuid, data }) => {
  return services.makeExamination({ sessionUuid, data })
}

export const attemptChatroomAccess = (_, { sessionUuid, chatroomId }) => {
  return services.accessChatroom({ sessionUuid, chatroomId })
}

export const attemptChatRoomRetrievalBySession = (_, data) => {
  if (data && data.fromCache) return data.fromCache

  return services.getChatroomsBySession(data.params).then((res) => res.data)
}

export const attemptInstanceDiscussionsListRetrieval = () => {
  return services.getForumInstanceDiscussionsList()
}

export const attemptClassroomPollsQuestionsListRetrieval = (_, sessionUuid) => {
  return services.getClassroomPollsList(sessionUuid)
}

export const attemptClassroomPollQuestionVote = (_, { sessionUuid, choices }) => {
  return services.votePoll(sessionUuid, choices)
}

export const attemptClassroomKbIssuesRetrieval = (_, params) => {
  return services.getClassroomKbList(params)
}

export const attemptClassroomKbIssueCreation = (_, { sessionUuid, data }) => {
  return services.createClassroomKbIssue(sessionUuid, data)
}

export const attemptClassroomKbInteractionCreation = (_, { sessionUuid, data }) => {
  return services.createClassroomKbInteraction(sessionUuid, data)
}

export const attemptClassroomAnnouncementsRetrieval = (_, { sessionUuid, profileAlias, limit }) => {
  return services.getClassroomAnnouncements(sessionUuid, profileAlias, limit)
}

export const attemptClassroomDashboardAnnouncementsRetrieval = (_, { sessionUuid, limit }) => {
  return services.getClassroomDashboardAnnouncements(sessionUuid, limit)
}

export const attemptClassroomCalendarEventCreation = (_, { sessionUuid, data }) => {
  return services.createCalendarEvent(sessionUuid, data)
}

export const attemptClassroomCalendarEventUpdate = (_, { sessionUuid, data }) => {
  return services.updateCalendarEvent(sessionUuid, data)
}

export const attemptClassroomCalendarMonthRetrieval = (_, { sessionUuid, month, year }) => {
  return services.getCalendarByMonth(sessionUuid, month, year)
}

export const attemptClassroomNextCalendarEvents = (_, { sessionUuid, limit }) => {
  return services.getNextCalendarEvents(sessionUuid, limit)
}

export const attemptClassroomTodayCalendarEvents = (_, { sessionUuid, limit }) => {
  return services.getTodayCalendarEvents(sessionUuid, limit)
}

export const attemptClassroomCalendarEventRemoval = (_, eventId) => {
  return services.deleteCalendarEvent(eventId)
}

export const attemptClassroomCalendarEventRetrieval = (_, { sessionUuid, eventId, isStudent }) => {
  return services.getCalendarEvent(sessionUuid, eventId, isStudent)
}

export const attemptDownloadKbAttachment = (_, { sessionUuid, data }) => {
  return services.downloadKbAttachment(sessionUuid, data)
}

export const attemptConsumeTopic = (_, params) => {
  return services.consumeTopic(params)
}

export const attemptSaveResearch = (_, { data, sessionUuid }) => {
  return services.saveResearch(data, sessionUuid)
}

export const attemptSaveCompetency = (_, data) => {
  return services.saveCompetency(data)
}

export const attemptGetClassroomLibrary = (_, { sessionUuid, params = {} }) => {
  return services.getClassroomLibrary(sessionUuid, params)
}

export const attemptGetClassroomLibraryOptimized = (_, { sessionUuid, params = {} }) => {
  return services.getClassroomLibraryOptimized(sessionUuid, params)
}

export const attemptClassroomDownloadLibraryFile = (_, data) => {
  return services.downloadClassroomLibraryFile(data)
}

export const attemptClassroomPreviewLibraryFile = (_, data) => {
  return services.previewClassroomLibraryFile(data)
}

export const attemptListClassroomEvaluationStudent = (_, data) => {
  return services.listClassroomEvaluationStudent(data)
}

export const attemptUserMakeExaminationAgentRetrieval = (_, data) => {
  return services.getUserMakeExaminationAgent(data)
}

export const attemptUserMakeExaminationStudentRetrieval = (_, data) => {
  return services.getUserMakeExaminationStudent(data)
}

export const attemptGradeBatchQuestions = (_, { sessionUuid, data }) => {
  return services.gradeBatchQuestions(sessionUuid, data)
}

export const attemptListClassroomEvaluation = (_, sessionUuid) => {
  return services.getClassroomEvaluationList(sessionUuid)
}

export const attemptListClassroomEvaluationByEnrollment = (_, params) => {
  return services.getClassroomEvaluationListByEnrollment(params.sessionUuid, params.searchParams)
}

export const attemptGetMakeExaminationNavigation = (_, params) => {
  return services.getMakeExaminationNavigation(params)
}

export const getStudentExaminations = (_, data) => {
  if (data && data.fromCache) return data.fromCache

  return services.getStudentEvaluationListByEnrollment(data.params.query.sessionUuid, data.params)
}

export const attemptListClassroomEvaluationByCurrentEnrollment = (
  _,
  { sessionUuid, searchParams }
) => {
  return services.getClassroomEvaluationListByCurrentEnrollment(sessionUuid, searchParams)
}

export const attemptListClassroomEvaluationLTIByCurrentEnrollment = (
  _,
  { sessionUuid, searchParams }
) => {
  return services.getClassroomEvaluationLTIListByCurrentEnrollment(sessionUuid, searchParams)
}

export const attemptListClassroomEvaluationByQuestion = (_, params) => {
  const { sessionUuid, questionId, pageNumber, firstPending } = params

  return services.getClassroomEvaluationListByQuestion(
    sessionUuid,
    questionId,
    pageNumber,
    firstPending
  )
}

export const attemptListClassroomQuestionSummary = (_, params) => {
  const { sessionUuid, topicId } = params

  return services.getClassroomEvaluationQuestionSummary(sessionUuid, topicId)
}

export const attemptGetEnrollmentExamination = async ({ commit }, data) => {
  if (data.fromCache) return commit(TYPES.SET_ENROLLMENT_EXAMINATIONS, data.fromCache)

  const method = data.params.isStudent
    ? services.getEnrollmentExamination
    : services.getExaminationByEnrollment

  let response = await method(data)

  commit(TYPES.SET_ENROLLMENT_EXAMINATIONS, response.data.data)
  return response.data
}

export const attemptGradeExaminationAnswer = (_, { sessionUuid, data, makeExaminationId }) => {
  return services.gradeExaminationAnswer(sessionUuid, data, makeExaminationId)
}

export const attemptGradeExaminationAnswerById = (_, { sessionUuid, data }) => {
  return services.gradeExaminationAnswerById(sessionUuid, data)
}

export const attemptDeleteGradeExaminationAnswer = (_, { sessionUuid, id }) => {
  return services.deleteGradeExaminationAnswer(sessionUuid, id)
}

export const attemptUpdatePassword = (_, { oldPassword, newPassword }) => {
  return services.updatePassword(oldPassword, newPassword)
}

export const attemptOpenTopic = async (
  { state, dispatch },
  { assetId, topicId, sessionUuid, accessType = '' }
) => {
  try {
    const biometricToken = state.facialRecognition.token

    const topic = await services.openTopic(
      assetId,
      topicId,
      sessionUuid,
      accessType,
      biometricToken
    )

    return topic
  } catch (error) {
    const errData = error && error.response && error.response.data

    if (errData && errData.hint && errData.hint.deadlinePause) {
      dispatch('setWorkdloadLimitStatus', {
        status: error.response.data.message,
        deadlinePause: error.response.data.hint.deadlinePause,
      })
    }

    if (errData && errData.message === 'biometric_capture_required') {
      dispatch('setActiveFacialRecognition', true)
    }

    throw error.response
  }
}

export const setWorkdloadLimitStatus = ({ commit }, data) => {
  commit(TYPES.SET_WORKLOAD_LIMIT_STATUS, data)
}

export const attemptCheckActivity = (_, { token, topicId, sessionUuid }) => {
  return services.checkActivity(token, topicId, sessionUuid)
}

export const attemptGetTopicPrerequisites = (_, { topicId, sessionUuid }) => {
  return services.getTopicPrerequisites(topicId, sessionUuid)
}

export const attemptCheckTopicsCompleted = (_, { sessionUuid, topics }) => {
  return services.checkTopicsCompleted(topics, sessionUuid)
}

export const classroomOfferingsResource = async ({ commit }, data) => {
  return pgtrCreateResource(
    commit,
    data,
    services.getClassroomOfferings,
    TYPES.SET_CLASSROOM_OFFERINGS
  )
}

export const attemptDownloadExaminationFile = (_, file) => {
  return services.downloadExaminationFile(file)
}

export const getCompetencyListResource = async ({ commit }, data) => {
  if (data && data.fromCache) return commit(TYPES.SET_COMPETENCY_LIST, data.fromCache)

  const response = await services.getCompetencyList({
    session_uuid: data.params.session_uuid,
    params: data.params,
  })
  commit(TYPES.SET_COMPETENCY_LIST, response.data.data)
  return response.data
}

export const getCompetenciesListResource = async ({ commit }, data) => {
  if (data && data.fromCache) return commit(TYPES.SET_COMPETENCY_LIST, data.fromCache)

  const response = await services.getCompetenciesList({
    session_uuid: data.params.session_uuid,
    params: data.params,
  })
  commit(TYPES.SET_COMPETENCY_LIST, response.data.data)
  return response.data
}

export const getStudentsCompetencyListResource = async ({ commit }, data) => {
  if (data && data.fromCache) return commit(TYPES.SET_STUDENTS_COMPETENCY_LIST, data.fromCache)

  const response = await services.getStudentsCompetencyList({
    session_uuid: data.params.session_uuid,
    params: data.params,
  })
  commit(TYPES.SET_STUDENTS_COMPETENCY_LIST, response.data.data)
  return response.data
}

export const attemptRetrievePreProjectListResource = async ({ commit }, data) => {
  if (data && data.fromCache) return commit(TYPES.SET_PRE_PROJECT_LIST, data.fromCache)

  const response = await services.getPreProjectList(data)
  commit(TYPES.SET_PRE_PROJECT_LIST, response.data.data)
  return response.data
}

export const attemptRetrieveProjectListResource = async ({ commit }, data) => {
  if (data && data.fromCache) return commit(TYPES.SET_PROJECT_LIST, data.fromCache)

  const response = await services.getProjectList(data)
  commit(TYPES.SET_PROJECT_LIST, response.data.data)
  return response.data
}

export const attemptSaveCompetencyFeedback = (_, data) => {
  return services.saveCompetencyFeedback(data)
}

export const attemptGetStudentCompetency = async ({ dispatch }, id) => {
  dispatch('setFetching', true)
  const response = await services.getStudentCompetency(id)
  dispatch('setFetching', false)
  return response.data
}

export const attemptAddGeneralFeedback = (_, { id, comment }) => {
  return services.addGeneralFeedback(id, comment)
}

export const attemptEditGeneralFeedback = (_, { id, comment }) => {
  return services.editGeneralFeedback(id, comment)
}

export const attemptDeleteGeneralFeedback = (_, { id }) => {
  return services.deleteGeneralFeedback(id)
}

export const setClassroomFinalAccessStatus = ({ commit }, status) => {
  commit(TYPES.SET_CLASSROOM_FINAL_ACCESS, status)
}

export const attemptSavePreProjectConfig = (_, { preProjectId, form }) => {
  return services.savePreProjectConfig(preProjectId, form)
}

export const attemptRetrievePreProjectAvailableStudents = (_, { sessionUuid, params }) => {
  return services.getPreProjectAvailableStudents(sessionUuid, params)
}

export const attemptAddPreProjectAvailableStudents = (_, { groupId, enrollments }) => {
  return services.addPreProjectNewStudents(groupId, enrollments)
}

export const attemptSavePreProjectGroup = (_, { sessionUuid, payload }) => {
  return services.savePreProjectGroup(sessionUuid, payload)
}

export const attemptRetrievePreProjectGroup = (_, sessionUuid) => {
  return services.getPreProjectGroup(sessionUuid)
}

export const attemptDeletePreProjectGroup = (_, groupId) => {
  return services.deletePreProjectGroup(groupId)
}

export const getPreProjectGroupsResources = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_PRE_PROJECT_GROUPS, data.fromCache)
    return
  }

  let response = await services.getPreProjectGroups(data.params)
  commit(TYPES.SET_PRE_PROJECT_GROUPS, response.data.data)
  return response.data
}

export const attemptGetHistoryActionPreProject = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_HISTORY_ACTION_PRE_PROJECT, data.fromCache)
    return
  }

  let response = await services.getHistoryActionPreProject(data)
  commit(TYPES.SET_HISTORY_ACTION_PRE_PROJECT, response.data.data)
  return response.data
}

export const attemptGetHistoryEvaluation = (_, data) => {
  return services.getHistoryEvaluation(data)
}

export const attemptGetClassroomNotifications = ({ commit }, payload) => {
  return services.getClassroomNotifications(payload).then((response) => {
    commit(TYPES.SET_CLASSROOM_NOTIFICATIONS, response)
    return response
  })
}

export const attemptClearClassroomNotifications = ({ commit }) => {
  commit(TYPES.SET_CLASSROOM_NOTIFICATIONS, [])
}

export const attemptReadClassroomNotifications = ({ getters }, payload) => {
  const filteredNotifications = getters.getClassroomNotifications.filter((notification) => {
    if (!notification.examination_id) return false
    if (notification.topic_id == payload.topicId) return true

    const sameExamination = notification.examination_id === payload.examinationId
    const sameEnrollment =
      notification.enrollment_examination_id === payload.enrollmentExaminationId
    return sameExamination && sameEnrollment
  })

  if (filteredNotifications.length === 0) return

  const notifications = filteredNotifications.map((notification) => {
    return notification.examination_notification_id
  })

  return services.readClassroomNotifications({ examination_notification_ids: notifications })
}

export const attemptReadCompetencyClassroomNotifications = ({ getters }, payload) => {
  const filteredNotifications = getters.getClassroomNotifications.filter((notification) => {
    if (!notification.competency_id) return false
    if (notification.topic_id == payload.topicId) return true

    const sameCompetency = notification.competency_id === payload.competencyId
    const sameEnrollment = notification.enrollment_competency_id === payload.enrollmentCompetencyId
    return sameCompetency && sameEnrollment
  })

  if (filteredNotifications.length === 0) return

  const notifications = filteredNotifications.map((notification) => {
    return notification.competency_notification_id
  })

  return services.readCompetencyClassroomNotifications({
    competency_notification_ids: notifications,
  })
}

export const attemptGetClassroomToolsHasItems = (_, sessionUuid) => {
  return services.getClassroomToolsHasItems(sessionUuid)
}

export const setOnTutorialClassroom = ({ commit }, isOnTutorial) => {
  commit(TYPES.SET_ON_TUTORIAL, isOnTutorial)
}

export const attemptGetEvaluationPreview = (_, payload) => {
  return services.getEvaluationPreview(payload)
}

export const attemptGetKnowledgeBaseExtensions = () => {
  return services.getKnowledgeBase()
}

export const setActiveFacialRecognition = ({ commit }, value) => {
  return commit(TYPES.SET_ACTIVE_FACIAL_RECOGNITION, value)
}

export const setFacialRecognitionNext = ({ commit }, value) => {
  return commit(TYPES.SET_FACIAL_RECOGNITION_NEXT, value)
}

export const resetFacialRecognition = ({ commit }) => {
  return commit(TYPES.RESET_FACIAL_RECOGNITION)
}

export const setTokenFacialRecognition = ({ commit }, value) => {
  return commit(TYPES.SET_TOKEN_FACIAL_RECOGNITION, value)
}

export const attemptVerifyBiometricCapture = (_, data) => {
  return services.verifyBiometricCapture(data)
}

export const attemptValidateExit = async ({ state, dispatch }, data) => {
  try {
    const response = await services.validateExit(data, state.facialRecognition.token)
    dispatch('resetFacialRecognition')
    return response
  } catch (error) {
    const errData = error && error.response && error.response.data

    if (errData && errData.message === 'biometric_capture_required') {
      return dispatch('setActiveFacialRecognition', true)
    }

    throw error.response
  }
}

export const toggleFloatingNotes = ({ commit }) => {
  commit(TYPES.TOGGLE_FLOATING_NOTES)
}

export const classroomNotesResource = async ({ commit }, data) => {
  if (data && data.params && data.params.filter && data.params.filter[0]) {
    commit(TYPES.SET_NOTE_ID, data.params.filter[0].note_id)
  }

  if (data.fromCache) {
    return commit(TYPES.SET_CLASSROOM_NOTES, data.fromCache)
  }
  let response = await services.getClassroomNotes(data)
  commit(TYPES.SET_CLASSROOM_NOTES, response.data.data)
  return response.data
}

export const attemptGetClassroomNote = (_, id) => {
  return services.getClassroomNote(id)
}

export const attemptCreateClassroomNote = (_, data) => {
  return services.createClassroomNote(data)
}

export const attemptEditClassroomNote = (_, data) => {
  return services.editClassroomNote(data)
}

export const attemptDeleteClassroomNote = (_, id) => {
  return services.deleteClassroomNote(id)
}

export const attemptDownloadNotes = (_, notes) => {
  return services.downloadNotes(notes)
}

export const attemptPreProjectGroupSession = async ({ commit }, payload) => {
  if (payload.fromCache) {
    return commit(TYPES.SET_PRE_PROJECT_GROUP_LIST, payload.fromCache)
  }
  const response = await services.getPreProjectGroupSession(payload)

  commit(TYPES.SET_PRE_PROJECT_GROUP_LIST, response.data)
  return response.data
}

export const attemptPreProjectStudentList = async ({ commit }, payload) => {
  if (payload.fromCache) {
    return commit(TYPES.SET_PRE_PROJECT_STUDENT_LIST, payload.fromCache)
  }
  const response = await services.getPreProjectStudents(payload)

  commit(TYPES.SET_PRE_PROJECT_STUDENT_LIST, response.data)
  return response.data
}

export const attemptRemovePreProjectGroup = (_, id) => {
  return services.removePreProjectGroup(id)
}

export const attemptGetPreProjectGroupDetails = (_, { sessionUuid, id }) => {
  return services.getPreProjectGroupDetails(sessionUuid, id)
}

export const attemptCreatePreprojectGroup = (_, payload) => {
  return services.createPreprojectGroup(payload)
}

export const attemptEditPreprojectGroup = (_, payload) => {
  return services.editPreprojectGroup(payload)
}
export const attemptCategoryListResource = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_CATEGORY_LIST_RESOURCE, data.fromCache)
    return
  }

  let response = await services.getCategoryListKB(data)
  commit(TYPES.SET_CATEGORY_LIST_RESOURCE, response.data.data)
  return response.data
}
export const attemptCreateCategoryKB = (_, { sessionUuid, payload }) => {
  return services.createCategoryKB(sessionUuid, payload)
}

export const attemptCreateSubCategoryKB = (_, { sessionUuid, category_id, payload }) => {
  return services.createSubCategoryKB(sessionUuid, category_id, payload)
}

export const attemptEditCategoryKB = (_, { sessionUuid, payload }) => {
  return services.editCategoryKB(sessionUuid, payload)
}

export const attemptEditSubCategoryKB = (_, { sessionUuid, category_id, payload }) => {
  return services.editSubCategoryKB(sessionUuid, category_id, payload)
}

export const attemptDeleteCategoryKB = (_, { sessionUuid, category_id }) => {
  return services.deleteCategoryKB(sessionUuid, category_id)
}

export const attemptDeleteSubCategoryKB = (_, { sessionUuid, subcategory_id }) => {
  return services.deleteSubCategoryKB(sessionUuid, subcategory_id)
}

export const attemptCategoryFilterResource = async (_, data) => {
  let response = await services.getCategoryListKB(data)

  return response.data
}

export const attemptPreProjectSessionGroup = async ({ commit }, payload) => {
  if (payload.fromCache) {
    return commit(TYPES.SET_PRE_PROJECT_GROUP_SESSION_LIST, payload.fromCache)
  }
  const response = await services.getPreProjectGroupSessionList(payload)

  commit(TYPES.SET_PRE_PROJECT_GROUP_SESSION_LIST, response.data)
  return response.data
}

export const attemptCreateExternalLink = (_, { sessionUuid, payload }) => {
  return services.createExternalLink(sessionUuid, payload)
}

export const attemptEditExternalLink = async (_, data) => {
  const response = await services.editExternalLink(data)
  return response.data
}

export const attemptGetExternalLink = async (_, data) => {
  let response = await services.getExternalLink(data)

  return response.data
}

export const attemptGetAdditionalFields = async (_, data) => {
  let response = await services.getAdditionalFields(data)

  return response.data
}

export const attemptGetOpenExternalLink = async (_, { idTool, id }) => {
  let response = await services.getOpenExternalLink(idTool, id)

  return response.data
}

export const attemptExternalLinkList = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_CATEGORY_LIST_RESOURCE, data.fromCache)
    return
  }

  let response = await services.getExternalLinkList(data)
  commit(TYPES.SET_CATEGORY_LIST_RESOURCE, response.data.data)
  return response.data
}

export const attemptDeleteExternalLink = (_, { idTool, idLink }) => {
  return services.deleteExternalLink(idTool, idLink)
}

export const attemptExternalLinkStatus = (_, payload) => {
  return services.toggleExternalLinkStatus(payload)
}
