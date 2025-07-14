import { http } from '@/support/http'
import { createQuery } from '@/support/utils/paginatorQueryBuilder'

export const getPolls = (params) => {
  return http.get(`my-management/polls?${createQuery(params)}`)
}
