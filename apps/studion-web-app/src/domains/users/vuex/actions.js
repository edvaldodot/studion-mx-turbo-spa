import cloneDeep from 'lodash/cloneDeep'

import * as services from '../services'
import * as TYPES from './mutations-types'

import { formatSessions } from '../utils/enrollments'

export const attemptUserListRetrieval = (_, searchParams = {}) => {
  return services.getUsers(searchParams)
}

export const attemptUserMetadataRetrieval = (_, userId) => {
  return services.getUserMetadata(userId)
}

export const attemptUserMetadataUpdate = (_, { userId, metadata }) => {
  return services.updateUserMetadata(userId, metadata)
}

export const attemptGetSessionsResponsibleUsersList = (_, userUuid) => {
  return services.getSessionsResponsibleUsersList(userUuid)
}

export const attemptUserCreation = (_, payload) => {
  return services.createUser(payload)
}

export const attemptUserUpdate = (_, payload) => {
  return services.updateUser(payload)
}

export const attemptUserDelete = (_, payload) => {
  return services.deleteUser(payload)
}

export const attemptUserActiveUserToggle = (_, userUuid) => {
  return services.activeUserToggle(userUuid)
}

export const attemptUserRemoval = (_, userId) => {
  return services.removeUser(userId)
}

export const attemptStatusListRetrieval = () => {
  return services.getStatus()
}

export const attemptAccountValidation = (_, emailAddress) => {
  return services.validateAccountByEmail(emailAddress)
}

export const attemptUserAccountLinkage = (_, { email, name, profiles, branch }) => {
  return services.linkAccount(email, name, profiles, branch)
}

export const attemptListUsersNonStudentByName = (_, { userName, branchIds }) => {
  return services.getListUsersNonStudentByName(userName, branchIds)
}

export const attemptConfirmUser = (_, email) => {
  return services.confirmUser(email)
}

export const attemptGetUserLanguage = (_, uuid) => {
  return services.getUserLanguage(uuid)
}

export const attemptDownloadBatchRegisterTemplate = (_, isBatchEditing) => {
  return isBatchEditing
    ? services.downloadBatchUpdaterTemplate()
    : services.downloadBatchRegisterTemplate()
}

export const attemptSendUserBatch = (_, { file, isBatchEditing }) => {
  return isBatchEditing ? services.sendBatchEdit(file) : services.sendBatchRegister(file)
}

export const attemptGetProgressRegister = (_, id) => {
  return services.getProgressRegister(id)
}

export const attemptListBatchRegisterProcess = (_) => {
  const types = ['register', 'updater']
  return services.listBatchRegisterProcess(types)
}

export const completedUserBatchResources = async ({ commit }, data) => {
  if (data.fromCache) {
    return commit(TYPES.SET_COMPLETED_USER_BATCH, data.fromCache)
  }

  let response = await services.getUserBatch(data.params, ['completed'])
  commit(TYPES.SET_COMPLETED_USER_BATCH, response.data.data)
  return response.data
}

export const pendingUserBatchResources = async ({ commit }, data) => {
  if (data.fromCache) {
    return commit(TYPES.SET_PENDING_USER_BATCH, data.fromCache)
  }

  let response = await services.getUserBatch(data.params, ['pending', 'processing'])
  commit(TYPES.SET_PENDING_USER_BATCH, response.data.data)
  return response.data
}

export const attemptDownloadUserBatchReport = (_, batch) => {
  return batch.type === 'updater'
    ? services.downloadBatchEditReport(batch)
    : services.downloadBatchRegisterReport(batch)
}

export const userEnrollmentsResource = async ({ commit }, data) => {
  if (data.fromCache) {
    return commit(TYPES.USERS_SET_CURRENT_ENROLLMENTS, data.fromCache)
  }
  let response = await services.getSessionsEnrolledUsersList(cloneDeep(data.params))
  response.data.data = formatSessions(response.data.data)
  commit(TYPES.USERS_SET_CURRENT_ENROLLMENTS, response.data.data)

  return response.data
}

export const userListResource = async ({ commit }, data) => {
  if (data.fromCache) {
    return commit(TYPES.SET_USER_LIST, data.fromCache)
  }

  let response = await services.getUsers(data.params)
  commit(TYPES.SET_USER_LIST, response.data.data)
  return response.data
}

export const setUsersData = ({ commit }, data) => {
  commit(TYPES.SET_DATA, data)
}

export const addUsersItems = ({ commit }, data) => {
  commit(TYPES.USERS_ADD_ITEMS, data)
}

export const setUsersCurrent = ({ commit }, data) => {
  commit(TYPES.USERS_SET_CURRENT, data)
}

export const attemptPasswordUpdate = (_, payload) => {
  return services.updatePassword(payload)
}
