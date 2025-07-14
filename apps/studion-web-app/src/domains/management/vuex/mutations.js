import * as TYPES from './mutations-types'

export default {
  [TYPES.SET_EXAMPLE](state, value) {
    state.example = value
  },
}