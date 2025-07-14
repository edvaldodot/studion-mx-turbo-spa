const compareByPosition = (a, b) => {
  if (a.position > b.position) return 1
  else if (a.position < b.position) return -1
  else return 0
}

const compareByFirstItem = (a, b) => {
  if (a[0] > b[0]) return 1
  else if (a[0] < b[0]) return -1
  else return 0
}

export const fillGap = (item, data) => {
  let answer = []
  let feedbackType = null
  let isRight = []
  let rightText = []
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
      if (!item.annulled && ans.answer) {
        answer.get(ans.choice.item.position).push({
          answer: ans.answer,
          position: ans.choice.position,
          right: ans.result === 'correct',
          correctAnswer: ans.choice.description,
        })
      }
    })
    answer.forEach((value, key) => {
      let sorted = answer.get(key).sort(compareByPosition)
      answer.set(key, sorted)
    })

    answer = [...answer.entries()].sort(compareByFirstItem).map((ans) => ans[1])

    let auxAnswer = []
    answer.forEach((val) => {
      isRight.push(val.map((ans) => ans.right))
      auxAnswer.push(val.map((ans) => ans.answer))
      rightText.push(val.map((ans) => ans.correctAnswer))
    })
    answer = auxAnswer
  }
  return {
    answer: answer,
    feedbackType: feedbackType,
    rightItems: isRight,
    rightText,
    answered: true,
  }
}
