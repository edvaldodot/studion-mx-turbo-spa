import qs from 'qs'

export const createQuery = (queryParams = {}, withoutEmptyParams = false) => {
  let params = {
    query: null,
    filter: null,
    order: null,
    page: 1,
    limit: null,
    embed: null,
    type: null,
  }
  Object.keys(params).forEach((key) => {
    params[key] = queryParams[key] || null
  })

  withoutEmptyParams && clearEmptyParams(params)

  return qs.stringify(params)
}

const clearEmptyParams = (params) => {
  Object.keys(params).forEach((key) => {
    if (params[key] === null) delete params[key]
  })
}
