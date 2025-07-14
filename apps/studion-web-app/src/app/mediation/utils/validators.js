import { REGEX_HOUR_MINUTE } from '@/support/utils/constants'

/**
 * @typedef {Object} Meta
 * @property {Object} actions
 * @property {number} duration,
 * @property {string} startTime,
 * @property {string} endTime,
 * @property {string} transmissionType
 */

/**
 * Validate time based on rules that are described on PDLMS-7980.
 * @param {string} rule
 * @param {string} value
 * @param {(Meta|undefined)} nestedMeta
 */
export const validateTime = (rule) => (value, nestedMeta) => {
  if (!value || !nestedMeta) return true

  if (['email', 'sms'].includes(nestedMeta.transmissionType)) return true

  const isDayZero = String(nestedMeta.duration) === '0'

  const startTime = nestedMeta.startTime
  const endTime = nestedMeta.endTime

  const isInvalid = {
    equalTime: () => startTime === endTime,
    lessEndTime: () => {
      const [startHour, startMinute] = startTime.split(':')
      const [endHour, endMinute] = endTime.split(':')

      if (endHour == startHour) {
        return endMinute < startMinute
      }

      return endHour < startHour
    },
  }

  if (isDayZero && isInvalid[rule]()) {
    return false
  }

  return value
}

/**
 * Validate if time is right.
 * @param {string} value
 */
export const validateTriggerTime = (value) => {
  if (!value) return true

  return REGEX_HOUR_MINUTE.test(value)
}