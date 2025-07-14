const audioExtensions = [
  'aac',
  'aacp',
  'aax',
  'amr',
  'aiff',
  'flac',
  'm3u',
  'm3u8',
  'm4a',
  'm4b',
  'm4p',
  'm4r',
  'm4v',
  'm4w',
  'mp3',
  'ogg',
  'pls',
  'wav',
  'wavpack',
  'wma',
  'wv',
  '3g2',
  '3gp',
  '3gpp',
  '3gpp2',
]

const documentExtensions = [
  'csv',
  'doc',
  'docx',
  'html',
  'htm',
  'json',
  'md',
  'odf',
  'odg',
  'odi',
  'odm',
  'odp',
  'ods',
  'odt',
  'otf',
  'otg',
  'oth',
  'otm',
  'otp',
  'ots',
  'ott',
  'rtf',
  'tex',
  'xhtml',
  'xml',
  'xsl',
  'xslt',
  'xaml',
  'xps',
]

const imageExtensions = [
  'ai',
  'apng',
  'bmp',
  'eps',
  'gif',
  'ico',
  'indd',
  'jpeg',
  'jpg',
  'jng',
  'png',
  'ps',
  'psd',
  'raw',
  'svg',
  'svgz',
  'tiff',
  'webp',
  'xcf',
]

const videoExtensions = [
  'avi',
  'f4a',
  'f4b',
  'f4p',
  'f4v',
  'flv',
  'm2ts',
  'm3u8',
  'm4v',
  'mkv',
  'mov',
  'mp4',
  'mpeg',
  'mpg',
  'ogg',
  'ogv',
  'ts',
  'mts',
  'webm',
  'wmv',
]

import { formatFileSize } from '@/support/utils/storageUnit'

export const libraryMixin = {
  methods: {
    getFileExtension(fileName) {
      if (!fileName || typeof fileName !== 'string') {
        return ''
      }

      const extensionRegex = /\.([^.]+)$/
      const match = fileName.match(extensionRegex)

      return match ? match[1] : ''
    },
    getFileIconName(file) {
      if (!file) return

      const extension = this.getFileExtension(file.filename || file.fileName || file.name)
      const fileTypeToIconMap = {
        pdf: 'file-pdf',
        ...this.mapExtensionsToIcons(audioExtensions, 'file-music'),
        ...this.mapExtensionsToIcons(documentExtensions, 'file-document'),
        ...this.mapExtensionsToIcons(imageExtensions, 'file-image'),
        ...this.mapExtensionsToIcons(videoExtensions, 'file-video'),
      }

      return file.isFolder || file.metaType === 'folder'
        ? 'folder'
        : fileTypeToIconMap[extension] || 'file'
    },

    getFileSize(item) {
      if (item.metaType === 'external_link' || (item.meta && item.meta.type === 'external_link')) {
        return this.$t('global:external.media')
      }
      if (item.isFolder) {
        const countFiles = item.countFiles ? item.countFiles : item.countFilesOnFolder

        return this.$tc('library:card.folder.num.files', countFiles > 0 ? countFiles : 0, {
          num: countFiles,
        })
      }

      if (
        Number.isInteger(item.size) ||
        (item.vendorMeta && Number.isInteger(item.vendorMeta.size))
      ) {
        return formatFileSize(item.size || (item.vendorMeta && item.vendorMeta.size))
      } else {
        return item.size
      }
    },

    getFileSizeMeta(item) {
      if (item.metaType === 'folder') {
        return this.$tc(
          'library:card.folder.num.files',
          item.countFiles > 0 ? item.countFiles : 0,
          {
            num: item.countFiles,
          }
        )
      }

      return item.size
    },

    mapExtensionsToIcons(extensions, iconName) {
      return extensions.reduce(
        (acc, extension) => ({
          ...acc,
          [extension]: iconName,
        }),
        {}
      )
    },
  },
}
