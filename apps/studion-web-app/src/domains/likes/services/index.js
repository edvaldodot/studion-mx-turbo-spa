import { http } from '@/support/http'
import { parse } from '@/support/payloadParser'

export const likeEntity = (sessionUuid, entityAlias, entityId, data) => {
  if (sessionUuid) {
    return http.post(`classroom/${sessionUuid}/likes/${entityAlias}/${entityId}`, parse(data))
  }
  return http.post(`${entityAlias}/${entityId}/likes`, parse(data))
}

export const updateLikeEntity = (sessionUuid, entityAlias, likeId, data) => {
  if (sessionUuid) {
    return http.put(`classroom/${sessionUuid}/likes/${likeId}`, parse(data))
  }
  return http.put(`${entityAlias}/likes/${likeId}`, parse(data))
}

export const removalLikeEntity = (sessionUuid, entityAlias, likeId) => {
  if (sessionUuid) {
    return http.delete(`classroom/${sessionUuid}/likes/${entityAlias}/${likeId}`)
  }
  return http.delete(`${entityAlias}/likes/${likeId}`)
}
