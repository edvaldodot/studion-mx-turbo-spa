import i18n from '@/support/i18n'

export const makeDurationTypeList = () => [
  {
    text: i18n.t('global:weeks'),
    value: 'w',
  },
  {
    text: i18n.t('global:days'),
    value: 'd',
  },
  {
    text: i18n.t('global:hours'),
    value: 'h',
  },
]

export const makeCheckboxClosedSessionList = () => [
  {
    value: true,
    label: i18n.t('trails.create:duration.access.limit.time.rule'),
    testid: 'duration-condition-closed',
  },
]
