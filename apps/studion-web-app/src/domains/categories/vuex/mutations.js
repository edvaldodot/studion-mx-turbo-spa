import * as TYPES from './mutations-types'

export default {
  [TYPES.SET_CATEGORIES_LIST] (state, value) {
    state.list = value
  },
  [TYPES.SET_CATEGORY_ITEM] (state, category) {
    const find = state.list.find(item => item.id === category.id)
    let index = state.list.indexOf(find)
    if (index >= 0) {
      Object.assign(state.list[index], category)
    } else {
      state.list.push(category)
    }
  },
  [TYPES.MOVE_CATEGORY] (state, { oldIndex, newIndex }) {
    let categoriesList = state.list

    let category = categoriesList.splice(oldIndex, 1)[0]
    categoriesList.splice(newIndex, 0, category)

    state.list = categoriesList
  },
  [TYPES.DELETE_CATEGORY] (state, categoryId) {
    state.list = state.list.filter(item => item.id !== categoryId)
  },
  [TYPES.SET_CATEGORIES_TAB_LIST] (state, value) {
    state.categoriesTabList = value
  }
}
