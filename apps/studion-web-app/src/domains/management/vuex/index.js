import * as actions from './actions'
import mutations from './mutations'
import state from './state'

import evaluations from './evaluations'
import messages from './messages'
import doubts from './doubts'
import announcement from './announcement'
import polls from './polls'
import forums from './forums'
import sessions from './sessions'
import chat from './chat'
import conference from './conference'

const module = {
  namespaced: true,
  state,
  actions,
  mutations,
  modules: {
    evaluations,
    messages,
    doubts,
    announcement,
    polls,
    forums,
    sessions,
    chat,
    conference,
  },
}

export default { module }
