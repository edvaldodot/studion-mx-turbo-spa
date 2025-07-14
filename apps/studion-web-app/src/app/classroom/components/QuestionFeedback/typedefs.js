/**
 * @typedef {'wrong' | 'correct' | 'incorrect' | 'partial' | 'partial-multi'} FeedbackTypes
 */

/**
 * @typedef Answers
 * @property {FeedbackTypes} result
 */

/**
 * @typedef Question
 * @property {Answers} answers
 * @property {'correct' | 'wrong'} feedbackType
 * @property {string} rightFeedback
 * @property {string} wrongFeedback
 */
