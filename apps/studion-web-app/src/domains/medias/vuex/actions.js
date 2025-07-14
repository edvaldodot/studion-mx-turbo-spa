import * as services from '../services'

export const attemptUploadMediaFile = ({ commit }, data) => {
  return services.uploadMediaFile(data)
}
