import { http } from '@/support/http'
import { parse, parseToFormData } from '@/support/payloadParser'
import { source } from '@/support/utils/source'
import { objectToFormData } from '@/support/utils/objectToFormData'
import { createQuery } from '@/support/utils/paginatorQueryBuilder'
import i18n from '@/support/i18n'

import config from '@/config'

const { AVOID_EXTERNAL } = config

export const getClassroomResources = ({ sessionUuid, params }) => {
  return http.get(
    `classroom/${sessionUuid}?${createQuery(params)}${params.token ? '&token=' + params.token : ''}`
  )
}

export const getStudentProgress = (sessionUUID) => {
  return http.get(`classroom/${sessionUUID}/progress`)
}
export const getStudentProgressDetails = (sessionUUID) => {
  return http.get(`classroom/${sessionUUID}/progress/details`)
}

export const getCourseTopics = ({ sessionUuid, enableExamination = false }) => {
  if (enableExamination) {
    return http.get(`classroom/${sessionUuid}/topics?enableExamination`)
  }

  return http.get(`classroom/${sessionUuid}/topics`)
}

export const getTopicAssetBlob = async (assetId) => {
  const response = await http.get(`assets/download/${assetId}`, {
    responseType: 'blob',
    headers: { 'Content-Type': 'application/pdf' },
    data: {},
  })
  return response.data
}

export const makeExamination = ({ sessionUuid, data }) => {
  return http.post(`classroom/${sessionUuid}/topics/examinations/make/answers`, data)
}

export const accessChatroom = ({ sessionUuid, chatroomId }) => {
  return http.get(`classroom/${sessionUuid}/chatrooms/${chatroomId}`)
}

export const getChatroomsBySession = (payload) => {
  const filter = { ...payload }

  filter.order = { semantical: 'asc' }

  let queryString = createQuery(filter)

  return http.get(`classroom/${payload.sessionUuid}/chatrooms?${queryString}`)
}

export const getForumDiscussionsList = (forumId) => http.get(`forums/${forumId}/discussions`)

export const getForumInstanceDiscussionsList = () => http.get(`forums/instance/discussions`)

export const getClassroomPollsList = (sessionUuid) => http.get(`classroom/${sessionUuid}/questions`)

export const getClassroomAnnouncements = (sessionUuid, profileAlias, limit) => {
  let url =
    profileAlias === 'student'
      ? `classroom/${sessionUuid}/available_announcements`
      : `classroom/${sessionUuid}/announcements`
  if (limit > 0) {
    url += `?limit=${limit}`
  }
  return http.get(url)
}

export const getClassroomDashboardAnnouncements = (sessionUuid, limit) => {
  let url = `classroom/${sessionUuid}/available_announcements`
  if (limit > 0) {
    url += `?limit=${limit}`
  }
  return http.get(url)
}

export const votePoll = (sessionUuid, choices) => {
  return http.post(`classroom/${sessionUuid}/polls/questions/vote`, { choices })
}

export const getClassroomKbList = (params) => {
  let requestUrl =
    params.profileAlias === 'student'
      ? `classroom/${params.sessionUuid}/my-kb?`
      : `classroom/${params.sessionUuid}/kb?`

  if (params && params.activeOnly) {
    requestUrl = `${requestUrl}active=1&`
  }

  return http.get(`${requestUrl}${createQuery(params)}`)
}

