import * as TYPES from '@/domains/trails/vuex/mutation-types'
import * as services from '@/domains/trails/services'

import i18n from '@/support/i18n'

export const addSolutions = ({ commit }, solutions) => {
  solutions.map((solution) => commit(TYPES.CURRENT_ADD_SOLUTION, solution))
}

export const clearSolutionsChanged = ({ commit }) => {
  commit(TYPES.CLEAR_SOLUTIONS_CHANGED)
}

export const remapPrerequisite = ({ commit }) => {
  commit(TYPES.CURRENT_MAP_SOLUTIONS_PREREQUISITE)
}

export const moveSolution = ({ commit }, { oldIndex, newIndex }) => {
  commit(TYPES.CURRENT_MOVE_SOLUTION, { oldIndex, newIndex })
}

export const removeSolution = ({ commit }, solutionId) => {
  commit(TYPES.CURRENT_REMOVE_SOLUTION, solutionId)
  commit(TYPES.CURRENT_MAP_SOLUTIONS_PREREQUISITE)
}

export const setSolutions = ({ commit }, solutions) => {
  commit(TYPES.SET_SOLUTIONS, solutions)
  commit(TYPES.CURRENT_MAP_SOLUTIONS_PREREQUISITE)
}

export const attemptGetTrailSolutionsStatus = (_, trailId) => {
  return services.getTrailSolutionsStatus(trailId)
}

export const attemptGetTrailErrorSheet = (_, pathCourseId) => {
  return services.getTrailErrorSheet(pathCourseId)
}

export const attemptGetUserTrailErrorSheet = (_, payload) => {
  return services.getUserTrailErrorSheet(payload)
}

export const attemptAddTrailSolutions = (
  { commit, dispatch },
  { trailId, solutions, isPublish }
) => {
  dispatch('setFetching', true)

  let bindSolutionPromise = services.addTrailSolutions(trailId, solutions)
  bindSolutionPromise.then(() => {
    if (!isPublish) {
      dispatch('setFeedback', { message: i18n.t('trails.create:feedback.saved') })
    }

    commit(TYPES.CURRENT_UPDATE_SOLUTIONS_ITEMS_TO_OLD)
  })

  bindSolutionPromise.catch(({ response }) => {
    if (response && response.data && response.data.message === 'expired_path') {
      dispatch('setFeedback', { message: i18n.t('trails.update:feedback.error.expired_path') })
    } else if (response && response.data && response.data.message === 'open_paths_cannot_have_conclusion_enrollment_rule') {
      dispatch('setFeedback', { message: i18n.t('trails.update:feedback.error.open_path_conclusion_rule') })
    } else {
      dispatch('setFeedback', { message: i18n.t('trails.update:feedback.error') })
    }
  })

  bindSolutionPromise.finally(() => {
    dispatch('setFetching', false)
  })

  return bindSolutionPromise
}

export const fetchTrailSolutions = ({ commit, dispatch }, trailId) => {
  commit(TYPES.SET_CURRENT_SOLUTIONS, [])
  dispatch('setFetching', true)

  const solutionsPromise = services.getTrailSolutions(trailId)
  solutionsPromise
    .then(({ data }) => {
      data = data.map((solution) => {
        let prerequisite = null
        if (solution.pathCoursePrerequisite !== null) {
          prerequisite = solution.pathCoursePrerequisite.course_id
        }

        solution.prerequisite = prerequisite
        return solution
      })
      commit(TYPES.SET_CURRENT_SOLUTIONS, data)
    })
    .finally(() => {
      dispatch('setFetching', false)
    })
  return solutionsPromise
}

export const trailSolutionsResource = async ({ commit }, data) => {
  if (data.fromCache) {
    return commit(TYPES.SET_CURRENT_AVAILABLE_TRAILS, data.fromCache)
  }
  let response = await services.getTrailAvailableSolutions(data)
  commit(TYPES.SET_CURRENT_AVAILABLE_TRAILS, response.data.data)

  return response.data
}

export const trailSessionsResource = async ({ commit }, data) => {
  if (data.fromCache) {
    return commit(TYPES.SET_SOLUTIONS, data.fromCache)
  }
  let response = await services.getTrailSolutionsWithParams(data.params)
  commit(TYPES.SET_SOLUTIONS, response.data)

  return response.data
}
