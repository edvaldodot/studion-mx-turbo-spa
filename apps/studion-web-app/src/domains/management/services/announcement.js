import { http } from '@/support/http'
import { createQuery } from '@/support/utils/paginatorQueryBuilder'

export const getAnnouncement = (params) => {
  return http.get(`my-management/announcement-entries?${createQuery(params)}`)
}

export const createAnnouncement = (params) => {
  return http.post(`my-management/entry/create-multiple-sessions`, params)
}
