import * as TYPES from './mutations-types'

export default {
  [TYPES.SET_MEDIAS_LIST](state, value) {
    state.medias = value
  },

  [TYPES.SET_MEDIAS_WITHOUT_RELATION_LIST](state, value) {
    state.mediasWithoutRelationList = value
  },

  [TYPES.SET_SOLUTION_MEDIAS_LIST](state, value) {
    state.solutionMediasList = value
  },

  [TYPES.SET_INSTANCE_LIBRARY_LIST](state, value) {
    state.instanceLibrary = value.map((file) => {
      return {
        ...file,
        fileName: file.filename,
        metaType: file.meta.type || 'file',
        size: file.vendorMeta.size || file.vendorMeta.getcontentlength,
        url: file.meta.type === 'external_link' ? file.path : null,
      }
    })
  },

  [TYPES.SET_LIBRARY_LIST](state, value) {
    state.updateLibraryList = {
      ...state.updateLibraryList,
      ...value,
    }
  },

  [TYPES.SET_LIBRARY_FILE_LIST](state, value) {
    state.libraryFileList = value
  },
}
