import * as TYPES from './mutations-types'
import * as services from '../services'

export const attemptProfileListRetrieval = (_, searchParams) => {
  return services.getProfiles(searchParams)
}

export const attemptProfileListAllRetrieval = (_, searchParams) => {
  return services.getProfilesAll(searchParams)
}

export const attemptRetrieveAllProfiles = async ({ commit, dispatch }) => {
  dispatch('setFetching', true)
  try {
    const { data: response } = await services.getAllActiveProfiles()
    commit(TYPES.SET_ALL_PROFILES, response)
  } catch (error) {
    commit(TYPES.SET_ALL_PROFILES, [])
    throw error
  } finally {
    dispatch('setFetching', false)
  }
}

export const attemptProfilesByUser = (_, uuid) => {
  return services.retrieveProfilesByUser(uuid)
}

export const attemptProfileCreation = (_, data) => {
  return services.createProfile(data)
}

export const attemptProfileUpdate = (_, data) => {
  return services.updateProfile(data)
}

export const attemptProfileDelete = (_, id) => {
  return services.deleteProfile(id)
}

export const attemptProfileActivation = (_, id) => {
  return services.activateProfile(id)
}

export const attemptProfileDeactivation = (_, id) => {
  return services.deactivateProfile(id)
}

export const attemptContextsRetrieval = ({ commit }) => {
  return services.getContexts().then((response) => {
    commit(TYPES.SET_CONTEXTS, response.data)
    return response
  })
}

export const attemptGetProfilesLGPDOptions = () => services.getProfilesLGPDOptions()

export const setProfilesData = ({ commit }, data) => {
  commit(TYPES.SET_DATA, data)
}

export const addProfilesItems = ({ commit }, data) => {
  commit(TYPES.PROFILES_ADD_ITEMS, data)
}

export const setProfilesCurrent = ({ commit }, data) => {
  commit(TYPES.PROFILES_SET_CURRENT, data)
}
