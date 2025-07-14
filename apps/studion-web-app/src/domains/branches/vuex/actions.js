import * as services from '../services'
import * as TYPES from './mutations-types'

export const attemptTreeDetailsRetrieval = async ({ commit }, cached = false) => {
  const promisse = services.getBranchesTree({cached})
  const { data } = await promisse
  commit(TYPES.SET_TREE, data)
}

export const attemptSetCurrentParent = async ({commit}, data) => {
  if (!data) {
    const response = await services.getBranchesList({})
    if (response.data.data.length) {
      commit(TYPES.SET_CURRENT_PARENT, response.data.data[0])
    }
    return
  }

  if (typeof data === 'object') {
    commit(TYPES.SET_CURRENT_PARENT, data)
  } else {
    const response = await services.getBranchById(data)
    commit(TYPES.SET_CURRENT_PARENT, response.data)
  }
}

export const attemptSetCurrent = async ({commit}, id) => {
  const response = await services.getBranchById(id)
  commit(TYPES.SET_CURRENT, response.data)
}

export const attemptGetCurrentBranchById = (_, id) => {
  return services.getBranchById(id)
}

export const attemptClearCurrent = async ({commit}) => {
  commit(TYPES.CLEAR_CURRENT)
}

export const branchesListResource = async ({commit}, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_BRANCHES_LIST, data.fromCache)
    return
  }
  let response = await services.getBranchesList(data.params)
  commit(TYPES.SET_BRANCHES_LIST, response.data.data)
  return response.data
}

export const attemptClearBranchesList = async ({commit}) => {
  commit(TYPES.CLEAR_BRANCHES_LIST)
}

export const attemptBranchCreation = ({ commit }, data) => {
  return services.createBranch(data)
}

export const attemptBranchUpdate = ({ commit }, data) => {
  return services.updateBranch(data)
}

export const attemptBranchActiveToggle = ({ commit }, id) => {
  return services.activateBranchToggle(id)
}

export const attemptBranchRemove = ({ commit }, id) => {
  return services.removeBranch(id)
}

export const attemptBranchUserUuidListRetrieval = ({ commit }, branchId) => {
  return services.retrieveBranchUserListUuid(branchId)
}

export const attemptBranchesListByNameRetrieval = ({ commit }, { branchName, all }) => {
  return all ? services.retrieveBranchesListByNameAll(branchName) : services.retrieveBranchesListByName(branchName)
}
