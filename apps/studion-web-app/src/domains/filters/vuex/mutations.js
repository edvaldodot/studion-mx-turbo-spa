import * as TYPES from './mutations-types'
import i18n from '@/support/i18n'

export default {
  [TYPES.SET_FILTER_TYPES] (state, filterList) {
    state.filterTypes = filterList.map(item => {
      return {
        id: item.id,
        value: item.alias,
        text: i18n.t(`mediation.filter:form.filter_type:${item.alias}`)
      }
    })
  },

  [TYPES.SET_FILTER_PREVIEW_DATA] (state, data) {
    state.filterPreview.data = data
  },
  [TYPES.SET_FILTERS] (state, value) {
    state.filters = value
  },
  [TYPES.SET_CACHE_CONTENT_STATUS] (state, { content, response = {} }) {
    state.cacheContentStatus[content] = response
  }
}
