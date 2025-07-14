import * as TYPES from './mutations-types'

export default {
  [TYPES.SET_ATTENDANCE_LISTS](state, value) {
    state.attendanceLists = value
  },
}
