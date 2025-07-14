import * as TYPES from './mutations-types'

export default {
  [TYPES.SET_LIST](state, value) {
    state.list = value
  },
  [TYPES.SET_CURRENT_RECORD](state, value) {
    state.currentRecord = value
  },
}
