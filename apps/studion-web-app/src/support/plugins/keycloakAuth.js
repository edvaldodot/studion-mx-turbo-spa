import Vue from 'vue'
import Keycloak from 'keycloak-js'
import config from '@/config'

const { KEYCLOAK_HOST, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID } = config

const options = {
  url: KEYCLOAK_HOST,
  realm: KEYCLOAK_REALM,
  clientId: KEYCLOAK_CLIENT_ID
}

const _keycloak = Keycloak(options)

const Plugin = {
  install (Vue) {
    Vue.$keycloak = _keycloak
  }
}

Plugin.install = Vue => {
  Vue.$keycloak = _keycloak
  Object.defineProperties(Vue.prototype, {
    $keycloak: {
      get () {
        return _keycloak
      }
    }
  })
}

Vue.use(Plugin)

export default Plugin
