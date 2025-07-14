import * as TYPES from './mutations-types'

export default {
  [TYPES.SET_POLLS_LIST_RESOURCE](state, value) {
    state.pollsListResource = value
  },
}
