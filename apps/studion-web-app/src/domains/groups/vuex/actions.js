import * as services from '../services'
import * as TYPES from './mutations-types'

export const fetchGroups = (context, params) => {
  return services.getGroupsList(params)
}

export const deleteGroup = ({ dispatch }, groupId) => {
  dispatch('setFetching', true)
  return services.deleteGroup(groupId)
    .then(() => dispatch('setFetching', false))
}

export const saveGroup = ({ dispatch }, payload) => {
  dispatch('setFetching', true)
  return services.saveGroup(payload)
    .then(({ data }) => {
      return data
    })
    .finally(() => dispatch('setFetching', false))
}

export const setCurrentGroup = ({ commit, dispatch }, groupId) => {
  dispatch('setFetching', true)
  return services.getGroup(groupId)
    .then(({ data }) => commit(TYPES.SET_CURRENT, data))
    .finally(() => dispatch('setFetching', false))
}

export const saveGroupMetadata = ({ dispatch }, payload) => {
  dispatch('setFetching', true)
  return services.saveGroupMetadata(payload)
    .then(() => dispatch('setFetching', false))
}

export const fetchGroupMetadata = ({ dispatch }, groupId) => {
  dispatch('setFetching', true)
  return services.getGroupMetadata(groupId)
    .then(res => res.data)
    .finally(() => dispatch('setFetching', false))
}

export const removeGroupMetadata = ({ dispatch }, payload) => {
  dispatch('setFetching', true)
  return services.deleteGroupMetadata(payload).then(() => {
    dispatch('refreshGroupsList')
  }).finally(() => dispatch('setFetching', false))
}

export const fetchGroupMetadataOptions = ({ dispatch }) => {
  dispatch('setFetching', true)
  return services.getGroupMetadataOptions()
    .then(res => res.data.data)
    .finally(() => dispatch('setFetching', false))
}

export const groupListResource = async ({ commit }, data) => {
  if (data.fromCache) {
    return commit(TYPES.SET_GROUPS_LIST, data.fromCache)
  }

  let response = await services.getGroupsList(data.params)
  commit(TYPES.SET_GROUPS_LIST, response.data.data)

  return response.data
}

export const getUsersGroupResource = async ({ commit }, data) => {
  if (data && data.fromCache) return commit(TYPES.SET_USERS_GROUP_LIST, data.fromCache)

  const response = await services.getUserOfGroupList(data.params)
  commit(TYPES.SET_USERS_GROUP_LIST, response.data.data)
  return response.data
}
