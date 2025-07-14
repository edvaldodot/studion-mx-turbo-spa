import cloneDeep from 'lodash/cloneDeep'
import { http } from '@/support/http'
import { parse } from '@/support/payloadParser'
import { source } from '../../../support/utils/source'
import { objectToFormData } from '@/support/utils/objectToFormData'
import { createQuery } from '../../../support/utils/paginatorQueryBuilder'
import { parseScheduleBlock } from '@/support/utils/scheduleBlock'

export const getSessions = (searchParams = {}) => {
  let queryString = createQuery(searchParams)
  return http.get(`sessions?${queryString}`, { cancelToken: source.token })
}

export const getSessionsV2 = (queryParams = {}) => {
  const query = createQuery(queryParams, true)
  return http.get(`sessions?${query}`, {
    headers: {
      'X-Accept-Version': 'v2',
    },
  })
}

export const getSessionsBatchDate = (searchParams = {}) => {
  let queryString = createQuery(searchParams.params)
  return http.get(
    `sessions/topics_periods/${searchParams.params.topicId}/schedules-mass?${queryString}`,
    { cancelToken: source.token }
  )
}

export const postTopicPeriodsSchedulesMass = (topicId, data) => {
  return http.post(`sessions/topics_periods/${topicId}/schedules-mass`, data)
}

export const getSessionsBatch = (ids) => {
  return http.get(`batch/session/${ids}`)
}

export const getSessionDependencies = (sessionId) =>
  http.get(`sessions/${sessionId}/dependencies`, { cancelToken: source.token })

export const createSession = (data) => {
  const formData = {}

  formData.team = data.team.map((item) => {
    return {
      uuid: item.uuid,
      position: item.position ? item.position : null,
      profile_id: item.profile_id,
    }
  })
  formData.name = data.name
  formData.vacancy = data.vacancy > 0 ? data.vacancy : 0
  formData.active = true
  formData.course_id = data.solution.id
  formData.schedule_block = parseScheduleBlock(data.schedule_block)
  formData.schedule_grant_access = parseScheduleBlock(data.schedule_grant_access)
  formData.reenrollment_allowed = data.reenrollment_allowed
  formData.status_allowed_reenrollment = data.status_allowed_reenrollment
  formData.auto_generate_type = data.auto_generate_type
  formData.slug = data.slug
  formData.allow_all_profiles_send_kb = data.allowAllProfilesSendKb

  if (data.duration && data.duration.dateInterval) {
    formData.duration = data.duration.dateInterval
  }
  if (data.start_time != null) formData.start_time = data.start_time + ' 00:00:00'
  if (data.end_time != null) formData.end_time = data.end_time + ' 23:59:59'

  if (data.categories) {
    formData.categories = data.categories
  }

  return http.post('sessions', formData)
}

export const updateSession = (sessionData) => {
  const data = cloneDeep(sessionData)

  const sessionId = data.session_id

  if (data.start_time != null) {
    data.start_time = data.start_time + ' 00:00:00'
  }

  if (data.end_time != null) {
    data.end_time = data.end_time + ' 23:59:59'
  }
  if (data.extended_time != null) {
    data.extended_time = data.extended_time + ' 23:59:59'
  }

  data.schedule_block = parseScheduleBlock(data.schedule_block)
  data.schedule_grant_access = parseScheduleBlock(data.schedule_grant_access)

  if (data.duration) {
    if (data.duration.dateInterval) data.duration = data.duration.dateInterval
    else delete data.duration
  }

  data.team.forEach((member) => {
    if (member.position) return
    member.position = null
  })

  for (let key in data) {
    if (data[key] === null) {
      delete data[key]
    }
  }

  return http.put(`sessions/${sessionId}`, data)
}

export const removeSession = (sessionId) => http.delete(`sessions/${sessionId}`)

export const enrollUser = (userUuid, sessionId) => {
  const params = {
    uuid: userUuid,
    session_id: sessionId,
  }
  return http.post('sessions/users', parse(params))
}

export const unenrollUser = (enrollmentId) => {
  return http.delete(`sessions/users/${enrollmentId}`)
}

export const reenrollUser = (sessionId, userUuid) => {
  return http.post(`sessions/reenroll/${sessionId}/${userUuid}`)
}

export const retrieveSessionUserList = (sessionId, searchParams) => {
  let queryString = createQuery(searchParams)
  return http.get(`sessions/${sessionId}/users/all?${queryString}`, { cancelToken: source.token })
}

export const recoverySessionUserList = (sessionId, searchParams) => {
  return http.get(
    `sessions/${sessionId}/users/all?filter[is_recovery]=1&${createQuery(searchParams)}`,
    {
      cancelToken: source.token,
    }
  )
}

export const retrieveToolList = () => http.get('toolstypes', { cancelToken: source.token })

export const downloadCertificate = (certificateHash, isHistory = false) => {
  return http
    .get(
      `myself/session/certificate/download/${certificateHash}${isHistory ? '?embed=history' : ''}`,
      {
        responseType: 'blob',
        headers: { 'Content-Type': 'application/pdf' },
        data: {},
      }
    )
    .then((response) => {
      return new Blob([response.data], { type: 'application/pdf' })
    })
}

