import * as services from '../services'
import * as ACCOUNT_TYPES from '../../account/vuex/mutations-types'
import * as TYPES from '@/domains/accessMessages/vuex/mutations-types'

export const bindUserToAccessMessage = ({ commit, dispatch }, accessMessageId) => {
  dispatch('setFetching', true)
  return services.bindUserToAccessMessage(accessMessageId)
    .then(() => {
      commit(ACCOUNT_TYPES.REMOVE_ACCESS_MESSAGE, accessMessageId)
    })
    .finally(() => dispatch('setFetching', false))
}

export const saveAccessMessage = ({ commit, dispatch }, accessMessage) => {
  dispatch('setFetching', true)

  let savePromise = (accessMessage.id !== 'undefined')
    ? services.updateAccessMessage(accessMessage)
    : services.createAccessMessage(accessMessage)

  savePromise.then(({ data }) => {
    commit(TYPES.SET_ACCESS_MESSAGES_ITEM, data)
  }).finally(() => dispatch('setFetching', false))
  return savePromise
}

export const getAccessMessage = ({ dispatch }, accessMessageId) => {
  dispatch('setFetching', true)
  return services.getAccessMessage(accessMessageId)
    .finally(() => dispatch('setFetching', false))
}

export const fetchAccessMessage = ({ commit }) => {
  return services.listAccessMessage().then(({ data }) => {
    commit(TYPES.SET_ACCESS_MESSAGES_LIST, data.data)
  })
}

export const setStateAccessMessage = ({ dispatch, getters }, payload) => {
  let accessMessage = getters.getAccessMessageById(payload.id)
  accessMessage.active = payload.state
  return dispatch('saveAccessMessage', accessMessage)
}
