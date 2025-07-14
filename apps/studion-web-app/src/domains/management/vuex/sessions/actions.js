import * as services from '../../services'
import * as TYPES from './mutations-types'

export const attemptModalSessionListResource = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_MODAL_SESSION_LIST, data.fromCache)
    return
  }
  let response = await services.sessions.getModalSessionList(data)
  commit(TYPES.SET_MODAL_SESSION_LIST, response.data.data)
  return response.data
}
