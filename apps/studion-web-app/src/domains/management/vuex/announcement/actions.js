import * as services from '../../services'
import * as TYPES from './mutations-types'

export const announcementListResource = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_ANNOUNCEMENT_LIST_RESOURCE, data.fromCache)
    return
  }

  let response = await services.announcement.getAnnouncement(data.params)
  commit(TYPES.SET_ANNOUNCEMENT_LIST_RESOURCE, response.data.data)
  return response.data
}

export const attemptManagementAnnouncementCreation = (_, data) => {
  return services.announcement.createAnnouncement(data)
}
