import * as services from '../service/index'
import * as TYPES from './mutations-types'

import i18n from '@/support/i18n'

const getFilterWithoutStatusList = (rootState) => {
  return rootState.Account.user.enabledFeatures.includes('bidding') ? ['desistente'] : []
}

export const fetchOverallProgressContent = ({ commit, dispatch, rootState }, payload) => {
  const filterWithoutStatusList = getFilterWithoutStatusList(rootState)

  dispatch('setFetching', true)
  return services
    .getOverallProgressContent({ ...payload, filterWithoutStatusList })
    .then(({ data }) => {
      let content = data.data
        .filter((content) => !['reprovado', 'expirado', 'desistente'].includes(content.status))
        .map((content) => {
          const item = {
            id: content.sessionUuid || content.id,
            image: content.image,
            title: content.title,
            progress: content.progress,
            period: content.period,
            isBlocked: content.isBlocked,
            categories: content.categories,
            type: content.type === 'paths' ? 'trails' : content.type,
          }

          if (content.type === 'offerings') {
            item.subtitle = i18n.t(`dashboard:overallProgressContent.offerings.subtitle`)
            item.path = { name: 'classroom.offerings.solutions', params: { id: content.id } }
          }

          if (content.type === 'sessions') {
            item.subtitle = i18n.t(`dashboard:overallProgressContent.sessions.subtitle`)
            item.path = { name: 'classroom', params: { session_uuid: content.sessionUuid } }
          }

          if (content.type === 'paths') {
            item.subtitle = i18n.t(`dashboard:overallProgressContent.trails.subtitle`)
            item.path = { name: 'classroom.trail.sessions', params: { id: content.id } }
          }

          return item
        })

      commit(TYPES.SET_OVERALL_PROGRESS_CONTENT, content)
    })
    .finally(() => {
      dispatch('setFetching', false)
    })
}

export const fetchNewsContentResource = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_NEWS_CONTENT, data.fromCache)
    return
  }

  const response = await services.getNewsContent(data.params)

  response.data.data = response.data.data.map((content) => {
    return {
      id: content.id,
      image: content.image,
      title: content.title,
      description: content.description,
      path: { name: 'offerings.view', params: { id: content.id } },
      categories: content.categories,
      type: content.meta.offeringTypeAlias,
      rating: (content['_embedded'] && content['_embedded']['rating_analysis']) || null,
    }
  })

  commit(TYPES.SET_NEWS_CONTENT, response.data.data)
  return response.data
}

export const fetchOverallProgressStatus = ({ commit, dispatch }, payload) => {
  dispatch('setFetching', true)
  return services
    .getOverallProgress(payload)
    .then(({ data }) => {
      const overallProgressData = data.data
      const overallProgress = [
        overallProgressData.find((status) => status.name === 'pending'),
        overallProgressData.find((status) => status.name === 'initial'),
        overallProgressData.find((status) => status.name === 'final'),
      ]
      commit(TYPES.SET_OVERALL_PROGRESS_STATUS, overallProgress)
    })
    .finally(() => {
      dispatch('setFetching', false)
    })
}

export const fetchFeaturedCategories = ({ commit, dispatch }) => {
  dispatch('setFetching', true)
  return services
    .getFeaturedCategories()
    .then(({ data }) => {
      const featuredCategories = data.data.map((category, index) => {
        if (!category.position) {
          category.position = index
        }

        return category
      })

      const orderedCategories = featuredCategories.sort((currentCategory, nextCategory) => {
        if (currentCategory.position === nextCategory.position) {
          return 0
        }

        return currentCategory.position < nextCategory.position ? -1 : 1
      })

      commit(TYPES.SET_FEATURED_CATEGORIES, orderedCategories)
    })
    .finally(() => dispatch('setFetching', false))
}

export const moveFeaturedCategory = ({ commit }, { oldIndex, newIndex }) => {
  commit(TYPES.MOVE_FEATURED_CATEGORY, { oldIndex, newIndex })
}

export const removeFeaturedCategory = ({ commit, dispatch }, payload) => {
  dispatch('setFetching', true)
  return services
    .deleteFeaturedCategory(payload)
    .then(() => {
      commit(TYPES.DELETE_FEATURED_CATEGORY, payload)
    })
    .finally(() => dispatch('setFetching', false))
}

export const updateCategoriesPositions = ({ dispatch, state }) => {
  dispatch('setFetching', true)
  const orderedList = state.featuredCategories.map(({ id, category }, index) => ({
    id,
    name: category.name,
    position: index + 1,
  }))

  return services
    .updateFeaturedCategoriesPositions(orderedList)
    .finally(() => dispatch('setFetching', false))
}

export const saveFeaturedCategories = (_, payload) => {
  return services.saveFeaturedCategories(payload)
}

export const addFeaturedCategories = ({ commit }, payload) => {
  commit(TYPES.ADD_FEATURED_CATEGORIES, payload)
}