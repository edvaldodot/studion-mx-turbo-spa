import * as TYPES from './types'

/* eslint-disable no-param-reassign */
export default {
  [TYPES.MAIN_SET_FETCHING](state, fetching) {
    if (fetching) {
      state.fetching += 1
    } else if (state.fetching > 0) {
      state.fetching -= 1
    } else {
      state.fetching = 0
    }
  },
  [TYPES.MAIN_SET_FEEDBACK](state, obj) {
    var newObj = Object.assign(
      {
        title: null,
        message: null,
        duration: 6000,
      },
      obj
    )
    newObj.random = Math.random()
    state.feedback = newObj
  },
  [TYPES.MAIN_SET_ACCESSIBILITY](state) {
    state.accessibility = !state.accessibility
  },
  [TYPES.MAIN_SET_LANGUAGE](state, language) {
    state.language = language
  },
  [TYPES.MAIN_SET_FONTSIZE](state, size) {
    state.accessibilityFontSize = size
  },
  [TYPES.MAIN_SET_FULLSCREEN](state) {
    state.fullscreen = !state.fullscreen
  },
  [TYPES.MAIN_CLOSE_FULLSCREEN](state) {
    state.fullscreen = false
  },
  [TYPES.MAIN_SURVEY](state, value) {
    state.showSurvey = value
  },
  [TYPES.MAIN_HIDE_FOOTER](state) {
    state.footerHidden = true
  },
  [TYPES.MAIN_SHOW_FOOTER](state) {
    state.footerHidden = false
  },
  [TYPES.MAIN_RESIZE_MENU](state, value) {
    state.menuExpanded = value
  },
  [TYPES.MAIN_OPEN_MENU](state) {
    state.menuOpen = true
  },
  [TYPES.MAIN_CLOSE_MENU](state) {
    state.menuOpen = false
  },
  [TYPES.MAIN_SET_AUDIO_VOLUME_STORAGE](state, volume) {
    state.audioVolumeStorage = volume
  },
  [TYPES.MAIN_SET_INTEGRATION_APP_MODE](state, value) {
    state.integrationAppMode = value
  },
  [TYPES.MAIN_SET_HIDE_FAB_MENU](state, value) {
    state.hideFabMenu = value
  },
  [TYPES.SET_AVAILABLE_LANGUAGES](state, data) {
    state.availableLanguages = { data }
  },
  [TYPES.MAIN_TOGGLE_CHATBOT_WINDOW](state, [insideModal, isOpen]) {
    state.chatbot = {
      ...state.chatbot,
      showWindow: {
        isOpen: isOpen,
        insideModal: insideModal,
      },
    }
  },
  [TYPES.MAIN_UPDATE_CHATBOT_POSITION](state, value) {
    state.chatbot = {
      ...state.chatbot,
      updatePosition: value,
    }
  },
  [TYPES.MAIN_IS_SAVING_BLOCKED](state, isBlocked) {
    state.isSavingBlocked = isBlocked
  },
  [TYPES.TEMPORARY_IDLE_TIMER_PAUSE](state, value) {
    state.pauseIdleTimer = value
  },
  [TYPES.MAIN_TOGGLE_ZENDESK_CHATBOT_WINDOW](state, value) {
    state.zendeskChatbot = {
      isOpen: value ? value : !state.zendeskChatbot.isOpen,
    }
  },
  resetState(state) {
    state.Auth.token = null
    state.Auth.refreshToken = null
    state.Account.user = {}
    state.footerHidden = false
  },
  [TYPES.SET_ANNOUNCEKIT_UNREADS](state, value) {
    state.announceKitUnreads = value
  },
}
