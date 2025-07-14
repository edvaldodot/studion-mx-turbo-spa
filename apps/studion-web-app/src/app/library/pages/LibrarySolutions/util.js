/**
 * @typedef CourseObject
 * @property {string | number} course_id
 * @property {string} course_name
 * @property {string} course_image
 * @property {number} course_media_length
 * @property {string} course_type_name
 * @property {string} author_name
 * @property {boolean} course_active
 * @property {number} topics_count
 */

/**
 * @typedef SolutionItem
 * @property {string | number} id
 * @property {string} name
 * @property {string} image
 * @property {number} mediaLength
 * @property {{name: string}} type
 * @property {{name: string}} author
 * @property {boolean} active
 * @property {number} topics_count
 * @property {Array<unknown>} media
 * @property {boolean} loading
 */

/**
 * @param {CourseObject} item
 * @returns {SolutionItem}
 */
export const solutionItemAdapter = item => ({
  id: item['course_id'],
  name: item['course_name'],
  image: item['course_image'],
  mediaLength: item['course_media_length'],
  type: {
    name: item['course_type_name']
  },
  author: {
    name: item['author_name']
  },
  active: item['course_active'],
  topics_count: item['topics_count'],
  media: [],
  loading: false
})
