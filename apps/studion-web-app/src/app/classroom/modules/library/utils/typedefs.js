/**
 * @typedef {Object} Folder
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {Folder|undefined} parent
 * @property {Array.<Folder>|undefined} children
 */

/**
 * @typedef {Object} LibraryFile
 * @property {number} id
 * @property {string} title
 * @property {string} description
 * @property {string} type
 * @property {string} url
 * @property {number} size
 * @property {string} fileName
 * @property {string} metaType
 * @property {string} session_uuid
*/

/**
 * @typedef {Object} BreadcrumbItem
 * @property {number} key
 * @property {string} text
 * @property {Object} value
 */

/** 
 * @typedef {Object} FolderSelectItem
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {Folder|undefined} parent
 * @property {Array.<Folder>|undefined} children
 * @property {string} breadcrumbs
 * @property {string} label
 * @property {number} value
 */
