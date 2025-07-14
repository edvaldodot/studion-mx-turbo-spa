import * as TYPES from './mutations-types'
import { getTagList } from '../utils'
import { formatAction } from '@/domains/mediation/utils'

export default {
  [TYPES.SET_ACTIONS](state, value) {
    state.actions = value.map(formatAction)
  },

  [TYPES.SET_MEDIATION_LIST](state, value) {
    state.mediationList = value
  },
  [TYPES.SET_MEDIATION_AVAILABLE_LINKS](state, value) {
    state.current.availableLinks = value
  },
  [TYPES.ADD_MEDIATION_LINKS](state, value) {
    state.current.links.push(...value)
  },
  [TYPES.REMOVE_MEDIATION_LINK](state, value) {
    const idx = state.current.links.findIndex((link) => link.id === value.id)
    return state.current.links.splice(idx, 1)
  },
  [TYPES.SET_MEDIATION_LINKS](state, value) {
    state.current.links = value
  },
  [TYPES.SET_MEDIATION_PLAN](state, value) {
    state.current.mediationPlan = value
  },
  [TYPES.SET_MEDIATION_TAGS](state, value) {
    state.tags = {
      email: getTagList(value.email),
      discussion: getTagList(value.discussion),
    }
  },
  [TYPES.SET_MEDIATION_TEMPLATES](state, value) {
    state.templates = value
  },
  [TYPES.SET_MEDIATION_TEMPLATES](state, value) {
    state.templates = value
  },
  [TYPES.SET_MEDIATION_FILTERS](state, value) {
    state.filters = value.data.map((filter) => {
      return {
        text: filter.name,
        description: filter.description,
        value: filter.i_filters,
      }
    })
  },
  [TYPES.SET_MEDIATION_BATCHES_LIST](state, value) {
    state.mediationBatchList = value
  },
  [TYPES.SET_CUSTOM_INSTRUCTIONS](state, value) {
    state.customInstructions = value
  },
  [TYPES.ADD_CUSTOM_PM_TAG](state, value) {
    state.current.mediationPlan.meta.customInstructions[value[0]] = value[1]
  },
  [TYPES.SET_SCHEDULED_LIST_RESOURCE](state, value) {
    state.scheduledListResource = value
  },
}
