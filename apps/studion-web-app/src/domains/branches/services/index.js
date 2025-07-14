import { http } from '@/support/http'
import { parse } from '@/support/payloadParser'
import { source } from '@/support/utils/source'
import { createQuery } from '@/support/utils/paginatorQueryBuilder'

export const getBranchesTree = (data) => {
  if (data.cached) {
    return http.get(`branches?cached=${data.cached}`, {cancelToken: source.token})
  }
  return http.get(`branches`, {cancelToken: source.token})
}

export const getBranchesList = queryParams => {
  return http.get(`branches?${createQuery(queryParams, true)}`, {cancelToken: source.token})
}

export const getBranchById = id => {
  return http.get(`branches/${id}`)
}

export const createBranch = payload => http.post('branches', parse(payload))

export const updateBranch = payload => {
  const id = payload.id

  payload.id = null

  return http.put(`branches/${id}`, parse(payload))
}

export const activateBranchToggle = id => {
  return http.put(`branches/${id}/active/toggle`)
}

export const removeBranch = id => http.delete(`branches/${id}`)

export const retrieveBranchUserList = branchId => http.get(`branches/${branchId}/users`, {cancelToken: source.token})

export const retrieveBranchUserListUuid = branchId => http.get(`branches/${branchId}/users/list`, {cancelToken: source.token})

export const retrieveBranchesListByName = (branchName) => {
  return http.get(`branches/regular?name=${branchName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
}

export const retrieveBranchesListByNameAll = (branchName) => {
  return http.get(`branches/all?name=${branchName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
}
