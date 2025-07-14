import { http } from '@/support/http'
import { parse } from '@/support/payloadParser'
import { source } from '../../../support/utils/source'

export const createRule = data => {
  return http.post('rules', parse(data))
}

export const updateRule = data => {
  const ruleId = data.id

  data.id = null
  data.active = Number(data.active)

  return http.put(`rules/${ruleId}`, parse(data))
}

export const removeRule = ruleId => {
  return http.delete(`rules/${ruleId}`)
}

export const retrieveRule = ruleId => {
  return http.get(`rules/${ruleId}`, {cancelToken: source.token})
}

export const retrieveRuleList = () => http.get('rules', {cancelToken: source.token})

export const retrieveRuleConditionsList = typeId => {
  return http.get(`rules/types/${typeId}/conditions`, {cancelToken: source.token})
}

export const retrieveRulesTypesList = () => {
  return http.get('rules/types', {cancelToken: source.token})
}

export const retrieveStatusTypesList = () => {
  return http.get('users/status', {cancelToken: source.token})
}
