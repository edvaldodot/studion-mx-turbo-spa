import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersist from 'vuex-persist'

import {vuexI18nPlugin} from '@/support/i18n'

import state from './state'
import mutations from './mutations'
import actions from './actions'
import modules from './modules'

import * as getters from './getters'

import config from '@/config'

const { STATE_STORAGE } = config

Vue.use(Vuex)

const storageBlacklist = [
  'offerings/SET_CURRENT_COURSES',
  'offerings/SET_CURRENT_CONFIGS'
]

const storageWhitelist = (s) => ({
  language: s.language,
  accessibility: s.accessibility,
  accessibilityFontSize: s.accessibilityFontSize,
  fullscreen: s.fullscreen,
  Auth: s.Auth,
  Account: s.Account,
  Settings: s.Settings,
  route: s.route,
  footerHidden: s.footerHidden,
  audioVolumeStorage: s.audioVolumeStorage,
  integrationAppMode: s.integrationAppMode
})

const stateStorage = () => {
  switch (STATE_STORAGE) {
    case 'session':
      return window.sessionStorage
    default:
      return window.localStorage
  }
}

const vuexLocalStorage = new VuexPersist({
  key: 'vuex',
  storage: stateStorage(),
  filter: mutations => (!storageBlacklist.includes(mutations.type)),
  reducer: (s) => (storageWhitelist(s))
})

export default new Vuex.Store({
  plugins: [vuexLocalStorage.plugin, vuexI18nPlugin],
  state,
  mutations,
  actions,
  getters,
  modules
})
