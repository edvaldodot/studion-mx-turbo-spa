import * as services from '@/domains/trails/services'
import i18n from '@/support/i18n'

export const attemptTrailSearchStudent = (_, { filter, pathsId }) => {
  return services.searchStudent(filter, pathsId)
}

export const attemptTrailEnrollSingleUser = ({ state, dispatch }, uuid) => {
  dispatch('setFetching', true)
  return services.enrollSingleUser(state.current.id, uuid).then(() => {
    dispatch('setFeedback', {
      message: i18n.t('trails.users:modal.single.feedback.add')
    })
  }).finally(() => {
    dispatch('setFetching', false)
  })
}

export const attemptTrailRemoveUser = ({ state, dispatch }, uuid) => {
  dispatch('setFetching', true)
  let trailId = state.current.id

  return services.trailRemoveUser(trailId, uuid).then(() => {
    dispatch('setFeedback', {
      message: i18n.t('trails.users:modal.confirm.feedback.success')
    })
  }).catch(() => {
    dispatch('setFeedback', {
      message: i18n.t('trails.users:modal.confirm.feedback.error')
    })
  }).finally(() => {
    dispatch('setFetching', false)
  })
}

export const attemptTrailsSessionUserSolutionsRetrieval = ({ state }, data) => {
  data.pathId = state.current.id
  return services.trailsSessionUserSolutionsRetrieval(data)
}
