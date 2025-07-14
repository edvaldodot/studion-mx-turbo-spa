import * as TYPES from './mutations-types'
import set from 'lodash/set'

export default {
  [TYPES.SET_DATA] (state, {path, value}) {
    set(state, path, value)
  },
  [TYPES.USERS_ADD_ITEMS] (state, payload) {
    const oldState = state.items
    state.items = [...oldState, payload]
  },
  [TYPES.USERS_SET_CURRENT] (state, payload) {
    state.current = payload
  },
  [TYPES.USERS_SET_CURRENT_ENROLLMENTS] (state, payload) {
    state.currentEnrollments = payload
  },
  [TYPES.SET_USER_LIST] (state, payload) {
    state.userList = payload
  },
  [TYPES.SET_COMPLETED_USER_BATCH] (state, payload) {
    state.completedUserBatch = payload
  },
  [TYPES.SET_PENDING_USER_BATCH] (state, payload) {
    state.pendingUserBatch = payload
  }
}
