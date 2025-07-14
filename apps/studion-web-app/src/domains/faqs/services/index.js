import { http } from '@/support/http'
import { parse } from '@/support/payloadParser'
import { source } from '../../../support/utils/source'
import { createQuery } from '@/support/utils/paginatorQueryBuilder'

export const getFaqQuestions = (params) => {
  let requestUrl = 'faqs?'
  return http.get(
    `${requestUrl}${createQuery(params)}`,
    { cancelToken: source.token }
  )
}

export const createFaqQuestion = data => {
  return http.post('faqs', parse(data))
}

export const updateFaqQuestion = (faqQuestionId, data) => {
  return http.put(`faqs/${faqQuestionId}`, parse(data))
}

export const removeFaqQuestion = faqQuestionId => {
  return http.delete(`faqs/${faqQuestionId}`)
}

export const getFaqCategories = (params) => {
  let requestUrl = 'faqs/categories?'
  return http.get(
    `${requestUrl}${createQuery(params)}`,
    { cancelToken: source.token }
  )
}

export const createFaqCategory = data => {
  return http.post('faqs/categories', parse(data))
}

export const updateFaqCategory = (categoryId, data) => {
  return http.put(`faqs/categories/${categoryId}`, parse(data))
}

export const removeFaqCategory = categoryId => {
  return http.delete(`faqs/categories/${categoryId}`)
}

export const activateFaqCategory = categoryId => {
  return http.put(`faqs/categories/${categoryId}`, parse({ active: 1 }))
}

export const deactivateFaqCategory = categoryId => {
  return http.put(`faqs/categories/${categoryId}`, parse({ active: 0 }))
}
