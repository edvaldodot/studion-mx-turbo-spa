import * as TYPES from './mutations-types'

export default {
  [TYPES.SET_ANNOUNCEMENT_LIST_RESOURCE](state, value) {
    state.announcementListResource = value
  },
}
