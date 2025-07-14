import config from '@/config'
import { setToken as httpSetToken, unsetToken as httpUnsetToken } from '@/support/http'
import * as TYPES from './mutations-types'
import * as services from '../services'
import { initKeycloakService, logoutKeycloak, getKeycloak } from '../helpers/keycloakHelper'
import jwtDecode from 'jwt-decode'

const { KEYCLOAK_ENABLED } = config

export const attemptLogin = ({ dispatch }, payload) => {
  return services.postLogin(payload)
    .then(({ data }) => {
      dispatch('setToken', { token: data.token, refreshToken: data.refresh_token })

      httpSetToken(data.token)

      return data
    })
}

export const attemptSetToken = ({ dispatch }, data) => {
  dispatch('setToken', { token: data.token, refreshToken: data.refresh_token })
  httpSetToken(data.token, data['x-suid'] || false)
  return Promise.resolve(data)
}

export const attemptPasswordRecovery = ({ commit }, email) => {
  return services.postPasswordRecoveryRequest(email)
}

export const attemptUsernameRecovery = ({ commit }, email) => {
  return services.postUsernameRecoveryRequest(email)
}

export const attemptPasswordReset = ({ commit }, { password, token }) => {
  return services.postPasswordResetRequest(password, token)
}

export const attemptActivateAccount = ({ commit }, token) => {
  return services.putActivateAccountRequest(token)
}

export const attemptActivationAccountLinkByActivationKey = ({ commit }, token) => {
  return services.putActivationAccountLinkByActivationKeyRequest(token)
}

export const attemptActivationAccountLinkByEmail = ({ commit }, email) => {
  return services.putActivationAccountLinkByEmailRequest(email)
}

export const attemptActivationAccountLinkByUsername = ({ commit }, username) => {
  return services.putActivationAccountLinkByUsernameRequest(username)
}

export const logout = ({ commit }, isStudent = false) => {
  httpUnsetToken()
  commit('resetState')

  if (KEYCLOAK_ENABLED) {
    logoutKeycloak(isStudent)
  }
}

export const setToken = ({ commit }, values) => {
  commit(TYPES.SET_TOKEN, values)
}

export const checkUserToken = ({ state }) => {
  if (state.token) {
    return Promise.resolve(state)
  }

  return Promise.reject(new Error('Unauthorized.'))
}

// export const addSignInAttempt = ({ commit, state }, data) => {
//   commit(TYPES.SET_SIGNIN_ATTEMPT, data)
// }

// export const addSignInTimeout = ({ commit, state }, data) => {
//   commit(TYPES.SET_SIGNIN_TIMEOUT, data)
// }

// window.intervals = {}
// export const setUserBlockTimeout = ({ state, dispatch }) => {
//   const interval = 1000
//   const blockTimeoutInSeconds = 900
//   const maxAttempts = 5
//   const { signinAttempts } = state
//   for (let username in signinAttempts) {
//     if (signinAttempts[username].attempts === maxAttempts && !window.intervals[username]) {
//       let timeout = signinAttempts[username].timeout || blockTimeoutInSeconds
//       dispatch('addSignInTimeout', { username, timeout })
//       window.intervals[username] = setInterval(() => {
//         let timeout = signinAttempts[username].timeout - 1
//         if (timeout > 0) {
//           dispatch('addSignInTimeout', { username, timeout })
//         } else {
//           clearInterval(window.intervals[username])
//           delete window.intervals[username]
//           dispatch('addSignInAttempt', { username, reset: true })
//         }
//       }, interval)
//     }
//   }
// }

export const initKeycloak = ({ state, commit }) => {
  const { token, refreshToken } = state
  return initKeycloakService({token, refreshToken})
}

export const attemptManageKeycloakAuth = async ({rootState, state, dispatch}) => {
  try {
    dispatch('setFetching', true)

    if (state.token) {
      // eslint-disable-next-line camelcase
      const { preferred_username } = jwtDecode(state.token)
      // eslint-disable-next-line camelcase
      if (preferred_username === undefined) {
        return Promise.resolve()
      }
    }

    await dispatch('initKeycloak')
    const keycloak = getKeycloak()

    if (!keycloak.authenticated) {
      await keycloak.login({locale: rootState.language})
      return Promise.resolve()
    }

    if (state.token !== keycloak.token) {
      await dispatch('attemptSetToken', {
        token: keycloak.token,
        refresh_token: keycloak.refreshToken
      })
      await dispatch('attemptUserAccountRetrieval')

      keycloak.loadUserInfo().then(({ locale }) => {
        if (locale !== undefined) {
          dispatch('setLanguage', locale.toLowerCase())
        }
      })
    }

    return Promise.resolve()
  } catch (error) {
    return Promise.reject(error)
  } finally {
    dispatch('setFetching', false)
  }
}
