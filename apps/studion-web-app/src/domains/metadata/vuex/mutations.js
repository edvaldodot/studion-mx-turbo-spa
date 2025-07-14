import * as TYPES from './mutations-types'
import set from 'lodash/set'
export default {
  [TYPES.SET_DATA] (state, {path, value}) {
    set(state, path, value)
  },
  [TYPES.SET_CURRENT] (state, payload) {
    const oldCurrent = state.current
    state.current = {...oldCurrent, payload}
  },
  [TYPES.ADD_ITEMS] (state, payload) {
    const oldItems = state.items
    state.items = [...oldItems, payload]
  },
  [TYPES.SET_BRANCHES_METADATA_LIST](state, payload) {
    state.branchesMetadataList = payload
  },
}
