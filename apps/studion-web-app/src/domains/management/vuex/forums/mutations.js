import * as TYPES from './mutations-types'

export default {
  [TYPES.SET_FORUMS_LIST_RESOURCE](state, value) {
    state.forumsListResource = value
  },
}
