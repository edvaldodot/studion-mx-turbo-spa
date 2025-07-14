import * as TYPES from './mutations-types'

export default {
  [TYPES.SET_CONFERENCE_RESOURCE](state, value) {
    state.conferenceResource = value
  },
}
