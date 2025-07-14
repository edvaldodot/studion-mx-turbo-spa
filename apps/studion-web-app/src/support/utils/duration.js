/**
 * @typedef DurationObject
 * @property {number} number
 * @property {string} type
 * @property {string} [dateInterval]
 */

import Duration from 'luxon/src/duration'

const getPrefix = (duration) => {
  let prefix = 'P'
  if (duration.type === 'h') {
    prefix += 'T'
  }
  return prefix
}

/**
 * Receives a dateInterval and parse it to Object with duration number and type
 * @param {string} dateInterval
 * @returns {Object}
 */
export const dateIntervalToTypeAndNumber = (dateInterval) => {
  let durationObj = Duration.fromISO(dateInterval)
  let [type, number, hours, minutes] = [null, null]
  if (durationObj.weeks > 0) {
    type = 'w'
    number = durationObj.weeks
  } else if (durationObj.days > 0) {
    type = 'd'
    number = durationObj.days
  } else if (durationObj.hours > 0 || durationObj.minutes > 0) {
    type = 'h'
    hours = durationObj.hours
    minutes = durationObj.minutes
  }
  return {type, number, hours, minutes}
}

/**
 * Receives a DurationObject and fill its fields based on the dateInterval aproach
 * @param {DurationObject} duration
 */
export const parseDuration = (duration) => {
  if (!duration.type) return
  let prefix = getPrefix(duration)
  if (duration.number && duration.type) {
    duration.dateInterval = prefix + duration.number + duration.type.toUpperCase()
  } else if (duration.dateInterval && !duration.number && !duration.type) {
    const durationFields = dateIntervalToTypeAndNumber(duration.dateInterval)
    duration.type = durationFields.type
    duration.number = durationFields.number
  }
}

/**
 * Receive a duration in the full ISO format and returns it in a reduced format
 * @param {string} fullFormatDuration
 * @returns {string}
 */
export const reduceDuration = (fullFormatDuration) => {
  const duration = dateIntervalToTypeAndNumber(fullFormatDuration)
  let prefix = getPrefix(duration.type)
  return prefix + duration.number + duration.type.toUpperCase()
}
