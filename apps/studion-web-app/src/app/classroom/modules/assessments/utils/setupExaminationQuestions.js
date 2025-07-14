import i18n from '@/support/i18n'

const SHOW_FEEDBACK_STATUS = ['passed', 'awaiting_correction', 'retake']

const compareByFirstItem = (a, b) => {
  if (a[0] > b[0]) return 1
  else if (a[0] < b[0]) return -1
  else return 0
}

const compareByPosition = (a, b) => {
  if (a.position > b.position) return 1
  else if (a.position < b.position) return -1
  else return 0
}

function getFeedbackType(correction) {
  const result = correction && correction.afterRevision && correction.afterRevision.result
  const feedbackType = result && result === 'incorrect' ? 'wrong' : result
  return feedbackType || null
}

const manualCorrectionSetup = (item, answer) => {
  if (item.manualCorrection && item.correction) {
    answer.history = item.correction

    const lastCorrection = item.correction[item.correction.length - 1]
    item.feedbackType = getFeedbackType(lastCorrection)
    answer.grade = lastCorrection ? lastCorrection.afterRevision.grade : null
  }

  if (item.type === 'fill_gap' && !item.correction) {
    item.feedbackType = null
    item.correction = []
  }
}

const feedbackSetup = (item, answer) => {
  let feedbackType = null
  let grade = null
  if (answer.history) {
    const lastHistory = answer.history[answer.history.length - 1]
    feedbackType = getFeedbackType(lastHistory)
    grade = lastHistory ? lastHistory.afterRevision.grade : null
  }
  return [feedbackType, grade]
}

const discursive = (feedbackType, answer, isRight, item, data, answered, status) => {
  let [parsedFeedbackType, parsedGrade] = feedbackSetup(item, answer)
  answer.grade = parsedGrade
  if (SHOW_FEEDBACK_STATUS.includes(status) && !parsedFeedbackType) {
    parsedFeedbackType = null
  }
  return Object.assign(
    { answer: answer, feedbackType: parsedFeedbackType, rightItems: isRight, answered },
    item
  )
}

const sendFile = (feedbackType, answer, isRight, item, data, answered, status) => {
  let [parsedFeedbackType, parsedGrade] = feedbackSetup(item, answer)
  answer.grade = parsedGrade
  if (SHOW_FEEDBACK_STATUS.includes(status) && !parsedFeedbackType) {
    parsedFeedbackType = null
  }
  return Object.assign(
    {
      answer: answer,
      feedbackType: parsedFeedbackType,
      rightItems: isRight,
      answered,
      modelFiles: item.files,
    },
    item,
    { files: [] }
  )
}

const multipleChoices = (feedbackType, answer, isRight, item, data, answered, status) => {
  if (answer.choice) {
    answer.choice.choice_id = answer.choice.id
    feedbackType = answer.choice.right ? 'correct' : 'wrong'
  } else {
    answer.choice = { choice_id: null }
  }

  if (SHOW_FEEDBACK_STATUS.includes(status) && !feedbackType && !item.manualCorrection) {
    feedbackType = 'wrong'
  }

  manualCorrectionSetup(item, answer)
  return Object.assign(
    { answer: answer, feedbackType: feedbackType, rightItems: isRight, answered },
    item
  )
}

