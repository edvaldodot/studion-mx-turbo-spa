import * as TYPES from './mutations-types'

export default {
  [TYPES.SET_CURRENT] (state, payload) {
    state.current = payload
  },
  [TYPES.SET_GROUPS_LIST] (state, payload) {
    state.groupsList = payload
  },
  [TYPES.SET_USERS_GROUP_LIST] (state, payload) {
    state.usersGroupList = payload
  }
}
