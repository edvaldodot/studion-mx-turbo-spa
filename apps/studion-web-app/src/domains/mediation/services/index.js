import { http } from '@/support/http'
import { parse } from '@/support/payloadParser'
import { objectToFormData } from '@/support/utils/objectToFormData'
import { createQuery } from '@/support/utils/paginatorQueryBuilder'
import { sanitizeObject } from '@/support/utils/sanitizeObject'
import { source } from '@/support/utils/source'

export const getMediationList = (params) => {
  return http.get(`mediation-plans?${createQuery(params)}`)
}

export const getMediationActions = (id) => {
  return http.get(`mediation-plans/${id}/mediations/metadata`)
}

export const createMediationAction = (data) => {
  const action = data.action
  sanitizeObject(action)
  const form = objectToFormData(action)

  const image = action.meta.image
  if (image && typeof image !== 'string') {
    form.delete('meta[image]')
    form.set('meta[image]', image, image.name + '.jpg')
  }

  const asset = action.meta.asset && action.meta.asset[0]
  if (asset && typeof asset !== 'string') {
    form.delete('meta[asset][0]')
    form.set('meta[asset]', asset, asset.name + '.pdf')
  }

  const triggerTime = action.meta.triggerTime
  if (!triggerTime) form.delete('meta[triggerTime]')

  return http.post(`mediation-plans/${data.mediationId}/mediations`, form)
}

export const cloneMediation = (data) => {
  return http.post(`mediation-plans/${data.id}/clone`, { addLinks: data.addLinks })
}

export const getMediationConfigs = (params) => {
  return http.get(`mediation-plans/${params.id}/mediations/${params.day}`)
}

export const getMediationFilters = (id) => {
  const params = {
    limit: 1000,
    query: {
      mediation_plan_id: id,
    },
  }

  return http.get(`filters?${createQuery(params)}`)
}

export const createMediationPlan = (data) => {
  return http.post('mediation-plans', parse(data))
}

export const editMediationPlan = (data) => {
  return http.put(`mediation-plans/${data.id}`, data)
}

export const getMediationTags = () => {
  return http.get('mediations/tags')
}

export const setMediationConfig = (data) => {
  data.mediations.forEach(sanitizeObject)
  const formData = objectToFormData(data, { indices: true })

  data.mediations.forEach((action, index) => {
    formData.delete(`mediations[${index}][meta][image]`)
    formData.delete(`mediations[${index}][meta][asset][0]`)
    formData.delete(`mediations[${index}][meta][asset]`)

    const image = action.meta.image
    if (image && typeof image !== 'string') {
      formData.set(`mediations[${index}][meta][image]`, image, image.name + '.jpg')
    }

    const asset = action.meta.asset && action.meta.asset[0]
    if (asset && typeof asset !== 'string') {
      formData.set(`mediations[${index}][meta][asset]`, asset, asset.name + '.pdf')
    }
  })

  return http.post(`mediations`, formData)
}

export const getSolutions = (params) => {
  return http.get(`courses?${createQuery(params)}`, { cancelToken: source.token })
}

export const getSessions = (params) => {
  return http.get(`sessions?${createQuery(params)}`, { cancelToken: source.token })
}

export const saveMediationSolutionsLinks = (id, data) => {
  return http.post(`mediation-plans/${id}/solutions`, objectToFormData(data))
}

export const saveMediationSessionsLinks = (id, data) => {
  return http.post(`mediation-plans/${id}/sessions`, data)
}

export const getMediationPlan = (id) => {
  return http.get(`mediation-plans/${id}`)
}

export const toggleMediationStatus = (id, status) => {
  return http.post(`mediation-plans/${id}/toggle/${status}`)
}

export const removeMediation = (id) => {
  return http.delete(`mediation-plans/${id}`)
}

/**
 * @param {Number} mediationId
 * @param {Number} sessionId
 * @returns {Promise}
 */
export const getMediationReport = (mediationId, sessionId) => {
  return http.get(`mediation-plans/${mediationId}/mediations/sessions/${sessionId}/metadata`)
}

export const createMediationTemplate = (data) => {
  return http.post('mediations-actions-templates', data)
}

export const updateMediationTemplate = (data) => {
  return http.put(`mediations-actions-templates/${data.id}`, data)
}

export const getMediationTemplate = (id) => {
  return http.get(`mediations-actions-templates/${id}`)
}

export const deleteMediationTemplate = (id) => {
  return http.delete(`mediations-actions-templates/${id}`)
}

export const getMediationTemplates = (params) => {
  return http.get(`mediations-actions-templates?${createQuery(params)}`)
}

export const autocompleteTemplateActions = (data) => {
  return http.get(
    `mediations-actions-templates/search/title/${data.title}?filter[transmission_type]=${data.type}`
  )
}

export const getMediationBatches = (data) => {
  return http.get(`batch/mediation/${data.options.mediationId}?${createQuery(data.params)}`)
}

export const getMediationBatchesSheet = (processId) => {
  return http
    .get(`batch/process/${processId}/mediation/report`, {
      responseType: 'blob',
    })
    .then((response) => {
      let link = document.createElement('a')
      link.href = window.URL.createObjectURL(response.data)
      link.download = 'batch-mediation-results.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
}

export const getMediationBatchesSheetModel = () => {
  return http
    .get('mediation-plans/batch/template', {
      responseType: 'blob',
    })
    .then((response) => {
      let link = document.createElement('a')
      link.href = window.URL.createObjectURL(response.data)
      link.download = 'batch-mediation-model.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
}

export const createMediationActionBatch = (data) => {
  const form = new FormData()
  form.append('file', data.file, data.file.name)
  form.append('mediation_plan_id', data.mediation_plan_id)
  return http.post('batch/mediation/create', form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const getScheduledActions = (data) => {
  return http.get(
    `mediation-plans/all/mediations/${data.options.transmission_type}?${createQuery(data.params)}`
  )
}

export const getScheduledPreviewActions = (mediationId) => {
  return http.get(`/mediation/${mediationId}`)
}
