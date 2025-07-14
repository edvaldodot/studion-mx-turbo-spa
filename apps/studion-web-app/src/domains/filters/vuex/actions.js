import * as services from '../services'
import * as TYPES from './mutations-types'

export const attemptFilterTypesRetrieval = async ({ commit, state }) => {
  if (state.filterTypes && state.filterTypes.length) {
    return state.filterTypes
  }

  try {
    const { data } = await services.getFilterTypes()
    commit(TYPES.SET_FILTER_TYPES, data)
    return data
  } catch (error) {
    commit(TYPES.SET_FILTER_TYPES, [])
    throw new Error(error)
  }
}

export const attemptFilterCreation = (_, filter) => {
  return services.createFilter(filter)
}

export const attemptSolutionsWithScormRetrieval = (_, { query }) => {
  return services.getSolutionsWithScorm(query)
}

export const attemptSolutionsRetrieval = (_, { query }) => {
  return services.getSolutions(query)
}

export const attemptScormBySolutionRetrieval = (_, { query, params }) => {
  return services.getScormBySolutionIdAndName(params.solutionId, query)
}

export const attemptStatusByContentTypeRetrieval = async ({ state, commit }, paramContentType) => {
  const hasContentStatusCached = state.cacheContentStatus && state.cacheContentStatus[paramContentType]

  if (hasContentStatusCached) {
    return hasContentStatusCached
  }

  try {
    const response = await services.getStatusByContentType(paramContentType)
    commit(TYPES.SET_CACHE_CONTENT_STATUS, { content: paramContentType, response })
    return response
  } catch (error) {
    commit(TYPES.SET_CACHE_CONTENT_STATUS, { content: paramContentType })
    throw new Error(error)
  }
}

export const attemptScormTopicsRetrieval = (_, { scormId }) => {
  return services.getScormTopics(scormId)
}

export const filterListResource = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_FILTERS, data.fromCache)
    return
  }

  let response = await services.getFilters(data.params)
  commit(TYPES.SET_FILTERS, response.data.data)

  return response.data
}

export const attemptToggleFilterStatus = (_, id) => {
  return services.toggleFilterStatus(id)
}

export const attemptSessionBySolutionRetrieval = (_, { query, params }) => {
  return services.getSessionBySolution(query, params)
}

export const filterPreviewResource = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_FILTER_PREVIEW_DATA, data.fromCache)
    return
  }
  let response = await services.getPreviewUsersList(data.options, data.params)
  commit(TYPES.SET_FILTER_PREVIEW_DATA, response.data.data)
  return response.data
}

export const attemptDownloadSpreadsheet = (_, { format, session, filterId }) => {
  return services.downloadSpreadsheet(format, session, filterId)
}

export const attemptFilterByIdRetrieval = (_, filterId) => {
  return services.getFilterById(filterId)
}

export const attemptCourseByIdRetrieval = (_, courseId) => {
  return services.getCourseById(courseId)
}

export const attemptRemoveFilter = (_, filterId) => {
  return services.removeFilter(filterId)
}
