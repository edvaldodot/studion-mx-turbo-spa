export const TAB_FILTERS = [
  {
    text: 'classroom.assessments.competency.tab.filter.1',
    location: {
      name: 'classroom.assessments.competency.evaluation',
    },
  },
  {
    text: 'classroom.assessments.competency.tab.filter.2',
    location: {
      name: 'classroom.assessments.competency.student',
    },
  },
]

export const DEFAULT_TABS = {
  assessments: {
    text: 'classroom.assessments.tab.link.1',
    location: {
      name: 'classroom.assessments.evaluation',
    },
  },
  competency: {
    text: 'classroom.assessments.tab.link.2',
    location: {
      name: 'classroom.assessments.competency',
    },
  },
  lti: {
    text: 'classroom.assessments.tab.link.3',
    location: {
      name: 'classroom.assessments.lti',
    },
  },
  preproject: {
    text: 'global:menu.preproject',
    location: {
      name: 'classroom.assessments.preproject',
    },
  },
}

export const FILTER_OPTIONS = (ctx) => {
  return {
    title: ctx.$t('global:status'),
    name: 'status',
    items: [
      {
        active: false,
        id: 'finished',
        text: ctx.$t(`classroom.assessments.evaluation:competency.finished`),
        property: 'status',
      },
      {
        active: false,
        id: 'finished_with_comment',
        text: ctx.$t(`classroom.assessments.evaluation:competency.finished_with_comment`),
        property: 'status',
      },
      {
        active: false,
        id: 'open',
        text: ctx.$t(`classroom.assessments.evaluation:competency.open`),
        property: 'status',
      },
    ],
  }
}