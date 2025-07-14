import { http } from '@/support/http'
import i18n from '@/support/i18n'

export const getGeneralLeaderboard = (params) => {
  return http.get(
    `gamification/ranking?page=${params.page}&limit=${params.limit}`,
    { headers: {'Accept-Language': i18n.locale} }
  )
}

export const getPlayerLeaderboard = () => {
  return http.get(
    `gamification/ranking/user`,
    { headers: {'Accept-Language': i18n.locale} }
  )
}

export const getPlayerStatus = () => {
  return http.get(
    `gamification/player/status`,
    { headers: {'Accept-Language': i18n.locale} }
  )
}

export const getAchievements = () => {
  return http.get(
    `gamification/achievements`,
    { headers: {'Accept-Language': i18n.locale} }
  )
}

export const getActions = () => {
  return http.get(
    `gamification/action`,
    { headers: {'Accept-Language': i18n.locale} }
  )
}
