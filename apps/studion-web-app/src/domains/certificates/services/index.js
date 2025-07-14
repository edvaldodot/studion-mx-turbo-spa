import { http } from '@/support/http'
import { parse } from '@/support/payloadParser'
import { source } from '../../../support/utils/source'
import {createQuery} from '../../../support/utils/paginatorQueryBuilder'

export const getCertificates = (queryParams = {}) => {
  let queryString = createQuery(queryParams, true)
  return http.get(`certificates?${queryString}`, {cancelToken: source.token})
}

export const getCertificate = certificateId => {
  return http.get(`certificates/${certificateId}`, {cancelToken: source.token})
}

export const getCertificateDependencies = certificateId => {
  return http.get(`certificates/${certificateId}/dependencies`, {cancelToken: source.token})
}

export const removeCertificate = certificateId => {
  return http.delete(`certificates/${certificateId}`)
}

export const getAvailableTags = (queryParams = {}) => {
  let queryString = createQuery(queryParams)
  return http.get(`certificates/tags?${queryString}`, {cancelToken: source.token})
}

/**
 * @deprecated don't need anymore add <p> outside message
 * @param content
 * @returns {*}
 */
export const checkContent = (content) => {
  if (!content.startsWith('<p>')) {
    content = `<p>${content}`
  }
  if (!content.endsWith('</p>')) {
    content = `${content}</p>`
  }
  return content
}

export const createCertificate = (data) => { // eslint-disable-line camelcase
  const form = new FormData() // eslint-disable-line no-undef
  form.append('content', data.content)
  form.append('description', data.description)
  form.append('style', data.style)
  form.append('has_back', data.hasBack)
  form.append('template_id', data.templateId)

  if (data.backgroundFront) {
    form.append('background_front', data.backgroundFront, data.backgroundFront.name)
  }
  if (data.backgroundBack) {
    form.append('background_back', data.backgroundBack, data.backgroundBack.name)
  }
  if (data.contentBack) {
    form.append('content_back', data.contentBack)
  }
  return http.post('certificates', form, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const updateCertificate = data => {
  let payload
  let promises

  payload = {
    certificate_id: data.id,
    content: data.content,
    description: data.description,
    style: data.style,
    has_back: data.hasBack,
    content_back: data.contentBack,
    template_id: data.templateId
  }
  promises = [ http.put('certificates', parse(payload)) ]

  if (data.backgroundFront || data.backgroundBack) {
    let multipartForm = new FormData() // eslint-disable-line no-undef
    let multipartOptions = { headers: { 'Content-Type': 'multipart/form-data' } }
    multipartForm.append('certificate_id', data.id)
    if (data.backgroundFront) {
      multipartForm.append('background_front', data.backgroundFront, data.backgroundFront.name)
    }
    if (data.backgroundBack) {
      multipartForm.append('background_back', data.backgroundBack, data.backgroundBack.name)
    }
    promises.push(http.post('certificates/files', multipartForm, multipartOptions))
  }
  return Promise.all(promises)
}

export const validateCertificate = hash => {
  return Promise.any([
    http.get(`sessions/certificate/${hash}/validate`),
    http.get(`paths/certificate/${hash}/validate`)
  ])
}

export const getCertificatePreview = id => {
  return http.post(`certificates/${id}/preview`)
}

export const getCertificateTemplate = () => {
  return http.get(`certificates/templates`)
}

export const downloadCertificatePreview = id => {
  let multipartOptions = { headers: { 'Content-Type': 'application/pdf' }, responseType: 'blob' }
  return http.post(
    `certificates/${id}/preview`,
    {},
    multipartOptions
  ).then(response => {
    let link = document.createElement('a')
    link.href = window.URL.createObjectURL(response.data)
    link.download = 'certificate_preview.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  })
}
