import { http } from '@/support/http'
import config from '@/config'
import { objectToFormData } from '@/support/utils/objectToFormData'
import 'url-search-params-polyfill'
import { source } from '../../../support/utils/source'
import { createQuery } from '../../../support/utils/paginatorQueryBuilder'
import { branchIdsToQueryString } from '../utils/branches'
import { parseToFormData } from '@/support/payloadParser'

const { APP_KEY, APP_SECRET } = config

export const getUsers = (searchParams = {}) => {
  let queryString = createQuery(searchParams)
  return http.get(`users?${queryString}`)
}

export const getUserMetadata = (userId) => {
  return http.get(`users/${userId}/metas`, { cancelToken: source.token })
}

export const updateUserMetadata = (userId, data) => {
  return http.put(`users/${userId}/metas`, data)
}

export const getSessionsEnrolledUsersList = (queryParams) => {
  const { userUuid } = queryParams
  delete queryParams.userUuid

  if (queryParams.filter.context === 'paths') {
    return http.get(`/paths/enrolled/user/${userUuid}?${createQuery(queryParams)}`)
  }
  return http.get(`sessions/enrolled/user/${userUuid}?${createQuery(queryParams)}`, {
    cancelToken: source.token,
  })
}

export const getSessionsResponsibleUsersList = (userUuid) => {
  return http.get(`sessions/responsible/user/${userUuid}`, { cancelToken: source.token })
}

export const createUser = ({ name, username, email, password, profiles, language, branch }) => {
  const params = objectToFormData({
    client_id: APP_KEY,
    client_secret: APP_SECRET,
    name,
    username,
    email,
    pwd: password,
    branch_id: branch,
    profiles,
    language,
  })

  return http.post('register/restrict', params)
}

export const updateUser = ({ uuid, name, email, username, password, profiles, language, branch, canChangeUsername = true }) => {
  const params = new URLSearchParams() // eslint-disable-line no-undef

  params.append('name', name)
  params.append('email', email)

  canChangeUsername && params.append('username', username)

  if (password) {
    params.append('pwd', password)
  }

  if (profiles.length) {
    params.append('profiles', JSON.stringify(profiles))
  }

  if (language.length) {
    params.append('language', language)
  }

  if (branch) {
    params.append('branch_id', branch)
  }

  return http.put(`users/${uuid}`, params)
}

export const deleteUser = (userUuid) => {
  return http.delete(`users/${userUuid}`)
}

export const activeUserToggle = (userUuid) => {
  return http.put(`users/${userUuid}/active/toggle`)
}

export const removeUser = (uuid) => {
  return http.delete(`users/${uuid}`)
}

export const getStatus = () => {
  return http.get('users/status', { cancelToken: source.token })
}

export const validateAccountByEmail = (email) => {
  return http.post('users/email/validate', objectToFormData({ email }))
}

export const linkAccount = (email, name, profiles, branch) => {
  const params = objectToFormData({
    email,
    name,
    profiles,
    branch_id: branch,
  })

  return http.post('register/restrict/exists/account', params)
}

export const getListUsersNonStudentByName = (userName, branchIds) => {
  let branchData = branchIdsToQueryString(branchIds)
  return http.get(`users/search/non-student/${userName}?${branchData}`)
}

export const confirmUser = (email) => {
  const params = parseToFormData({
    email: email,
    client_id: APP_KEY,
    client_secret: APP_SECRET,
  })

  return http.post('accounts/active/restrict', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const getUserLanguage = (uuid) => {
  return http.get(`users/${uuid}/settings`)
}

export const downloadBatchRegisterTemplate = () => {
  return http
    .get(`batch/template/register`, {
      responseType: 'blob',
    })
    .then((response) => {
      let link = document.createElement('a')
      link.href = window.URL.createObjectURL(response.data)
      link.download = 'batch-register-model.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
}

export const downloadBatchUpdaterTemplate = () => {
  return http
    .get(`batch/template/updater`, {
      responseType: 'blob',
    })
    .then((response) => {
      let link = document.createElement('a')
      link.href = window.URL.createObjectURL(response.data)
      link.download = 'batch-updater-model.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
}

export const sendBatchRegister = (file) => {
  const form = new FormData()
  form.append('file', file, file.name)
  return http.post('batch/register', form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const sendBatchEdit = (file) => {
  const form = new FormData()
  form.append('file', file, file.name)
  return http.post('batch/updater', form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const getProgressRegister = (id) => {
  return http.get(`batch/process/${id}/status`)
}

export const listBatchRegisterProcess = (types) => {
  return http.get(`batch/process?types=${types.join()}`, { cancelToken: source.token })
}

export const getUserBatch = (params, status) => {
  const types = ['register', 'updater']
  return http.get(
    `batch/process?types=${types.join()}&status=${status.join()}&${createQuery(params)}`
  )
}

export const downloadBatchRegisterReport = (batch) => {
  return http
    .get(`batch/process/${batch.id}/register/report`, {
      responseType: 'blob',
    })
    .then((response) => {
      let link = document.createElement('a')
      link.href = window.URL.createObjectURL(response.data)
      link.download = batch.fileName.split('.', 1) + '-results.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
}

export const downloadBatchEditReport = (batch) => {
  return http
    .get(`batch/process/${batch.id}/updater/report`, {
      responseType: 'blob',
    })
    .then((response) => {
      let link = document.createElement('a')
      link.href = window.URL.createObjectURL(response.data)
      link.download = batch.fileName.split('.', 1) + '-results.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
}

export const updatePassword = ({ uuid, password }) => {
  const params = new URLSearchParams()

  params.append('new_password', password)

  return http.put(`users/${uuid}/password`, params)
}
