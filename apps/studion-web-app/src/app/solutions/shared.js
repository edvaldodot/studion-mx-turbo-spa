import i18n from '@/support/i18n'

export const TOPIC_TYPES = ['examination', 'research']

export const ALLOWED_TYPES = ['scorm', 'pptx', 'video']

export const QUESTION_TYPE_OPTIONS = [
  {
    label: i18n.t('global:form.send_file'),
    text: i18n.t('global:form.send_file'),
    value: 'send_file',
  },
  {
    label: i18n.t('global:form.discursive'),
    text: i18n.t('global:form.discursive'),
    value: 'discursive',
  },
  {
    label: i18n.t('global:form.objective'),
    text: i18n.t('global:form.objective'),
    value: 'multiple_choices',
  },
  {
    label: i18n.t('global:form.multiple.choice'),
    text: i18n.t('global:form.multiple.choice'),
    value: 'multiple_choices_multi_answers',
  },
  {
    label: i18n.t('global:form.fill.blank'),
    text: i18n.t('global:form.fill.blank'),
    value: 'fill_gap',
  },
  {
    label: i18n.t('global:form.trueOrFalse'),
    text: i18n.t('global:form.trueOrFalse'),
    value: 'true_or_false',
  },
  {
    label: i18n.t('global:form.association'),
    text: i18n.t('global:form.association'),
    value: 'association',
  },
]

export const RESEARCH_TYPE_OPTIONS = [
  {
    text: i18n.t('global:form.discursive'),
    value: 'discursive',
  },
  {
    text: i18n.t('global:form.objective'),
    value: 'multiple_choices',
  },
  {
    text: i18n.t('global:form.linear.scale'),
    value: 'linear_scale',
  },
  {
    text: i18n.t('global:form.matrix'),
    value: 'matrix',
  },
  {
    label: i18n.t('global:form.multiple.choice'),
    text: i18n.t('global:form.multiple.choice'),
    value: 'multiple_choices_multi_answers',
  }
]

export const DISABLE_ACTION_COPY = [
  {
    label: i18n.t('solutions.create.classes:modal.block.action.title', {
      action: i18n.t('global:copy'),
    }),
    description: i18n.t('solutions.create.classes:modal.block.action.description', {
      action: i18n.t('global:copy'),
    }),
    value: true,
  },
]

export const DISABLE_ACTION_CUT = [
  {
    label: i18n.t('solutions.create.classes:modal.block.action.title', {
      action: i18n.t('global:cut'),
    }),
    description: i18n.t('solutions.create.classes:modal.block.action.description', {
      action: i18n.t('global:cut'),
    }),
    value: true,
  },
]

export const DISABLE_ACTION_PASTE = [
  {
    label: i18n.t('solutions.create.classes:modal.block.action.title', {
      action: i18n.t('global:paste'),
    }),
    description: i18n.t('solutions.create.classes:modal.block.action.description', {
      action: i18n.t('global:paste'),
    }),
    value: true,
  },
]

export const QUESTION_FEEDBACK_OPTIONS = [
  {
    label: i18n.t('solutions.create.classes:modal.include.feedback'),
    value: true,
  },
]

export const MANDATORY_OPTION = [
  {
    label: i18n.t('solutions.create.classes:modal.mandatory'),
    value: true,
  },
]

export const BLOCK_ADVANCE = [
  {
    label: i18n.t('solutions.create.classes:modal.block.advance'),
    description: i18n.t('solutions.create.classes:modal.block.advance.description'),
    value: true,
  },
]

export const RESTRICT_PROGRESS_OPTION = [
  {
    label: i18n.t('solutions.create.classes:modal.restrict.progress'),
    value: true,
  },
]

export const EXAMINATION_MANDATORY_OPTION = [
  {
    label: i18n.t('solutions.create.classes:modal.examination.mandatory'),
    value: true,
  },
]

export const DOWNLOADABLE_OPTION = [
  {
    label: i18n.t('solutions.create.classes:modal.downloadable'),
    value: true,
  },
]

export const makePreferenceColumns = () => [
  {
    label: i18n.t('solutions.list:datatable.header.1'),
    value: 'name',
  },
  {
    label: i18n.t('global:slug.identity'),
    value: 'slug',
  },
  {
    label: i18n.t('solutions.list:datatable.header.2'),
    value: 'type',
  },
  {
    label: i18n.t('solutions.list:datatable.header.3'),
    value: 'status',
  },
  {
    label: i18n.t('solutions.list:datatable.header.4'),
    value: 'topics_count',
  },
  {
    label: i18n.t('solutions.list:datatable.header.5'),
    value: 'branch',
  },
  {
    label: i18n.t('solutions.list:datatable.header.6'),
    value: 'category',
  },
  {
    label: i18n.t('solutions.list:datatable.header.7'),
    value: 'workload',
  },
  {
    label: i18n.t('solutions.list:datatable.header.8'),
    value: 'duration',
  },
]

export const makeDefaultPreferences = () => ['name', 'type', 'status', 'topics_count']

export const classTypeAlias = {
  video: i18n.t('solutions.create.classes:modal.file.type.video'),
  external_link: i18n.t('solutions.create.classes:modal.file.type.external.link'),
  pptx: i18n.t('solutions.create.classes:modal.file.type.pptx'),
  upload: i18n.t('solutions.create.classes:modal.file.type.pdf'),
  audio: i18n.t('solutions.create.classes:modal.file.type.audio'),
  scorm: i18n.t('solutions.create.classes:modal.file.type.scorm'),
}

export const allowAutoSaveOptions = (send = false) => [
  {
    label: i18n.t('solutions.create.classes:modal.auto.send.student.responses'),
    description: send
      ? i18n.t('solutions.create.classes:modal.auto.send.student.responses.desc')
      : '',
    value: true,
  },
]
