import * as services from '../../services'
import * as TYPES from './mutations-types'

export const forumsListResource = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_FORUMS_LIST_RESOURCE, data.fromCache)
    return
  }

  let response = await services.forums.getForums(data.params)
  commit(TYPES.SET_FORUMS_LIST_RESOURCE, response.data.data)
  return response.data
}
