import { http } from '@/support/http'
import { createQuery } from '@/support/utils/paginatorQueryBuilder'

export const getFilterTypes = () => {
  return http.get(`/filters/filter_type`)
}

export const createFilter = (data) => {
  return http.post('/filters/full', data)
}

export const getSolutionsWithScorm = (courseName) => {
  const queryName = courseName ? `&query[name]=${courseName}` : ''
  return http.get(`courses?order[name]=desc&page=1&limit=1000&filter[scorm]=1${queryName}`)
}

export const getSolutions = (courseName) => {
  const queryName = courseName ? `&query[name]=${courseName}` : ''
  return http.get(`courses?order[name]=desc&page=1&limit=1000${queryName}`)
}

export const getSessionBySolution = (query, params) => {
  const courseId = params.solution[0].course_id
  const queryName = query ? `&query[name]=${query}` : ''

  return http.get(`sessions?order[name]=desc&page=1&limit=1000&filter[courses_id]=${courseId}${queryName}`, {
    headers: {
      'X-Accept-Version': 'v2'
    }
  })
}

export const getPreviewUsersList = (data, params) => {
  return http.get(`filters/${data.id}/preview/${data.session}?paginate=true&${createQuery(params)}`)
}

export const downloadSpreadsheet = (format, session, filterId) => {
  return http.get(`filters/${filterId}/preview/${session.id}/download`, {
    headers: {
      'Accept': format
    },
    responseType: 'blob'
  })
    .then(response => {
      const finalFormat = format === 'text/csv' ? 'csv' : 'xlsx'

      let link = document.createElement('a')
      link.href = window.URL.createObjectURL(response.data)
      link.download = session.name.replaceAll(' ', '_') + `.${finalFormat}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
}

export const getScormBySolutionIdAndName = (solutionId, scormName) => {
  return http.get(`/filters/solution/${solutionId}/scorm?filter[name]=${scormName}`)
}

export const getStatusByContentType = (filterType) => {
  return http.get(`/filters/content-status?filter[type]=${filterType}`)
}

export const getScormTopics = (assetId) => {
  return http.get(`/assets/${assetId}/meta`)
}

export const getFilters = (params) => {
  return http.get(`filters?${createQuery(params)}`)
}

export const toggleFilterStatus = (id) => {
  return http.put(`filters/${id}/toggle`)
}

export const getFilterById = (filterId) => {
  return http.get(`filters/${filterId}`)
}

export const getCourseById = (courseId) => {
  return http.get(`courses/${courseId}`)
}

export const removeFilter = (filterId) => {
  return http.delete(`filters/${filterId}`)
}
