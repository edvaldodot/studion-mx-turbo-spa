/**
 * @typedef {Object} StateObject
 * @property {Object} actions
 */

/**
 * Get lowest day action.
 * @param {StateObject} getters
 * @returns {number|null}
 */
export const getInitialDayAction = (getters) => {
  let minDay = null

  getters.actions.forEach(({ day }) => {
    if (minDay === null || day < minDay) {
      minDay = day
    }
  })

  return minDay
}

/**
 * Get highest day action.
 * @param {StateObject} getters
 * @returns {number|null}
 */
export const getFinalDayAction = (getters) => {
  let maxDay = null

  getters.actions.forEach(({ day }) => {
    if (maxDay === null || day > maxDay) {
      maxDay = day
    }
  })

  return maxDay
}

/**
 * Get all distinct profiles.
 * @param {StateObject} getters
 * @returns {number|null}
 */
export const getProfilesSet = (getters) => {
  const profileLabels = []

  getters.actions.forEach((action) => {
    const profiles = action.profiles
    if (!profiles || !profiles.list) return
    profileLabels.push(profiles.list)
  })

  const profileLabelSet = new Set(profileLabels.flat())
  return [...profileLabelSet]
}

/**
 * Get all distinct action types.
 * @param {StateObject} getters
 * @returns {number|null}
 */
export const getActionsSet = (getters) => {
  const actionLabels = []

  getters.actions.forEach((action) => {
    const actions = action.actions
    if (!actions || !actions.list) return
    actionLabels.push(actions.list)
  })

  const actionLabelSet = new Set(actionLabels.flat())
  return [...actionLabelSet]
}
