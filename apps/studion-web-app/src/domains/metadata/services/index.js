import { http } from '@/support/http'
import { source } from '../../../support/utils/source'
import {createQuery} from '../../../support/utils/paginatorQueryBuilder'
// import { parse, parseToFormData } from '@/support/payloadParser'

export const getMetas = (entity, searchParams) => {
  let queryString = createQuery(searchParams)
  return http.get(`metas/entities/${entity}?${queryString}`, {cancelToken: source.token})
}

export const getMetasTypes = () => http.get('metas/types', {cancelToken: source.token})

export const checkMetaStatus = () => http.get('metastatus', {cancelToken: source.token})

export const getMetasFormats = () => http.get('metas/formats', {cancelToken: source.token})

export const createMetas = payload => http.post('metas/meta/entity', payload)

export const updateMetas = payload => http.put('metas/meta/entity', payload)

export const deleteMetas = (entity, id) => http.delete(`metas/entity/${entity}/${id}`)

export const getCourseMetadata = (courseId) => http.get(`courses/${courseId}/metas`)

export const saveCourseMetadata = (courseId, data) => http.put(`courses/${courseId}/metas`, data)

export const getBranchingsMetadata = () => http.get(`branches/metas`)

export const getBranchMetadata = (id) => http.get(`branches/${id}/metas`)
