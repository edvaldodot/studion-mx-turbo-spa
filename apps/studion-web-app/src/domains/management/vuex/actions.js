import * as TYPES from './mutations-types'

export const setExample = ({ commit }, data) => {
  commit(TYPES.SET_EXAMPLE, data)
}