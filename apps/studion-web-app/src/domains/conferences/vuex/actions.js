import * as services from '../services'
import * as TYPES from './mutations-types'
import { isBlob } from '@/support/utils/objectToFormData'
import { parseConferenceData } from '../support/utils'
export const attemptConferenceRoomCreation = ({ commit }, data) => {
  data = parseConferenceData(data)

  return services.createConferenceRoom(data).then(result => {
    if (data.image) {
      result.data.image = result.data.image
    }
    return result
  })
}

export const attemptConferenceRoomRetrieval = ({ commit }, id) => {
  return services.getConferenceRoom(id)
}

export const attemptConferenceRoomDelete = ({ commit }, id) => {
  return services.deleteConferenceRoom(id)
}

export const attemptMultiConferenceRoomDelete = (_, vendorId) => {
  return services.multiDeleteConferenceRoom(vendorId)
}

export const attemptConferenceRoomUpdate = ({ commit }, { conferenceRoomId, data }) => {
  data = parseConferenceData(data)
  const updateRequests = [
    services.updateConferenceRoom(conferenceRoomId, data)
  ]
  if (isBlob(data.image)) {
    updateRequests.push(services.updateConferenceRoomImage(conferenceRoomId, data))
  }
  return Promise.all(updateRequests)
    .then(result => {
      if (isBlob(data.image)) {
        result[0].data.image = result[1].data.image
      }
      return result[0]
    })
}

export const attemptConferenceMediasList = ({ commit }, conferenceId) => {
  return services.conferenceMediasList(conferenceId)
}

export const attemptConferenceRoomAccess = (
  _,
  { sessionUuid, conferenceRoomId, accessType = 'live' }
) => {
  return services.accessConferenceRoom({ sessionUuid, conferenceRoomId, accessType })
}

export const attemptConferenceRoomRetrievalBySession = ({ commit }, data) => {
  const { sessionUuid, folder, query } = data
  const promise = services.getConferencesRoomsBySession(sessionUuid, folder, query)

  promise.then(({data}) => {
    commit(TYPES.SET_LIST, data)
  })

  return promise
}

export const attemptConferenceRoomsRecordingStatus = ({commit}, conferenceRoomId) => {
  return services.getConferenceRoomsRecordingStatus(conferenceRoomId)
}

export const attemptConsumeRecording = (_, payload) => {
  return services.consumeRecording(payload)
}

export const setConferenceCurrentRecord = ({ commit }, data) => {
  commit(TYPES.SET_CURRENT_RECORD, data)
}

export const attemptGetDailyConferences = (_, data) => {
  return services.getDailyConferences()
}

export const attemptGenerateSignature = (_, data) => {
  return services.generateSignature(data)
}

export const attemptConferenceFolderAdd = (_, data) => {
  return services.conferenceFolderAdd(data)
}

export const attemptConferenceFolderUpdate = (_, data) => {
  return services.conferenceFolderUpdate(data)
}

export const attemptRemoveConferenceFolder = (_, data) => {
  return services.removeConferenceFolder(data)
}

export const attemptGetConferenceFolderById = (_, data) => {
  return services.getConferenceFolderById(data)
}

export const attemptGetConferenceFolderOptions = (_, sessionId) => {
  return services.getConferenceFolderOptions(sessionId)
}

export const attemptMoveItemToFolder = (_, data) => {
  return services.moveItemToFolder(data)
}
