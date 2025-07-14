import * as services from '../services'

export const attemptDraftMessageCreation = ({ commit }, { sessionUuid, data }) => {
  return services.createDraftMessage(sessionUuid, data)
}

export const attemptMessageAttachmentCreation = ({ commit }, { sessionUuid, data }) => {
  return services.createMessageAttachment(sessionUuid, data)
}

export const attemptDraftMessageUpdate = ({ commit }, { sessionUuid, data }) => {
  return services.updateDraftMessage(sessionUuid, data)
}

export const attemptSendMessage = ({ commit }, { sessionUuid, data }) => {
  return services.sendMessage(sessionUuid, data)
}

export const attemptSendMessageMultipleSessions = (_, { data }) => {
  return services.sendMessageMultipleSessions(data)
}

export const attemptMessagesRetrieval = ({ commit }, { sessionUuid, statusAlias, queryParams }) => {
  return services.getMessages(sessionUuid, statusAlias, queryParams)
}

export const attemptMessageRetrieval = ({ commit }, { sessionUuid, interactionId }) => {
  return services.getMessage(sessionUuid, interactionId)
}

export const attemptMessageSubject = ({ commit }, { sessionUuid }) => {
  return services.getMessageSubject(sessionUuid)
}

export const attemptManagementMessageSubject = ({ commit }) => {
  return services.getManagementMessageSubject()
}

export const attemptBookmarkMessage = ({ commit }, { sessionUuid, interactionId }) => {
  return services.bookmarkedToggle(sessionUuid, interactionId)
}

export const attemptDeleteMessageAttachment = (
  { commit },
  { sessionUuid, messageId, filename }
) => {
  return services.deleteMessageAttachment(sessionUuid, messageId, filename)
}

export const attemptDownloadMessageAttachment = ({ commit }, { sessionUuid, data }) => {
  return services.downloadMessageAttachment(sessionUuid, data)
}

export const attemptInteractionTrash = ({ commit }, { sessionUuid, action, data }) => {
  return services.interactionTrash(sessionUuid, action, data)
}

export const attemptDeleteMessage = ({ commit }, { sessionUuid, interactions }) => {
  return services.deleteMessage(sessionUuid, interactions)
}

export const attemptCreateReplyDraftMessage = ({ commit }, { sessionUuid, interactionId }) => {
  return services.createReplyDraftMessage(sessionUuid, interactionId)
}

export const attemptCreateForwardDraftMessage = ({ commit }, { sessionUuid, interactionId }) => {
  return services.createForwardDraftMessage(sessionUuid, interactionId)
}

export const attemptGetEmailTags = async (_, session_uuid) => {
  let response = await services.getEmailTag(session_uuid)
  return response
}
