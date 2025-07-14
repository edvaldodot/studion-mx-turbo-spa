import i18n from '@/support/i18n'

export const makeTypeOptions = () => [
  {
    text: i18n.t('global:metadata.type.text.mask'),
    value: 'string',
  },
  {
    text: i18n.t('global:metadata.type.text'),
    value: 'text',
  },
]
