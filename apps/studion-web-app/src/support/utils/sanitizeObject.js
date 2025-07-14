/**
 * Mutate passed object by removing nested properties with value equal "null".
 * @param {Object} objectRef
 */
export function sanitizeObject (objectRef) {
  Object.keys(objectRef).forEach((key) => {
    if (objectRef[key] === null) delete objectRef[key]
    if (typeof objectRef[key] === 'object') sanitizeObject(objectRef[key])
  })
}
