import * as TYPES from './mutations-types'
import * as services from '../services'

import i18n from '@/support/i18n'

export const attempSaveCoursePreferences = async ({ rootState, commit }, preferences) => {
  const displayPreferences = rootState.Settings.display_preferences ? rootState.Settings.display_preferences : {}
  displayPreferences.solutions_list = preferences
  const response = await services.setCourseListPreferences(displayPreferences, rootState.set)
  commit(TYPES.SET_DISPLAY_PREFERENCES, response.data.display_preferences)
}

export const attemptCourseListRetrieval = ({ commit }, params = {}) => {
  return services.getCourses(params)
    .then(response => {
      commit(TYPES.SET_ALL, response.data)
      return response
    })
}

export const attemptCourseRetrieval = ({ commit }, { courseId, params }) => {
  return services.getCourse(courseId, params).then(response => {
    commit(TYPES.SET_CURRENT, response.data)

    return response
  })
}

export const attemptCourseDependencies = (_, { courseId, justNotPublishedOfferings = false }) => {
  return services.getCourseDependencies(courseId, justNotPublishedOfferings)
}

export const attemptCourseCreation = (_, data) => {
  const savedPromise = services.createCourse(data)

  return savedPromise
}

export const attemptCourseUpdate = (_, { courseId, data }) => {
  const updateRequests = [
    services.updateCourse(courseId, data)
  ]

  if (data.image) {
    updateRequests.push(services.updateCourseImage(courseId, data))
  }

  return Promise.all(updateRequests)
    .then(result => result[0])
}

export const attemptCourseSaveAvailableTools = (_, { courseId, data }) => {
  return services.saveAvailableTools(courseId, data)
}

export const attemptCourseActivateToggle = (_, courseId) => {
  let ret = services.activateCourseToggle(courseId)
  return ret
}

export const toggleCourseStatusOnFront = ({ commit }, courseId) => {
  commit(TYPES.ACTIVATE_TOGGLE, courseId)
}

export const attemptCourseRemoval = (_, courseId) => {
  const savedPromise = services.removeCourse(courseId)

  return savedPromise
}

export const attemptCourseDuplicate = (_, { courseId, language }) => {
  return services.duplicateCourse(courseId, language)
}

export const attemptTypesRetrieval = () => {
  return services.getTypes()
}

export const attemptTopicCreation = ({ dispatch }, payload) => {
  dispatch('setFetching', true)
  const promise = services.createTopic(payload)
  promise.then(() => {
    payload.isTopicTemplate
      ? dispatch('setFeedback', { message: i18n.t('solutions.create.topicsTemplates:feedback.create.success') })
      : dispatch('setFeedback', { message: i18n.t('solutions.create.classes:feedback.create.success') })
  }).finally(() => {
    dispatch('setFetching', false)
  })

  return promise
}

export const attemptTopicCompetencyCreation = ({ dispatch }, payload) => {
  dispatch('setFetching', true)
  const requestPromise = services.createCompetencyTopic(payload)

  requestPromise
    .then(() => {
      dispatch('setFeedback', {
        message: i18n.t('solutions.create.classes:feedback.create.success'),
      })
    })
    .finally(() => {
      dispatch('setFetching', false)
    })

  return requestPromise
}

export const attemptGetTopicCompetency = (_, topicId) => {
  return services.getCompetencyTopic(topicId)
}

export const attemptTopicToggle = (_, topicId) => {
  return services.topicToggle(topicId)
}

export const attemptTopicRetrieval = (_, topicId) => {
  return services.getTopic(topicId)
}

export const attemptTopicsRetrieval = ({ commit }, data) => {
  return services.getTopics(data).then(response => {
    commit(TYPES.SET_CURRENT_TOPICS, response.data)
    return response
  })
}

export const attemptTopicsAssetsStatusRetrieval = (_, courseId) => {
  return services.getTopicsAssetsStatus(courseId)
}

export const attemptTopicExamination = (_, topicId) => {
  return services.getTopicExamination(topicId)
}

export const attemptPreProjects = (_, id) => {
  return services.getPreProjects(id)
}

export const attemptTopicResearchRetrieval = (_, topicId) => {
  return services.getResearch(topicId)
}

