import * as services from '../services'
import * as TYPES from './mutations-types'

export const attemptLibraryRetrieval = ({ commit }, data) => {
  return services.getInstanceLibrary(data)
}

export const classroomMediasListResource = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_MEDIAS_LIST, data.fromCache)
    return
  }
  let response = await services.classroomMediasList(data)
  commit(TYPES.SET_MEDIAS_LIST, response.data.data)
  return response.data
}

export const mediaListResource = async ({ commit }, data) => {
  if (data.fromCache) {
    return commit(TYPES.SET_INSTANCE_LIBRARY_LIST, data.fromCache)
  }
  let response = await services.getInstanceLibrary(data.params)
  commit(TYPES.SET_INSTANCE_LIBRARY_LIST, response.data.data)

  return response.data
}

export const attemptDownloadLibraryFileRetrieval = (_, data) => {
  return services.downloadLibraryFile(data)
}

export const attemptDownloadLibraryFileV2Retrieval = (_, data) => {
  return services.downloadLibraryFileV2(data)
}

export const attemptPreviewLibraryFileRetrieval = ({ commit }, data) => {
  return services.previewLibraryFile(data)
}

export const attemptRetrieveLibraryFile = ({ commit }, data) => {
  return services.retrieveLibraryFile(data)
}

export const attemptCourseLibraryRetrieval = (_, { courseId, data }) => {
  return services.getCourseLibrary(courseId, data)
}
export const attemptCourseAssociatedLibraryRetrieval = (_, { courseId }) => {
  return services.getCourseAssociatedLibrary(courseId)
}

export const attemptLibraryWithoutRelationRetrieval = ({ commit }, params = {}) => {
  return services.getLibraryWithoutRelation(params)
}

export const attemptLibraryWithoutCourseRelationRetrieval = ({ commit }, { courseId, params }) => {
  return services.getLibraryWithoutCourseRelation(courseId, params || {})
}

export const solutionMediasListResource = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_SOLUTION_MEDIAS_LIST, data.fromCache)
    return
  }
  let response = await services.getLibraryWithoutCourseRelation(data)
  commit(TYPES.SET_SOLUTION_MEDIAS_LIST, response.data.data)
  return response.data
}

export const libraryFilesListResource = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_LIBRARY_FILE_LIST, data.fromCache)
    return
  }
  let response = await services.getInstanceLibrary(data.params)
  commit(TYPES.SET_LIBRARY_FILE_LIST, response.data.data)
  return response.data
}

export const attemptLibraryFileCreation = ({ commit }, data) => {
  return services.createLibraryFile(data)
}

export const attemptLibraryFileCreationOnResource = ({ commit }, { data, resource }) => {
  return services.createLibraryFileOnResource(data, resource)
}

export const attemptLibraryFileUpdate = (_, params) => {
  if (params.file instanceof FileList && params.type === 'file') {
    return services.updateLibraryFilePhysical(params).then(() => {
      return services.updateLibraryFile(params)
    })
  } else {
    return services.updateLibraryFile(params)
  }
}

export const attemptLibraryFileCourseAssociation = ({ commit }, { courseId, filesIds }) => {
  return services.associateLibraryOnCourse(courseId, filesIds)
}

export const attemptAddFilesOnCourse = ({ commit }, { courseId, params }) => {
  return services.addFilesOnCourse(courseId, params)
}

export const attemptLibraryFileSessionAssociation = (_, { sessionUuid, filesIds, parent }) => {
  return services.associateLibraryOnSession(sessionUuid, filesIds, parent)
}

export const attemptQuotaRetrieval = () => {
  return services.quotaRetrieval()
}

export const attemptLibraryFileRemoval = ({ commit }, fileId) => {
  return services.removeLibraryFile(fileId)
}

export const attemptLibraryFileCourseDisassociation = ({ commit }, { courseId, filesIds }) => {
  return services.disassociateLibraryOnCourse(courseId, filesIds)
}

export const attemptLibraryFileSessionDisassociation = ({ commit }, { sessionUuid, filesIds }) => {
  return services.disassociateLibraryOnSession(sessionUuid, filesIds)
}

export const attemptLibraryFileDeleteLibraryOnSession = (_, { courseId, filesIds }) => {
  return services.deleteLibraryOnSession(courseId, filesIds)
}

export const libraryWithoutRelationResource = async ({ commit }, data) => {
  if (data.fromCache) return commit(TYPES.SET_MEDIAS_WITHOUT_RELATION_LIST, data.fromCache)
  const response = await services.getLibraryWithoutRelation(data.params)
  commit(TYPES.SET_MEDIAS_WITHOUT_RELATION_LIST, response.data.data)
  return response.data
}

export const attemptAddSessionLibraryFolder = ({ commit }, { sessionUuid, formData }) => {
  if (formData.parentId === 0) delete formData.parentId
  return services.addSessionLibraryFolder(formData, sessionUuid)
}

export const attemptUpdateSessionLibraryFolder = ({ commit }, { sessionUuid, formData }) => {
  if (formData.parentId === 0) delete formData.parentId
  return services.updateSessionLibraryFolder(formData, sessionUuid)
}

export const attemptRemoveSessionLibraryFolder = ({ commit }, { sessionUuid, folderId }) => {
  return services.removeSessionLibraryFolder(folderId, sessionUuid)
}

export const attemptMoveLibraryFile = ({ commit }, { fileId, parentId, sessionUuid }) => {
  return services.moveLibraryFile(fileId, parentId, sessionUuid)
}

export const attemptGetFolderList = (_, sessionUuid) => {
  return services.getFolderList(sessionUuid)
}

export const attemptToUpdateLibraryList = ({ commit }, data) => {
  commit(TYPES.SET_LIBRARY_LIST, data)
}

export const attemptGetFolder = async (_, folderValue) => {
  const response = await services.getFolder(folderValue)

  return response.data
}

export const attemptCreateCourseFolder = (_, { courseId, formData }) => {
  if (!formData.parent_folder_id) delete formData.parent_folder_id
  return services.createCourseFolder(courseId, formData)
}
