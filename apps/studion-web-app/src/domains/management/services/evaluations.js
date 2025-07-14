import { http } from '@/support/http'
import { createQuery } from '@/support/utils/paginatorQueryBuilder'

export const getEvaluationList = (params) => {
  return http.get(`my-management/examinations?${createQuery(params)}`)
}

export const getPreProjectList = (params) => {
  return http.get(`my-management/preproject_examinations?${createQuery(params)}`)
}
