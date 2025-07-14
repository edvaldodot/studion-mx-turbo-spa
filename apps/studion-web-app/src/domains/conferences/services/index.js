import { http } from '@/support/http'
import { parse, parseToFormData } from '@/support/payloadParser'
import { objectToFormData } from '@/support/utils/objectToFormData'
import { getCreateConferenceEndpoint } from '../support/utils'
import { createQuery } from '@/support/utils/paginatorQueryBuilder'

export const createConferenceRoom = (data) => {
  let form = objectToFormData(data)

  if (data.image) {
    form.delete('image')
    form.append('image', data.image, data.image.name + '.jpg')
  }

  return http.post(getCreateConferenceEndpoint(data), form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const getConferenceRoom = (conferenceRoomId) => {
  return http.get(`conferences/conferences-rooms/${conferenceRoomId}`)
}

export const conferenceMediasList = (conferenceRoomId) => {
  return http.get(`conferences/conferences-rooms/${conferenceRoomId}/library-files?limit=1000`)
}

export const updateConferenceRoom = (conferenceRoomId, data) => {
  return http.put(`conferences/conferences-rooms/${conferenceRoomId}`, parse(data))
}

export const deleteConferenceRoom = (conferenceRoomId) => {
  return http.delete(`conferences/conferences-rooms/${conferenceRoomId}`)
}

export const multiDeleteConferenceRoom = (vendorId) => {
  return http.delete(`conferences/conferences-rooms/multiple-sessions/${vendorId}`)
}

export const updateConferenceRoomImage = (conferenceRoomId, data) => {
  const form = parseToFormData(data)

  if (data.image.type === undefined) {
    return
  }

  form.append('image', data.image, data.image.name)

  return http.post(`conferences/conferences-rooms/${conferenceRoomId}/image`, form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const accessConferenceRoom = ({ sessionUuid, conferenceRoomId, accessType }) => {
  return http.get(`classroom/${sessionUuid}/conferences-rooms/${conferenceRoomId}`, {
    params: { access_type: accessType },
  })
}

export const getConferencesRoomsBySession = (sessionUuid, folder = 0, query) => {
  const { query: search, order } = query

  const params = createQuery({ query: search, order })
  return http.get(`classroom/${sessionUuid}/conferences-rooms?${params}&folder=${folder || 0}`)
}

export const getConferenceRoomsRecordingStatus = (conferenceRoomId) =>
  http.get(`/conferences/conferences-rooms/${conferenceRoomId}/video/availability`)

export const consumeRecording = (data) =>
  http.post(`/myself/conferences-rooms/${data.id}/consume`, data)

export const getDailyConferences = () => {
  return http.get('/conferences/conferences-rooms/list/student')
}

export const generateSignature = (data) => {
  return http.post('/conferences/conferences-rooms/signature', data)
}

export const conferenceFolderAdd = (data) => {
  return http.post('/conferences/conferences-rooms/folder', data)
}

export const conferenceFolderUpdate = (data) => {
  return http.put(`/conferences/conferences-rooms/folder/${data.id}`, data)
}

export const removeConferenceFolder = (data) => {
  return http.delete(`/conferences/conferences-rooms/folder/${data.id}`)
}

export const getConferenceFolderById = (data) => {
  return http.get(`/conferences/conferences-rooms/${data.sessionId}/folder/${data.folderId}`)
}

export const getConferenceFolderOptions = (sessionId) => {
  return http.get(`/conferences/conferences-rooms/folder/list/${sessionId}`)
}

export const moveItemToFolder = (payload) => {
  return http.put(`/conferences/conferences-rooms/folder/move/${payload.id}`, {
    type: payload.type,
    folderId: payload.folderId,
  })
}
