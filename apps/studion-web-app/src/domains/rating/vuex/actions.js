import * as services from '../services'

export const sendRating = ({ commit }, payload) => {
  return services.sendRating(payload)
}
