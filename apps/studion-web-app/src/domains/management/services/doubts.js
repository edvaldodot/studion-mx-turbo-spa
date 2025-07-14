import { http } from '@/support/http'
import { createQuery } from '@/support/utils/paginatorQueryBuilder'

export const getDoubtsList = (params) => {
  return http.get(`my-management/knowledge-issues?${createQuery(params)}`)
}

export const getOnlyDoubt = (issue_id) => {
  return http.get(`knowledge_base/issue/${issue_id}/access`)
}

export const getCategoryFilter = (payload) => {
  return http.get(`knowledge_base/list-issue-category?${createQuery(payload.params)}`)
}
