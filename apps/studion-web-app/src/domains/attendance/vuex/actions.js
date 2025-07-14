import * as services from '../services'
import * as TYPES from './mutations-types'

export const attemptGetAttendanceLists = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_ATTENDANCE_LISTS, data.fromCache)
    return
  }

  const endpointService = data.options.isStudent
    ? services.getStudentAttendanceLists
    : services.getAttendanceLists

  let response = await endpointService(data)
  commit(TYPES.SET_ATTENDANCE_LISTS, response.data.data)

  return response.data
}

export const attemptDownloadAttendanceList = (_, id) => {
  return services.getAttendanceList(id)
}

export const attemptCreateAttendanceList = (_, payload) => {
  return services.createAttendanceList(payload)
}

export const attemptAttendanceAuditList = (_, payload) => {
  return services.getAttendanceAuditList(payload)
}

export const attemptUpdateAttendanceList = (_, payload) => {
  return services.updateAttendanceList(payload)
}

export const attemptRemoveAttendanceList = (_, payload) => {
  return services.removeAttendanceList(payload)
}

export const attemptSaveAttendanceList = (_, payload) => {
  return services.saveAttendanceList(payload)
}
