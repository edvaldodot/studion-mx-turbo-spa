import i18n from '@/support/i18n'

import * as TYPES from './mutations-types'
import * as services from '../services'

export const attemptOfferingCreation = (_, data) => {
  return services.createOffering(data)
}

export const attemptOfferingRetrieval = ({ commit }, data) => {
  return services.getOffering(data).then((response) => {
    commit(TYPES.SET_CURRENT, response.data)

    return response
  })
}

export const attemptOfferingUpdate = (_, data) => {
  const updateRequests = []
  updateRequests.push(services.updateOffering(data))
  if (data.image.type) {
    updateRequests.push(services.updateOfferingImage(data))
  }
  return Promise.all(updateRequests)
}

export const attemptOfferingRemoval = (_, offeringId) => {
  return services.removeOffering(offeringId)
}

export const attemptSaveOfferingMeta = (_, data) => {
  return services.saveOfferingMeta(data)
}

export const attemptOfferingsRetrievalByLoggedProfile = (store, searchParams = {}) => {
  return services.getOfferingsByLoggedProfile(searchParams)
}

export const attemptOfferingPublishing = (_, offeringId) => {
  return services.publishOffering(offeringId)
}

export const attemptOfferingCoursesRetrieval = (_, data) => {
  return services.getOfferingCourses(data)
}

export const attemptOfferingEnrollment = (_, { offeringId, configId }) => {
  return services.enrollOnOffering(offeringId, configId)
}

export const attemptCancelOfferingEnrollment = async ({ dispatch }, offeringId) => {
  try {
    dispatch('setFetching', true)
    const { data } = await services.cancelEnrollmentOnOffering(offeringId)
    dispatch('setFeedback', {
      message: i18n.t('offerings.view:feedback.enrollment.cancel.success'),
    })
    return data
  } catch (error) {
    return
  } finally {
    dispatch('setFetching', false)
  }
}

export const attemptOfferingUserEnrollments = (_, offeringId) => {
  return services.getOfferingUserEnrollments(offeringId)
}

export const attemptOfferingUserEnrollmentsEmbed = (_, data) => {
  return services.getOfferingUserEnrollmentsEmbed(data)
}

export const attemptOfferingStatusRetrieval = (_, offeringId) => {
  return services.getOfferingStatus(offeringId)
}

export const attemptToggleOfferingActiveStatus = (_, offeringId) => {
  return services.toggleOfferingActiveStatus(offeringId)
}

export const setOfferingsData = ({ commit }, data) => {
  commit(TYPES.SET_DATA, data)
}

export const setMetaSessionCourses = ({ commit }, data) => {
  commit(TYPES.SET_META_SESSION_COURSES, data)
}

export const attemptKeywordsRetrievalByName = (_, keywordName) => {
  return services.getKeywordsByName(keywordName)
}

export const getCoursesListToOffering = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_COURSE_LIST, data.fromCache)
    return
  }

  let response = await services.getCoursesToAddOffering(data)

  commit(TYPES.SET_COURSE_LIST, response.data.data)
  return response.data
}
