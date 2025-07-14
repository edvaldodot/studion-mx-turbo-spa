/**
 * @typedef {Object} MediationObject
 * @property {string} transmissionType
 */

/**
 * @param {MediationObject} nestedModel
 */
export const isEmailOrSms = (nestedModel) => {
  const isEmail = nestedModel.transmissionType === 'email'
  const isSms = nestedModel.transmissionType === 'sms'
  return isEmail || isSms
}
