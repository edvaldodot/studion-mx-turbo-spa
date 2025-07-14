import * as TYPES from './mutations-types'

export default {
  [TYPES.SET_ACCESS_MESSAGES_LIST] (state, value) {
    state.list = value
  },
  [TYPES.SET_ACCESS_MESSAGES_ITEM] (state, accessMessage) {
    const find = state.list.find(message => message.id === accessMessage.id)
    let index = state.list.indexOf(find)
    if (index >= 0) {
      state.list[index] = accessMessage
    } else {
      state.list.push(accessMessage)
    }
  }
}
