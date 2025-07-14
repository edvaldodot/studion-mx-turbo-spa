import i18n from '@/support/i18n'

export const gradeFormatsFactory = () => [
  {
    label: i18n.t('solutions.create.classes:modal.examination.grade.type.score'),
    value: 'score',
  },
  {
    label: i18n.t('solutions.create.classes:modal.examination.grade.type.hidden'),
    value: 'hidden',
  },
]

export const questionConfigsFactory = () => [
  {
    label: i18n.t('solutions.create.classes:modal.examination.config.questions:option.0'),
    value: 'default',
  },
  {
    label: i18n.t('solutions.create.classes:modal.examination.config.questions:option.1'),
    value: 'question_template_random',
  },
]

export const gradeVisibilityOptionsFactory = () => [
  {
    label: i18n.t('solutions.create.classes:modal.examination.grade:show:option.1'),
    hint: i18n.t('solutions.create.classes:modal.examination.grade:show:option.1:hint'),
    value: 'respond_lesson',
  },
  {
    label: i18n.t('solutions.create.classes:modal.examination.grade:show:option.3'),
    hint: i18n.t('solutions.create.classes:modal.examination.grade:show:option.3:hint'),
    value: 'after_correction',
  },
  {
    label: i18n.t('solutions.create.classes:modal.examination.grade:show:option.2'),
    hint: i18n.t('solutions.create.classes:modal.examination.grade:show:option.2:hint'),
    value: 'session_schedule_finish',
  },
  {
    label: i18n.t('solutions.create.classes:modal.examination.grade:show:option.2'),
    hint: i18n.t('solutions.create.classes:modal.examination.grade:show:option.2:hint'),
    value: 'session_schedule_finish_after_correction',
  },
]