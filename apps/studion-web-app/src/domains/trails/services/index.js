import { http } from '@/support/http'
import { parse } from '@/support/payloadParser'
import forEach from 'lodash/forEach'
import { source } from '@/support/utils/source'
import { createQuery } from '@/support/utils/paginatorQueryBuilder'
import { parseScheduleBlock } from '@/support/utils/scheduleBlock'

export const getTrailsTypes = () => {
  return http.get('paths/types')
}

function builderTrailsFromData(trail) {
  const isEditing = !!trail.id
  let form = new FormData()

  let workload = trail.workload.hours * 60 + trail.workload.minutes

  let duration = null

  if (trail.duration.hours > 0 || trail.duration.minutes > 0 || trail.duration.number > 0) {
    if (trail.duration && trail.duration.type === 'h') {
      duration = `PT${Number(trail.duration.hours) * 60 + Number(trail.duration.minutes)}M`
    } else if (trail.duration && trail.duration.number && trail.duration.type) {
      duration = `P${trail.duration.number}${String(trail.duration.type).toUpperCase()}`
    }
  }

  form.append('name', trail.name)
  form.append('workload_value', workload)
  form.append('workload_type', 'i')
  if (trail.startTime) form.append('start_time', trail.startTime)
  if (trail.endTime) form.append('end_time', trail.endTime)

  forEach(trail.team, (item, key) => {
    form.append(`team[${key}][uuid]`, item.uuid)
    form.append(`team[${key}][position]`, item.position)
    form.append(`team[${key}][profile_id]`, item.profile_id)
  })

  if (trail.description != null) {
    form.append('description', trail.description)
  }

  if (trail.finalStatusId != null) {
    form.append('finalStatusId', trail.finalStatusId)
  }

  forEach(trail.branch_ids, (item) => {
    form.append(`branch_ids[]`, item)
  })

  if (trail.image instanceof Blob) {
    form.append('image', trail.image, trail.image.name)
  }

  form.append('reenrollmentAllowed', trail.reenrollmentAllowed || false)

  forEach(trail.statusAllowedReenrollment, (item) => {
    form.append(`statusAllowedReenrollment[]`, item)
  })

  form.append('duration', duration)
  form.append('closedSession', trail.closedSession ? '1' : '0')

  if (Array.isArray(trail.categories)) {
    trail.categories.forEach((category) => {
      form.append('categories[]', category.id)
    })
  }

  if (trail.certificate.enable && trail.certificate.model) {
    form.append('certificate_id', trail.certificate.model)
  }

  if (isEditing) {
    if (!form.has('categories[]')) {
      form.append('categories[]', '')
    }

    if (!trail.certificate.enable) {
      form.append('certificate_id', '')
    }
  }

  return form
}

export const createTrails = (trail) => {
  let form = builderTrailsFromData(trail)
  return http.post('paths', form)
}

export const updateTrailRequest = (trail) => {
  let form = builderTrailsFromData(trail)
  form.append('_method', 'PUT')
  return http.post(`paths/${trail.id}`, form)
}

export const trailsRetrieval = (queryParams) => {
  return http.get(`paths?${createQuery(queryParams)}`)
}

export const trailRetrieval = (data) => {
  return http.get(`paths/${data.trailId}?${createQuery(data.params)}`)
}

export const deleteTrail = (id) => {
  return http.delete(`paths/${id}`)
}
export const getTrailsList = (params) => {
  return http.get(`paths?${createQuery(params)}`)
}

export const trailsSessionUserSolutionsRetrieval = ({ pathId, appUserId }) => {
  return http.get(`paths/${pathId}/enrollment/${appUserId}/course`)
}

export const getTrailSolutions = (trailId) => {
  return http.get(`paths/${trailId}/solutions`)
}

export const getTrailSolutionsWithParams = (params) => {
  let queryParams = { embed: params.embed }
  return http.get(`paths/${params.filter.trail_id}/solutions?${createQuery(queryParams)}`)
}

export const getTrailAvailableSolutions = (data) => {
  return http.get(`paths/${data.options.trailId}/available/solutions?${createQuery(data.params)}`)
}