export const attemptTopicRemoval = (_, topicId) => {
  return services.removeTopic(topicId)
}

export const attemptTopicUpdate = ({ dispatch }, payload) => {
  dispatch('setFetching', true)
  const promise = services.updateTopic(payload)

  promise
    .then(() => {
      dispatch('setFeedback', {
        message: i18n.t('solutions.create.classes:feedback.update.success'),
      })
    })
    .finally(() => {
      dispatch('setFetching', false)
    })

  return promise
}

export const attemptUpdateTopicOrder = ({ dispatch }, payload) => {
  dispatch('setFetching', true)
  const promise = services.updateTopicOrder(payload)

  promise.finally(() => {
    dispatch('setFetching', false)
  })

  return promise
}

export const attemptUserCoursesRetrieval = (_, params = {}) => {
  return services.getUserCourses(params)
}

export const attemptAssetsTypesRetrieval = ({ dispatch, commit }) => {
  dispatch('setFetching', true)
  return services.getAssetsTypes()
    .then(({ data }) => {
      const assetTypeOptions = data.map(assetType => {
        const slug = assetType.name.toLowerCase().replace(/ /g, '_')
        const translateKey = assetType.name.toLowerCase().replace(/ /g, '.')

        return {
          slug,
          text: i18n.t(`solutions.create.classes:modal.file.type.${translateKey}`).toUpperCase(),
          value: assetType.id
        }
      })

      commit(TYPES.SET_ASSET_TYPES_OPTIONS, assetTypeOptions)
    })
    .finally(() => dispatch('setFetching', false))
}

export const attemptResearchQuestionsRemoval = (_, data) => {
  return services.removeResearchQuestions(data)
}

export const attemptExaminationQuestionsRemoval = (_, data) => {
  return services.removeExaminationQuestions(data)
}

export const attemptConditionsRetrieval = () => {
  return services.retrieveConditions()
}

export const attemptCourseCustomRuleCreation = (_, { courseId, courseType, ruleType, conditionsIds }) => {
  const currentRule = {
    typeAlias: ruleType,
    conditionsIds: conditionsIds,
    statusTrueAlias: courseType && courseType === 'hybrid' ? 'realizado' : 'aprovado',
    statusFalseAlias: 'em_andamento'
  }

  return services.createCourseCustomRule(courseId, currentRule)
}

export const attemptCheckAvailableSpace = () => {
  return services.checkAvailableSpace()
}

export const fetchTopicTemplate = ({ dispatch }, topicTemplateId) => {
  dispatch('setFetching', true)
  return services.getTopicTemplate(topicTemplateId)
    .finally(() => dispatch('setFetching', false))
}

export const attemptBindTopicsTemplates = async ({ dispatch }, { courseId, data }) => {
  dispatch('setFetching', true)
  const response = await services.bindTopicsTemplates(courseId, data)
  dispatch('setFetching', false)
  dispatch('attemptTopicsRetrieval', { courseId })
  return response
}

export const deleteTopicTemplate = ({ dispatch }, topicTemplateId) => {
  dispatch('setFetching', true)

  return services.deleteTopicTemplate(topicTemplateId)
    .finally(() => dispatch('setFetching', false))
}

export const solutionListResource = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_SOLUTIONS_LIST, data.fromCache)
    return
  }
  let response = await services.getCourses(data.params)
  commit(TYPES.SET_SOLUTIONS_LIST, response.data.data)
  return response.data
}

export const topicsTemplatesResources = async ({ commit }, data) => {
  if (data.fromCache) {
    return commit(TYPES.SET_TOPICS_TEMPLATES, data.fromCache)
  }

  let response = await services.getTopicsTemplates(data.params)
  commit(TYPES.SET_TOPICS_TEMPLATES, response.data.data)

  return response.data
}

export const attemptAddNewScormVersion = async (_, data) => {
  const assetId = data.assetId
  delete data.assetId
  return services.addNewScormVersion(assetId, data)
}

export const attemptUploadExaminationFiles = (_, files) => {
  return services.uploadExaminationFiles(files)
}

export const attemptStartExamination = (_, { topicId, enrollmentId }) => {
  return services.postStartExamination(topicId, enrollmentId)
}

export const attemptGetDeadline = (_, data) => {
  return services.getDeadline(data)
}

