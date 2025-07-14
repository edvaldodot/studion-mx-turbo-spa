import * as TYPES from './mutations-types'

export default {
  [TYPES.SET_USER](state, value) {
    state.user = value
  },
  [TYPES.SET_USER_PERMISSIONS_DENIED](state, value) {
    state.user.permissionsDenied = value
  },
  [TYPES.SET_USER_PROFILE_IMAGE](state, value) {
    state.user.profile_image = value
  },
  [TYPES.SET_USER_META_STATUS](state, value) {
    state.user.metaStatus = value
  },
  [TYPES.SET_USER_NAME](state, value) {
    state.user.data.name = value
  },
  [TYPES.SET_USER_NICKNAME](state, value) {
    state.user.data.nickname = value
  },
  [TYPES.REMOVE_ACCESS_MESSAGE](state, id) {
    state.user.accessMessages = state.user.accessMessages.filter(
      (accessMessage) => accessMessage.id !== id
    )
  },
  [TYPES.SET_ANSWERED_SURVEY](state, value) {
    state.user.date_nps_last_feedback = value
  },
  [TYPES.SET_EDUCATIONAL_RESOURCES](state, value) {
    state.user.order_educational_resources = value
  },
}