import * as services from '../services'

export const attemptGeneralLeaderboardRetrieval = ({ commit }, params = {}) => {
  return services.getGeneralLeaderboard(params)
}

export const attemptPlayerLeaderboardRetrieval = () => {
  return services.getPlayerLeaderboard()
}

export const attemptAchievementsRetieval = () => {
  return services.getAchievements()
}

export const attemptPlayerStatusRetrieval = () => {
  return services.getPlayerStatus()
}

export const attemptActionsRetrieval = () => {
  return services.getActions()
}
