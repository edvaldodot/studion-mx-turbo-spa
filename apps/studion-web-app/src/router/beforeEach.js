import store from '@/store'
import {validateWithMetaStatus} from './restrictions'

import config from '@/config'

const needAuth = auth => auth === true
const isLocked = locked => locked === true
const beforeEach = async (to, from, next) => {
  const { KEYCLOAK_ENABLED } = config
  const auth = to.meta.requiresAuth
  const softLock = to.meta.softLock
  const feature = to.meta.requiresFeature
  const userMetaStatus = store.state.Account.user.metaStatus
  const blockMeta = config.BLOCK_META_OPT_IN

  /**
   * If in maintenace, block user navigation
   * A timestamp is used to avoid browser cache
   */
  if (to.name !== 'maintenance' && process.env.VUE_APP_IN_MAINTENANCE === 'true') {
    next({ name: 'maintenance', query: { t: Date.now() } })
    return
  }

  if (to.query.integrationAppMode) {
    const appModeValue = to.query.integrationAppMode === 'true'
    store.dispatch('setIntegrationAppMode', appModeValue)
  }

  if (to.query.hideFabMenu) {
    const condition = to.query.hideFabMenu === 'true'
    store.dispatch('setHideFabMenu', condition)
  }

  if (to.name !== 'dashboard.profile.new' && (blockMeta && userMetaStatus === 'new')) {
    next({name: 'dashboard.profile.new'})
    return
  }

  if (to.name !== 'dashboard.profile.pending' && (blockMeta && userMetaStatus === 'pending')) {
    next({name: 'dashboard.profile.pending'})
    return
  }

  if (isLocked(softLock)) {
    next({name: 'dashboard.profile.pending'})
    return
  }

  if (!needAuth(auth)) {
    next()
    return
  }

  if (KEYCLOAK_ENABLED) {
    await store.dispatch('attemptManageKeycloakAuth')
  }

  store.dispatch('checkUserToken')
    .then(() => {
      validateWithMetaStatus(to.name).then(routeIsBlockedByMeta => {
        if (routeIsBlockedByMeta) {
          next({name: 'dashboard.profile.pending'})
        } else {
          if (!feature) return next()

          store.dispatch('checkIsEnabledFeature', feature).then((isEnabled) => {
            if (isEnabled) {
              next()
            } else {
              next({name: 'dashboard'})
            }
          })
        }
      })
    })
    .catch(() => {
      next({name: 'auth.signin', params: {lastUrl: to.path}})
    })
}

export default beforeEach
