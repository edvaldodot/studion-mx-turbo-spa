import * as services from '../services'

export const attemptChatRoomCreation = (_, data) => services.createChatRoom(data)

export const attemptChatRoomUpdate = (_, data) => services.updateChatRoom(data)

export const attemptChatroomToggle = (_, data) => services.toggleChatroom(data)

export const attemptChatroomRemove = (_, data) => services.removeChatroom(data)

export const attemptChatroomNicknameRetrieval = ({ rootState }) => {
  const userAccount = rootState.Account && rootState.Account.user
  const nickname = userAccount && userAccount.data && userAccount.data.nickname
  if (nickname) return userAccount

  return services.getChatroomNickname()
}

export const attemptChatroomNicknameUpdate = (_, nickname) => {
  return services.updateChatroomNickname(nickname)
}
