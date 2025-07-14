import * as services from '../services'
import * as TYPES from '../vuex/mutations-types'
import bannersSlideshow from '@/domains/settings/support/dashboardSlideshowResources'

export const attemptUpdateInstanceSettings = ({ commit }, data) => {
  return services.updateInstanceSettings(data)
}

export const attemptInstanceSettingsRetrieval = () => {
  return services.getInstanceSettings()
}

export const attemptPostInstanceSettingsRetrieval = ({ commit }) => {
  return services.postInstanceSettings()
    .then(response => {
      let allowChangeProfile = response.data.allow_change_profile_image
      commit(TYPES.SET_ALLOW_PROFILE_CHANGE_IMAGE, (allowChangeProfile === undefined || allowChangeProfile))
      commit(TYPES.SET_ENABLED_FEATURES, response.data.enabledFeatures)
      return response
    })
}

export const attemptNotificationTypeRetrieval = ({ commit }, {notificationTypeId, notificationTransportName}) => {
  return services.getNotificationType(notificationTypeId, notificationTransportName)
}

export const attemptNotificationsSettingsRetrieval = ({ commit }) => {
  return services.getNotificationsSettings()
    .then(response => {
      commit(TYPES.SET_ALL_NOTIFICATIONS, response.data.notificationsTypes)
      commit(TYPES.SET_EMAIL_NOTIFICATION_HEADER, response.data.emailNotificationHeader)
      return response
    })
}

export const attemptBatchUpdateNotificationsTypes = ({ commit }, data) => {
  return services.batchUpdateNotificationsTypes(data)
}

export const attemptUpdateNotificationTransportContent = ({ commit }, {notificationTransportId, data}) => {
  return services.updateNotificationTransportContent({notificationTransportId, data})
}

export const attemptUpdateEmailNotificationHeader = ({ commit }, data) => {
  return services.updateEmailNotificationHeader(data)
}

export const attemptGetBannersDashboard = ({ commit }, theme) => {
  return bannersSlideshow[theme] !== undefined ? bannersSlideshow[theme] : bannersSlideshow['default']
}


export const checkIsEnabledFeature = ({ commit, state }, feature) => {
  if (!feature) return Promise.resolve(true)

  if (state.enabledFeatures.indexOf(feature) !== -1) {
    return Promise.resolve(true)
  }

  return Promise.resolve(false)
}

export const attemptUpdateMenusOrder = ({ commit }, data) => {
  return services.updateMenusOrder(data)
}

const preparePreferences = (rootState, preferences, field) => {
  const { display_preferences = {} } = rootState.Settings
  display_preferences[field] = preferences
  return display_preferences
}

export const attemptSaveLocalDisplayPreferencesField = (
  { rootState, commit },
  { preferences, field }
) => {
  commit(TYPES.SET_DISPLAY_PREFERENCES, preparePreferences(rootState, preferences, field))
}

export const attemptSaveDisplayPreferencesField = async (
  { rootState, commit },
  { preferences, field }
) => {
  const { data } = await services.setDisplayPreferences(
    preparePreferences(rootState, preferences, field)
  )
  commit(TYPES.SET_DISPLAY_PREFERENCES, data.display_preferences)
}

export const attemptGetCustomInstructions = () => {
  return services.getCustomInstructions()
}

export const attemptCreateCustomInstruction = (_, data) => {
  return services.createCustomInstruction(data)
}

export const attemptUpdateCustomInstruction = (_, { data, id }) => {
  return services.updateCustomInstruction(data, id)
}

export const attemptUpdateSurveyNPSConfigs = (_, { data }) => {
  return services.updateSurveyNPSConfig(data)
}

export const attemptSettingsConfigs = () => {
  return services.getSettingsConfigs()
}

export const attemptDeleteCustomInstruction = (_, data) => {
  return services.deleteCustomInstruction(data)
}

export const attemptBranchSettings = () => {
  return services.getBranchSettings()
}
