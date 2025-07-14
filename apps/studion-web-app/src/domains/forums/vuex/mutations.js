import * as TYPES from './mutations-types'
import set from 'lodash/set'
export default {
  [TYPES.SET_DATA] (state, {path, value}) {
    set(state, path, value)
  },
  [TYPES.REMOVE_ITEMS] (state, {index, deleteCount}) {
    state.items.splice(index, deleteCount)
  },
  [TYPES.SET_EVALUATION_STUDENT_LIST](state, value) {
    state.evaluationStudentList = value
  },
  [TYPES.SET_REMAINING_NOTE](state, { remainingNote, fullMark }) {
    state.remainingNote = remainingNote
    state.fullMark = fullMark
  },
  [TYPES.SET_DISCUSSION_LIST](state, value) {
    state.discussionList = value
  },
}