const trueOrFalse = (feedbackType, answer, isRight, item, data, answered, status) => {
  item.answer = { choice: { choice_id: [] } }
  let rightQuestions = 0

  item.items.forEach((questionItem) => {
    if (!answer.choice) item.answer.choice.choice_id.push(null)
    else {
      data.answers.forEach((userAnswer) => {
        if (!(userAnswer.question.id === item.id)) return
        if (userAnswer.choice.item && userAnswer.choice.item.id === questionItem.id) {
          if (userAnswer.choice.right) rightQuestions++
          item.answer.choice.choice_id.push(userAnswer.choice.id)
        }
      })
    }

    questionItem.options = item.choices
      .filter((choice) => {
        if (questionItem && questionItem.id && questionItem.id === choice.item.id) return choice
      })
      .map((option) => {
        return {
          label: i18n.t(`global:${option.label}`),
          value: option.value,
        }
      })

    if (!questionItem.options.length) {
      questionItem.options = [
        {
          label: i18n.t(`global:true`),
          value: 1,
        },
        {
          label: i18n.t(`global:false`),
          value: 0,
        },
      ]
    }
  })

  if (data.answers) {
    data.answers.forEach((dataAnswer) => {
      if (
        dataAnswer.choice &&
        dataAnswer.question.type === 'true_or_false' &&
        SHOW_FEEDBACK_STATUS.includes(status)
      ) {
        const idx = dataAnswer.question.choices.findIndex(
          (choice) => choice.id === dataAnswer.choice.id
        )
        if (idx) item.answer.choice.choice_id[Math.floor(idx / 2)] = dataAnswer.choice.id
      }
    })
  }

  if (rightQuestions === item.items.length) {
    feedbackType = 'correct'
  } else if (rightQuestions > 0) {
    feedbackType = 'partial-multi'
  } else {
    feedbackType = 'wrong'
  }

  manualCorrectionSetup(item, item.answer)
  return Object.assign(
    { answer: answer, feedbackType: feedbackType, rightItems: isRight, answered },
    item
  )
}

const multipleChoicesMultiAnswer = (
  feedbackType,
  answer,
  isRight,
  item,
  data,
  answered,
  status
) => {
  item.choices.forEach((choice) => {
    if (!choice.value) {
      if (choice.description) choice.label = choice.description.replace(/(?:\r\n|\r|\n)/g, '<br />')
      choice.value = choice.id
      choice.correct = choice.right

      delete choice.description
    }
  })

  if (!answer.choice) {
    answer.choice = { choice_id: null }
  }

  let correctAlternatives = []
  let userRightAnswers = []
  let markedCount = 0

  if (data.answers && data.answers.length) {
    answer.choice.choice_id = data.answers.map((answer) => {
      if (answer.question.id === item.id) {
        if (!answer.choice) return
        if (answer.choice.right) correctAlternatives.push(answer.choice.right)

        if (answer.marked) {
          markedCount++
          if (answer.choice.right) userRightAnswers.push(answer.choice.id)
          if (answer.choice.id) return answer.choice.id.toString()
        }
      }
    })
    const wrongMarked = markedCount !== userRightAnswers.length
    if (userRightAnswers.length === correctAlternatives.length && !wrongMarked) {
      feedbackType = 'correct'
    } else if (userRightAnswers.length > 0 && !wrongMarked) {
      feedbackType = 'partial-multi'
    } else {
      feedbackType = 'wrong'
    }
  }

  if (
    SHOW_FEEDBACK_STATUS.includes(status) &&
    !userRightAnswers.length &&
    !correctAlternatives.length &&
    !item.manualCorrection
  ) {
    feedbackType = 'wrong'
  }

  manualCorrectionSetup(item, answer)
  return Object.assign(
    { answer: answer, feedbackType: feedbackType, rightItems: isRight, answered },
    item
  )
}

const association = (feedbackType, answer, isRight, item, data, answered, status) => {
  item.itemsAnswer = []

  item.itemOptions = null
  item.itemOptions = item.choices.map((choice, index) => {
    item.itemsAnswer.push(null)
    return {
      text: index + 1,
      value: choice.id,
    }
  })

  let rightAnswers = 0

  if (data.answers && data.answers.length) {
    const itemsIndex = item.items.map((item) => item.id)
    data.answers.forEach((answer) => {
      if (!item.annulled && item.id === answer.question.id && answer.choice) {
        item.itemsAnswer[itemsIndex.indexOf(parseInt(answer.answer))] = answer.choice.id
        if (parseInt(answer.answer) === answer.choice.item.id) rightAnswers++
      }
    })

    if (
      answer.question &&
      answer.question.choices &&
      rightAnswers === answer.question.choices.length
    ) {
      feedbackType = 'correct'
    } else if (rightAnswers > 0) {
      feedbackType = 'partial-multi'
    } else {
      feedbackType = 'wrong'
    }
  }

  if (SHOW_FEEDBACK_STATUS.includes(status) && rightAnswers === 0 && !item.manualCorrection) {
    feedbackType = 'wrong'
  }

  manualCorrectionSetup(item, answer)
  return Object.assign(
    { answer: answer, feedbackType: feedbackType, rightItems: isRight, answered },
    item
  )
}

