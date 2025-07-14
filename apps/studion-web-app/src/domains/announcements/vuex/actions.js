import * as services from '../services'

export const attemptAnnouncementCreation = ({ commit }, data) => {
  return services.createAnnouncement(data)
}

export const attemptAnnouncementUpdate = ({ commit }, { entryId, data }) => {
  return services.updateAnnouncement(entryId, data)
}

export const attemptAnnouncementRemoval = ({ commit }, entryId) => {
  return services.removeAnnouncement(entryId)
}

export const attemptGetAnnouncementTags = () => {
  return services.getAnnouncementTags()
}
