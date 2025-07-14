import * as services from '../services'
import * as TYPES from './mutations-types'

export const attemptCertificateListRetrieval = (_, queryString) => {
  return services.getCertificates(queryString)
}

export const certificateListResource = async ({ commit, dispatch }, data) => {
  if (data.fromCache) {
    return commit(TYPES.SET_CERTIFICATE_LIST, data.fromCache)
  }

  const response = await dispatch('attemptCertificateListRetrieval', data.params)
  commit(TYPES.SET_CERTIFICATE_LIST, response.data.data)
  return response.data
}

export const attemptCertificateRemoval = (_, certificateId) => {
  return services.removeCertificate(certificateId)
}

export const attemptAvailableTagsRetrieval = (_, queryString) => {
  return services.getAvailableTags(queryString)
}

export const attemptCertificateCreation = (_, data) => {
  return services.createCertificate(data)
}

export const attemptCertificateRetrieval = (_, certificateId) => {
  return services.getCertificate(certificateId)
}

export const attemptCertificateDependenciesRetrieval = (_, certificateId) => {
  return services.getCertificateDependencies(certificateId)
}

export const attemptCertificateUpdate = (_, data) => {
  return services.updateCertificate(data)
}

export const attemptCertificatePreviewRetrieval = (_, id) => {
  return services.getCertificatePreview(id)
}

export const attemptDownloadCertificatePreviewRetrieval = (_, id) => {
  return services.downloadCertificatePreview(id)
}

export const attemptValidateCertificate = (_, hash) => {
  return services.validateCertificate(hash)
}

export const attemptCertificateTemplateRetrieval = () => {
  return services.getCertificateTemplate()
}
