import * as TYPES from './mutations-types'
import * as services from '../services'
import { setToken as httpSetToken } from '@/support/http'
import config from '@/config'

const { KEYCLOAK_ENABLED } = config

export const attemptVerifyPasswordRecoveryToken = ({ commit }, token) => {
  return services.verifyPasswordRecoveryToken(token)
}

export const attemptCreateUser = ({ commit }, payload) => {
  return services.postCreateUser(payload).then(({ data }) => data)
}

export const attemptUserAccountRetrieval = ({ commit, dispatch }) => {
  return dispatch('checkUserToken')
    .then(() => {
      return Promise.all([
        services.getUserAccount(),
        services.retrieveCurrentProfile()
      ])
        .then(([ user, profile ]) => {
          if (!user || !profile) return
          commit(TYPES.SET_ENABLED_FEATURES, user.data.enabledFeatures)
          commit(TYPES.SET_DISPLAY_PREFERENCES, user.data.display_preferences)
          commit(TYPES.SET_USER, user.data)
          commit(TYPES.SET_USER_PERMISSIONS_DENIED, [...profile.data.deniedRoutesContexts, ...profile.data.deniedData])
          return user.data
        })
    })
}

export const refreshPermissions = ({ commit }) => {
  return services.retrieveCurrentProfile()
    .then(({ data }) => {
      commit(TYPES.SET_USER_PERMISSIONS_DENIED, [...data.deniedRoutesContexts, ...data.deniedData])
      return true
    })
}

export const attemptGetUserMetadata = ({ commit }) => {
  return services.getUserMetadata()
}

export const attemptGetUserSettings = ({ commit }) => {
  return services.getUserSettings()
}

export const attemptSaveUserSettings = ({ commit }, data) => {
  return services.saveUserSettings(data)
}

export const attemptRemoveProfilePicture = ({ commit }) => {
  return services.removeProfilePicture().then((response) => {
    commit(TYPES.SET_USER_PROFILE_IMAGE, null)
    return response
  })
}

export const attemptSaveUserMetadata = ({ commit }, data) => {
  return services.saveUserMetadata(data).then((response) => {
    commit(TYPES.SET_USER_META_STATUS, response.data.currentMetaStatus)
    return response
  })
}

export const attemptSaveUserData = ({ commit }, data) => {
  return services.saveUserData(data).then((response) => {
    commit(TYPES.SET_USER_NAME, response.data)
    return response
  })
}

export const saveUserNickname = ({ commit }, nickname) => {
  commit(TYPES.SET_USER_NICKNAME, nickname)
}

export const attemptSaveUserPhoto = ({ commit }, data) => {
  return services.saveUserPhoto(data).then((response) => {
    commit(TYPES.SET_USER_PROFILE_IMAGE, response.data.url)
    return response
  })
}

export const updateMetaStatus = ({ commit }, status) => {
  commit(TYPES.SET_USER_META_STATUS, status)

  Promise.resolve(status)
}

export const setUserMetaStatus = ({ commit }, status) => {
  commit(TYPES.SET_USER_META_STATUS, status)
}

export const attemptChangeUserProfile = ({ commit, dispatch, state }, profileId) => {
  const { user } = state
  const profile = user.profiles.find((profile) => profile.id === profileId)
  const profileData = {
    uuid: user.uuid,
    profile_id: profile.id,
    profile: profile.alias,
  }

  return services.changeUserProfile(profileData).then(({ data }) => {
    if (!KEYCLOAK_ENABLED && data.token) {
      commit(TYPES.SET_TOKEN, { token: data.token, refreshToken: data.refresh_token })
      httpSetToken(data.token)
    }
  })
}

export const attemptForcedProfileStudent = ({ commit }, profileId, uuid) => {
  const profileData = {
    uuid: uuid,
    profile_id: profileId,
    profile: 'student',
  }

  return services.changeUserProfile(profileData).then(({ data }) => {
    if (!KEYCLOAK_ENABLED && data.token) {
      commit(TYPES.SET_TOKEN, { token: data.token, refreshToken: data.refresh_token })
      httpSetToken(data.token)
    }
  })
}

export const setUsersPermissionsDenied = ({ commit }, payload) => {
  commit(TYPES.SET_USER_PERMISSIONS_DENIED, payload)
}

export const attemptGetChatbotToken = ({ commit }, token) => {
  return services.getChatbotToken(token)
}

export const setEducationalResources = ({ commit }, data) => {
  commit(TYPES.SET_EDUCATIONAL_RESOURCES, data)
}

export const attemptSaveSurveyDate = ({ commit }, payload) => {
  commit(TYPES.SET_ANSWERED_SURVEY, payload)
  return services.saveSurveyDate(payload)
}

export const attemptSetDelayNps = (_, delay) => {
  return services.setDelayNps(delay)
}
