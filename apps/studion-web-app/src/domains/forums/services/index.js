import { http } from '@/support/http'
import { objectToFormData } from '@/support/utils/objectToFormData'
import { parse, parseToFormData } from '@/support/payloadParser'
import { createQuery } from '@/support/utils/paginatorQueryBuilder'

const mountDiscussionPayload = (data) => {
  const payload = {
    ...data,
  }

  if (data.mandatory) {
    payload.meta = {
      operator: data.operator,
      numPosts: data.numPosts,
      numComments: data.numComments,
    }
    delete payload.operator
    delete payload.numComments
    delete payload.numPosts
  }

  for (let key in data) {
    if (data[key] === null) delete payload[key]
  }

  return payload
}

export const createDiscussion = (sessionUuid, data) => {
  const payload = mountDiscussionPayload(data)

  const form = objectToFormData(payload)

  if (data.image) {
    form.delete('image')
    form.append('image', data.image, data.image.name + '.jpg')
  }

  if (data.assets) {
    form.delete('assets')
    form.append('asset', data.assets[0], data.assets[0].name + '.pdf')
  }

  return http.post(`classroom/${sessionUuid}/forums/discussions`, form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const createDiscussionManagement = (params) => {
  const payload = mountDiscussionPayload(params)

  const form = objectToFormData(payload)

  if (params.image) {
    form.delete('image')
    form.append('image', params.image, params.image.name + '.jpg')
  }

  if (params.assets) {
    form.delete('assets')
    form.append('asset', params.assets[0], params.assets[0].name + '.pdf')
  }
  return http.post(`my-management/forums/create-multiple-sessions`, form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const updateDiscussionImage = (sessionUuid, discussionId, data) => {
  const form = parseToFormData(data)

  if (data.image) {
    form.delete('image')
    form.append('image', data.image, data.image.name + '.jpg')
  }

  return http.post(`classroom/${sessionUuid}/forums/discussions/${discussionId}/image`, form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const updateDiscussionAsset = (discussionId, data) => {
  const form = parseToFormData(data)

  if (data.asset) {
    form.delete('asset')
    form.append('asset', data.asset, data.asset.name + '.pdf')
  }

  return http.post(`/forums/discussions/${discussionId}/asset`, form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const deleteDiscussionAsset = (discussionId) => {
  return http.delete(`/forums/discussions/${discussionId}/asset`)
}

export const updateDiscussion = (sessionUuid, discussionId, data) => {
  const payload = mountDiscussionPayload(data)

  payload.mandatory = payload.mandatory ? 1 : 0
  payload.feedback_mandatory = payload.feedback_mandatory ? 1 : 0
  payload.avaliative = payload.avaliative ? 1 : 0

  const formData = parse(payload)

  if (Object.hasOwn(data, 'slug') && !formData.has('slug')) {
    formData.append('slug', '')
  }

  return http.put(`classroom/${sessionUuid}/forums/discussions/${discussionId}`, formData)
}

export const getDiscussionsList = (sessionUuid, forumId, params) => {
  return http.get(`classroom/${sessionUuid}/forums/${forumId}/discussions?${createQuery(params)}`)
}
export const movePostDiscussion = ({ postId, discussionId }) => {
  return http.put(`forums/move-post-discussion/${postId}/discussion/${discussionId}`)
}

export const getDiscussion = (sessionUuid, discussionId) => {
  return http.get(`classroom/${sessionUuid}/forums/discussions/${discussionId}`)
}

export const removeDiscussion = (sessionUuid, discussionId) => {
  return http.delete(`classroom/${sessionUuid}/forums/discussions/${discussionId}`)
}

export const createDiscussionPost = (sessionUuid, discussionId, data) => {
  return http.post(`classroom/${sessionUuid}/forums/discussions/${discussionId}/post`, parse(data))
}

export const updateDiscussionPost = (sessionUuid, discussionId, discussionPostId, data) => {
  return http.put(
    `classroom/${sessionUuid}/forums/discussions/${discussionId}/post/${discussionPostId}`,
    parse(data)
  )
}

export const removeDiscussionPost = (sessionUuid, discussionId, discussionPostId) => {
  return http.delete(
    `classroom/${sessionUuid}/forums/discussions/${discussionId}/post/${discussionPostId}`
  )
}

export const toggleDiscussionStatus = (sessionUuid, discussionId) => {
  return http.put(
    `classroom/${sessionUuid}/forums/discussions/activation/status/toggle`,
    parse({
      discussion_id: discussionId,
    })
  )
}

export const createDiscussionPostComment = (sessionUuid, discussionPostId, data) => {
  return http.post(
    `classroom/${sessionUuid}/forums/discussions/post/${discussionPostId}/comment`,
    parse(data)
  )
}

export const updateDiscussionPostComment = (sessionUuid, commentId, data) => {
  return http.put(
    `classroom/${sessionUuid}/forums/discussions/post/comment/${commentId}`,
    parse(data)
  )
}

export const removeDiscussionPostComment = (sessionUuid, commentId) => {
  return http.delete(`classroom/${sessionUuid}/forums/discussions/post/comment/${commentId}`)
}

export const downloadForumAttachment = (data) => {
  return http
    .get(`forums/${data.discussionId}/attachment`, {
      responseType: 'blob',
    })
    .then((response) => {
      let link = document.createElement('a')
      link.href = window.URL.createObjectURL(response.data)
      link.download = `discussion-${data.discussionId}-attachment.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
}

export const getDiscussionEvaluationList = (payload) => {
  return http.get(
    `forums/discussions/${payload.params.discussion_id}/users-interactions?${createQuery(
      payload.params
    )}`
  )
}

export const getRemainingNote = (forumId, courseId) => {
  return http.get(`forums/${forumId}/scores/course/${courseId}`)
}

export const getFeedbackResponsible = (discussion_id) => {
  return http.get(`forums/${discussion_id}/interactions`)
}

export const createEvaluationStudentPost = (discussion_id, application_user_id, data) => {
  return http.post(`forums/evaluate/${discussion_id}/${application_user_id}`, parse(data))
}

export const EditEvaluationStudentPost = (discussion_id, application_user_id, data) => {
  return http.put(`forums/evaluate/${discussion_id}/${application_user_id}`, data)
}

export const getDiscussionPostUser = (discussion_id, application_user_id) => {
  return http.get(
    `forums/discussions/${discussion_id}/discussion-posts/user/${application_user_id}`
  )
}

export const getDiscussionTag = () => {
  return http.get(`forums/tags`)
}

export const removeDiscussionLink = (id) => {
  return http.put(`forums/discussions/${id}/multiple-sessions-unbind`)
}
