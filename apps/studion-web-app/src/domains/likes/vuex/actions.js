import * as services from '../services'

export const attemptEntityLike = ({ commit }, { sessionUuid, entityAlias, entityId, data }) => {
  return services.likeEntity(sessionUuid, entityAlias, entityId, data)
}

export const attemptEntityLikeUpdate = ({ commit }, { sessionUuid, entityAlias, likeId, data }) => {
  return services.updateLikeEntity(sessionUuid, entityAlias, likeId, data)
}

export const attemptEntityLikeRemoval = ({ commit }, { sessionUuid, entityAlias, likeId }) => {
  return services.removalLikeEntity(sessionUuid, entityAlias, likeId)
}
