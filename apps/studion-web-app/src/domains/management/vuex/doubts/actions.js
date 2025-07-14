import * as services from '../../services'
import * as TYPES from './mutations-types'

export const doubtsListResource = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_DOUBTS_LIST_RESOURCE, data.fromCache)
    return
  }

  let response = await services.doubts.getDoubtsList(data.params)
  commit(TYPES.SET_DOUBTS_LIST_RESOURCE, response.data.data)
  return response.data
}

export const doubtsOnlyResource = async (_, issue_id) => {
  let response = await services.doubts.getOnlyDoubt(issue_id)
  return response.data
}

export const attemptCategoryFilter = async (_, payload) => {
  let response = await services.doubts.getCategoryFilter(payload)
  return response.data
}
