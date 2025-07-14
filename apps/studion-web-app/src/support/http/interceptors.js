import Vue from 'vue'
import config from '@/config'
import { isBefore, subMinutes, parse as parseDate } from 'date-fns'
import jwtDecode from 'jwt-decode'
import axios from 'axios'
import { parse } from '@/support/payloadParser'
import * as TYPES from '@/store/types'
import i18n from '@/support/i18n'

const { PORTAL_CONFIGS } = config

const { API_URL, APP_KEY, APP_SECRET, API_URL_BASE_MOCK, URL_MOCKS } = config

const exceptions = [
  'login_check',
  'passwordRequest',
  'passwordReset',
  'passwordRecovery',
  'usernameRecovery',
  'register',
  'accounts/active',
  'accounts/activation/activation_key/link',
  'accounts/activation/email/link',
  'accounts/activation/link',
  'settings/external',
]

const parametrizedExceptions = [
  'verifyPasswordRecoveryToken',
  'auth/reset',
  '(sessions|paths)/certificate/[0-9a-zA-Z-]+/validate',
]

const ErrorToastExceptions = [
  'certificate_not_found',
  'session_did_not_start',
  'user_not_exists',
  'user_identity_not_found',
  'not_allowed_access_topic_out_of_schedule',
  'enrollment_not_consumed_pre_requisite',
  'application_user_not_exists',
  'not_allowed_access_topic_out_of_schedule',
  'topic_restricted_by_examination_result',
  'access_not_allowed_to_expired_class',
  'session_out_of_access_period',
  'settings_not_found',
  'exceeded_day_limit',
  'exceeded_limit_continuously',
  'biometric_capture_required',
]

const notAuthorizedExceptions = ['insufficient_authorization_level']

// Impersonate configs
const IMPERSONATE_NOT_ALLOWED_METHODS = ['post', 'put', 'delete']

export const IMPERSONATE_ERROR_MESSAGE = [
  'impersonate_not_allowed_method',
  'request_not_permitted_to_read_only',
]

const IMPERSONATE_WHITE_LIST_ROUTES = ['users/change_profile', 'impersonate/exit']
// end Impersonate configs

let accessErrorRedirectTimeout = null
let refreshInProgress

const tokenIsValid = (exp, keycloakEnable) => {
  return isBefore(new Date(), subMinutes(parseDate(exp, 't', new Date()), keycloakEnable ? 0 : 10))
}

const isImpersonatedUser = (store) => {
  const account = store && store.state && store.state.Account
  return account && account.user && account.user.isImpersonate
}

