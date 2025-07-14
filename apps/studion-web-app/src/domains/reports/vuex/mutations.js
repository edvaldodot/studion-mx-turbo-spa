import * as TYPES from './mutations-types'
import set from 'lodash/set'
export default {
  [TYPES.SET_CURRENT] (state, payload) {
    state.current = payload
  },
  [TYPES.CLEAR_CURRENT] (state) {
    state.current = null
  },
  [TYPES.SET_DATA] (state, {path, value}) {
    set(state, path, value)
  }
}
