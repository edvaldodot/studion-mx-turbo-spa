import { http, plutonHttp } from '@/support/http'
import { parse, parseToFormData } from '@/support/payloadParser'
import { objectToFormData } from '@/support/utils/objectToFormData'
import { source } from '@/support/utils/source'
import { createQuery } from '@/support/utils/paginatorQueryBuilder'
import { clearDataTopic, mountTopicPayload } from '../helpers/topicHelper'

export const getCourses = (params) => {
  let requestUrl = 'courses?'
  if (params && params.activeOnly) {
    if (!Array.isArray(params.filter)) {
      params.filter = []
    }
    params.filter.active = 1
  }

  if (params && 'allCoursesRead' in params) {
    if (!Array.isArray(params.filter)) {
      params.filter = []
    }
    params.filter.all_courses_read = 0
  }

  return http.get(`${requestUrl}${createQuery(params, true)}`, { cancelToken: source.token })
}

export const getCourse = (courseId, params) => {
  return http.get(`courses/${courseId}?${createQuery(params)}`, { cancelToken: source.token })
}

export const getCourseDependencies = (courseId, justNotPublishedOfferings = false) => {
  let val = justNotPublishedOfferings === true ? 1 : 0
  return http.get(`courses/dependencies/${courseId}?just_not_published_offerings=${val}`)
}

