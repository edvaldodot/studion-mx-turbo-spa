import * as services from '../services'
import * as TYPES from './mutations-types'

export const attemptDiscussionCreation = (_, { sessionUuid, data }) => {
  return services.createDiscussion(sessionUuid, data)
}

export const attemptManagementForumsCreation = (_, data) => {
  return services.createDiscussionManagement(data)
}

export const attemptDiscussionUpdate = (_, { sessionUuid, discussionId, data }) => {
  const hasNewAsset = data.assets && data.assets[0] instanceof Blob

  const updateRequests = [services.updateDiscussion(sessionUuid, discussionId, data)]

  if (data.hasImage) {
    updateRequests.push(services.updateDiscussionImage(sessionUuid, discussionId, data))
  }

  if (hasNewAsset) {
    updateRequests.push(services.updateDiscussionAsset(discussionId, { asset: data.assets[0] }))
  }

  if (data.oldAsset && data.assets === null) {
    updateRequests.push(services.deleteDiscussionAsset(discussionId))
  }

  return Promise.all(updateRequests).then((result) => {
    if (data.hasImage) {
      result[0].data.image = result[1].data.image
    }
    return result[0]
  })
}

export const attemptDiscussionListRetrieval = (_, { sessionUuid, forumId, params = {} }) => {
  return services.getDiscussionsList(sessionUuid, forumId, params)
}

export const attemptDiscussionList = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_DISCUSSION_LIST, data.fromCache)
    return
  }

  let response = await services.getDiscussionsList(
    data.params.sessionUuid,
    data.params.forumId,
    data.params
  )

  commit(TYPES.SET_DISCUSSION_LIST, response.data.data)
  return response.data
}

export const attemptMovePostDiscussion = (_, payload) => {
  return services.movePostDiscussion(payload)
}

export const attemptDiscussionRetrieval = ({ dispatch }, { sessionUuid, discussionId }) => {
  return services.getDiscussion(sessionUuid, discussionId).then((response) => {
    dispatch('setForumsData', { path: 'current', value: response.data })
    return response
  })
}

export const attemptDiscussionRemoval = (_, { sessionUuid, discussionId }) => {
  return services.removeDiscussion(sessionUuid, discussionId)
}

export const attemptRemoveDiscussionLink = (_, id) => {
  return services.removeDiscussionLink(id)
}

export const attemptDiscussionPostCreation = (_, { sessionUuid, discussionId, data }) => {
  return services.createDiscussionPost(sessionUuid, discussionId, data)
}

export const attemptDiscussionPostUpdate = (
  _,
  { sessionUuid, discussionId, discussionPostId, data }
) => {
  return services.updateDiscussionPost(sessionUuid, discussionId, discussionPostId, data)
}

export const attemptDiscussionPostRemoval = (
  _,
  { sessionUuid, discussionId, discussionPostId }
) => {
  return services.removeDiscussionPost(sessionUuid, discussionId, discussionPostId)
}

export const attemptDiscussionStatusToggle = (_, { sessionUuid, discussionId }) => {
  return services.toggleDiscussionStatus(sessionUuid, discussionId)
}

export const attemptDiscussionPostCommentCreation = (
  _,
  { sessionUuid, discussionPostId, data }
) => {
  return services.createDiscussionPostComment(sessionUuid, discussionPostId, data)
}

export const attemptDiscussionPostCommentUpdate = (_, { sessionUuid, commentId, data }) => {
  return services.updateDiscussionPostComment(sessionUuid, commentId, data)
}

export const attemptDiscussionPostCommentRemoval = (_, { sessionUuid, commentId }) => {
  return services.removeDiscussionPostComment(sessionUuid, commentId)
}

export const setForumsData = ({ commit }, data) => {
  commit(TYPES.SET_DATA, data)
}

export const attemptDownloadForumAttachment = (_, data) => {
  return services.downloadForumAttachment(data)
}

export const removeForumsItem = ({ commit }, data) => {
  commit(TYPES.REMOVE_ITEMS, data)
}

export const attemptDiscussionEvaluationList = async ({ commit }, data) => {
  if (data && data.fromCache) return commit(TYPES.SET_EVALUATION_STUDENT_LIST, data.fromCache)
  const response = await services.getDiscussionEvaluationList(data)
  commit(TYPES.SET_EVALUATION_STUDENT_LIST, response.data.data)

  return response.data
}
export const attemptRemainingNote = ({ commit, rootState, dispatch }) => {
  const currentClassroom = rootState.Classroom.data

  dispatch('setFetching', true)
  return services
    .getRemainingNote(currentClassroom.forum.id, currentClassroom.course.id)
    .then((response) => {
      const data = response.data
      commit(TYPES.SET_REMAINING_NOTE, {
        remainingNote: data.remainingScore,
        fullMark: data.courseScore,
      })

      return response.data
    })
    .finally(() => {
      dispatch('setFetching', false)
    })
}

export const attemptFeedbackResponsible = (_, discussion_id) => {
  return services.getFeedbackResponsible(discussion_id)
}

export const attemptEvaluationStudentPost = (_, { id, applicationUserId, data }) => {
  return services.createEvaluationStudentPost(id, applicationUserId, data)
}

export const attemptEditEvaluationStudentPost = (_, { id, applicationUserId, data }) => {
  return services.EditEvaluationStudentPost(id, applicationUserId, data)
}

export const attemptDiscussionPostUser = async (_, { id, applicationUserId }) => {
  return services.getDiscussionPostUser(id, applicationUserId)
}

export const attemptGetDiscussionTags = async () => {
  let response = await services.getDiscussionTag()
  return response.data
}
