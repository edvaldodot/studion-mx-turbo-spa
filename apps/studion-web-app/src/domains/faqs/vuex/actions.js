import * as services from '../services'
import * as TYPES from './mutations-types'
export const attemptFaqQuestionsListRetrieval = ({ commit }, params) => {
  return services.getFaqQuestions(params)
}

export const attemptFaqQuestionsCreation = ({ commit }, data) => {
  return services.createFaqQuestion(data)
}

export const attemptFaqQuestionsUpdate = ({ commit }, { faqQuestionId, data }) => {
  return services.updateFaqQuestion(faqQuestionId, data)
}

export const attemptFaqQuestionsRemoval = ({ commit }, faqQuestionId) => {
  return services.removeFaqQuestion(faqQuestionId)
}

export const attemptFaqCategoriesRetrieval = ({ commit }, params) => {
  return services.getFaqCategories(params)
}

export const attemptFaqCategoryCreation = ({ commit }, data) => {
  return services.createFaqCategory(data)
}

export const attemptFaqCategoryUpdate = ({ commit }, { categoryId, data }) => {
  return services.updateFaqCategory(categoryId, data)
}

export const attemptFaqCategoryRemoval = ({ commit }, categoryId) => {
  return services.removeFaqCategory(categoryId)
}

export const attemptFaqCategoryActivation = ({ commit }, categoryId) => {
  return services.activateFaqCategory(categoryId)
}

export const attemptFaqCategoryDeactivation = ({ commit }, categoryId) => {
  return services.deactivateFaqCategory(categoryId)
}

export const setFaqsData = ({ commit }, data) => {
  commit(TYPES.SET_DATA, data)
}

export const addFaqsItems = ({ commit }, data) => {
  commit(TYPES.ADD_ITEMS, data)
}

export const addFaqsCategories = ({ commit }, data) => {
  commit(TYPES.ADD_CATEGORIES, data)
}
