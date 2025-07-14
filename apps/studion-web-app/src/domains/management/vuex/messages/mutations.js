import * as TYPES from './mutations-types'

export default {
  [TYPES.SET_MESSAGES_LIST_RESOURCE](state, value) {
    state.messagesListResource = value
  },
}
