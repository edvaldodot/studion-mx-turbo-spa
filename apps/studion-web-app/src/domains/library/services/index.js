import { http } from '@/support/http'
import { parse } from '@/support/payloadParser'
import { source } from '../../../support/utils/source'
import { createQuery } from '@/support/utils/paginatorQueryBuilder'
import { objectToFormData } from '@/support/utils/objectToFormData'

import config from '@/config'

const { AVOID_EXTERNAL } = config

export const getInstanceLibrary = (params) => {
  let requestUrl = '/library/files?'

  return http.get(`${requestUrl}${createQuery(params)}`, { cancelToken: source.token })
}

export const downloadLibraryFile = async (data) => {
  const response = await http.get(`library/files/${data.id}/download?external=true`)
  const image = await fetch(response.data.url)
  const blob = await image.blob()
  const objectUrl = URL.createObjectURL(blob)

  let a = document.createElement('a')
  a.href = objectUrl
  a.setAttribute('download', data.fileName || data.filename)
  document.body.appendChild(a)
  a.click()

  document.body.removeChild(a)
}

export const downloadLibraryFileV2 = (data) => {
  if (AVOID_EXTERNAL || data.type !== 'image') {
    return http
      .get(`library/files/${data.id}/download`, {
        responseType: 'blob',
      })
      .then((response) => {
        return new Blob([response.data], { type: response.headers['content-type'] })
      })
  }
  return http.get(`library/files/${data.id}/download?external=true`)
}

export const previewLibraryFile = (data) => {
  return http
    .get(`library/files/${data.id}/download`, {
      responseType: 'blob',
    })
    .then((response) => {
      return response.data
    })
}

export const retrieveLibraryFile = (id) => {
  return http.get(`library/files/${id}/download`, {
    responseType: 'blob',
  })
}

export const classroomMediasList = (data) => {
  let requestUrl = `classroom/${data.params.classroomUuid}/library?`
  if (data.params && data.params.activeOnly) {
    if (!Array.isArray(data.params.filter)) {
      data.params.filter = []
    }
    data.params.filter.active = 1
  }
  return http.get(`${requestUrl}${createQuery(data.params, true)}`, { cancelToken: source.token })
}

export const getCourseLibrary = (courseId, data) => {
  if (!data) {
    return http.get(`/library/files/courses/${courseId}`, {
      cancelToken: source.token,
    })
  }
  return http.get(`/library/files/courses/${courseId}?${createQuery(data)}`, {
    cancelToken: source.token,
  })
}
export const getCourseAssociatedLibrary = (courseId) => {
  return http.get(`/library/files/courses/${courseId}/associated/list`, {
    cancelToken: source.token,
  })
}

export const getLibraryWithoutRelation = (params) => {
  let requestUrl = '/library/files/unassociated/list?'
  return http.get(`${requestUrl}${createQuery(params)}`, { cancelToken: source.token })
}

export const getLibraryWithoutCourseRelation = (data) => {
  return http.get(
    `/library/files/courses/${data.options.courseId}/unassociated/list?${createQuery(data.params)}`
  )
}

export const createLibraryFile = (data) => {
  const { title, description, file, type, url, branches, canReadWhenUp, parent_folder_id } = data

  const formBody = {
    title,
    description,
    type,
    parent_folder_id,
  }

  if (branches) {
    formBody.branch_ids = branches
    formBody.can_read_when_up = canReadWhenUp
  }

  const form = objectToFormData(formBody, { indices: true })

  type === 'file' ? form.append('file', file[0], file[0].name) : form.append('url', url)

  return http.post('library/files', form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const updateLibraryFile = (data) => {
  const { id } = data
  data.type === 'external_link' && delete data.file

  if (data.branch) {
    data.branch_id = data.branch[0].id
    delete data.branch
  }

  if (data.branch_ids) {
    data.can_read_when_up = data.canReadWhenUp
    delete data.canReadWhenUp
  }

  return http.put(`library/files/${id}`, parse(data))
}

export const updateLibraryFilePhysical = (data) => {
  const { id, file } = data
  const form = new FormData()
  form.append('file', file[0], file[0].name)

  return http.post(`library/files/${id}/physical`, form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const createLibraryFileOnResource = (data, { resourceName, resourceId }) => {
  const { title, description, file, type, url, branchIds, folderId, parent_folder_id } = data
  const formBody = {
    title,
    description,
    type,
    resource: resourceName,
    resource_id: resourceId,
    parent_folder_id,
  }
  if (folderId) formBody.parent_folder_id = folderId
  if (branchIds) formBody.branch_ids = branchIds
  const form = objectToFormData(formBody, { indices: true })
  type === 'file' ? form.append('file', file[0], file[0].name) : form.append('url', url)

  return http.post(`library/files/${resourceName}/${resourceId}`, form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const createCourseFolder = (courseId, data) => {
  return http.post(`courses/${courseId}/library/folders`, data)
}

export const associateLibraryOnCourse = (courseId, filesIds) => {
  return http.put(`library/files/course/${courseId}`, { files: filesIds })
}

export const addFilesOnCourse = (courseId, params) => {
  return http.put(`library/files/course/${courseId}/add`, {
    files: params.filesIds,
    parent_folder_id: params.parent_folder_id,
  })
}

export const associateLibraryOnSession = (sessionUuid, filesIds, parent) => {
  const form = {
    file_id: filesIds,
  }
  if (parent) form.parent_folder_id = parent

  return http.post(`library/files/sessions/${sessionUuid}/relation`, form)
}

export const removeLibraryFile = (fileId) => {
  return http.delete(`library/files/${fileId}`)
}

export const disassociateLibraryOnCourse = (courseId, filesIds) => {
  let fileId = Array.isArray(filesIds) ? filesIds.join(',') : filesIds
  return http.delete(`library/files/courses/${courseId}/relation/${fileId}`)
}

export const disassociateLibraryOnSession = (sessionUuid, filesIds) => {
  let fileId = Array.isArray(filesIds) ? filesIds.join(',') : filesIds
  return http.delete(`library/files/sessions/${sessionUuid}/relation/${fileId}`)
}

export const deleteLibraryOnSession = (courseId, filesIds) => {
  return http.delete(`courses/${courseId}/library/folders/${filesIds}`)
}

export const quotaRetrieval = () => {
  return http.get('/library/quota', { cancelToken: source.token })
}

export const addSessionLibraryFolder = (data, sessionUuid) =>
  http.post(`classroom/${sessionUuid}/library/folders`, data)

export const updateSessionLibraryFolder = (data, sessionUuid) =>
  http.put(`classroom/${sessionUuid}/library/folders/${data.id}`, data)

export const removeSessionLibraryFolder = (folderId, sessionUuid) =>
  http.delete(`classroom/${sessionUuid}/library/folders/${folderId}`)

export const moveLibraryFile = (fileId, parentId, sessionUuid) =>
  http.put(`classroom/${sessionUuid}/library/files/${fileId}`, {
    session_library_folder_id: parentId,
  })

export const getFolderList = (sessionUuid) => http.get(`classroom/${sessionUuid}/library/folders`)

export const getFolder = (folderValue) => http.get(`library/${folderValue}/folder`)
