import { http } from '@/support/http'
import { createQuery } from '@/support/utils/paginatorQueryBuilder'

export const getConference = (params) => {
  return http.get(`my-management/conferences?${createQuery(params)}`)
}
