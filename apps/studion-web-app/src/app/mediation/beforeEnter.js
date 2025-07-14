import store from '@/store'

const navigationWhitelist = [
  'mediation.edit',
  'mediation.actions',
  'mediation.actions.day',
  'mediation.link',
  'mediation.link.add',
  'mediation.batch.list',
  'mediation.batch.list.add',
]

/**
 * Prevents repeated setup requests (mediation tags and data)
 * between mediation steps navigation
 *
 * The request is called only in navigation or page refresh
 *
 * @param {Object} to
 * @param {Object} from
 * @param {function} next
 */
const beforeEnterMediationSetup = async (to, from, next) => {
  const name = from.name || ''

  if (!navigationWhitelist.includes(name)) {
    await store.dispatch('attemptMediationSetup', to.params.id)
  }
  next()
}

export default beforeEnterMediationSetup
