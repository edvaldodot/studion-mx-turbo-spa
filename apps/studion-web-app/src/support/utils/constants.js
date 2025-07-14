import i18n from '@/support/i18n'

export const SESSION_TEAM_OPTIONS = [
  {
    value: 'primary',
    text: i18n.t('global:priority:primary'),
    label: i18n.t('global:priority:primary')
  },
  {
    value: 'secondary',
    text: i18n.t('global:priority:secondary'),
    label: i18n.t('global:priority:secondary')
  },
  {
    value: '',
    text: i18n.t('global:priority:no_primary'),
    label: i18n.t('global:priority:no_primary')
  }
]

export const REGEX_HOUR_MINUTE = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/
