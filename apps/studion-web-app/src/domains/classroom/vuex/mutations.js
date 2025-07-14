import * as TYPES from './mutations-types'

export default {
  [TYPES.SET_CLASSROOM](state, value) {
    state.data = value
  },

  [TYPES.SET_CLASSROOM_NEXT_SOLUTION](state, value) {
    if (!state.data) return
    state.data.nextTrailSolution = value
  },

  [TYPES.SET_CLASSROOM_OFFERINGS](state, value) {
    state.offerings = value
  },
  [TYPES.SET_CLASSROOM_STUDENT_PROGRESS](state, value) {
    state.studentProgress = value
  },
  [TYPES.SET_CLASSROOM_STUDENT_PROGRESS_DETAILS](state, value) {
    state.studentProgressDetails = value
  },
  [TYPES.SET_CLASSROOM_MODAL_READ_ANNOUNCEMENT](state, value) {
    state.modalReadMoreAnnouncement = value
  },
  [TYPES.SET_CLASSROOM_ANNOUNCEMENT_TO_READ](state, value) {
    state.announcementToRead = value
  },
  [TYPES.SET_COMPETENCY_LIST](state, value) {
    state.competencyList = value
  },
  [TYPES.SET_STUDENTS_COMPETENCY_LIST](state, value) {
    state.studentsCompetencyList = value
  },
  [TYPES.SET_CLASSROOM_FINAL_ACCESS](state, value) {
    state.classroomSetStatusFinal = value
  },
  [TYPES.SET_CLASSROOM_NOTIFICATIONS](state, value) {
    state.notifications = value
  },
  [TYPES.SET_ENROLLMENT_EXAMINATIONS](state, value) {
    state.enrollmentExaminations = value
  },

  [TYPES.SET_ON_TUTORIAL](state, value) {
    state.onTutorial = value
  },
  [TYPES.SET_PRE_PROJECT_LIST](state, value) {
    state.preProjectList = value
  },
  [TYPES.SET_PROJECT_LIST](state, value) {
    state.projectList = value
  },
  [TYPES.SET_PRE_PROJECT_GROUPS](state, value) {
    state.preProjectGroups = value
  },
  [TYPES.SET_PRE_PROJECT_GROUPS](state, value) {
    state.preProjectGroups = value
  },
  [TYPES.SET_HISTORY_ACTION_PRE_PROJECT](state, value) {
    state.historyActionpreProject = value
  },
  [TYPES.SET_WORKLOAD_LIMIT_STATUS](state, value) {
    state.data.userWorkloadValue = value
  },
  [TYPES.SET_ACTIVE_FACIAL_RECOGNITION](state, value) {
    state.facialRecognition.activeTool = true
    state.facialRecognition.active = value
  },
  [TYPES.SET_TOKEN_FACIAL_RECOGNITION](state, value) {
    state.facialRecognition.token = value
  },
  [TYPES.SET_FACIAL_RECOGNITION_NEXT](state, value) {
    state.facialRecognition.next = value
  },
  [TYPES.RESET_FACIAL_RECOGNITION](state) {
    state.facialRecognition = {
      active: false,
      token: null,
      next: null,
      activeTool: false,
    }
  },
  [TYPES.TOGGLE_FLOATING_NOTES](state) {
    state.floatingNotes.active = !state.floatingNotes.active
  },
  [TYPES.SET_CLASSROOM_NOTES](state, value) {
    state.floatingNotes.data = value
  },
  [TYPES.SET_NOTE_ID](state, value) {
    state.floatingNotes.note_id = value
  },
  [TYPES.SET_FLOATING_NOTES_ACTIVE](state, value) {
    state.floatingNotes.active = value
  },
  [TYPES.SET_PRE_PROJECT_GROUP_LIST](state, value) {
    state.preProjectGroupList = value
  },
  [TYPES.SET_PRE_PROJECT_STUDENT_LIST](state, value) {
    state.preProjectStudentList = value
  },
  [TYPES.SET_CATEGORY_LIST_RESOURCE](state, value) {
    state.categoryListKb = value
  },
  [TYPES.SET_PRE_PROJECT_GROUP_SESSION_LIST](state, value) {
    state.preProjetcGroupSessionList = value
  },
  [TYPES.SET_EXTERNAL_LINK_LIST](state, value) {
    state.externalLink = value
  },
}
