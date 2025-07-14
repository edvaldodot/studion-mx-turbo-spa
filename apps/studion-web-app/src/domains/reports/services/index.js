import { http } from '@/support/http'
import { parse, parseToFormData } from '@/support/payloadParser'
import { objectToFormData } from '@/support/utils/objectToFormData'
import { source } from '../../../support/utils/source'
import {createQuery} from '../../../support/utils/paginatorQueryBuilder'

export const createReport = data => {
  data.active = data.active === true ? 1 : 0
  data.admin_only_visible = data.admin_only_visible ? 1 : 0
  data.all_profiles_allowed = data.all_profiles_allowed ? 1 : 0
  let form = objectToFormData(data, { forceEmptyArray: true })

  let options = {}
  form.delete('image')
  if (data.image) {
    form.append('image', data.image, data.image.name + '.jpg')
    options.headers = {
      'Content-Type': 'multipart/form-data'
    }
  }
  return http.post('reports', form, options)
}

export const getOneReport = (reportId) => {
  return http.get(`reports/${reportId}`, {cancelToken: source.token})
}

export const getReportSourceURL = (reportId) => {
  return http.get(`reports/${reportId}/dashboard`, {cancelToken: source.token})
}

export const getReports = (queryParams = {}) => {
  let queryString = createQuery(queryParams)
  return http.get(`reports?${queryString}`, {cancelToken: source.token})
}

export const getAllReports = (queryParams = {}) => {
  let queryString = createQuery(queryParams)
  return http.get(`reports/all?${queryString}`, {cancelToken: source.token})
}

export const updateReport = (reportId, data) => {
  data.profiles = data.allowedProfiles !== null ? data.allowedProfiles : []
  data.active = data.active === true ? 1 : 0
  data.admin_only_visible = data.admin_only_visible ? 1 : 0
  data.all_profiles_allowed = data.all_profiles_allowed ? 1 : 0
  data.is_highlight = data.is_highlight === true ? 1 : 0
  if (!data.secret_key) delete data.secret_key

  return http.put(`reports/${reportId}`, parse(data))
}

export const updateReportImage = data => {
  let form = parseToFormData(data)
  form.delete('image')
  form.append('image', data.image, data.image.name + '.jpg')

  return http.post(`reports/${data.id}/image`, form, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const removeReport = reportId => {
  return http.delete(`reports/${reportId}`)
}

export const getReportsProfiles = () => {
  return http.get('reports/profiles', {cancelToken: source.token})
}

export const getReportHighLighted = () => {
  return http.get('reports-highlight')
}
