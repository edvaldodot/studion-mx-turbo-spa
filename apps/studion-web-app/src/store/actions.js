import * as TYPES from './types'
import { http } from '@/support/http'
import i18n from '@/support/i18n'
import router from '@/router'
import { canRead } from '@/support/utils/permissions'

export default {
  setFetching({ commit }, obj) {
    commit(TYPES.MAIN_SET_FETCHING, obj)
  },

  setAccessibility({ commit }) {
    commit(TYPES.MAIN_SET_ACCESSIBILITY)
  },

  setLanguage({ commit }, obj) {
    commit(TYPES.MAIN_SET_LANGUAGE, obj)
  },

  setFontsize({ commit }, obj) {
    commit(TYPES.MAIN_SET_FONTSIZE, obj)
  },

  setFullscreen({ commit }) {
    commit(TYPES.MAIN_SET_FULLSCREEN)
  },

  closeFullscreen({ commit }) {
    commit(TYPES.MAIN_CLOSE_FULLSCREEN)
  },

  stopIdleTimer({ commit }, val) {
    commit(TYPES.TEMPORARY_IDLE_TIMER_PAUSE, val)
  },

  async setFeedback({ commit, dispatch }, feedback) {
    const errorOnUserImpersonated =
      feedback.type === 'error' && (await dispatch('isUserImpersonated'))

    if (errorOnUserImpersonated) {
      if (feedback.impersonated) commit(TYPES.MAIN_SET_FEEDBACK, feedback)
      return
    }

    commit(TYPES.MAIN_SET_FEEDBACK, feedback)
  },

  setShowSurvey({ commit }, value) {
    commit(TYPES.MAIN_SURVEY, value)
  },

  setAudioVolumeStorage({ commit }, volume) {
    commit(TYPES.MAIN_SET_AUDIO_VOLUME_STORAGE, volume)
  },

  setIsSavingBlocked({ commit }, value) {
    commit(TYPES.MAIN_IS_SAVING_BLOCKED, value)
  },

  hideFooter({ commit }) {
    commit(TYPES.MAIN_HIDE_FOOTER)
  },

  showFooter({ commit }) {
    commit(TYPES.MAIN_SHOW_FOOTER)
  },

  resizeMenu({ commit }, value) {
    commit(TYPES.MAIN_RESIZE_MENU, value)
  },

  openMenu({ commit }) {
    commit(TYPES.MAIN_OPEN_MENU)
  },

  closeMenu({ commit }) {
    commit(TYPES.MAIN_CLOSE_MENU)
  },

  setIntegrationAppMode({ commit }, value) {
    commit(TYPES.MAIN_SET_INTEGRATION_APP_MODE, value)
  },

  setHideFabMenu({ commit }, value) {
    commit(TYPES.MAIN_SET_HIDE_FAB_MENU, value)
  },

  toggleChatbotWindow({ commit }, value) {
    commit(TYPES.MAIN_TOGGLE_CHATBOT_WINDOW, value)
  },

  updateChatbotPosition({ commit }, value) {
    commit(TYPES.MAIN_UPDATE_CHATBOT_POSITION, value)
  },

  async attemptGetAvailableLanguages({ commit, state }) {
    const availableLanguages = state.availableLanguages
    if (availableLanguages.data) return availableLanguages

    const response = await http.get('languages')
    commit(TYPES.SET_AVAILABLE_LANGUAGES, response.data)
    return response
  },

  async impersonateUser({ dispatch }, { user, sessionUuid }) {
    try {
      dispatch('setFetching', true)

      const form = new FormData()
      form.append('username', user.username)
      form.append('read_only', true)

      const { data } = await http.post('impersonate', form)
      await dispatch('attemptSetToken', data)
      await dispatch('attemptUserAccountRetrieval')

      let route = { name: 'dashboard' }

      if (sessionUuid) {
        route = {
          name: 'classroom.panel.dashboard',
          params: { session_uuid: sessionUuid },
        }
      }

      router.push(route)
    } catch ({ response }) {
      let errorMessage = response && response.data && response.data.message
      let message = 'global:error'

      if (errorMessage === 'user_unauthorized_impersonate') {
        message = 'impersonate:error:user_unauthorized_impersonate'
      }

      if (errorMessage === 'user_not_active') {
        message = 'impersonate:error:user_not_active'
      }

      dispatch('setFeedback', { message: i18n.t(message), type: 'error' })
    } finally {
      dispatch('setFetching', false)
    }
  },

  async leaveImpersonate({ dispatch, state }, routeFrom) {
    try {
      dispatch('setFetching', true)

      const { data } = await http.post('impersonate/exit')
      await dispatch('attemptSetToken', data)
      await dispatch('attemptUserAccountRetrieval')
      const routeTo = canRead(state, 'users') ? 'community.users' : 'community.sessions'

      if (routeFrom === routeTo) return
      router.push({
        name: routeTo,
      })
    } catch (error) {
      dispatch('setFeedback', { message: i18n.t('global:error'), type: 'error' })
    } finally {
      dispatch('setFetching', false)
    }
  },

  /**
   * Check if feature flag is enabled.
   * @param {object} store
   * @param {string} feature FF alias
   * @returns {boolean}
   */
  isFeatureEnabled({ state }, feature) {
    return (
      state.Settings &&
      state.Settings.enabledFeatures &&
      state.Settings.enabledFeatures.indexOf(feature) !== -1
    )
  },

  isUserImpersonated({ state }) {
    const user = state.Account && state.Account.user
    return user && user.isImpersonate
  },

  /**
   * Check if current user profile match the specified profile.
   * @param {object} store
   * @param {string} profile
   * @returns {boolean}
   */
  isEqualsProfile({ state }, profile) {
    return state.Account.user && state.Account.user.currentProfile === profile
  },

  /**
   * Check if current user profile is student.
   * @param {object} store
   * @returns {boolean}
   */
  isStudent({ dispatch }) {
    return dispatch('isEqualsProfile', 'student')
  },

  toggleZendeskChatbotWindow({ commit }, value) {
    commit(TYPES.MAIN_TOGGLE_ZENDESK_CHATBOT_WINDOW, value)
  },

  setAnnounceKitUnreads({ commit }, value) {
    commit(TYPES.SET_ANNOUNCEKIT_UNREADS, value)
  },
}
