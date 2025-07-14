import { http } from '@/support/http'
import { parseToFormData } from '@/support/payloadParser'

export const uploadMediaFile = (data) => {
  const form = parseToFormData(data)
  if (data.file) {
    form.append('file', data.file[0], data.file[0].name)
  }

  return http.post(`medias/file`, form, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
