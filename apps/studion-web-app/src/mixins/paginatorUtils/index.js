const CHAR_PARAM_SEPARATOR = '|'

/**
 * Parse nested object/array from queryParams.
 * @param {object} queryParams
 * @param {string[]} ignoreParams
 * @returns {object}
 */
export function stringifyNestedParamKeys(params = {}, ignoreParams = []) {
  const queryParams = {}

  Object.keys(params).forEach((key) => {
    if (ignoreParams.includes(key)) return

    if (Array.isArray(params[key])) {
      params[key].forEach((value, index) => {
        if (value === null || value === undefined) return
        queryParams[`${key}${CHAR_PARAM_SEPARATOR}${index}`] = value
      })
      return
    }

    if (params[key] && typeof params[key] === 'object') {
      Object.entries(params[key]).forEach(([childKey, childValue]) => {
        if (childValue === null || childValue === undefined) return

        if (Array.isArray(childValue)) {
          childValue.forEach((value, index) => {
            queryParams[`${key}${CHAR_PARAM_SEPARATOR}${childKey}${CHAR_PARAM_SEPARATOR}${index}`] =
              value
          })
          return
        }

        queryParams[`${key}${CHAR_PARAM_SEPARATOR}${childKey}`] = childValue
      })
      return
    }

    if (params[key] === null || params[key] === undefined) return
    queryParams[key] = params[key]
  })

  return queryParams
}

/**
 * Regex that verifies if value is a number.
 * @param {string} value
 * @returns {boolean}
 */
function isDigit(value) {
  return /^\d+$/.test(value)
}

/**
 * Parse nested object/array from queryParams.
 * @param {object} queryParams
 * @param {string[]} ignoreParams
 * @returns {object}
 */
export function createRouteParams(queryParams = {}, ignoreParams = []) {
  const params = {}

  Object.entries(queryParams).forEach(([nestedKey, nestedValue]) => {
    if (ignoreParams.includes(nestedKey)) return

    const keys = nestedKey.split(CHAR_PARAM_SEPARATOR)
    const value = isDigit(nestedValue) ? Number(nestedValue) : nestedValue

    if (keys.length === 1) {
      params[nestedKey] = value
      return
    }

    let previous
    keys.forEach((key, index) => {
      const currentKeyIsDigit = isDigit(key)
      const nextKey = keys[index + 1]
      const nextKeyIsDigit = isDigit(nextKey)

      if (previous) {
        if (previous[key]) {
          previous = previous[key]
          return
        }

        if (currentKeyIsDigit) {
          previous.push(value)
          return
        }

        if (!nextKey) {
          previous[key] = value
          return
        }

        previous[key] = nextKeyIsDigit ? [] : {}
        previous = previous[key]
        return
      }

      if (!params[key]) {
        params[key] = nextKeyIsDigit ? [] : {}
      }
      previous = params[key]
    })
  })

  return params
}

/**
 * Check if the current route queryParams are the same as the previous ones.
 * @param {object} currentRouteParams
 * @param {object} currentRouteParams
 * @returns {boolean}
 */
export function checkIsSameRouteParams(currentRouteParams, previousRouteParams) {
  const previousKeys = Object.keys(previousRouteParams)
  const currentKeys = Object.keys(currentRouteParams)

  if (previousKeys.length !== currentKeys.length) return false

  const isSameParams = previousKeys.every(
    (key) => currentRouteParams[key] == previousRouteParams[key]
  )

  return isSameParams
}
