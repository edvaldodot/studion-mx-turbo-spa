import { http } from '@/support/http'
import config from '@/config'
import { parse, parseToFormData } from '@/support/payloadParser'
import { source } from '../../../support/utils/source'

const { APP_KEY, APP_SECRET } = config

export const getInstanceSettings = () => http.get('settings', { cancelToken: source.token })

export const updateInstanceSettings = (data) => {
  return http.put('settings/instance', data)
}

export const postInstanceSettings = () => {
  let params = {
    client_id: APP_KEY,
    client_secret: APP_SECRET,
  }
  return http.post('settings/external', parse(params))
}

export const getNotificationsSettings = () => {
  return http.get('notifications/types')
}

export const getNotificationType = (notificationTypeId, notificationTransportName) => {
  return http.get(`notifications/types/${notificationTypeId}/${notificationTransportName}`)
}

export const batchUpdateNotificationsTypes = (data) => {
  return http.put('notifications/types', data)
}

export const updateNotificationTransportContent = ({ notificationTransportId, data }) => {
  return http.put(`notifications/transport/${notificationTransportId}/content`, data)
}

export const updateEmailNotificationHeader = (data) => {
  const form = parseToFormData(data)

  if (data.image.type === undefined) {
    return
  }

  form.append('image', data.image, data.image.name)

  return http.post(`settings/instance/email-notification-header`, form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const updateMenusOrder = (data) => {
  let payload = {}

  data.forEach((item) => {
    payload[item.menu] = {
      enabled: item.enabled ? 1 : 0,
      order: item.order,
    }
  })

  return http.put('settings/instance/menu', { menu: payload })
}

export const setDisplayPreferences = async (display_preferences) => {
  return http.put('myself/preferences', { display_preferences })
}

export const updateSurveyNPSConfig = async (data) => {
  return http.put('settings/instance', data)
}

export const getCustomInstructions = () => http.get('ai/personalized-instructions?limit=1000')

export const createCustomInstruction = (data) => http.post('ai/personalized-instructions', data)

export const updateCustomInstruction = (data, id) =>
  http.put(`ai/personalized-instructions/${id}`, data)

export const deleteCustomInstruction = (id) => http.delete(`ai/personalized-instructions/${id}`)

export const getBranchSettings = () => {
  return http.get('settings/branch')
}

export const getSettingsConfigs = () => {
  return http.get('settings')
}

