import * as TYPES from './mutations-types'

export default {
  [TYPES.SET_MODAL_SESSION_LIST](state, value) {
    state.modalSessionList = value
  },
}
