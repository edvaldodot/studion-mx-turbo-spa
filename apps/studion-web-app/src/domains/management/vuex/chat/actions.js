import * as services from '../../services'
import * as TYPES from './mutations-types'

export const chatsListResource = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_CHAT_LIST_RESOURCE, data.fromCache)
    return
  }

  let response = await services.chat.getChats(data.params)
  commit(TYPES.SET_CHAT_LIST_RESOURCE, response.data.data)
  return response.data
}

export const attemptChatRoomCreation = (_, data) => services.chat.createChatRoomManagement(data)
