import i18n from '@/support/i18n'

import * as services from '../services'
import * as TYPES from './mutation-types'

import { pgtrCreateResource } from '@/support/utils/paginator'

export * from './enroll-actions'
export * from './actions-solutions'
export * from './actions-groups'

export const attemptTrailsTypesRetrieval = () => {
  return services.getTrailsTypes()
}

export const attemptTrailRetrieval = (_, data) => {
  return services.trailRetrieval(data)
}

export const attemptTrailCreation = ({ commit, state }, trail) => {
  let createTrailRequest = services.createTrails(trail)
  createTrailRequest.then(({ data }) => {
    commit(TYPES.SET_CURRENT, { ...state.current, ...data })
  })

  return createTrailRequest
}

export const attemptTrailUpdate = ({ commit, state }, trails) => {
  let updateTrailRequest = services.updateTrailRequest(trails)
  updateTrailRequest.then(({ data }) => {
    data._embedded = { categories: data.categories }
    commit(TYPES.SET_CURRENT, { ...state.current, ...data })
  })

  return updateTrailRequest
}

export const setCurrent = ({ state, commit, dispatch }, trailId) => {
  trailId = parseInt(trailId)

  if (state.current.id === trailId) {
    return
  }

  const params = { embed: 'categories' }

  dispatch('setFetching', true)

  return services
    .trailRetrieval({ trailId, params })
    .then(({ data }) => {
      commit(TYPES.SET_CURRENT, { ...state.current, ...data })
    })
    .finally(() => {
      dispatch('setFetching', false)
    })
}

export const trailUsersResource = async ({ commit }, data) => {
  data.params = { ...data.params, args: { trailId: data.options.trailId } }
  if (data.fromCache) {
    return commit(TYPES.SET_CURRENT_USERS, data.fromCache)
  }
  let response = await services.trailUsersRetrieval(data.params)
  commit(TYPES.SET_CURRENT_USERS, response.data.data)

  return response.data
}

export const attemptTrailEnrollmentStatusUpdate = (_, data) => {
  return services.trailEnrollmentStatusUpdate(data)
}

export const trailsResource = async ({ commit }, data) => {
  return pgtrCreateResource(commit, data, services.getTrailsList, TYPES.SET_TRAILS)
}

export const deleteTrail = (_, trailId) => {
  return services.deleteTrail(trailId)
}

export const publishTrail = ({ commit, dispatch, state }, trailId) => {
  if (trailId == null) {
    trailId = state.current.id
  }

  dispatch('setFetching', true)
  let publishPromise = services.publishTrail(trailId)
  publishPromise
    .then(({ data }) => {
      commit(TYPES.SET_CURRENT, { ...state.current, ...data })
    })
    .then(() => {
      dispatch('setFeedback', { message: i18n.t('trails.create:feedback.saved') })
    })
  publishPromise
    .catch(({ response }) => {
      dispatch('setFeedback', {
        message: i18n.t(`trails.publish:feedback.error:${response.data.message}`),
      })
    })
    .finally(() => {
      dispatch('setFetching', false)
    })

  return publishPromise
}

export const searchNonStudentByNameOrEmail = (_, nameOrEmail) => {
  return services.searchNonStudentByNameOrEmail(nameOrEmail)
}

export const setCurrentTrailRating = ({ commit }, trailRating) => {
  commit(TYPES.SET_CURRENT_RATING, trailRating)
}

export const attemptDownloadTrailCertificate = (_, payload) => {
  return services.downloadTrailCertificate(payload.hash, payload.isHistory)
}

export const attemptSaveTrailSessionAllowance = (_, data) => {
  return services.saveTrailSessionAllowance(data)
}

export const attemptDeleteTrailSessionAllowance = (_, data) => {
  return services.deleteTrailSessionAllowance(data)
}

export const attemptGetTrailFinalStatusList = () => {
  return services.getTrailFinalStatusList()
}

export const attemptReenrollUserOnTrail = (_, data) => {
  return services.reenrollUserOnTrail(data)
}
