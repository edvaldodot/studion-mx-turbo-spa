import { conference as services } from '../../services'
import * as TYPES from './mutations-types'

export const conferenceResource = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_CONFERENCE_RESOURCE, data.fromCache)
    return
  }

  let response = await services.getConference(data.params)
  commit(TYPES.SET_CONFERENCE_RESOURCE, response.data.data)
  return response.data
}
