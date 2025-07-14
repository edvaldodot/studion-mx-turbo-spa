import * as TYPES from './mutations-types'
import set from 'lodash/set'
export default {
  [TYPES.SET_CURRENT](state, value) {
    state.currentProfile = value
  },

  [TYPES.SET_CONTEXTS](state, value) {
    state.contexts = value
  },

  [TYPES.SET_DATA](state, { path, value }) {
    set(state, path, value)
  },

  [TYPES.PROFILES_ADD_ITEMS](state, payload) {
    const oldState = state.items
    state.items = [...oldState, payload]
  },

  [TYPES.PROFILES_SET_CURRENT](state, payload) {
    state.current = payload
  },

  [TYPES.SET_ALL_PROFILES](state, payload) {
    const current = state.current
    const ProfileImpersonateIds =
      (current && current.meta && current.meta.canProfileImpersonate) || []
    const profilesWithoutAdmin = payload.filter((profile) => profile.alias !== 'admin')

    state.allProfiles = profilesWithoutAdmin.map((profile) => ({
      id: profile.id,
      name: profile.name,
      alias: profile.alias,
      active: ProfileImpersonateIds.includes(profile.id),
    }))
  },
}