export default (http, store, router) => {
  // request interceptors
  http.interceptors.request.use((config) => {
    if (store.state.language) {
      store.commit(TYPES.MAIN_SET_LANGUAGE, store.state.language)
    }
    return new Promise((resolve, reject) => {
      const newAxiosInstance = axios.create({
        baseURL: API_URL,
      })

      if (
        isImpersonatedUser(store) &&
        IMPERSONATE_NOT_ALLOWED_METHODS.includes(config.method) &&
        !IMPERSONATE_WHITE_LIST_ROUTES.includes(config.url)
      ) {
        reject({ isImpersonate: true })
      }

      if (API_URL_BASE_MOCK && URL_MOCKS && URL_MOCKS.length > 0) {
        for (let route of URL_MOCKS) {
          if (config.url.search(route) !== -1) {
            config.baseURL = API_URL_BASE_MOCK
          }
        }
      }

      for (let route of exceptions) {
        if (config.url === route) {
          resolve(config)
          return
        }
      }

      for (let route of parametrizedExceptions) {
        let regex = new RegExp(`(${route})`, 'i')
        if (regex.exec(config.url)) {
          resolve(config)
          return
        }
      }

      store
        .dispatch('checkUserToken')
        .then(async ({ token, refreshToken }) => {
          const { preferred_username, exp } = jwtDecode(token)
          const isKeycloak = preferred_username !== undefined
          if (isKeycloak) {
            if (!tokenIsValid(exp, isKeycloak)) {
              await Vue.$keycloak.updateToken()
              config.headers.Authorization = `Bearer ${Vue.$keycloak.token}`
              store.dispatch('attemptSetToken', {
                token: Vue.$keycloak.token,
                refresh_token: Vue.$keycloak.refreshToken,
              })
            }

            resolve(config)
            return
          }

          const params = {
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: APP_KEY,
            client_secret: APP_SECRET,
          }

          if (refreshInProgress) {
            try {
              await refreshInProgress
              const { token: tokenAfterRefresh } = await store.dispatch('checkUserToken')
              token = tokenAfterRefresh
            } catch (error) {
              resolve(config)
              return
            }
          }

          if (tokenIsValid(exp, false)) {
            config.headers.Authorization = `Bearer ${token}`
            resolve(config)

            return
          }

          refreshInProgress = newAxiosInstance
            .post('refresh', parse(params), { headers: { Authorization: `Bearer ${token}` } })
            .then((response) => {
              const newToken = response.data.token
              const newRefreshToken = response.data.refresh_token

              config.headers.Authorization = `Bearer ${newToken}`

              store.dispatch('setToken', { token: newToken, refreshToken: newRefreshToken })

              resolve(config)
            })
            .catch((error) => {
              store.dispatch('logout')
              router.push({ name: 'auth.signin' })
              Promise.reject(error)
              store.dispatch('setFetching', false)
            })
            .finally(() => {
              refreshInProgress = null
            })
        })
        .catch((e) => {
          store.dispatch('setFetching', false)
          Promise.reject(e)
        })
    })
  })

  // response interceptors
  http.interceptors.response.use(
    (response) => response,
    (error) => {
      const response = error && error.response
      const responseMessage = response && response.data && response.data.message

      if (
        responseMessage === 'user_blocked_redirect' &&
        PORTAL_CONFIGS &&
        PORTAL_CONFIGS.MAIN_URL
      ) {
        window.location.assign(PORTAL_CONFIGS.MAIN_URL)
        return
      }

      if (responseMessage === 'user_not_active_profile') {
        return router.push({
          name: '401',
          params: { error: responseMessage },
        })
      }

      if (notAuthorizedExceptions.includes(responseMessage)) {
        store.dispatch('setFeedback', {
          message: i18n.t('access.feedback.error:insufficient_authorization_level'),
        })
        return router.push({ name: 'dashboard' }).then(() => {
          store.dispatch('setFetching', false)
        })
      }

      if (responseMessage === 'path_enrollment_is_not_passed') {
        store.dispatch('setFeedback', {
          message: i18n.t('trail.access:feedback.error.access'),
        })
        return router.push({ name: 'dashboard' }).then(() => {
          store.dispatch('setFetching', false)
        })
      }

      if (error.isImpersonate || IMPERSONATE_ERROR_MESSAGE.includes(responseMessage)) {
        store.dispatch('setFeedback', {
          message: i18n.t(IMPERSONATE_ERROR_MESSAGE[0]),
          type: 'error',
          impersonated: true,
        })
        store.dispatch('setFetching', false)
        return Promise.reject({ isImpersonate: true })
      }

      if (responseMessage === 'meta_status_not_completed') {
        const currentStatus = response.data.hint.currentStatus || 'pending'

        store.dispatch('updateMetaStatus', currentStatus)
        router.push({
          name: `dashboard.profile.${currentStatus}`,
          params: { accessDenied: true },
        })
      }

      if (responseMessage === 'rule_access_not_passed') {
        const {
          prerequisite,
          trail_id: trailId,
          offering_id: offeringId,
          backToSessionsOnError,
        } = window.app.$route.params

        if (prerequisite) {
          store.dispatch('setFeedback', {
            message: i18n.t('classroom.access:feedback.error.prerequisite.name', {
              name: prerequisite,
            }),
            type: 'error',
          })
        } else {
          store.dispatch('setFeedback', {
            message: i18n.t('classroom.access:feedback.error.access'),
          })
        }

        if (trailId) {
          router.replace({ name: 'classroom.trail.sessions', params: { id: trailId } })
          return Promise.reject(error)
        }

        if (offeringId) {
          router.replace({ name: 'classroom.offerings.solutions', params: { id: offeringId } })
          return Promise.reject(error)
        }

        if (backToSessionsOnError) {
          router.replace({ name: 'classroom.sessions' })
          return Promise.reject(error)
        }

        store.dispatch('setClassroomFinalAccessStatus', response.data.hint.status)

        return Promise.reject(error)
      }

      if (
        responseMessage === 'session_is_blocked' ||
        responseMessage === 'session_is_not_granted_access'
      ) {
        router.push({ name: 'classroom.blocked' })
        return Promise.reject(error)
      }

      if ([408, 504].indexOf(response.status) > -1) {
        store.dispatch('setFetching', false)
        store.dispatch('setFeedback', { message: i18n.t('global.request:timeout.message') })
      }

      if (
        [400].indexOf(response.status) > -1 ||
        responseMessage === 'application_user_not_activated'
      ) {
        router.push({ name: 'auth.signin' })
      }

      if ([401].indexOf(response.status) > -1) {
        return store
          .dispatch('setFeedback', {
            message: i18n.t('global.request:unauthorized.message'),
            type: 'error',
          })
          .then(() => {
            store.dispatch('setFetching', false)
            router.push({ name: 'auth.signin' })
            return Promise.reject(error)
          })
      }

      if ([403, 405].indexOf(response.status) > -1) {
        return store.dispatch('refreshPermissions').then(() => {
          return store
            .dispatch('setFeedback', { message: i18n.t('global:access.denied'), type: 'error' })
            .then(() => {
              router.push({ name: 'dashboard' })
              return Promise.reject(error)
            })
        })
      }

      for (let errorMessage of ErrorToastExceptions) {
        if (responseMessage === errorMessage) {
          return Promise.reject(error)
        }
      }

      return store.dispatch('setFetching', false).then(() => {
        return store
          .dispatch('setFeedback', {
            message: i18n.t('global.request:timeout.message'),
            type: 'error',
          })
          .then(() => {
            return Promise.reject(error)
          })
      })
    }
  )
}
