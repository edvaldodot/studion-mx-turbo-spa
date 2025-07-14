import * as TYPES from './mutations-types'
import set from 'lodash/set'
export default {
  [TYPES.SET_CURRENT](state, value) {
    state.current = value
  },
  [TYPES.SET_SESSIONS_ITEMS](state, value) {
    state.items = value
  },
  [TYPES.SET_SESSIONS_USERS](state, value) {
    state.users = value
  },
  [TYPES.SET_DATA](state, { path, value }) {
    set(state, path, value)
  },
  [TYPES.ADD_SESSIONS_ITEMS](state, value) {
    const oldItems = state.items
    state.items = [...oldItems, value]
  },
  [TYPES.SET_CURRENT_ITEM_DATA](state, value) {
    state.items[state.currentIndex] = value
  },
  [TYPES.REMOVE_SESSION_ITEM](state, { index, deleteCount }) {
    state.items.splice(index, deleteCount)
  },
  [TYPES.SET_SESSIONS_LIST](state, value) {
    state.sessionsList = value
  },
  [TYPES.SET_MEDIATION_LIST](state, value) {
    state.mediationList = value
  },
  [TYPES.SET_SHEET_LIST](state, value) {
    state.sheetList = value
  },
  [TYPES.SET_SESSIONS_BATCH_DATE_LIST](state, value) {
    state.sessionsBatchDateList = value
  },
  [TYPES.SET_RECOVERY_LIST](state, value) {
    state.recoveryList = value
  },
  [TYPES.SET_REASON_LIST](state, value) {
    state.reasonList = value
  },
  [TYPES.ADD_REASON](state, value) {
    state.reasonList.data.push(value)
  },
}
