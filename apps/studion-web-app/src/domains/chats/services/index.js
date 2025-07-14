import { http } from '@/support/http'
import { parseToFormData, parse } from '@/support/payloadParser'

export const createChatRoom = (data) => {
  let form = parseToFormData(data)
  form.delete('image')
  if (data.image) {
    form.append('image', data.image, data.image.name + '.jpg')
  }
  return http.post('chats/chatrooms', form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const updateChatRoom = (data) => {
  let form = parseToFormData(data)
  form.delete('image')
  if (data.image !== null && data.image !== undefined && typeof data.image !== 'string') {
    form.append('image', data.image, data.image.name + '.jpg')
  }
  return http.post(`chats/chatrooms/${data.chatroomId}`, form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const toggleChatroom = (data) => {
  return http.post(`chats/chatrooms/toggle`, parse(data))
}

export const removeChatroom = (data) => {
  return http.delete(`chats/chatrooms/${data.id}`)
}

export const getChatroomNickname = () => http.get('chats/list-chat-username')

export const updateChatroomNickname = (nickname) => {
  return http.post('chats/edit-chat-username', {
    username: nickname,
  })
}
