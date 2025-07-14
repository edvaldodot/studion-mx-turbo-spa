import * as TYPES from './mutations-types'

export default {
  [TYPES.SET_CERTIFICATES](state, value) {
    state.all.push(value)
  },
  [TYPES.SET_CERTIFICATE_LIST](state, value) {
    state.certificateList = value
  },
}
