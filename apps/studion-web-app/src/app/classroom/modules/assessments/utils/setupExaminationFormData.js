const choiceQuestions = (formData, question) => {
  formData.answers.push({ question_id: question.id, choice_id: question.answer.choice.choice_id })
  return formData
}

const association = (formData, question) => {
  formData.answers.association = []
  let association = question.items.map((item, index) => {
    return {
      choice_id: question.itemsAnswer[index] ? question.itemsAnswer[index].toString() : null,
      item_id: item.id.toString()
    }
  })
  formData.answers.push({
    question_id: question.id,
    association
  })
  return formData
}

const fillGap = (formData, question) => {
  let itemsId = question.items.map(item => item.id)
  let answersFinal = []
  question.answer.forEach((answer, index) => {
    answer.forEach((gap, gapIndex) => {
      answersFinal.push({ position: gapIndex + 1, item_id: itemsId[index], answer: gap.trim() })
    })
  })
  formData.answers.push({ question_id: question.id, answer: answersFinal })
  return formData
}

const discursive = (formData, question) => {
  formData.answers.push({ question_id: question.id, answer: question.answer.answer })
  return formData
}

const sendFile = (formData, question) => {
  formData.answers.push({
    question_id: question.id,
    'send_file': {
      answer: question.answer.answer,
      files: question.files
    }
  })
  return formData
}

export const setupFormData = {
  multiple_choices: choiceQuestions,
  multiple_choices_multi_answers: choiceQuestions,
  true_or_false: choiceQuestions,
  fill_gap: fillGap,
  association,
  send_file: sendFile,
  discursive
}