const fillGap = (feedbackType, answer, isRight, item, data, answered) => {
  answer = []
  if (data.answers) {
    let itemAnswers = data.answers.filter((ans) => ans.question.id === item.id)
    let rightAnswers = itemAnswers.reduce((prev, current) => {
      if (current.result === 'correct') return prev + 1
      else return prev
    }, 0)
    if (rightAnswers === item.choices.length) {
      feedbackType = 'correct'
    } else if (rightAnswers > 0) {
      feedbackType = 'partial'
    } else {
      feedbackType = 'wrong'
    }
    answer = new Map()

    item.items.forEach((questionItem) => {
      answer.set(questionItem.position, [])
    })
    itemAnswers.forEach((ans) => {
      if (!item.annulled && ans.choice) {
        answer.get(ans.choice.item.position).push({
          answer: ans.answer,
          position: ans.choice.position,
          right: ans.result === 'correct',
        })
      }
    })
    answer.forEach((value, key) => {
      let sorted = answer.get(key).sort(compareByPosition)
      answer.set(key, sorted)
    })

    answer = [...answer.entries()].sort(compareByFirstItem).map((ans) => ans[1])

    isRight = []
    let auxAnswer = []
    answer.forEach((val) => {
      isRight.push(val.map((ans) => ans.right))
      auxAnswer.push(val.map((ans) => ans.answer))
    })
    answer = auxAnswer
  }
  manualCorrectionSetup(item, answer)
  return Object.assign(
    { answer: answer, feedbackType: feedbackType, rightItems: isRight, answered },
    item
  )
}

export const getQuestionAnswer = (data, item) => {
  let answer = { choice: null }
  if (data.answers && data.answers.length > 0) {
    let answered = data.answers.filter((answer) => {
      return answer.question.id === item.id
    })
    if (answered) {
      answer = answered[0]
    }
  }
  return answer
}

const SETUP_QUESTIONS = {
  multiple_choices: multipleChoices,
  true_or_false: trueOrFalse,
  multiple_choices_multi_answers: multipleChoicesMultiAnswer,
  association,
  fill_gap: fillGap,
  send_file: sendFile,
  discursive,
}

export const mapQuestion = (data, status) => (item) => {
  item.statement = item.statement.replace(/(?:\r\n|\r|\n)/g, '<br />')

  if (item.type !== 'association') {
    let choices = item.choices.map((itemChoice) => {
      return {
        label: itemChoice.label || itemChoice.description.replace(/(?:\r\n|\r|\n)/g, '<br />'),
        value: itemChoice.value || itemChoice.id,
        correct: itemChoice.correct || itemChoice.right,
        item: itemChoice.item,
      }
    })
    item.choices = choices
  }

  let isRight = null
  let feedbackType = null
  let answer = {
    choice: null,
  }
  let hasAnswer = false
  if (data.answers && data.answers.length) {
    let answered = data.answers.filter((answer) => {
      return answer.question.id === item.id
    })
    hasAnswer = !!(answered && answered.length)
    if (hasAnswer) {
      answer = answered[0]
    }
  }
  if (answer.result || answer.answer) {
    feedbackType = false
    if (answer.result !== null) {
      feedbackType = answer.result === 'incorrect' ? 'wrong' : answer.result
    }

    if (!feedbackType && answer.history) {
      feedbackType = getFeedbackTypeFromHistory(answer.history)
    }
  } else {
    answer.answer = null
  }
  return SETUP_QUESTIONS[item.type](feedbackType, answer, isRight, item, data, hasAnswer, status)
}

/**
 * @param {Object[]} history
 */
const getFeedbackTypeFromHistory = (history) => {
  const historyLength = history && history.length
  const lastRevision = historyLength && history[historyLength - 1]
  const result = lastRevision && lastRevision.afterRevision && lastRevision.afterRevision.result
  return result === 'incorrect' ? 'wrong' : result
}