export const downloadPathCertificate = (certificateHash, isHistory = false) => {
  return http
    .get(
      `myself/path/certificate/download/${certificateHash}${isHistory ? '?embed=history' : ''}`,
      {
        responseType: 'blob',
        headers: { 'Content-Type': 'application/pdf' },
        data: {},
      }
    )
    .then((response) => {
      return new Blob([response.data], { type: 'application/pdf' })
    })
}

export const searchStudent = (filter, sessionUuid) => {
  return http.get(`profiles/student/search/${filter}/${sessionUuid}`)
}

export const retrieveSessionUsers = (config) => {
  return http.get(
    `attendance/attendance-lists/${config.options.id}/sheet?${createQuery(config.params)}`
  )
}

export const editEnrollmentStatus = (enrollmentId, payload) => {
  return http.put(`sessions/enrollment/${enrollmentId}/status`, parse(payload))
}

export const retrieveEnrolledSessionsByOffering = (enrollmentId) => {
  return http.get(`sessions/offering/enrollment/${enrollmentId}`, { cancelToken: source.token })
}

export const retrieveEnrollmentStatusList = (sessionId) => {
  return http.get(`sessions/${sessionId}/courses/status`, { cancelToken: source.token })
}

export const getEnrollmentLogs = (enrollmentId) => {
  const params = { order: { created_at: 'desc' }, limit: 100 }
  return http.get(`sessions/enrollment/${enrollmentId}/logs?${createQuery(params)}`)
}

export const enrollmentReasonListRetrieval = () => {
  const params = { limit: 99 } // Show all reasons
  return http.get(`sessions/reasons-status-changes?${createQuery(params)}`)
}

export const enrollmentReasonAdd = (name) => {
  return http.post('sessions/create-reason-status-change', { name })
}

export const uploadEnrollmentSheet = (sessionId, file) => {
  const form = new FormData()
  form.append('session_id', sessionId)
  form.append('file', file, file.name)
  return http.post('batch/enrollments', form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const retrieveSessionTeams = (profileId, userId) => {
  return http.get(`sessions/teams/user/${userId}/profile/${profileId}`, {
    cancelToken: source.token,
  })
}

export const cancelBatchProcess = (processId) => {
  const params = objectToFormData({
    process_id: processId,
  })

  return http.post('batch/process/cancel', params)
}

export const getProgressEnrollment = (processId) => {
  return http.get(`batch/process/${processId}/status`, { cancelToken: source.token })
}

export const listBatchProcess = (sessionId, status, params) => {
  let searchParams = ''

  if (params.name) {
    searchParams += `query[name]=${params.name}`
  }

  if (Array.isArray(params.order)) {
    searchParams += `${searchParams ? '&' : ''}order[${params.order[0]}]=${params.order[1]}`
  } else {
    searchParams += `${searchParams ? '&' : ''}order[created_at]=desc`
  }

  Object.keys(params).forEach((key) => {
    if (key !== 'order' && key !== 'name' && params[key] !== undefined) {
      searchParams += `${searchParams ? '&' : ''}${key}=${params[key]}`
    }
  })

  return http.get(`batch/session/${sessionId}/status/${status}/list?${searchParams}`, {
    cancelToken: source.token,
  })
}

export const downloadBatchEnrollmentTemplate = () => {
  return http
    .get(`batch/template/enrollment`, {
      responseType: 'blob',
    })
    .then((response) => {
      let link = document.createElement('a')
      link.href = window.URL.createObjectURL(response.data)
      link.download = 'batch-enrollment-model.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
}

export const downloadBatchProcessReport = (processId, fileName) => {
  return http
    .get(`batch/process/${processId}/report`, {
      responseType: 'blob',
    })
    .then((response) => {
      let link = document.createElement('a')
      link.href = window.URL.createObjectURL(response.data)
      link.download = fileName.split('.', 1) + '-results.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
}

export const getSession = (sessionId) => {
  return http.get(`sessions/${sessionId}`, { cancelToken: source.token })
}

export const getSessionMediationList = (params) => {
  return http.get(
    `mediation-plans?filter[session]=${params.options.sessionId}&${createQuery(params.params)}`
  )
}

export const getTopicsPeriods = (id) => {
  return http.get(`/sessions/${id}/topics_periods`)
}

export const saveTopicsPeriods = (id, data) => {
  return http.post(`/sessions/${id}/topics_periods`, data)
}

export const addSessionGroup = (data) => {
  return http.post('sessions/enroll/group', data)
}

export const groupSessionList = (payload) => {
  return http.get(`sessions/groups/${payload.options.sessionId}`, { embed: payload.params.embed })
}

export const removeSessionGroup = (sessionGroupId) => {
  return http.delete(`sessions/groups/${sessionGroupId}`)
}

export const saveStudentRecovery = (id, data) => {
  return http.put(`sessions/${id}/enrollments-recovery-examination`, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
