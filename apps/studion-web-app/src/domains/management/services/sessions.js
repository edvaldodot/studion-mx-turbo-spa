import { http } from '@/support/http'
import { createQuery } from '@/support/utils/paginatorQueryBuilder'

export const getModalSessionList = (params) => {
  return http.get(`/my-management/list-sessions-user-team?${createQuery(params.params)}`)
}
