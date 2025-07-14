/// <reference path="../../utils/typedefs.js" />
import { cloneDeep } from 'lodash'
import i18n from '@/support/i18n'

/**
 * generate and return a logical root folder
 * this folder doesnt returns from backend and means the root folder
 * of the session library
 * @param {Array.<Folder>} folders
 * @returns {Folder}
 */
const getRootFolder = (folders) => {
  return {
    id: 0,
    name: i18n.t('global:menu.classroom.library'),
    children: folders
  }
}

/**
 * search for a folder by id using a Depth-First-Search algorithm
 * and return the path to it as a Breadcrumbitem Array
 * @param {number} targetId
 * @param {Array.<Folder>} folders
 * @param {boolean} keepLast
 * @returns {Array.<BreadcrumbItem>}
 */
export const getBreadcrumb = (targetId, folders, keepLast) => {
  const path = []
  const depthFirstSearchFolder = (currentFolder) => {
    if (currentFolder.id === targetId) {
      path.push({key: currentFolder.id, text: currentFolder.name, value: currentFolder})
      return true
    }
    for (let child of currentFolder.children) {
      if (depthFirstSearchFolder(child)) {
        path.push({key: currentFolder.id, text: currentFolder.name, value: currentFolder})
        return true
      }
    }
    return false
  }
  depthFirstSearchFolder({id: 0, name: i18n.t('global:menu.classroom.library'), children: folders})
  path.reverse()
  if (!keepLast) path.pop()
  return path
}

/**
 * search for any folder that contains the search string in its name
 * using a Depth-First-Search algorithm and return the matched folders
 * in the format to be used in the FolderSelect component
 * @param {string} search
 * @param {Array.<Folder>} folders
 * @returns {Array.<FolderSelectItem>}
 */
export const searchFolderByName = (search, folders) => {
  const matchedFolders = []
  const byNameDepthFirstSearch = (search, folder, currentBreadCrumb) => {
    currentBreadCrumb.push({key: folder.id, text: folder.name, value: {...folder}})
    if (folder.name.includes(search)) {
      const breadcrumbs = cloneDeep(currentBreadCrumb)
      if (breadcrumbs.length > 1) breadcrumbs.pop()
      matchedFolders.push({...folder, label: folder.name, value: folder.id, breadcrumbs})
    }
    for (let children of folder.children) {
      byNameDepthFirstSearch(search, children, currentBreadCrumb)
    }
  }
  for (let folder of folders) {
    byNameDepthFirstSearch(search, folder, [{key: 0, text: i18n.t('global:menu.classroom.library'), value: getRootFolder(folders)}])
  }
  return matchedFolders
}

/**
 * search for the parent folder of a folder starting from the currentFolder
 * @param {Folder} currentFolder
 * @param {number} folderId
 * @param {Folder} parent
 * @returns {Folder | null}
 */
export const findParentFolder = (currentFolder, folderId, parent = null) => {
  if (currentFolder.id === folderId) return parent

  for (let child of currentFolder.children) {
    const result = findParentFolder(child, folderId, currentFolder)
    if (result) return result
  }
  return null
}
