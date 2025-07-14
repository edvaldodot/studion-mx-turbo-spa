import { http } from '@/support/http'
import { createQuery } from '@/support/utils/paginatorQueryBuilder'

export const getMessages = (params) => {
  return http.get(`my-management/messages?${createQuery(params)}`)
}
