import * as TYPES from './mutations-types'

export default {
  [TYPES.SET_TREE] (state, value) {
    state.tree = value
  },
  [TYPES.SET_BRANCHES_LIST] (state, value) {
    state.list = value
  },
  [TYPES.CLEAR_BRANCHES_LIST] (state) {
    state.list = []
  },
  [TYPES.SET_CURRENT_PARENT] (state, value) {
    state.currentParentBranch = value
  },
  [TYPES.SET_CURRENT] (state, value) {
    state.currentBranch = value
  },
  [TYPES.CLEAR_CURRENT] (state) {
    state.currentBranch = null
  },
  [TYPES.SET_ASSOCIATION] (state, value) {
    state.associations.push(value)
  },
  [TYPES.SET_DISASSOCIATION] (state, value) {
    state.disassociations.push(value)
  }
}
