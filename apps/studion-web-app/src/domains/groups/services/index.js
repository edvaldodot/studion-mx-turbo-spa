import { http } from '@/support/http'
import { createQuery } from '@/support/utils/paginatorQueryBuilder'

export const getGroupsList = (params) => {
  return http.get(`/groups?${createQuery(params)}`)
}

export const getGroup = (groupId) => {
  return http.get(`/groups/${groupId}`)
}

export const saveGroup = (group) => {
  if (group.id) {
    return http.put(`/groups/${group.id}`, group)
  }

  return http.post(`/groups`, group)
}

export const deleteGroup = (groupId) => {
  return http.delete(`/groups/${groupId}`)
}

export const getUserOfGroupList = (params) => {
  return http.get(`/groups/${params.filter.groupId}/users?${createQuery(params)}`)
}

export const saveGroupMetadata = ({ groupId, ...metadata }) => {
  const meta = {}

  for (let key in metadata) {
    const metaKey = metadata[key].meta_key
    const values = (metadata[key].values || '').split(';')

    if (metaKey && values.length) {
      meta[metaKey] = [ ...(meta[metaKey] || []), ...values ]
    }
  }

  return http.put(`/groups/${groupId}/metas`, { meta })
}

export const getGroupMetadata = (groupId) => {
  return http.get(`/groups/${groupId}/metas`)
}

export const deleteGroupMetadata = ({ groupId, metaKey }) => {
  return http.delete(`/groups/${groupId}/metas/${metaKey}`)
}

export const getGroupMetadataOptions = () => {
  return http.get(`/metas/entities/application_user?filter[type][]=text&filter[type][]=string&limit=9999`)
}
