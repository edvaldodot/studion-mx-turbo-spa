import * as services from '../../services'
import * as TYPES from './mutations-types'

export const pollsListResource = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_POLLS_LIST_RESOURCE, data.fromCache)
    return
  }

  let response = await services.polls.getPolls(data.params)
  commit(TYPES.SET_POLLS_LIST_RESOURCE, response.data.data)
  return response.data
}
