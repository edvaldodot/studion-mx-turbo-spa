import { mapActions, mapState } from 'vuex'
import i18n from '@/support/i18n'

import config from '@/config'
const { CUSTOM_CLASSROOM_REDIRECT } = config

const makeOrderFilterOptions = (propertyOrderAsc = 'name', isOfferListSolutions = false) => {
  const defaultOptions = [
    {
      text: i18n.t('global:order.name'),
      value: 0,
      property: propertyOrderAsc,
      type: 'asc',
    },
  ]

  if (isOfferListSolutions) {
    return [
      ...defaultOptions,
      {
        text: i18n.t('global:courses.position', { position: i18n.t('global:asc') }),
        value: 1,
        property: 'offerings_course_position',
        type: 'asc',
      },
      {
        text: i18n.t('global:courses.position', { position: i18n.t('global:desc') }),
        value: 2,
        property: 'offerings_course_position',
        type: 'desc',
      },
    ]
  }

  return [
    ...defaultOptions,
    {
      text: i18n.t('global:order.date.new'),
      value: 1,
      property: 'created_at',
      type: 'desc',
    },
    {
      text: i18n.t('global:order.date.old'),
      value: 2,
      property: 'created_at',
      type: 'asc',
    },
  ]
}

const sharedDataMixin = {
  data() {
    const { tab } = this.$route.params
    const enrollmentStatus = ['', 'initial', 'pending', 'final']
    const isSolutionTab = this.$route.name === 'classroom.sessions'
    let activeTab = 0
    let currentEnrollmentStatus = ''

    if (tab) {
      activeTab = enrollmentStatus.findIndex((item) => item === tab)
      currentEnrollmentStatus = tab
    }

    return {
      activeTab,
      currentEnrollmentStatus,
      enrollmentStatus,
      filterTagOptions: [
        {
          title: 'Status',
          name: 'enrollments_status_alias',
          items: [
            {
              active: false,
              text: this.$t('community.sessions.filters:status.in.progress'),
              id: 'in_progress',
              property: 'enrollments_status_type_alias',
            },
            {
              active: false,
              text: this.$t('community.sessions.filters:status.ended'),
              id: 'ended',
              property: 'enrollments_status_type_alias',
            },
            {
              active: false,
              text: this.$t('community.sessions.filters:status.not.started'),
              id: 'not_started',
              property: 'enrollments_status_type_alias',
            },
          ],
        },
      ],
      filterCategoriesOptions: [],
      tablinks: [
        {
          text: `classroom:tabs.1.text${isSolutionTab ? '' : ':female'}`,
        },
        {
          text: `classroom:tabs.2.text${isSolutionTab ? '' : ':female'}`,
        },
        {
          text: 'classroom:tabs.3.text',
        },
        {
          text: `classroom:tabs.4.text${isSolutionTab ? '' : ':female'}`,
        },
      ],
      periodDict: {
        daily: 'global:day.plural',
        weekly: 'global:week.plural',
        monthly: 'global:month.plural',
        yearly: 'global:year.plural',
      },
      isOfferListSolutions: false,
    }
  },

  computed: {
    ...mapState(['language']),
    filterTrailsListOrderOptions() {
      return [...makeOrderFilterOptions('name')]
    },
    filterOfferingsListOrderOptions() {
      return [...makeOrderFilterOptions('title')]
    },
    filterSolutionsListOrderOptions() {
      return [...makeOrderFilterOptions('course_name', this.isOfferListSolutions)]
    },
    hasCustomClassroomRedirectEnv() {
      return !!CUSTOM_CLASSROOM_REDIRECT
    },
  },

  methods: {
    ...mapActions(['attemptCategoryListRetrieval']),
    /**
     * Receives a Schedule block array and cehck its fields to return the correct block message
     * @param {Object} Session
     * @returns {String}
     */
    dateFrequencyToMessage(session) {
      const noScheduleBlock = !session.scheduleBlock || session.scheduleBlock.length === 0
      const noScheduleGrantAccess =
        (!session.scheduleGrantAccess || session.scheduleGrantAccess.length === 0) &&
        (!session.schedule_grant_access || session.schedule_grant_access.length === 0)
      const isNotBlockedAndGrantedAccess =
        !session.isBlocked && (session.isGrantedAccess || session.session_is_granted)
      const noAllowAccess = !session.allowAccess && !session.schedule_grant_access

      if (
        this.notEqualsProfile('student') ||
        (noScheduleBlock && noScheduleGrantAccess) ||
        isNotBlockedAndGrantedAccess ||
        noAllowAccess
      ) {
        return ''
      }

      return this.$t('classroom.list:session.block.general')
    },

    /**
     * @description Returns a block message
     * @param {Object} session
     */
    getBlockMessage(session) {
      const prerequisiteName =
        session.prerequisite_name || (session.offering && session.offering.prerequisiteName)

      if (prerequisiteName)
        return this.$t('classroom.list:session.block.prerequisite', {
          solution: prerequisiteName,
        })

      return this.dateFrequencyToMessage(session)
    },

    getClassroomRedirect(course) {
      if (CUSTOM_CLASSROOM_REDIRECT) {
        return CUSTOM_CLASSROOM_REDIRECT
      }

      if (!course.customClassroomRedirect) return 'classroom.panel.dashboard'

      switch (course.customClassroomRedirect) {
        case 'class':
          return 'classroom.lessons.course'
        default:
          return 'classroom.panel.dashboard'
      }
    },
  },

  created() {
    this.attemptCategoryListRetrieval().then(({ data }) => {
      this.filterCategoriesOptions = data.data.map((category) => ({
        text: category.name,
        value: category.id,
      }))
    })
  },
}

export default sharedDataMixin