import * as TYPES from './mutations-types'

export default {
  [TYPES.SET_OVERALL_PROGRESS_CONTENT] (state, payload) {
    state.overallProgressContent = payload
  },
  [TYPES.SET_OVERALL_PROGRESS_STATUS] (state, payload) {
    state.overallProgressStatus = payload
  },
  [TYPES.SET_FEATURED_CATEGORIES] (state, payload) {
    const categories = payload.sort((currentCategory, nextCategory) => {
      if (currentCategory.position === nextCategory.position) {
        return 0
      }
      return (currentCategory.position < nextCategory.position) ? -1 : 1
    })

    state.featuredCategories = categories
  },
  [TYPES.MOVE_FEATURED_CATEGORY] (state, { oldIndex, newIndex }) {
    let categories = state.featuredCategories

    let category = categories.splice(oldIndex, 1)[0]
    categories.splice(newIndex, 0, category)

    categories = categories.map((category, index) => {
      category.position = index + 1
      return category
    })

    state.featuredCategories = categories
  },
  [TYPES.DELETE_FEATURED_CATEGORY] (state, categoryId) {
    state.featuredCategories = state.featuredCategories.filter(item => item.id !== categoryId)
  },
  [TYPES.SET_CATEGORIES_LIST] (state, categoriesList) {
    state.categoriesList = categoriesList
  },

  [TYPES.SET_NEWS_CONTENT](state, newsContent) {
    state.newsContent = newsContent
  },
}