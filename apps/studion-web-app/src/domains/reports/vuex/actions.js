import * as services from '../services'
import * as TYPES from './mutations-types'

export const attemptReportCreation = (_, data) => {
  return services.createReport(data)
}

export const attemptReportRetrieval = ({ commit }, reportId) => {
  const promise = services.getOneReport(reportId)

  promise.then(({ data }) => {
    commit(TYPES.SET_CURRENT, data)
  })

  return promise
}

export const clearCurrentReport = ({ commit }) => {
  commit(TYPES.CLEAR_CURRENT)
}

export const attemptReportListRetrieval = (_, queryString) => {
  return services.getReports(queryString)
}

export const attemptReportLinkedURLRetrieval = (_, reportId) => {
  return services.getReportSourceURL(reportId)
}

export const attemptAllReportListRetrieval = (_, queryString) => {
  return services.getAllReports(queryString)
}

export const attemptReportUpdate = (_, data) => {
  const updateRequests = []
  updateRequests.push(services.updateReport(data.id, data))
  if (data.hasImage) {
    updateRequests.push(services.updateReportImage(data))
  }

  return Promise.all(updateRequests).then((result) => {
    if (data.hasImage) {
      result[0].data.image = result[1].data.image
      result[0].data.imagePath = result[1].data.imagePath
    }
    return result[0]
  })
}

export const attemptReportRemoval = (_, reportId) => {
  return services.removeReport(reportId)
}

export const attemptReportsProfileListRetrieval = () => {
  return services.getReportsProfiles()
}

export const getReportsHighlight = () => {
  return services.getReportHighLighted()
}

export const setReportsData = ({ commit }, data) => {
  commit(TYPES.SET_DATA, data)
}
