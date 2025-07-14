import * as TYPES from './mutation-types'
import Vue from 'vue'
import mutationsSolutions from './mutations-solutions'
import { initialCurrentTrail } from './state'

export default {
  [TYPES.SET_TRAILS] (state, payload) {
    state.trails = payload
  },
  [TYPES.SET_CURRENT] (state, payload) {
    state.current = payload
  },
  [TYPES.RESET_CURRENT] (state) {
    state.current = initialCurrentTrail
  },
  [TYPES.SET_CURRENT_RATING] (state, trailRating) {
    state.currentTrailRating = trailRating
  },
  [TYPES.SET_CURRENT_AVAILABLE_TRAILS] (state, availableSolutions) {
    Vue.set(state.current, 'availableSolutions', availableSolutions)
  },
  [TYPES.SET_CURRENT_USERS] (state, users) {
    state.current.users = users
  },
  [TYPES.SET_TRAIL_GROUPS_LIST] (state, payload) {
    state.current.groups = payload
  },
  ...mutationsSolutions
}
