/**
 * Setup the resource that will be used on pagination
 * @param {Function} commit state commit method
 * @param {object} data paginator data
 * @param {Function} serviceFn
 * @param {string} mutation mutation that will save the data into store
 * @returns  {(Object | undefined )} returns request data if data is'nt on cache and returns nothing if data is on cache
 */
export const pgtrCreateResource = async (commit, data, serviceFn, mutation) => {
  if (data.fromCache) {
    commit(mutation, data.fromCache)
    return
  }
  let response = await serviceFn(data.params)
  commit(mutation, response.data.data)
  return response.data
}
