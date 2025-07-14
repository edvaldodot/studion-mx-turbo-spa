import * as TYPES from './mutations-types'
import set from 'lodash/set'

export default {
  [TYPES.SET_DATA] (state, {path, value}) {
    set(state, path, value)
  },
  [TYPES.ADD_ITEMS] (state, value) {
    const oldItems = state.items
    state.items = {...oldItems, value}
  },
  [TYPES.ADD_CATEGORIES] (state, value) {
    const oldCategories = state.categories
    state.categories = {...oldCategories, value}
  }
}
