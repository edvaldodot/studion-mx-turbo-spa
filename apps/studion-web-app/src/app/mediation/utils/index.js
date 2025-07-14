export * from './checkers'
export * from './validators'

/**
 * @typedef {Object} ApiMediationObject
 * @property {Object} actions
 * @property {Array} attachments
 * @property {Number} daysSinceReferenceDate
 * @property {Object} filter
 * @property {Number} id
 * @property {String} message
 * @property {Object} meta
 * @property {String} referenceDate
 * @property {String} title
 * @property {String} transmissionType
 */

/**
 * Handler to create a list of Mediation object's.
 * @param {ApiMediationObject[]} mediationData
 */
export function handleMediationData(mediationData) {
  return mediationData.map((config) => {
    const mediation = {
      ...config,
      tempFile: null,
      tempMediaFile: null,
      files: config.attachments,
      isHidden: mediationData.length > 1,
      daysSinceReferenceDate: Math.abs(config.daysSinceReferenceDate),
      period: config.daysSinceReferenceDate >= 0 ? 'after' : 'before',
    }

    if (config.filter && typeof config.filter.id === 'number') {
      mediation.filterId = config.filter.id
    }

    if (mediation.meta) {
      setupMediationMeta(mediation)
    }

    return mediation
  })
}

/**
 * Realize the setup of meta object inside mediation.
 * @param {ApiMediationObject} mediation
 */
function setupMediationMeta(mediation) {
  const meta = mediation.meta
  meta.transmissionType = mediation.transmissionType
  meta.multipleSessions = meta.isMultiple

  if (typeof meta.startTime === 'string') return
  meta.startTime = getCorrectTimeWithMinutes(meta.startTime)
  meta.endTime = getCorrectTimeWithMinutes(meta.endTime)
}

function getCorrectTimeWithMinutes(hour) {
  if (hour === null) return null
  return String(hour).padStart(2, '0') + ':00'
}
