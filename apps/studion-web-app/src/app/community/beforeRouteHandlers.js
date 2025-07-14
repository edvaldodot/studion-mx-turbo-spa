import store from '@/store'
import i18n from '@/support/i18n'

export async function getAllProfilesHandler(to, _, next) {
  try {
    const isEnabled = await store.dispatch('isFeatureEnabled', 'impersonate_read_only')
    if (!isEnabled || store.getters.currentProfileIsAdminOrStudent) return next()

    await store.dispatch('attemptRetrieveAllProfiles')
    return next()
  } catch (_) {
    store.dispatch('setFeedback', {
      message: i18n.t('global:error'),
      type: 'error',
    })
    return false
  }
}
