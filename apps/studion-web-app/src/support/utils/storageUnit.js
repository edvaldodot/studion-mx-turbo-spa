import { fileTypes } from '@/domains/library/support/fileTypes'

export const formatFileSize = (bytes, decimalPoint) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1000
  const dm = decimalPoint || 2
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export const getFileTypes = (mimeType) => {
  const currentFileType = fileTypes.find((fileType) => {
    return fileType.mime.indexOf(mimeType) > -1
  })

  return currentFileType ? currentFileType.alias : null
}
