import { http } from '@/support/http'
import 'url-search-params-polyfill'
import { source } from '../../../support/utils/source'
import {createQuery} from '../../../support/utils/paginatorQueryBuilder'

export const getProfiles = (searchParams = {}) => {
  let queryString = createQuery(searchParams)
  return http.get(`profiles/active?${queryString}`, {cancelToken: source.token})
}

export const getProfilesAll = (searchParams = {}) => {
  let queryString = createQuery(searchParams)
  return http.get(`profiles?${queryString}`, {cancelToken: source.token})
}

export const getAllActiveProfiles = () => http.get('profiles/active/all')

export const retrieveProfilesByUser = uuid => http.get(`profiles/users/${uuid}`, {cancelToken: source.token})

export const createProfile = payload => http.post('profiles', payload)

export const updateProfile = payload => {
  const id = payload.id

  return http.put(`profiles/${id}`, payload)
}

export const deleteProfile = id => http.delete(`profiles/${id}`)

const changeProfileStatus = (id, status) => {
  const params = new URLSearchParams() // eslint-disable-line no-undef

  params.append('active', status ? '1' : '0')

  return http.put(`profiles/${id}`, params)
}

export const activateProfile = (profileId) => changeProfileStatus(profileId, true)

export const deactivateProfile = (profileId) => changeProfileStatus(profileId, false)

export const getContexts = () => http.get(`profiles/authorization/contexts`, {cancelToken: source.token})

export const getProfilesLGPDOptions = () => http.get(`profiles/authorization/data`, {cancelToken: source.token})