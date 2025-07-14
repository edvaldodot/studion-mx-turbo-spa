import * as services from '../services'
import * as TYPES from './mutations-types'

export const attemptSaveCategory = ({ commit, dispatch }, data) => {
  dispatch('setFetching', true)

  let savePromise = Number.isInteger(data.id)
    ? services.updateCategory(data)
    : services.createCategory(data)

  savePromise.then(({ data }) => {
    commit(TYPES.SET_CATEGORY_ITEM, data)
  }).finally(() => dispatch('setFetching', false))

  return savePromise
}

export const attemptCategoryRemove = ({ commit, dispatch }, categoryId) => {
  dispatch('setFetching', true)
  let savePromise = services.removeCategory(categoryId)

  savePromise.then(() => {
    commit(TYPES.DELETE_CATEGORY, categoryId)
  }).finally(() => dispatch('setFetching', false))

  return savePromise
}

export const attemptCategoryRetrieval = ({ commit }, data) => {
  return services.getCategory(data)
}

export const attemptCategoryListRetrieval = ({ commit, dispatch }, data) => {
  dispatch('setFetching', true)

  let params = Object.assign({limit: 1000}, data)

  let savePromise = services.getCategories(params)

  savePromise.then(({ data }) => {
    commit(TYPES.SET_CATEGORIES_LIST, data.data)
  }).finally(() => { dispatch('setFetching', false) })

  return savePromise
}

export const moveCategory = ({ commit }, { oldIndex, newIndex }) => {
  commit(TYPES.MOVE_CATEGORY, {oldIndex, newIndex})
}

export const updatePosition = ({ commit, dispatch, getters }, { newIndex }) => {
  dispatch('setFetching', true)

  const category = getters.getCategoryByIndex(newIndex)
  category.position = newIndex + 1

  services.updateCategory(category)
    .then(({ data }) => {
      commit(TYPES.SET_CATEGORY_ITEM, data)
    })
    .finally(() => {
      dispatch('setFetching', false)
    })
}

export const getCategoriesTabListResource = async ({ commit }, data) => {
  if (data && data.fromCache) return commit(TYPES.SET_CATEGORIES_TAB_LIST, data.fromCache)

  const response = await services.getCategories(data.params)
  commit(TYPES.SET_CATEGORIES_TAB_LIST, response.data.data)
  return response.data
}
