import { http } from '@/support/http'
import { parse, parseToFormData } from '@/support/payloadParser'
import { source } from '@/support/utils/source'
import { createQuery } from '@/support/utils/paginatorQueryBuilder'
import { setupSessionSolutions } from './utils'

export const getOffering = ({ offeringId, params }) => {
  return http.get(`offerings/${offeringId}?${createQuery(params)}`, { cancelToken: source.token })
}

export const createOffering = (data) => {
  const form = new FormData() // eslint-disable-line no-undef
  const {
    title,
    audience,
    branch,
    description,
    categories,
    keywords,
    image,
    meta,
    tags,
    published,
  } = data
  form.append('title', title)
  form.append('audience', audience)
  form.append('branch_id', branch)
  form.append('description', description)
  form.append('image', image, image.name)
  form.append('meta[programContent]', meta.programContent)
  if (tags) form.append('tags', tags)
  form.append('published', published)

  if (Array.isArray(categories)) {
    categories.forEach((category) => {
      form.append('categories[]', category.id)
    })
  }

  if (Array.isArray(keywords)) {
    keywords.forEach((keyword) => {
      form.append('keywords[]', keyword)
    })
  }
  return http.post('offerings', form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const updateOffering = (data) => {
  const submitData = Object.assign({}, data)

  if (Array.isArray(submitData.categories)) {
    submitData.categories = submitData.categories.map((category) => category.id)
  }

  if (submitData.branch) {
    submitData.branch_id = submitData.branch
    delete submitData.branch
  }

  const parsedData = parse(submitData)

  if (!parsedData.has('categories[]')) {
    parsedData.append('categories[]', '')
  }

  return http.put('offerings', parsedData)
}

export const updateOfferingImage = (data) => {
  const form = parseToFormData(data)

  if (data.image.type === undefined) {
    return
  }

  const offeringId = data.id ? data.id : data.offering_id

  form.append('image', data.image, data.image.name)

  return http.post(`offerings/${offeringId}/image`, form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const removeOffering = (offeringId) => http.delete(`offerings/${offeringId}`)

export const saveOfferingMeta = (data) => {
  const sessionConfigs = data.meta.configs

  if (sessionConfigs && sessionConfigs.length) {
    setupSessionSolutions(data.meta.courses, sessionConfigs)
  }

  return http.put(`offerings/${data.offeringId}/meta`, data)
}

export const getOfferingsByLoggedProfile = (params) => {
  let requestUrl = 'offerings?'
  if (params && params.activeOnly) {
    if (!Array.isArray(params.filter)) {
      params.filter = []
    }
    params.filter.active = 1
  }

  return http.get(`${requestUrl}${createQuery(params)}`, {
    cancelToken: source.token,
    headers: {
      'X-Accept-Version': 'v2',
    },
  })
}

export const publishOffering = (offeringId) => {
  return http.put(`offerings/${offeringId}/publish`)
}

export const getOfferingCourses = ({ offeringId, params }) => {
  return http.get(`offerings/${offeringId}/courses?${createQuery(params)}`, {
    cancelToken: source.token,
  })
}

export const enrollOnOffering = (offeringId, configId) => {
  return http.post(`offerings/${offeringId}/enroll`, parse({ config_id: configId }))
}

export const cancelEnrollmentOnOffering = (offeringId) => {
  return http.put(`offerings/${offeringId}/enroll/cancel`)
}

export const getOfferingUserEnrollments = (offeringId) => {
  return http.get(`offerings/${offeringId}/enrollments`, { cancelToken: source.token })
}

export const getOfferingUserEnrollmentsEmbed = ({ offeringId, params }) => {
  return http.get(`offerings/${offeringId}/enrollments?${createQuery(params)}`, {
    cancelToken: source.token,
  })
}

export const getOfferingStatus = (offeringId) => {
  return http.get(`offerings/${offeringId}/status`)
}

export const toggleOfferingActiveStatus = (offeringId) => {
  return http.put(`offerings/${offeringId}/active/toggle`)
}

export const getKeywordsByName = (keywordName) => {
  return http.get(`offerings/keywords/${keywordName}`)
}

export const getCoursesToAddOffering = ({ params }) => {
  return http.get(`offerings/courses/list?${createQuery(params)}`, {
    cancelToken: source.token,
  })
}
