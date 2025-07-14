import * as TYPES from './mutations-types'

export default {
  [TYPES.SET_EVALUATIONS_LIST_RESOURCE](state, value) {
    state.evaluationsListResource = value
  },

  [TYPES.SET_PRE_PROJECT_LIST_RESOURCE](state, value) {
    state.preProjectListResource = value
  },
}