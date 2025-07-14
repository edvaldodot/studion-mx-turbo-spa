import Vue from 'vue'
import config from '@/config'

const { PORTAL_CONFIGS } = config

let keycloakPromise

export const initKeycloakService = async ({token, refreshToken} = {}) => {
  let params = { checkLoginIframe: false }

  if (token && refreshToken) {
    params.token = token
    params.refreshToken = refreshToken
  }

  if (!keycloakPromise) {
    keycloakPromise = Vue.$keycloak.init(params)

    Vue.$keycloak.onAuthError = () => {
      Vue.$keycloak.login()
    }

    Vue.$keycloak.onAuthRefreshError = () => {
      Vue.$keycloak.login()
    }
  }

  return keycloakPromise
}

export const logoutKeycloak = async (isStudent) => {
  await initKeycloakService()

  let logoutUri = window.location.origin
  if (PORTAL_CONFIGS && PORTAL_CONFIGS.LOGOUT_URL && isStudent) {
    logoutUri = PORTAL_CONFIGS.LOGOUT_URL
  }

  if (Vue.$keycloak.token === undefined) {
    return window.location = logoutUri
  }

  Vue.$keycloak.logout({ redirectUri: logoutUri })
}

export const getKeycloak = () => {
  return Vue.$keycloak
}
