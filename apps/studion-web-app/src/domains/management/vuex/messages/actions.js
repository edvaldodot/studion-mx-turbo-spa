import * as services from '../../services'
import * as TYPES from './mutations-types'

export const messagesListResource = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_MESSAGES_LIST_RESOURCE, data.fromCache)
    return
  }

  let response = await services.messages.getMessages(data.params)
  commit(TYPES.SET_MESSAGES_LIST_RESOURCE, response.data.data)
  return response.data
}
