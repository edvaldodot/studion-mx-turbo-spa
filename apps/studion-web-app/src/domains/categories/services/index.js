import { http } from '@/support/http'
import { createQuery } from '@/support/utils/paginatorQueryBuilder'

export const createCategory = data => {
  return http.post('categories', data)
}

export const updateCategory = (data) => {
  return http.put(`categories/${data.id}`, data)
}

export const removeCategory = (id) => {
  return http.delete(`categories/${id}`)
}

export const getCategory = (data) => {
  return http.get(`categories/${data.id}`)
}

export const getCategories = (params) => {
  return http.get(`categories?${createQuery(params, true)}`)
}
