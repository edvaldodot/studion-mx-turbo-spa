import { http } from '@/support/http'
import { source } from '../../../support/utils/source'
import { createQuery } from '../../../support/utils/paginatorQueryBuilder'
import { normalizeFilename } from '../utils'

export const getMessages = (sessionUuid, statusAlias, queryParams) => {
  let queryString = createQuery(queryParams)
  return http.get(`classroom/${sessionUuid}/messages/${statusAlias}?${queryString}`, {cancelToken: source.token})
}

export const getMessageSubject = (sessionUuid) => {
  return http.get(`classroom/${sessionUuid}/messages/filters/options`, {cancelToken: source.token})
}

export const getManagementMessageSubject = () => {
  return http.get(`my-management/messages/filters-options`)
}

export const createDraftMessage = (sessionUuid, data) => {
  const form = new FormData() // eslint-disable-line no-undef
  const optionalFields = ['body', 'subject', 'parent', 'scheduled_time', 'hide_people']

  form.append('session_uuid', sessionUuid)
  if (data.to) {
    form.append('filters', JSON.stringify(data.to))
  }
  optionalFields.forEach(field => {
    if (Object.prototype.hasOwnProperty.call(data, field)) form.append(field, data[field])
  })
  if (data.attachments) {
    form.append('attachment', data.attachments[0], data.attachments[0].name)
  }

  return http.post(`classroom/${sessionUuid}/messages/draft`, form, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const updateDraftMessage = (sessionUuid, data) => {
  let form = {} // eslint-disable-line no-undef
  let optionalFields = ['body', 'subject', 'parent', 'scheduled_time', 'message_id', 'hide_people']
  optionalFields.forEach(field => {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      form[field] = data[field]
    }
  })
  if (data.to) {
    form['filters'] = data.to
  }
  return http.put(`classroom/${sessionUuid}/messages/${data.message_id}/draft`, form)
}

export const createMessageAttachment = (sessionUuid, data) => {
  let form = new FormData() // eslint-disable-line no-undef
  if (data.attachments) {
    form.append('attachment', data.attachments[0], data.attachments[0].name)
  }
  return http.post(`classroom/${sessionUuid}/messages/${data.message_id}/attachment`, form, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const sendMessage = (sessionUuid, data) => {
  data.filters = JSON.stringify(data.to)
  return http.put(`classroom/${sessionUuid}/messages/${data.message_id}/send`, data)
}

export const sendMessageMultipleSessions = (data) => {
  const form = new FormData()

  const fields = ['body', 'subject', 'scheduled_time', 'hide_people']
  form.append('filters', JSON.stringify(data.to))

  fields.forEach(field => {
      if (Object.prototype.hasOwnProperty.call(data, field)) {
        if (field === 'scheduled_time' && !data[field]) return
        form.append(field, data[field])
      }
  })

  if (data.attachment && data.attachment.length) {
    data.attachment.forEach((file, i) => form.append(`attachment[${i}]`, file, file.name))
  }

  if (data.sessions_ids && data.sessions_ids.length) {
    data.sessions_ids.forEach((id, i) => form.append(`sessions_ids[${i}]`, id))
  }

  return http.post(`my-management/messages/create-multiple-sessions`, form, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const getMessage = (sessionUuid, interactionId) => {
  return http.get(`classroom/${sessionUuid}/messages/${interactionId}`, {cancelToken: source.token})
}

export const deleteMessageAttachment = (sessionUuid, messageId, filename) => {
  return http.delete(`classroom/${sessionUuid}/messages/${messageId}/attachments/${normalizeFilename(filename)}`)
}

export const downloadMessageAttachment = (sessionUuid, data) => {
  return http.get(
    `classroom/${sessionUuid}/messages/${data.interaction_id}/attachments/${normalizeFilename(data.filename)}`,
    {
      responseType: 'blob',
      cancelToken: source.token
    }
  )
    .then(response => {
      let link = document.createElement('a')
      link.href = window.URL.createObjectURL(response.data)
      link.download = data.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
}

export const bookmarkedToggle = (sessionUuid, interactionId) => {
  return http.put(`classroom/${sessionUuid}/messages/interactions/${interactionId}/bookmarked/toggle`)
}

export const interactionTrash = (sessionUuid, action, data) => {
  return http.put(`classroom/${sessionUuid}/messages/interactions/${action}`, {interactions: data})
}

export const deleteMessage = (sessionUuid, interactions) => {
  return http.delete(`classroom/${sessionUuid}/messages/interactions/${interactions}`)
}

export const createReplyDraftMessage = (sessionUuid, interactionId) => {
  const form = new FormData() // eslint-disable-line no-undef
  form.append('session_uuid', sessionUuid)
  form.append('interaction_id', interactionId)
  return http.post(`classroom/${sessionUuid}/messages/reply/draft`, form)
}

export const createForwardDraftMessage = (sessionUuid, interactionId) => {
  const form = new FormData() // eslint-disable-line no-undef
  form.append('session_uuid', sessionUuid)
  form.append('interaction_id', interactionId)
  return http.post(`classroom/${sessionUuid}/messages/forward/draft`, form)
}

export const getEmailTag = (session_uuid) => {
  return http.get(`classroom/${session_uuid}/tags/email`)
}