export const createClassroomKbIssue = (sessionUuid, data) => {
  const form = parseToFormData({})
  const { subject, question, profileId, attachment } = data

  form.append('subject', subject)
  form.append('kb_question', question)
  form.append('profile_id', profileId)

  if (attachment) {
    form.append('attachment', attachment, attachment.name)
  }

  return http.post(`classroom/${sessionUuid}/kb`, form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const createClassroomKbInteraction = (sessionUuid, data) => {
  const form = parseToFormData({})
  const { questionId, comment, attachment, issue_category_id, issue_subcategory_id } = data
  form.append('issue_id', questionId)
  form.append('comment', comment)

  if (attachment) {
    form.append('attachment', attachment, attachment.name)
  }

  if (issue_category_id) {
    form.append('issue_category_id', issue_category_id)
  }

  if (issue_subcategory_id) {
    form.append('issue_subcategory_id', issue_subcategory_id)
  }

  return http.post(`classroom/${sessionUuid}/kb/interaction`, form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const createCalendarEvent = (sessionUuid, data) => {
  return http.post(`classroom/${sessionUuid}/calendar/events`, parse(data))
}

export const updateCalendarEvent = (sessionUuid, data) => {
  return http.put(`classroom/${sessionUuid}/calendar/events/${data.id}`, parse(data))
}

export const getCalendarByMonth = (sessionUuid, month, year) => {
  return http.get(`classroom/${sessionUuid}/calendar/events/${month}/${year}`)
}

export const getNextCalendarEvents = (sessionUuid, limit) => {
  return http.get(`classroom/${sessionUuid}/calendar/next/events?limit=${limit}`)
}

export const getTodayCalendarEvents = (sessionUuid, limit) => {
  return http.get(`classroom/${sessionUuid}/calendar/in-progress/events?limit=${limit}`)
}

export const getClassroomLibrary = (sessionUuid, params) =>
  http.get(
    `library/student/files?` +
      createQuery(params) +
      (params.folder ? '&filter[parent_folder_id]=' + params.folder : '') +
      `&filter[session_uuid]=` +
      sessionUuid
  )

export const getClassroomLibraryOptimized = (sessionUuid, params) =>
  http.get(
    `classroom/${sessionUuid}/list_files?` +
      createQuery(params) +
      (params.folder ? '&filter[parent_folder_id]=' + params.folder : '') +
      `&filter[session_uuid]=` +
      sessionUuid
  )

export const deleteCalendarEvent = (eventId) => {
  return http.delete(`/calendar/events/${eventId}`)
}

export const getCalendarEvent = (sessionUuid, eventId, isStudent) => {
  if (isStudent) {
    return http.get(`classroom/${sessionUuid}/calendar/events/${eventId}`)
  }
  return http.get(`/calendar/events/${eventId}`)
}

export const downloadKbAttachment = async (sessionUuid, { id, fileName, mimeType }) => {
  const response = await http.get(
    `classroom/${sessionUuid}/kb/interactions/${id}/attachment?external=true`
  )

  const image = await fetch(response.data)
  const blob = await image.blob()
  const objectUrl = URL.createObjectURL(blob)

  let a = document.createElement('a')
  a.href = objectUrl
  a.setAttribute('download', fileName)
  a.setAttribute('type', mimeType)
  document.body.appendChild(a)
  a.click()

  document.body.removeChild(a)
}

export const saveResearch = (data, sessionUuid) => {
  return http.post(`classroom/${sessionUuid}/topics/researches/make/all`, data)
}

export const saveCompetency = (data) => {
  return http.post(`competency/enrollment`, data)
}

export const previewClassroomLibraryFile = (data) => {
  return http.get(`classroom/${data.session_uuid}/library/files/${data.id}/download`, {
    responseType: 'blob',
  })
}

export const downloadClassroomLibraryFile = async (data) => {
  if (AVOID_EXTERNAL || !['image', 'video'].includes(data.type)) {
    return http
      .get(`classroom/${data.session_uuid}/library/files/${data.id}/download`, {
        responseType: 'blob',
      })
      .then((response) => {
        return new Blob([response.data], { type: response.headers['content-type'] })
      })
  }
  return http.get(`classroom/${data.session_uuid}/library/files/${data.id}/download?external=true`)
}

export const consumeTopic = (params) => {
  const payload = parse(params)

  if (params && params.pages && params.pages.length) {
    return http.post('/myself/topic_consume_pages', payload)
  }

  return http.post('/myself/topic_consume', payload)
}

export const gradeBatchQuestions = (sessionUuid, data) => {
  const form = { grade_answers: data }
  return http.post(`classroom/${sessionUuid}/examinations/questions/grade`, form)
}

export const listClassroomEvaluationStudent = ({ sessionUuid }) => {
  return http.get(`classroom/${sessionUuid}/enrollment/examinations`)
}

export const getUserMakeExaminationAgent = ({ sessionUuid, userMakeExaminationId }) => {
  return http.get(
    `classroom/${sessionUuid}/enrollment/examinations/make/${userMakeExaminationId}/agent`
  )
}

export const getUserMakeExaminationStudent = ({ sessionUuid, userMakeExaminationId }) => {
  return http.get(`classroom/${sessionUuid}/enrollment/examinations/make/${userMakeExaminationId}`)
}

export const getClassroomEvaluationList = ({ sessionUuid, searchParams = {} }) => {
  let queryString = createQuery(searchParams)

  return http.get(`classroom/${sessionUuid}/examinations/students?${queryString}`)
}

export const getClassroomEvaluationListByEnrollment = (sessionUuid, searchParams = {}) => {
  let queryString = createQuery(searchParams)
  return http.get(`classroom/${sessionUuid}/examinations/examination?${queryString}`)
}

export const getMakeExaminationNavigation = (params) => {
  const order = params.query.order.split('=')

  const queryString = {
    query: {
      ...params.query,
    },
    filter: { status: ['awaiting_correction', 'pending'] },
    order: { [order[0]]: order[1] },
  }

  delete queryString.query.order

  return http.get(
    `classroom/${params.sessionUuid}/examinations/list/navigation/${
      params.userMakeExaminationId
    }?${createQuery(queryString, true)}`
  )
}

export const getStudentEvaluationListByEnrollment = (sessionUuid, params = {}) => {
  let queryString = createQuery(params)
  return http
    .get(`classroom/${sessionUuid}/examinations/list?${queryString}`)
    .then(({ data }) => data)
}

export const getClassroomEvaluationListByCurrentEnrollment = (sessionUuid, searchParams = {}) => {
  let queryString = createQuery(searchParams)
  return http.get(`classroom/${sessionUuid}/examinations/evaluations?${queryString}`)
}

export const getClassroomEvaluationLTIListByCurrentEnrollment = (
  sessionUuid,
  searchParams = { type: 'lti' }
) => {
  let queryString = createQuery(searchParams)
  return http.get(
    `classroom/${sessionUuid}/third-party-examinations/list/enrollments?${queryString}`
  )
}

export const getClassroomEvaluationListByQuestion = (
  sessionUuid,
  questionId,
  pageNumber = 1,
  firstPending = false
) => {
  return http.get(
    `classroom/${sessionUuid}/examinations/grading/questions/${questionId}?page=${pageNumber}&first_grade_pending=${Number(
      firstPending
    )}`
  )
}

export const getClassroomEvaluationQuestionSummary = (sessionUuid, topicId) => {
  return http.get(`classroom/${sessionUuid}/examinations/grading/questions/summary/${topicId}`)
}

export const getEnrollmentExamination = ({ params }) => {
  let queryString = createQuery(params)

  return http.get(
    `classroom/${params.sessionUuid}/examinations/${params.examinationId}/enrollment/list?${queryString}`
  )
}

export const getExaminationByEnrollment = ({ params }) => {
  let queryString = createQuery(params)
  return http.get(
    `classroom/${params.sessionUuid}/examinations/${params.examinationId}/enrollment/${params.enrollmentId}/list?${queryString}`
  )
}

export const gradeExaminationAnswer = (sessionUuid, data, makeExaminationId) => {
  let { result, comment, grade, files, allowFile, questionId } = data
  const formBody = {
    result_type: result,
    grade,
    files,
    allowFile,
  }

  if (comment) {
    formBody.comment = comment
  }

  const form = objectToFormData(formBody, { indices: true })

  return http.post(
    `classroom/${sessionUuid}/examinations/questions/${questionId}/grade/${makeExaminationId}`,
    form,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )
}

/**
 * @deprecated on backend since SMX-9381
 *
 * @param {String} sessionUuid
 * @param {Object} data
 * @returns
 */
export const gradeExaminationAnswerById = (sessionUuid, data) => {
  let { id, result, comment, grade, files, allowFile } = data

  const formBody = {
    result_type: result,
    grade,
    comment,
    files,
    allowFile,
  }

  const form = objectToFormData(formBody, { indices: true })

  return http.post(`classroom/${sessionUuid}/examinations/questions/answers/${id}/grade`, form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const deleteGradeExaminationAnswer = (sessionUuid, id) => {
  return http.delete(`classroom/${sessionUuid}/examination/question/answer/${id}`)
}

export const checkCanAnswerEvaluation = (sessionUuid, topicId, enrollmentId) => {
  return http.get(
    `classroom/${sessionUuid}/topics/${topicId}/examinations/enrollment/${enrollmentId}`
  )
}

export const updatePassword = (oldPassword, newPassword) => {
  const form = {
    old_password: oldPassword,
    new_password: newPassword,
  }
  return http.put(`myself/password`, parse(form))
}

export const openTopic = (assetId, topicId, sessionUuid, accessType, biometricToken = null) => {
  const params = {}
  if (accessType) params.access_type = accessType
  return http.get(
    `/classroom/${sessionUuid}/topic/${topicId}/asset/${assetId}/open?${
      biometricToken ? 'token=' + biometricToken : ''
    }`,
    {
      headers: {
        'Accept-Language': i18n.locale,
      },
      params,
    }
  )
}

export const getTopicPrerequisites = (topicId, sessionUuid) => {
  return http.get(`/classroom/${sessionUuid}/topic/${topicId}/prerequisites`)
}

export const checkTopicsCompleted = (topics, sessionUuid) => {
  return http.post(`classroom/${sessionUuid}/topics/completed`, { topics: topics })
}

export const getClassroomOfferings = (queryParams) => {
  return http.get(`offerings?${createQuery(queryParams)}`, {
    headers: {
      'X-Accept-Version': 'v2',
    },
  })
}

export const getClassroomSessions = (queryParams) => {
  return http.get(`sessions?${createQuery(queryParams)}`, {
    headers: {
      'X-Accept-Version': 'v2',
    },
  })
}

export const downloadExaminationFile = (file) => {
  return http.get(`examinations/files/download?file=${file}`, {
    responseType: 'blob',
    cancelToken: source.token,
  })
}

export const checkActivity = (token, topicId, sessionUuid) => {
  return http.post(`classroom/${sessionUuid}/activity`, { topic_id: topicId, token })
}

export const getCompetencyList = (payload) => {
  return http.get(`classroom/${payload.session_uuid}/competencies?${createQuery(payload.params)}`)
}

export const getPreProjectList = (payload) => {
  return http.get(
    `classroom/${payload.params.session_uuid}/pre-projects/pre-project?${createQuery(
      payload.params
    )}`
  )
}

export const getProjectList = (payload) => {
  return http.get(
    `classroom/${payload.params.sessionUuid}/pre-projects/student-pre-project?${createQuery(
      payload.params
    )}`
  )
}

export const getCompetenciesList = (payload) => {
  return http.get(
    `classroom/${payload.session_uuid}/competencies/competency?${createQuery(payload.params)}`
  )
}

export const getStudentsCompetencyList = (payload) => {
  return http.get(
    `classroom/${payload.session_uuid}/competencies/student?${createQuery(payload.params)}`
  )
}

export const saveCompetencyFeedback = (feedback) => {
  return http.post(`competency/comment`, feedback)
}

export const getStudentCompetency = (id) => {
  return http.get(`competency/enrollment/${id}`)
}

export const addGeneralFeedback = (id, comment, active = true) => {
  return http.post(`examinations/comment`, {
    make_examination_id: id,
    comment,
    active,
  })
}

export const editGeneralFeedback = (id, comment) => {
  return http.put(`examinations/comment/${id}`, {
    comment,
  })
}

export const deleteGeneralFeedback = (id) => {
  return http.delete(`examinations/comment/${id}`)
}

export const checkClassroomBlock = (session_uuid) => {
  return http.get(`classroom/${session_uuid}/is_blocked`)
}

export const savePreProjectConfig = (preProjectId, form) => {
  return http.put(`pre-project/${preProjectId}`, form)
}

export const getPreProjectAvailableStudents = (sessionUuid, params) => {
  return http.get(`pre-project/session/${sessionUuid}/enrollments?${createQuery(params)}`)
}

export const addPreProjectNewStudents = (groupId, enrollments) => {
  return http.put(`pre-project/group/${groupId}`, { enrollments })
}

export const savePreProjectGroup = (sessionUuid, payload) => {
  return http.post(`pre-project/session/${sessionUuid}/group`, payload)
}

export const getPreProjectGroup = (sessionUuid) => {
  return http.get(`pre-project/${sessionUuid}/preproject_group`)
}

export const deletePreProjectGroup = (groupId) => {
  return http.delete(`pre-project/${groupId}/leave-group`)
}

export const getPreProjectGroups = (data) => {
  return http.get(`pre-project/${data.sessionUuid}/groups?${createQuery(data)}`)
}

export const getHistoryActionPreProject = (data) => {
  return http.get(`pre-project/group/${data.options.group_id}/actions?${createQuery(data.params)}`)
}

export const getHistoryEvaluation = (data) => {
  return http.get(
    `classroom/${data.sessionUuid}/group/${data.userMakeExaminationId}/last-examination`
  )
}

export const getClassroomNotifications = (payload) => {
  let query = `query[session_id]=${payload.classroomId}`
  if (payload.enrollmentId) {
    query += `&query[enrollment_id]=${payload.enrollmentId}`
  }
  const examinations = http.get(`examinations/notifications?${query}`)
  const competencies = http.get(`competency/notifications?${query}`)
  return Promise.all([examinations, competencies]).then(([resExamination, resCompetency]) => {
    return [...resExamination.data, ...resCompetency.data]
  })
}

export const readClassroomNotifications = (payload) => {
  return http.put(`examinations/notifications/consume`, payload)
}

export const readCompetencyClassroomNotifications = (payload) => {
  return http.put(`competency/notifications/consume`, payload)
}

export const getClassroomToolsHasItems = (sessionUuid) => {
  return http.get(`classroom/${sessionUuid}/tools`)
}

export const getTrailSolutions = (trailId) => {
  return http.get(`paths/${trailId}/solutions`)
}

export const getEvaluationPreview = ({ topicId }) => {
  return http.get(`examinations/topic/${topicId}/open-examination-preview`)
}

export const getKnowledgeBase = () => {
  return http.get('knowledge_base/files/quota')
}

export const verifyBiometricCapture = (payload) => {
  return http.post(`/classroom/${payload.sessionUuid}/verify-biometric-capture`, {
    data: {
      image: payload.data,
    },
  })
}

export const validateExit = (data, token) => {
  return http.get(
    `classroom/${data.uuid}/check-biometrics-on-logout?token=${token}&configType=${data.configType}`
  )
}

export const getPreProjectGroupSession = (payload) => {
  return http.get(
    `pre-project/session/${payload.options.sessionUuid}/groups?${createQuery(payload.params)}`
  )
}

export const getPreProjectStudents = (payload) => {
  const params = { ...payload.params }

  if (payload.options.id) {
    params.filter = { group_id: payload.options.id }
  }

  return http.get(
    `pre-project/session/${payload.options.sessionUuid}/enrollments?${createQuery(params)}`
  )
}

export const removePreProjectGroup = (id) => {
  return http.delete(`pre-project/delete-group/${id}`)
}

export const getPreProjectGroupDetails = (sessionUuid, id) => {
  return http.get(`pre-project/${sessionUuid}/preproject_group/${id}`)
}

export const createPreprojectGroup = (payload) => {
  return http.post(`pre-project/session/${payload.session_uuid}/group`, payload)
}

export const editPreprojectGroup = (payload) => {
  return http.put(
    `pre-project/session/${payload.session_uuid}/group/${payload.pre_project_id}`,
    payload
  )
}

export const getClassroomNotes = (data) => {
  return http.get(`/notes/notes-entries?${createQuery(data.params)}`)
}

export const getClassroomNote = (id) => {
  return http.get(`/notes/note-entry/${id}`)
}

export const createClassroomNote = (payload) => {
  return http.post('/notes/note-entry', payload)
}

export const editClassroomNote = (data) => {
  return http.put(`/notes/note-entry/${data.id}`, data)
}

export const deleteClassroomNote = (id) => {
  return http.delete(`/notes/note-entry/${id}`)
}

export const downloadNotes = (notes) => {
  const multipartOptions = { headers: { 'Content-Type': 'application/pdf' }, responseType: 'blob' }
  const form = objectToFormData({ notes_entries_ids: notes })

  return http.post(`notes/notes-entries/download`, form, multipartOptions).then((response) => {
    let link = document.createElement('a')
    link.href = window.URL.createObjectURL(response.data)
    link.download = 'notes.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  })
}

export const createCategoryKB = (sessionUuid, payload) => {
  return http.post(`classroom/${sessionUuid}/create-issue-category`, payload)
}

export const createSubCategoryKB = (sessionUuid, category_id, payload) => {
  return http.post(`classroom/${sessionUuid}/create-issue-subcategory/${category_id}`, payload)
}

export const getCategoryListKB = (payload) => {
  const sessionUuid = payload.options ? payload.options.sessionUuid : payload.sessionUuid
  return http.get(`classroom/${sessionUuid}/list-issue-category?${createQuery(payload.params)}`)
}

export const editCategoryKB = (sessionUuid, payload) => {
  return http.put(`classroom/${sessionUuid}/edit-issue-category`, payload)
}
export const editSubCategoryKB = (sessionUuid, category_id, payload) => {
  return http.put(`classroom/${sessionUuid}/edit-issue-subcategory/${category_id}`, payload)
}

export const deleteCategoryKB = (sessionUuid, category_id) => {
  return http.delete(`classroom/${sessionUuid}/delete-issue-category/${category_id}`)
}

export const deleteSubCategoryKB = (sessionUuid, subcategory_id) => {
  return http.delete(`classroom/${sessionUuid}/delete-issue-subcategory/${subcategory_id}`)
}

export const getPreProjectGroupSessionList = (payload) => {
  return http.get(
    `classroom/${payload.session_uuid}/examinations/pre-project/${payload.examination_id}/groups`
  )
}

export const getExternalLinkList = (payload) => {
  return http.get(`external-links/${payload.params.id}/links?${createQuery(payload.params)}`)
}

export const deleteExternalLink = (idTool, idLink) => {
  return http.delete(`external-links/${idTool}/link/${idLink}`)
}

export const toggleExternalLinkStatus = (payload) => {
  return http.put(`external-links/${payload.id}/active/toggle`, payload.params)
}

export const createExternalLink = (sessionUuid, payload) => {
  const formData = new FormData()

  formData.append('name', payload.name)
  formData.append('description', payload.description)
  formData.append('icon', payload.icon)
  formData.append('url', payload.url)
  formData.append('linked', payload.linked)

  if (payload.linkContents) {
    payload.linkContents.forEach((item, index) => {
      formData.append(`link_contents[${index}][data][name]`, item.name)
      formData.append(`link_contents[${index}][data][type]`, item.type)
      formData.append(`link_contents[${index}][data][value]`, item.value)
    })
  }

  if (payload.externalLink.id) {
    formData.append('external_link_id', payload.externalLink.id)
  }

  return http.post(`classroom/${sessionUuid}/external-links/link`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const editExternalLink = (payload) => {
  const { linkContents, ...rest } = payload
  const transformedPayload = {
    ...rest,
    link_contents: (linkContents || []).map((item) => ({
      data: {
        name: item.name,
        type: item.type,
        value: String(item.value),
      },
    })),
  }

  return http.put(
    `external-links/${payload.externalLink.id}/link/${payload.id}`,
    transformedPayload
  )
}

export const getExternalLink = (payload) => {
  return http.get(`external-links/${payload.idTool}/link/${payload.externalLinkId}`)
}

export const getAdditionalFields = (payload) => {
  const sessionUuid = payload.options ? payload.options.sessionUuid : payload.sessionUuid
  return http.get(`classroom/${sessionUuid}/metas?${createQuery(payload.params)}`)
}

export const getOpenExternalLink = (idTool, id) => {
  return http.get(`external-links/${idTool}/open/${id}`)
}
