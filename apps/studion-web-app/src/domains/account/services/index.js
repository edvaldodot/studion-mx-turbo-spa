import { http } from '@/support/http'
import { parse, parseToFormData } from '@/support/payloadParser'
import config from '@/config'
import 'url-search-params-polyfill'

const { APP_KEY, APP_SECRET } = config

export const getUserAccount = () => {
  return http.get('myself')
}

export const postCreateUser = ({ name, username, email, password, dateOfBirth, gender }) => {
  const data = {
    client_id: APP_KEY,
    client_secret: APP_SECRET,
    date_of_birth: dateOfBirth,
    pwd: password,
    username,
    gender,
    email,
    name
  }

  return http.post('register', parse(data))
}

export const verifyPasswordRecoveryToken = (token) => {
  const config = {
    headers: {
      'client-id': APP_KEY,
      'client-secret': APP_SECRET
    }
  }

  return http.get(`verifyPasswordRecoveryToken/${token}`, config)
}

export const postLinkAccount = ({ email, pwd }) => {
  const params = new URLSearchParams() // eslint-disable-line no-undef

  params.append('email', email)
  params.append('pwd', pwd)

  const config = {
    headers: {
      'client-id': APP_KEY,
      'client-secret': APP_SECRET
    }
  }

  return http.post('associate', params, config)
}

export const retrieveCurrentProfile = () => {
  return http.get('profiles/users/current')
}

export const getUserMetadata = () => {
  return http.get('myself/metas')
}

export const getUserSettings = () => {
  return http.get('myself/settings')
}

export const saveUserSettings = (data) => {
  return http.put('myself/settings', data)
}

export const removeProfilePicture = () => {
  return http.delete('profile-image')
}

export const saveUserMetadata = (data) => {
  return http.put('myself/metas', data)
}

export const saveUserData = (data) => {
  return http.put('myself', data)
}

export const saveUserPhoto = (data) => {
  const form = parseToFormData(data)

  if (data.type === undefined) {
    return
  }

  form.append('image', data, data.name)

  return http.post('profileImage', form, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const changeUserProfile = (data) => {
  data.client_id = APP_KEY
  return http.post('users/change_profile', parse(data))
}

export const getChatbotToken = (token) => {
  return http.get('myself/chatbot/token', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export const saveSurveyDate = (date) => {
  return http.put('myself/nps/last-feedback', { date })
}

export const setDelayNps = (delay) => {
  return http.put('myself/nps', {
    request_delay: parseInt(delay),
  })
}
