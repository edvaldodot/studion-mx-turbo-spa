import * as services from '@/domains/trails/services'
import * as TYPES from './mutation-types'

export const removeTrailGroup = ({ dispatch }, data) => {
  dispatch('setFetching', true)
  return services.deleteTrailGroup(data)
    .then(() => {
      dispatch('setFetching', false)
    })
}

export const addTrailGroup = ({ dispatch }, payload) => {
  return services.addTrailGroup(payload.trailId, payload.groupId)
}

export const groupTrailListResource = async ({ commit }, data) => {
  if (data.fromCache) {
    return commit(TYPES.SET_TRAIL_GROUPS_LIST, data.fromCache)
  }

  let response = await services.getTrailGroupsList(data.options.trailId, data.params)
  commit(TYPES.SET_TRAIL_GROUPS_LIST, response.data.data)

  return response.data
}
