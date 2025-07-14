import * as services from '../services'
import * as TYPES from './mutations-types'

export const saveFeaturedContent = ({ commit, dispatch }, featuredContent) => {
  dispatch('setFetching', true)
  if (!Number.isInteger(featuredContent.active)) {
    featuredContent.active = [true, '1'].indexOf(featuredContent.active) >= 0 ? 1 : 0
  }

  let savePromise = Number.isInteger(featuredContent.id)
    ? services.updateFeaturedContent(featuredContent)
    : services.createFeaturedContent(featuredContent)

  savePromise.then(({ data }) => {
    commit(TYPES.SET_FEATURED_CONTENTS_ITEM, data)
  }).finally(() => dispatch('setFetching', false))

  return savePromise
}

export const getFeaturedContent = ({ dispatch }, featuredContentId) => {
  dispatch('setFetching', true)
  return services.getFeaturedContent(featuredContentId)
    .finally(() => dispatch('setFetching', false))
}

export const fetchFeaturedContent = ({ commit }) => {
  return services.listFeaturedContent().then(({ data }) => {
    commit(TYPES.SET_FEATURED_CONTENTS_LIST, data.data)
  })
}

export const setStateFeaturedContent = ({ dispatch, getters }, payload) => {
  let featuredContent = getters.getFeaturedContentById(payload.id)
  featuredContent.active = payload.state
  return dispatch('saveFeaturedContent', featuredContent)
}

export const moveFeaturedContent = ({ commit, dispatch, state }, { oldIndex, newIndex }) => {
  commit(TYPES.MOVE_FEATURED_CONTENT, { oldIndex, newIndex })
}

export const deleteFeaturedContent = ({ commit, dispatch }, payload) => {
  dispatch('setFetching', true)
  return services.deleteFeaturedContent(payload)
    .then(() => {
      commit(TYPES.DELETE_FEATURED_CONTENT, payload)
    })
    .finally(() => dispatch('setFetching', false))
}
export const updatePositions = ({ commit, dispatch, state }) => {
  dispatch('setFetching', true)
  const orderedList = state.list.map(({ id, title, description, url }, index) => ({ id, title, position: index + 1, description, url }))
  return services.updatePositions(orderedList)
    .finally(() => dispatch('setFetching', false))
}
