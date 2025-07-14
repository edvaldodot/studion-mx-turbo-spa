export const mountTopicPayload = (data, saveAsTopicTemlate, isListContextUpdate) => {
  if (data.questions) {
    data.questions = data.questions.map((question) => {
      if (question.type !== 'fill_gap') return question
      delete question.choices
      question.items = question.items.map((item, index) => {
        item.position = index + 1
        return item
      })
      return question
    })
  }
  let payload = {
    id: data.id,
    course_id: data.courseId,
    name: data.name,
    description: data.description,
    mandatory: saveAsTopicTemlate ? data.mandatory : Number(data.mandatory),
    type: data.type,
    active: data.active,
    is_block_advancement_button: data.isBlockAdvancementButton,
  }

  if (data.type === 'class') {
    payload = {
      ...payload,
      assets: data.assets,
    }

    if (data.workloadValue) {
      payload.workloadValue = Number(data.workloadValue)
    }
  }

  if (data.type === 'examination') {
    payload = {
      ...payload,
      examination: {
        blockNewAttempts: Boolean(data.blockNewAttempts),
        questions: data.questions,
        examinationTypeEnum: data.examinationTypeEnum,
        examination_id: data.examinationId,
        mandatory: saveAsTopicTemlate ? data.hasMinimalGrade : Number(data.hasMinimalGrade),
        tries: data.tries,
        minimalGrade: data.minimalGrade,
        feedbackInclude: data.feedbackInclude,
        restrict_progress: data.restrictProgress,
        randomOrder: data.randomOrder,
        randomOrderChoices: data.randomOrderChoices,
        gradeFormat: data.gradeFormat,
        gradeVisibility: data.gradeVisibility,
        disableCopy: data.disableCopy,
        disableCut: data.disableCut,
        disablePaste: data.disablePaste,
        showHistoryTries: data.tries !== 1 && data.showHistoryTries,
        examDeadline: data.examDeadline,
        slug: data.slug || '',
        isPreProject: data.isPreProject,
        aggregateExaminationId: data.aggregateExaminationId,
        isRecovery: data.isRecovery,
      },
    }

    if (data.examinationTypeEnum === 'question_template_random') {
      delete payload.examination.questions
      payload.examination.questionTemplateGroupMeta = data.questionTemplateGroupMeta.map(
        ({ id, levels }) => ({
          id,
          levels: levels.map(({ level, questions, scorePerQuestion }) => ({
            level,
            questions,
            scorePerQuestion,
          })),
        })
      )
    }
  }

  if (data.type === 'research') {
    payload = {
      ...payload,
      research: {
        questions: data.questions,
        research_id: data.researchId,
      },
    }
  }

  if (data.type === 'competency' && data.competency) {
    payload = {
      ...payload,
      competency: {
        id: data.competency.id,
        title: data.name,
        description: data.description,
        questions: data.competency.questions,
      },
    }
  }

  if (isListContextUpdate) {
    if (data.position) {
      payload = {
        ...payload,
        position: data.position,
      }
    }

    if (data.prerequisiteId || data.prerequisiteId === null) {
      payload = {
        ...payload,
        prerequisite_id: data.prerequisiteId,
      }
    }

    if (data.type === 'examination') {
      delete payload.examination
    }
  }

  return payload
}

export const clearDataTopic = (data, saveAsTopicTemplate = false) => {
  if (saveAsTopicTemplate) {
    if (data.type === 'examination') {
      for (let key in data.questions) {
        delete data.questions[key].question_id
      }
    }
  }

  if (data.description && data.description.length < 1) {
    delete data.description
  }

  return data
}
