import * as TYPES from './mutations-types'

export default {
  [TYPES.SET_CHAT_LIST_RESOURCE](state, value) {
    state.chatsListResource = value
  },
}
