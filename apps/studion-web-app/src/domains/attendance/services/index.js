import { http } from '@/support/http'
import { createQuery } from '../../../support/utils/paginatorQueryBuilder'

export const getAttendanceLists = (config) => {
  return http.get(`classroom/${config.options.id}/attendance-lists?${createQuery(config.params)}`)
}

export const getStudentAttendanceLists = (config) => {
  return http.get(
    `classroom/${config.options.id}/attendance-lists/student?${createQuery(config.params)}`
  )
}

export const getAttendanceList = (id) => {
  return http
    .get(`attendance/attendance-list/${id}/download-sheet`, {
      responseType: 'blob',
    })
    .then(({ data }) => {
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(data)
      link.download = 'attendance-list.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
}

export const getAttendanceAuditList = ({ id }) => {
  return http.get(`attendance/attendance-lists/${id}/history`)
}

export const createAttendanceList = (payload) => {
  return http.post('attendance/attendance-list', payload)
}

export const updateAttendanceList = (payload) => {
  return http.put(`attendance/attendance-list/${payload.i_attendance_list}`, payload)
}

export const removeAttendanceList = (id) => {
  return http.delete(`attendance/attendance-list/${id}`)
}

export const saveAttendanceList = (payload) => {
  return http.post('attendance/attendance-list/sheet', payload)
}
