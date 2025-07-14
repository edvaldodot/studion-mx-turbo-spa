import * as TYPES from './mutation-types'
import Vue from 'vue'

export default {
  [TYPES.SET_CURRENT_SOLUTIONS](state, solutions) {
    solutions = solutions.sort((currentSolution, nextSolution) => {
      if (currentSolution.position === nextSolution.position) {
        return 0
      }
      return currentSolution.position < nextSolution.position ? -1 : 1
    })

    Vue.set(state.current, 'solutions', solutions)
  },
  [TYPES.CURRENT_ADD_SOLUTION](state, solution) {
    let solutions = state.current.solutions

    Vue.set(solution, 'prerequisite', null)
    Vue.set(solution, 'position', solutions.length + 1)

    Vue.set(state.current.solutions, solutions.length, solution)
    state.current.solutionsChanged = true
  },
  [TYPES.CURRENT_MOVE_SOLUTION](state, { oldIndex, newIndex }) {
    let solutions = state.current.solutions

    let solution = solutions.splice(oldIndex, 1)[0]
    solutions.splice(newIndex, 0, solution)

    Vue.set(state.current, 'solutions', solutions)
    state.current.solutionsChanged = true
  },
  [TYPES.CURRENT_REMOVE_SOLUTION](state, solutionId) {
    let solutions = state.current.solutions
    solutions = solutions
      .filter((solution) => solution.course_id !== solutionId)
      .map((solution, index) => {
        solution.position = index + 1
        return solution
      })

    Vue.set(state.current, 'solutions', solutions)
    state.current.solutionsChanged = true
  },
  [TYPES.SET_SOLUTIONS](state, solutions) {
    state.current.solutions = solutions
  },
  [TYPES.CURRENT_MAP_SOLUTIONS_PREREQUISITE](state) {
    let solutions = state.current.solutions
    solutions.map((solution, index) => {
      solution.position = index + 1
      if (solution.position === 1) solution.prerequisite = null
      return solution
    })

    solutions.map((solution) => {
      const prerequisiteSolution = solutions.find((s) => s.course_id === solution.prerequisite)

      if (!prerequisiteSolution || prerequisiteSolution.position > solution.position) {
        solution.prerequisite = null
      }

      return solution
    })

    Vue.set(state.current, 'solutions', solutions)
    state.current.solutionsChanged = true
  },
  [TYPES.CLEAR_SOLUTIONS_CHANGED](state) {
    state.current.solutionsChanged = false
  },
  [TYPES.CURRENT_UPDATE_SOLUTIONS_ITEMS_TO_OLD](state) {
    let solutions = [...state.current.solutions]

    if (solutions.length) {
      solutions = solutions.map((item) => ({ ...item, isNew: false }))
      state.current.solutions = solutions
    }
  },
}
