import * as services from '../services'
import * as TYPES from './mutations-types'

export const mediationListResource = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_MEDIATION_LIST, data.fromCache)
    return
  }
  let response = await services.getMediationList(data.params)
  commit(TYPES.SET_MEDIATION_LIST, response.data.data)
  return response.data
}

export const mediationLinksResource = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_MEDIATION_AVAILABLE_LINKS, data.fromCache)
    return
  }

  let response = []

  if (data.options.type === 'solution') {
    response = await services.getSolutions(data.params)
  } else {
    response = await services.getSessions(data.params)
  }

  commit(TYPES.SET_MEDIATION_AVAILABLE_LINKS, response.data.data)
  return response.data
}

export const attemptMediationCreation = async (_, data) => {
  let response = await services.createMediationPlan(data)
  return response.data
}

export const attemptMediationEdit = (_, data) => {
  return services.editMediationPlan(data)
}

export const attemptGetMediationFilters = async ({ commit, dispatch }, id) => {
  dispatch('setFetching', true)
  let response = await services.getMediationFilters(id)
  dispatch('setFetching', false)

  commit(TYPES.SET_MEDIATION_FILTERS, response.data)
}

export const attemptGetMediationTags = async ({ commit }) => {
  let response = await services.getMediationTags()
  commit(TYPES.SET_MEDIATION_TAGS, response.data)
}

export const attemptMediationSetup = async ({ commit, dispatch }, id) => {
  dispatch('setFetching', true)

  await Promise.all([dispatch('attemptGetMediationPlan', id), dispatch('attemptGetMediationTags')])

  const pmAiEnabled = await dispatch('checkIsEnabledFeature', 'pm_ai')

  if (pmAiEnabled) {
    const ci = await dispatch('attemptGetCustomInstructions')
    commit(TYPES.SET_CUSTOM_INSTRUCTIONS, ci.data.data)
  }

  dispatch('setFetching', false)
}

export const attemptGetMediationActions = async ({ commit }, id) => {
  const response = await services.getMediationActions(id)
  commit(TYPES.SET_ACTIONS, response.data)
}

export const attemptCreateMediationAction = (_, data) => {
  return services.createMediationAction(data)
}

export const attemptGetMediationConfigs = (_, params) => {
  return services.getMediationConfigs(params)
}

export const addCustomPMTag = ({ commit }, data) => {
  commit(TYPES.ADD_CUSTOM_PM_TAG, data)
}

export const setCustomInstructions = ({ commit }, data) => {
  commit(TYPES.SET_CUSTOM_INSTRUCTIONS, data)
}

export const attemptCloneMediation = (_, params) => {
  return services.cloneMediation(params)
}

export const attemptSetMediationConfigs = (_, { data, mediationId }) => {
  return services.setMediationConfig(data, mediationId)
}

export const addMediationLinks = async ({ commit }, data) => {
  commit(TYPES.ADD_MEDIATION_LINKS, data)
}

export const removeMediationLink = async ({ commit }, data) => {
  commit(TYPES.REMOVE_MEDIATION_LINK, data)
}

export const attemptSaveMediationLinks = (_, { id, data, type }) => {
  if (type === 'solution') {
    return services.saveMediationSolutionsLinks(id, { course: data })
  } else {
    return services.saveMediationSessionsLinks(id, { session: data })
  }
}

export const setMediationLinks = ({ commit }, data) => {
  commit(TYPES.SET_MEDIATION_LINKS, data)
}

export const setMediationPlan = ({ commit }, data) => {
  commit(TYPES.SET_MEDIATION_PLAN, data)
}

export const attemptGetMediationPlan = async ({ commit }, id) => {
  const data = await services.getMediationPlan(id)
  commit(TYPES.SET_MEDIATION_PLAN, data.data)

  return data
}

export const attemptToggleMediationStatus = (_, data) => {
  return services.toggleMediationStatus(data.id, data.action)
}

export const attemptRemoveMediation = (_, id) => {
  return services.removeMediation(id)
}

export const attemptGetMediationReport = (_, { mediationId, sessionId }) => {
  return services.getMediationReport(mediationId, sessionId)
}

export const attemptGetMediationTemplate = (_, id) => {
  return services.getMediationTemplate(id)
}

export const attemptCreateMediationTemplate = (_, data) => {
  return services.createMediationTemplate(data)
}

export const attemptUpdateMediationTemplate = (_, data) => {
  return services.updateMediationTemplate(data)
}

export const attemptDeleteMediationTemplate = (_, data) => {
  return services.deleteMediationTemplate(data)
}

export const mediationTemplatesResource = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_MEDIATION_LIST, data.fromCache)
    return
  }

  let response = await services.getMediationTemplates(data.params)

  commit(TYPES.SET_MEDIATION_LIST, response.data.data)
  return response.data
}

export const attemptAutocompleteTemplateActions = (_, data) => {
  return services.autocompleteTemplateActions(data)
}

export const mediationBatchesResource = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_MEDIATION_BATCHES_LIST, data.fromCache)
    return
  }

  let response = await services.getMediationBatches(data)

  commit(TYPES.SET_MEDIATION_BATCHES_LIST, response.data.data)
  return response.data
}

export const attemptCreateMediationActionBatch = (_, data) => {
  return services.createMediationActionBatch(data)
}

export const attemptGetMediationBatchesSheet = (_, processId) => {
  return services.getMediationBatchesSheet(processId)
}

export const attemptGetMediationBatchesSheetModel = () => {
  return services.getMediationBatchesSheetModel()
}

export const scheduledListResource = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_SCHEDULED_LIST_RESOURCE, data.fromCache)
    return
  }

  let response = await services.getScheduledActions(data)
  commit(TYPES.SET_SCHEDULED_LIST_RESOURCE, response.data.data)
  return response.data
}

export const attemptgetScheduledPreviewActions = (_, mediationId) => {
  return services.getScheduledPreviewActions(mediationId)
}
