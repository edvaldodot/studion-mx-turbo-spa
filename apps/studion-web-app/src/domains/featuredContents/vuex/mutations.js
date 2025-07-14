import * as TYPES from './mutations-types'

export default {
  [TYPES.SET_FEATURED_CONTENTS_LIST] (state, value) {
    state.list = value
  },
  [TYPES.SET_FEATURED_CONTENTS_ITEM] (state, featuredContent) {
    const find = state.list.find(item => item.id === featuredContent.id)
    let index = state.list.indexOf(find)
    if (index >= 0) {
      state.list[index] = featuredContent
    } else {
      state.list.push(featuredContent)
    }
  },
  [TYPES.MOVE_FEATURED_CONTENT] (state, { oldIndex, newIndex }) {
    let featuredContentsList = state.list

    let featuredContent = featuredContentsList.splice(oldIndex, 1)[0]
    featuredContentsList.splice(newIndex, 0, featuredContent)

    state.list = featuredContentsList
  },
  [TYPES.DELETE_FEATURED_CONTENT] (state, featuredContentId) {
    state.list = state.list.filter(item => item.id !== featuredContentId)
  }
}
