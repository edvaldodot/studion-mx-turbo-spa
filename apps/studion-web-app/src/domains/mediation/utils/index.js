import i18n from '@/support/i18n'
import { TRANSMISSION_TYPES } from '@/app/mediation/shared'

/**
 * Retrieves action object from mapped transmission types.
 * @param {string} action
 * @returns {object}
 */
export function getActionInfo (action) {
  const actionObject = TRANSMISSION_TYPES.find(type => type.value === action)
  return actionObject || {}
}

/**
 * Retrieves transmission type translation.
 * @param {string} transmission
 * @returns {string}
 */
function getActionText (transmission) {
  const actionInfo = getActionInfo(transmission)
  return (actionInfo && actionInfo.text) || ''
}

/**
 * Return a concatenated version of array based on transmission type.
 * @param {object} transmission
 * @returns {string}
 */
export function stringifyTransmissions (transmission) {
  const translatedTransmissions = Object.keys(transmission).map(getActionText)
  return {
    title: translatedTransmissions.join(', '),
    list: Object.keys(transmission)
  }
}

/**
 * Return a formatted object containing all profiles associated with that action
 * and a list of profile/action.
 * @param {object} transmission
 * @returns {object}
 */
export function getProfilesInfo (transmission) {
  const profileLabelSet = new Set()
  const profileItems = []

  Object.keys(transmission).forEach((transmissionKey) => {
    transmission[transmissionKey].forEach(profile => {
      if (profile) {
        profileLabelSet.add(profile)
      }

      const action = getActionText(transmissionKey)
      profileItems.push({
        transmission: transmissionKey,
        action,
        profile
      })
    })
  })

  const list = [...profileLabelSet]

  return {
    title: list.join(', '),
    items: profileItems,
    list
  }
}

/**
 * @param {object} action
 * @returns {object}
 */
export function formatAction (action) {
  return {
    ...action,
    actions: stringifyTransmissions(action.transmission),
    profiles: getProfilesInfo(action.transmission)
  }
}

/**
 * Set property to high-order function and
 * return a callback for `Array.prototype.sort` that applies alphabetical order.
 * @param {string} property
 * @returns {function} high-order function
 */
function orderByProperty (property) {
  /**
   * @param {object} a
   * @param {object} b
   * @returns {number} position
   */
  return (a, b) => {
    if (a[property] < b[property]) return -1
    if (a[property] > b[property]) return 1
    return 0
  }
}

/**
 * Get all tags with respective translation and sort alphabetically.
 * @param {object} value
 * @returns {object[]}
 */
export function getTagList (value) {
  const tagList = Object.keys(value).map(key => ({
    value: value[key],
    text: i18n.t(`mediation.actions:tag.item:${key.toLowerCase()}`)
  }))

  tagList.sort(orderByProperty('text'))
  return tagList
}
