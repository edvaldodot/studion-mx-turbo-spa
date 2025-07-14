import * as TYPES from './mutations-types'
import Vue from 'vue'
export default {
  [TYPES.SET_CURRENT] (state, value) {
    state.current = value
  },
  [TYPES.SET_ALL] (state, value) {
    state.all = value
  },
  [TYPES.SET_CURRENT_TOPICS] (state, value) {
    state.currentTopics = value
  },
  [TYPES.SET_ASSET_TYPES_OPTIONS] (state, value) {
    state.assetTypeOptions = value
  },
  [TYPES.SET_SOLUTIONS_LIST] (state, value) {
    state.solutionsList = value
  },
  [TYPES.ACTIVATE_TOGGLE] (state, courseId) {
    const courseIndex = state.solutionsList.findIndex(course => course.course_id === courseId)
    if (courseIndex !== -1) {
      const item = {...state.solutionsList[courseIndex]}
      item.course_active = !item.course_active
      Vue.set(state.solutionsList, courseIndex, item)
    }
  },
  [TYPES.SET_TOPICS_TEMPLATES] (state, value) {
    state.topicsTemplates = value
  },
  [TYPES.SET_EXAMINATION_FILE_QUOTA] (state, value) {
    state.examinationFilesQuota = value
  },
  [TYPES.SET_COURSE_LIST] (state, value) {
    state.courseList = value
  },
  [TYPES.SET_QUESTION_TEMPLATES](state, value) {
    state.questionTemplatesGroups = value
  },
  [TYPES.SET_QUESTION_TEMPLATES_QUESTIONS](state, value) {
    state.questionTemplates = value
  },
}
