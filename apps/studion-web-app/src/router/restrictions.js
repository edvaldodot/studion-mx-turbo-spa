import store from '@/store'
import routesBlackList from './blockedByMetaStatus'

const metaStatusCompleted = 'completed'

export const validateWithMetaStatus = routeName => {
  if (routesBlackList.indexOf(routeName) < 0) {
    return Promise.resolve(false)
  }

  store.dispatch('setFetching', true)
  return store.dispatch('attemptCheckMetaStatusRetrieval').then(({ data }) => {
    return data.status !== metaStatusCompleted
  }).finally(() => store.dispatch('setFetching', false))
}