export const attemptExaminationDrafts = (_, { topicId, examinationId, enrollmentId, attempt }) => {
  return services.getExaminationDrafts(examinationId, topicId, enrollmentId, attempt)
}

export const attemptSaveDraftExamination = (_, data) => {
  return services.saveDraftExamination(data)
}

export const attemptAggregateExaminationAnswers = (_, { examinationId, enrollmentId }) => {
  return services.getAggregateExaminationAnswers(examinationId, enrollmentId)
}

export const attemptExaminationQuestionFileQuota = async ({ commit, state }) => {
  const filesQuotaCache = state.examinationFilesQuota
  if (filesQuotaCache) return filesQuotaCache

  const { data } = await services.getExaminationQuestionFileQuota()
  commit(TYPES.SET_EXAMINATION_FILE_QUOTA, data)

  return data
}

export const getCoursesListResource = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_COURSE_LIST, data.fromCache)
    return
  }

  let response = await services.coursesList(data)

  commit(TYPES.SET_COURSE_LIST, response.data.data)
  return response.data
}

export const getQuestionTemplateGroups = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_QUESTION_TEMPLATES, data.fromCache)
    return
  }

  let response = await services.getQuestionTemplateGroups(data)

  commit(TYPES.SET_QUESTION_TEMPLATES, response.data.data)
  return response.data
}

export const attemptGetQuestionTemplateGroupSummary = () => {
  return services.getQuestionTemplateGroupSummary().then((response) => {
    return Object.values(response.data)
  })
}

export const attemptGetQuestionTemplateGroup = ({ dispatch }, id) => {
  dispatch('setFetching', true)
  return services.getQuestionTemplateGroup(id).finally(() => {
    dispatch('setFetching', false)
  })
}

export const attemptCreateQuestionTemplateGroup = ({ dispatch }, data) => {
  dispatch('setFetching', true)
  return services.createQuestionTemplateGroup(data).finally(() => {
    dispatch('setFetching', false)
  })
}

export const attemptEditQuestionTemplateGroup = ({ dispatch }, data) => {
  dispatch('setFetching', true)
  return services.editQuestionTemplateGroup(data).finally(() => {
    dispatch('setFetching', false)
  })
}

export const attemptDeleteQuestionTemplateGroup = ({ dispatch }, id) => {
  dispatch('setFetching', true)
  return services.deleteQuestionTemplateGroup(id).finally(() => {
    dispatch('setFetching', false)
  })
}

export const attemptToggleStatusQuestionTemplateGroup = ({ dispatch }, id) => {
  dispatch('setFetching', true)
  return services.toggleStatusQuestionTemplateGroup(id).finally(() => {
    dispatch('setFetching', false)
  })
}

export const getQuestionTemplateGroupQuestions = async ({ commit }, data) => {
  if (data.fromCache) {
    commit(TYPES.SET_QUESTION_TEMPLATES_QUESTIONS, data.fromCache)
    return
  }

  let response = await services.getQuestionTemplateGroupsQuestions(data)

  commit(TYPES.SET_QUESTION_TEMPLATES_QUESTIONS, response.data.data)
  return response.data
}

export const attemptGetQuestionTemplateGroupQuestion = ({ dispatch }, { groupId, questionId }) => {
  dispatch('setFetching', true)
  return services.getQuestionTemplateGroupQuestion(groupId, questionId).finally(() => {
    dispatch('setFetching', false)
  })
}

export const attemptCreateQuestionTemplateGroupQuestion = ({ dispatch }, { groupId, data }) => {
  dispatch('setFetching', true)
  return services.createQuestionTemplateGroupQuestion(groupId, data).finally(() => {
    dispatch('setFetching', false)
  })
}

export const attemptEditQuestionTemplateGroupQuestion = ({ dispatch }, { groupId, data }) => {
  dispatch('setFetching', true)
  return services.editQuestionTemplateGroupQuestion(groupId, data).finally(() => {
    dispatch('setFetching', false)
  })
}

export const attemptDeleteQuestionTemplateGroupQuestion = ({ dispatch }, { groupId, id }) => {
  dispatch('setFetching', true)
  return services.deleteQuestionTemplateGroupQuestion(groupId, id).finally(() => {
    dispatch('setFetching', false)
  })
}