export const createCourse = (data) => {
  let form = objectToFormData(data)
  form.delete('image')
  form.append('image', data.image, data.image.name + '.jpg')
  return http.post('courses', form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const updateCourse = (courseId, data) => {
  data.active = Number(data.active)
  let parsedData = parse(data)

  if (!parsedData.has('categories[]') && data.hasOwnProperty('categories') === true) {
    parsedData.append('categories[]', '')
  }

  if (!parsedData.has('slug') && Object.hasOwn(data, 'slug')) {
    parsedData.append('slug', '')
  }

  return http.put(`courses/${courseId}`, parsedData)
}

export const saveAvailableTools = (courseId, data) => {
  return http.put(`courses/${courseId}/tools`, data)
}

export const updateCourseImage = (courseId, data) => {
  const form = parseToFormData(data)

  if (data.image.type === undefined) {
    return
  }

  form.append('image', data.image, data.image.name)

  return http.post(`courses/${courseId}/image`, form, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const activateCourse = (courseId) => {
  return http.put(`courses/${courseId}`, parse({ active: 1 }))
}

export const activateCourseToggle = (courseId) => {
  return http.put(`courses/${courseId}/active/toggle`)
}

export const removeCourse = (courseId) => {
  return http.delete(`courses/${courseId}`)
}

export const duplicateCourse = (courseId, language) => {
  return http.post(`courses/${courseId}/duplicate`, { language })
}

export const getTypes = () => {
  return http.get('courses/types', { cancelToken: source.token })
}

export const createTopic = ({
  formData: data,
  isTopicTemplate: saveAsTopicTemplate,
  isListContextUpdate,
}) => {
  data = clearDataTopic(data, saveAsTopicTemplate)
  data = mountTopicPayload(data, saveAsTopicTemplate, isListContextUpdate)

  let resourse = saveAsTopicTemplate ? 'topics/templates' : 'topics'
  let params = objectToFormData(data, { indices: true })

  return http.post(`${resourse}`, params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const getTopic = (topicId) => {
  return http.get(`topics/${topicId}`, { cancelToken: source.token })
}

export const getTopics = ({ courseId, params }) => {
  return http.get(`topics/courses/${courseId}?${createQuery(params)}`, {
    cancelToken: source.token,
  })
}

export const getResearch = (topicId) => http.get(`researches/topic/${topicId}`)

export const getTopicsAssetsStatus = (courseId) => {
  return http.get(`topics/course/${courseId}/assets/status`, { cancelToken: source.token })
}

export const topicToggle = (topicId) => {
  return http.put(`topics/${topicId}/toggle`)
}

export const removeTopic = (topicId) => {
  return http.delete(`topics/${topicId}`)
}

export const getTopicExamination = (topicId) => {
  return http.get(`examinations/topic/${topicId}`, { cancelToken: source.token })
}

export const updateTopic = ({
  formData: data,
  isTopicTemplate: saveAsTopicTemplate,
  isListContextUpdate,
}) => {
  data = clearDataTopic(data, saveAsTopicTemplate)
  data = mountTopicPayload(data, saveAsTopicTemplate, isListContextUpdate)

  let resourse = saveAsTopicTemplate ? 'topics/templates' : 'topics'

  return http.put(`${resourse}/${data.id}`, data)
}

export const updateTopicOrder = ({ formData: data }) => {
  return http.put(`topics/order/${data.id}`, data)
}

export const removeExaminationQuestions = (data) => {
  return http.delete('examinations/multiple/questions?' + parse(data))
}

export const removeResearchQuestions = (data) => {
  return http.delete('researches/multiple/questions?' + parse(data))
}

export const getUserCourses = (params) => {
  let requestUrl = 'myself/courses?'

  return http
    .get(`${requestUrl}${createQuery(params)}`, { cancelToken: source.token })
    .then((response) => {
      if (response.status === 200) {
        response.data.data.map((item) => {
          item.progress = null

          return item
        })
      }

      return response
    })
}

export const getAssetsTypes = () => {
  return http.get('topics/assets/types', { cancelToken: source.token })
}

export const retrieveConditions = () => {
  const validConditionsTypes = ['access', 'enrollment', 'conclusion']
  const conditionsRequests = validConditionsTypes.map((conditionType) => {
    return http.get(`rules/types/${conditionType}/conditions`, { cancelToken: source.token })
  })

  return Promise.all(conditionsRequests).then(
    ([accessConditionsResponse, enrollmentConditionsResponse, conclusionConditionsResponse]) => {
      const accessConditions = accessConditionsResponse.data || []
      const enrollmentConditions = enrollmentConditionsResponse.data || []
      const conclusionConditions = conclusionConditionsResponse.data || []

      return {
        accessConditions,
        enrollmentConditions,
        conclusionConditions,
      }
    }
  )
}

export const createCourseCustomRule = (courseId, ruleSettings) => {
  const { typeAlias, conditionsIds, statusTrueAlias, statusFalseAlias } = ruleSettings
  const requestPayload = {
    name: `Generated rule for course ${courseId}`,
    description: `This rule has been automatically generated for course ${courseId}`,
    active: 1,
    type_alias: typeAlias,
    conditions: conditionsIds,
    status_true_alias: statusTrueAlias,
    status_false_alias: statusFalseAlias,
  }
  return http
    .post('rules', objectToFormData(requestPayload, { forceEmptyArray: true }))
    .then(({ status, data }) => {
      const ruleId = status === 201 ? data.id : null

      if (!ruleId) {
        return Promise.reject(new Error('Rule not generated'))
      }

      return ruleId
    })
}

export const checkAvailableSpace = () => {
  return http.get('assets/check_space/video/B', { cancelToken: source.token })
}

export const getTopicsTemplates = (params) => {
  return http.get(`topics/templates?${createQuery(params)}`)
}

export const getTopicTemplate = (topicTemplateId) => {
  return http.get(`topics/templates/${topicTemplateId}`)
}

export const bindTopicsTemplates = (courseId, data) => {
  return http.post(`topics/templates/bind/${courseId}`, objectToFormData(data))
}

export const deleteTopicTemplate = (topicTemplateId) => {
  return http.delete(`topics/templates/${topicTemplateId}`)
}

export const setCourseListPreferences = async (data) => {
  const requestData = { display_preferences: data }
  return http.put('myself/preferences', requestData)
}

export const addNewScormVersion = async (assetId, data) => {
  const formData = objectToFormData(data)
  return http.post(`assets/${assetId}`, formData)
}

export const uploadExaminationFiles = (files) => {
  const formData = objectToFormData(files, { indices: true })
  return http.post('examinations/files', formData)
}

export const getExaminationQuestionFileQuota = () => {
  return http.get('examinations/files/quota')
}

export const coursesList = (data) => {
  let requestUrl = `courses?`

  return http.get(`${requestUrl}${createQuery(data.params, true)}`, { cancelToken: source.token })
}

export const createCompetencyTopic = (payload) => {
  if (payload.description === null) {
    delete payload.description
  }

  const resource = payload.isTopicTemplate ? 'topics/templates' : 'topics'

  return http.post(resource, objectToFormData(payload.formData, { indices: true }))
}

export const getCompetencyTopic = (topicId) => {
  return http.get(`competency/topic/${topicId}`)
}
export const postStartExamination = (topicId, enrollmentId) => {
  return http.post('examinations/init', {
    topic_id: topicId,
    enrollment_id: enrollmentId,
  })
}

export const getDeadline = (data) => {
  return http.get(
    `classroom/${data.session_uuid}/enrollment/examinations/make/${data.make_examination_id}`
  )
}

export const getExaminationDrafts = (examinationId, topicId, enrollmentId, attempt) => {
  return plutonHttp.get(`answer/${examinationId}/${topicId}/${enrollmentId}/${attempt}`)
}

export const saveDraftExamination = (data) => {
  return plutonHttp.post(`answer`, data)
}

export const getQuestionTemplateGroups = (data) => {
  return http.get(`topics-templates/question-group?${createQuery(data.params, true)}`)
}

export const getQuestionTemplateGroupSummary = () => {
  return http.get('topics-templates/question-group/summary')
}

export const getQuestionTemplateGroup = (id) => {
  return http.get(`topics-templates/question-group/${id}`)
}

export const createQuestionTemplateGroup = (data) => {
  return http.post(`topics-templates/question-group`, data)
}

export const editQuestionTemplateGroup = (data) => {
  return http.put(`topics-templates/question-group/${data.id}`, data)
}

export const deleteQuestionTemplateGroup = (id) => {
  return http.delete(`topics-templates/question-group/${id}`)
}

export const toggleStatusQuestionTemplateGroup = (id) => {
  return http.post(`topics-templates/question-group/${id}/toggle`)
}

export const getQuestionTemplateGroupsQuestions = (data) => {
  return http.get(
    `topics-templates/question-group/${data.options.groupId}/question?${createQuery(
      data.params,
      true
    )}`
  )
}

export const getQuestionTemplateGroupQuestion = (groupId, id) => {
  return http.get(`topics-templates/question-group/${groupId}/question/${id}`)
}

export const createQuestionTemplateGroupQuestion = (groupId, data) => {
  data = {
    ...data,
    allow_file: data.allowFile,
    right_feedback: data.rightFeedback,
    wrong_feedback: data.wrongFeedback,
  }
  delete data.allowFile
  delete data.rightFeedback
  delete data.wrongFeedback
  delete data.isTemplate
  return http.post(`topics-templates/question-group/${groupId}/question`, data)
}

export const editQuestionTemplateGroupQuestion = (groupId, data) => {
  return http.put(`topics-templates/question-group/${groupId}/question/${data.id}`, data)
}

export const deleteQuestionTemplateGroupQuestion = (groupId, id) => {
  return http.delete(`topics-templates/question-group/${groupId}/question/${id}`)
}

export const getPreProjects = (courseId) => {
  return http.get(`examinations/pre-project/courses/${courseId}`)
}

export const getAggregateExaminationAnswers = (examinationId, enrollmentId) => {
  return http.get(`examinations/${examinationId}/user/${enrollmentId}`)
}
