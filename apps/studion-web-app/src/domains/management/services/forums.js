import { http } from '@/support/http'
import { createQuery } from '@/support/utils/paginatorQueryBuilder'

export const getForums = (params) => {
  return http.get(`my-management/forums?${createQuery(params)}`)
}
