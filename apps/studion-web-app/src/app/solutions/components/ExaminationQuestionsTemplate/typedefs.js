/**
 * @typedef {Object} Level
 * @property {number} level
 * @property {number} questions
 * @property {number} scorePerQuestion
 */

/**
 * @typedef {Object} QuestionTemplate
 * @property {number|string} id
 * @property {Level[]} levels
 * @property {Object[]} template - selected template with name and id
 * @property {Object[]} levelOptions - selected template with name and id
 */