import * as TYPES from './mutations-types'
import set from 'lodash/set'
export default {
  [TYPES.SET_CURRENT] (state, value) {
    state.current = value
  },
  [TYPES.SET_COURSES] (state, value) {
    state.current.meta.courses = value
  },
  [TYPES.SET_CONFIGS] (state, value) {
    state.current.meta.configs = value
  },
  [TYPES.SET_SESSION_TYPE] (state, value) {
    state.current.meta.sessionType = value
  },
  [TYPES.SET_CURRENT_SESSION_TYPE] (state, value) {
    state.current.meta.sessionType = value
  },
  [TYPES.ADD_CONFIG] (state, value) {
    state.current.meta.configs.push(value)
  },
  [TYPES.SET_DATA] (state, {path, value}) {
    set(state, path, value)
  },
  [TYPES.SET_META_SESSION_COURSES](state, value) {
    state.current.meta.configs = value
  },
}
