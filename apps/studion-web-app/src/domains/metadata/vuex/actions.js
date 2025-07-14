import * as services from '../services'
import * as TYPES from './mutations-types'

export const attemptMetasListRetrieval = ({ commit }, {entity, searchParams}) => {
  return services.getMetas(entity, searchParams)
}

export const attemptMetasTypesListRetrieval = () => {
  return services.getMetasTypes()
}

export const attemptCheckMetaStatusRetrieval = () => {
  return services.checkMetaStatus()
}

export const attemptMetasFormatsListRetrieval = () => {
  return services.getMetasFormats()
}

export const attemptMetasCreation = ({ commit }, data) => {
  return services.createMetas(data)
}

export const attemptMetasUpdate = ({ commit }, data) => {
  return services.updateMetas(data)
}

export const attemptMetasRemoval = ({ commit }, { entity, id }) => {
  return services.deleteMetas(entity, id)
}

export const setMetadataData = ({ commit }, data) => {
  commit(TYPES.SET_DATA, data)
}

export const setMetadataCurrent = ({ commit }, data) => {
  commit(TYPES.SET_CURRENT, data)
}

export const addMetadataItems = ({ commit }, data) => {
  commit(TYPES.ADD_ITEMS, data)
}

export const courseListMetadataResources = async (_, data) => {
  if (data.fromCache) {
    return data.fromCache
  }

  const response = await services.getMetas('course', data.params)

  return response.data
}

export const attemptGetCourseListMetadata = async ({ dispatch, state }, data) => {
  if (state.items && state.items.length) {
    return state.items
  }

  try {
    const response = await services.getMetas('course')
    const pagination = response.data
    dispatch('setMetadataData', { path: 'items', value: pagination.data })
    return pagination.data
  } catch (error) {
    return []
  }
}

export const attemptGetCourseMetadata = (_, courseId) => {
  return services.getCourseMetadata(courseId)
}

export const attemptGetBranchingMetadata = () => {
  return services.getBranchingsMetadata()
}

export const attemptGetBranchMetadata = (id) => {
  return services.getBranchMetadata(id)
}

export const attemptSaveCourseMetadata = ({ commit }, { courseId, data }) => {
  return services.saveCourseMetadata(courseId, data)
}

export const getBranchMetadataList = async ({ commit }, data) => {
  const { fromCache } = data
  if (fromCache) return commit(TYPES.SET_BRANCHES_METADATA_LIST, fromCache)

  try {
    const response = await services.getMetas('application_branch', data.params)
    commit(TYPES.SET_BRANCHES_METADATA_LIST, response.data.data)
    return response.data
  } catch (error) {
    commit(TYPES.SET_BRANCHES_METADATA_LIST, [])
    throw error
  }
}
