import * as services from '../../services'
import * as TYPES from './mutations-types'

export const evaluationListResource = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_EVALUATIONS_LIST_RESOURCE, data.fromCache)
    return
  }

  let response = await services.evaluation.getEvaluationList(data.params)
  commit(TYPES.SET_EVALUATIONS_LIST_RESOURCE, response.data.data)
  return response.data
}

export const preProjectListResource = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_PRE_PROJECT_LIST_RESOURCE, data.fromCache)
    return
  }

  let response = await services.evaluation.getPreProjectList(data.params)
  commit(TYPES.SET_PRE_PROJECT_LIST_RESOURCE, response.data.data)
  return response.data
}