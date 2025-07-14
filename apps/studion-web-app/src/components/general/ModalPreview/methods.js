export function previewModal(types = ['image', 'pdf', 'video']) {
  return {
    accept: (type, metaType = 'file') => type && types.includes(type) && metaType === 'file',
  }
}
