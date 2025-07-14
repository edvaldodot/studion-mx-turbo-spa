import { http } from '@/support/http'
import { createQuery } from '@/support/utils/paginatorQueryBuilder'
import { parseToFormDataWithArray } from '@/support/payloadParser'

export const getChats = (params) => {
  return http.get(`my-management/chat?${createQuery(params)}`)
}

export const createChatRoomManagement = (data) => {
  let form = parseToFormDataWithArray(data)
  form.delete('image')

  if (data.image) {
    form.append('image', data.image, data.image.name + '.jpg')
  }
  return http.post('my-management/chat/create-multiple-sessions', form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
