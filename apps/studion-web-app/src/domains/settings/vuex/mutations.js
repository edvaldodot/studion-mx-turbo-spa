import * as TYPES from './mutations-types'

export default {
  [TYPES.SET_ALL_NOTIFICATIONS] (state, value) {
    state.notifications.items = value
  },
  [TYPES.SET_EMAIL_NOTIFICATION_HEADER] (state, value) {
    state.email_notification_header = value
  },
  [TYPES.SET_ALLOW_PROFILE_CHANGE_IMAGE] (state, value) {
    state.allow_change_profile_image = value
  },
  [TYPES.SET_ENABLED_FEATURES] (state, value) {
    state.enabledFeatures = value
  },
  [TYPES.SET_DISPLAY_PREFERENCES] (state, value) {
    state.displayFeatures = value
  }
}
