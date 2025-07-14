import * as TYPES from './mutations-types'

export default {
  [TYPES.SET_TOKEN] (state, values) {
    state.token = values.token
    state.refreshToken = values.refreshToken
  },
  [TYPES.SET_WAITING_TIME] (state, value) {
    state.waitingTime = value
  }
  // [TYPES.SET_SIGNIN_ATTEMPT] (state, { username, reset }) {
  //   if (!reset) {
  //     const userAttempts = state.signinAttempts[username]
  //     if (userAttempts) {
  //       state.signinAttempts[username].attempts = userAttempts.attempts + 1
  //     } else {
  //       state.signinAttempts[username] = { attempts: 1, timeout: null }
  //     }
  //   } else {
  //     state.signinAttempts[username] = { attempts: 0, timeout: null }
  //   }
  // },
  // [TYPES.SET_SIGNIN_TIMEOUT] (state, { username, timeout }) {
  //   state.signinAttempts[username].timeout = timeout
  // }
}
