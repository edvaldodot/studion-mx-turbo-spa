const trueOrFalse = (value) => {
  return value.choice.choice_id.every(id => id)
}

const fillGap = (value, question) => {
  if (value.some(item => {
    return item.some(val => val === '')
  })) return false
  return question.choices.length === value.reduce((prev, curr) => prev + curr.length, 0)
}

const multipleChoices = (value) => {
  return value.choice.choice_id !== null
}

const multipleChoicesMultiAnswers = (value) => {
  return !!(value.choice.choice_id && value.choice.choice_id.length > 0)
}

const discursive = (value) => {
  return !!(value.answer && (value.answer.length > 0))
}

export const validateQuestionFilled = {
  true_or_false: trueOrFalse,
  fill_gap: fillGap,
  multiple_choices: multipleChoices,
  multiple_choices_multi_answers: multipleChoicesMultiAnswers,
  discursive
}
