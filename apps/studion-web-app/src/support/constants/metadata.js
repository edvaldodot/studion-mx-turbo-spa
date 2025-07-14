import i18n from '@/support/i18n'

export const SESSION_METADATA_OPTIONS = [
  {
    text: i18n.t('global:metadata.type.date'),
    value: 'date'
  },
  {
    text: i18n.t('global:metadata.type.text'),
    value: 'text'
  },
  {
    text: i18n.t('global:metadata.type.select'),
    value: 'select'
  },
  {
    text: i18n.t('global:metadata.type.multiple.select'),
    value: 'multiple_select'
  }
]
