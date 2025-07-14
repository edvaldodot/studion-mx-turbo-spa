import { http } from '@/support/http'
import { parseToFormData } from '@/support/payloadParser'

export function getAccessMessage (accessMessageId) {
  return http.get(`access-messages/${accessMessageId}`)
}

export function createAccessMessage (payload) {
  const formData = parseToFormData(payload)

  if (formData.file && typeof formData.file !== 'string') {
    formData.append('file', payload.file)
  }

  return http.post(`access-messages`, payload, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function updateAccessMessage (payload) {
  const formData = parseToFormData(payload)

  formData.append('active', payload.active ? 1 : 0)

  if (payload.file !== null && payload.file !== undefined && typeof payload.file !== 'string') {
    formData.append('file', payload.file, payload.file.name)
  } else {
    formData.delete('file')
  }

  return http.post(`access-messages/${payload.id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const bindUserToAccessMessage = (accessMessageId) => {
  return http.put(`access-messages/${accessMessageId}/bind-user`)
}

export function listAccessMessage () {
  return http.get(`access-messages`)
}