export const addTrailSolutions = (trailId, solutions) => {
  return http.put(`paths/${trailId}/bind/solutions`, solutions)
}

export const trailUsersRetrieval = (params) => {
  return http.get(`paths/${params.args.trailId}/enroll?${createQuery(params)}`, {
    headers: {
      'X-Accept-Version': 'v2',
    },
  })
}

export const enrollSingleUser = (trailId, uuid) => {
  const form = new FormData()
  form.append('uuid', uuid)

  return http.post(`paths/${trailId}/enroll`, form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const trailSessionsUserRetrieval = (trailId, applicationUserId) => {
  return http.get(`paths/${trailId}/enroll/${applicationUserId}/course`)
}

export const searchStudent = (filter, pathsId) => {
  return http.get(`paths/${pathsId}/students/search?name_or_email=${filter}`)
}

export const trailRemoveUser = (trailId, uuid) => {
  return http.delete(`paths/${trailId}/enroll/${uuid}`)
}

export const trailEnrollmentStatusUpdate = ({ statusId, enrollmentId, reasonStatusId }) => {
  const params = {
    status_id: statusId,
    reason_status_id: reasonStatusId,
  }

  return http.put(`sessions/enrollment/${enrollmentId}/status`, parse(params))
}

export const getSolutions = (params) => {
  return http.get(`courses?${createQuery(params)}`, { cancelToken: source.token })
}

export const publishTrail = (trailId) => {
  return http.post(`paths/${trailId}/publish`)
}

export const searchNonStudentByNameOrEmail = (nameOrEmail) => {
  return http.get(`users/search/name-or-email/non-student/${nameOrEmail}`)
}

export const getTrailGroupsList = (trailId, params) => {
  return http.get(`paths/${trailId}/groups?${createQuery(params)}`)
}

export const deleteTrailGroup = ({ trailId, groupId }) => {
  return http.delete(`paths/${trailId}/groups/${groupId}`)
}

export const addTrailGroup = (trailId, groupId) => {
  return http.post(`paths/${trailId}/groups`, { group_id: groupId })
}

export const downloadTrailCertificate = (certificateHash, isHistory = false) => {
  return http
    .get(`myself/path/certificate/download/${certificateHash}${isHistory ? '?embed=history' : ''}`, {
      responseType: 'blob',
      headers: { 'Content-Type': 'application/pdf' },
      data: {},
    })
    .then((response) => {
      return new Blob([response.data], { type: 'application/pdf' })
    })
}

export const saveTrailSessionAllowance = (data) => {
  const parsedPayload = parseScheduleBlock(data)
  return http.post('sessions/create_session_schedule_grant_access', {
    schedule_grant_access: parsedPayload,
  })
}

export const deleteTrailSessionAllowance = (data) => {
  return http.delete('sessions/schedule_grant_access/delete', {
    data: { schedule_grant_access: data },
  })
}

export const getTrailSolutionsStatus = (trailId) => {
  return http.get(`paths/${trailId}/courses/status`)
}

export const getTrailErrorSheet = (pathCourseId) => {
  return http
    .get(`paths/courses/status/download/${pathCourseId}`, {
      responseType: 'blob',
      headers: {
        Accept: 'text/csv',
      },
    })
    .then((response) => {
      let link = document.createElement('a')
      link.href = window.URL.createObjectURL(response.data)
      link.download = 'path-solution-error.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
}

export const getUserTrailErrorSheet = (payload) => {
  return http
    .get(`paths/enrollment/${payload.appUserId}/status/download/${payload.pathId}`, {
      responseType: 'blob',
      headers: {
        Accept: 'text/csv',
      },
    })
    .then((response) => {
      let link = document.createElement('a')
      link.href = window.URL.createObjectURL(response.data)
      link.download = 'user-path-solution-error.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
}

export const getTrailFinalStatusList = () => {
  return http.get('paths/list-status')
}

export const reenrollUserOnTrail = (payload) => {
  return http.post(`paths/${payload.pathId}/reenroll`, {
    uuid: payload.userUuid,
  })
}
