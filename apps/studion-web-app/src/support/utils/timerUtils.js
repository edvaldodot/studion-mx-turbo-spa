import i18n from '@/support/i18n'

/**
 * @desc Return time in seconds in rounded hours
 * @param {Number} timeInSeconds
 * @param {Boolean} pad
 * @returns {String}
 */
const getHours = (timeInSeconds, pad = false) => {
  let hours = Math.floor(timeInSeconds / 3600)
  if (pad) hours = setPad(hours)
  return hours
}

/**
 * @desc Return time in seconds remaining minutes
 * @param {Number} timeInSeconds
 * @param {Boolean} pad
 * @returns {String}
 */
const getMinutes = (timeInSeconds, pad = false) => {
  let minutes = Math.floor((timeInSeconds % 3600) / 60)
  if (pad) minutes = setPad(minutes)
  return minutes
}

/**
 * @desc Return time in seconds remaining minutes
 * @param {Number} timeInSeconds
 * @param {Boolean} pad
 * @returns {String}
 */
const getSeconds = (timeInSeconds, pad = false) => {
  let seconds = timeInSeconds % 60
  if (pad) seconds = setPad(seconds)
  return seconds
}

/**
 * @desc Returns a object formated time
 * @param {String} timeInSeconds
 * @param {Boolean} pad
 * @returns {Object}
 */
const getTimeObject = (timeInSeconds, pad = false) => {
  return {
    hours: getHours(timeInSeconds, pad),
    minutes: getMinutes(timeInSeconds, pad),
    seconds: getSeconds(timeInSeconds, pad),
  }
}

/**
 * @desc Set pad to numbers
 * @param {Number} number
 * @returns {String}
 */
const setPad = (number) => {
  return number.toString().padStart(2, '0')
}


/**
 * @desc Returns time in <99:99:99> format
 * @param {Number} timeInSeconds
 * @returns {String}
 */
export const getTime = (timeInSeconds) => {
  const { hours, minutes, seconds } = getTimeObject(timeInSeconds, true)
  return `${hours}:${minutes}:${seconds}`
}

/**
 * @desc Return time in <9 hours and 9 minutes> format
 * @param {Number} timeInSeconds
 * @returns {String}
 */
export const getLongTime = (timeInSeconds) => {
  const { hours, minutes } = getTimeObject(timeInSeconds)

  const hourStr = hours ? hours + ' ' + i18n.t(`global:hour${hours > 1 ? 's' : ''}`) : null
  const minuteStr = minutes ? minutes + ' ' + i18n.t(`global:minutes.min`) : null
  const andSeparator = hourStr && minuteStr ? i18n.t('global:and') : ''

  return `${hourStr || ''} ${andSeparator} ${minuteStr || ''}`.toLowerCase()
}
