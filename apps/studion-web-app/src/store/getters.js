export const isFullscreen = (getters) => {
  return getters.fullscreen
}

export const isFetching = (getters) => {
  return getters.fetching
}

export const footerHidden = (getters) => {
  return getters.footerHidden
}

export const isIntegrationAppMode = (getters) => {
  return getters.integrationAppMode
}
export const hideFabMenu = (getters) => {
  return getters.hideFabMenu
}

export const getChatbotWindow = (getters) => {
  return getters.chatbot.showWindow
}

export const getIdleTimerAvailability = (getters) => {
  return getters.pauseIdleTimer
}
