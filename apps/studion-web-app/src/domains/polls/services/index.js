import { http } from '@/support/http'

export const removePollQuestion = (pollQuestionId) =>
  http.delete(`polls/questions/${pollQuestionId}`)

export const createPollQuestion = (data, multipleSessions = false) => {
  const questionForm = new FormData() // eslint-disable-line no-undef
  const {
    poll_id, // eslint-disable-line camelcase
    description,
    image,
    use_image, // eslint-disable-line camelcase
    multiples_choices, // eslint-disable-line camelcase
    allow_comments, // eslint-disable-line camelcase
    scheduled,
    start_time, // eslint-disable-line camelcase
    end_time, // eslint-disable-line camelcase
    choices,
  } = data

  if (multipleSessions) {
    data.sessionsIds.forEach((obj, index) => {
      questionForm.append(`sessionsIds[${index}]`, obj)
    })
  }

  if (!multipleSessions) questionForm.append('poll_id', poll_id)
  questionForm.append('description', description)

  if (use_image) questionForm.append('image', image, image.name) // eslint-disable-line camelcase

  questionForm.append('use_image', Number(use_image))
  questionForm.append('multiples_choices', Number(multiples_choices))
  questionForm.append('allow_comments', Number(allow_comments))
  questionForm.append('scheduled', Number(scheduled))
  questionForm.append('start_time', start_time)
  questionForm.append('end_time', end_time)

  choices.forEach((obj, index) => {
    questionForm.append(`choices[${index}][description]`, obj.description)
    questionForm.append(`choices[${index}][position]`, index + 1)
  })

  return http.post(
    !multipleSessions ? 'polls/questions' : 'my-management/polls/create-multiple-sessions',
    questionForm,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )
}

export const updatePollQuestion = (questionId, data) => {
  const imageForm = new FormData() // eslint-disable-line no-undef
  let promises = [
    http.put(`polls/questions/${questionId}`, data)
  ]

  if (data.use_image && data.image) {
    imageForm.append('question_id', questionId)
    imageForm.append('image', data.image, data.image.name)

    promises.push(http.post('polls/questions/image', imageForm))
  }

  data.image = null

  return Promise.all(promises)
}
