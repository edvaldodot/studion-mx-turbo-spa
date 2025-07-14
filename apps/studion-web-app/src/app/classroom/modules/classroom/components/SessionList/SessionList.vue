<script>
import { mapActions, mapState } from 'vuex'

import sharedDataMixin from '../../pages/sharedDataMixin'
import { paginateMixin } from '@/mixins/paginatorMixin'
import { certificateMixin } from '@/mixins/certificateMixin'

import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import FilterListOrder from '@/components/general/FilterListOrder'
import FilterListSearch from '@/components/general/FilterListSearch'
import Pagination from '@/components/general/Pagination'
import SessionCard from '../ClassroomCard/SessionCard'
import Tabs from '@/components/general/Tabs'

export default {
  components: {
    EmptyMessage,
    FilterList,
    FilterListOrder,
    FilterListSearch,
    Pagination,
    SessionCard,
    Tabs,
  },

  mixins: [paginateMixin, sharedDataMixin, certificateMixin],

  props: {
    defaultFilter: {
      type: Object,
      default: () => ({}),
    },

    fromOfferSolutions: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    ...mapState({
      Classroom: (state) => state.Classroom,
      accessibility: (state) => state.accessibility,
      userId: (state) => state.Account.user.id,
      userUuid: (state) => state.Account.user.uuid,
      Sessions: (state) => state.Sessions,
    }),

    userFilterKey() {
      return this.equalsProfile('student') ? 'enrollments_user' : 'teams_id'
    },

    getEmbed() {
      return this.equalsProfile('student')
        ? 'enrollments,courses,allow_access,categories,rating_analysis,user_rating,progress,offerings'
        : 'courses,categories,rating_analysis'
    },

    getFilterWithoutStatusList() {
      return this.equalsProfile('student') && this.$isEnabledFeature('bidding')
        ? ['desistente']
        : []
    },

    getFilter() {
      const filter = {
        ...this.filterActiveItems,
        [this.userFilterKey]: this.userId,
        without_status: this.getFilterWithoutStatusList,
        ...this.defaultFilter,
      }

      if (this.currentEnrollmentStatus) {
        filter.enrollments_status_type_alias = this.currentEnrollmentStatus
      }

      return filter
    },

    customParams() {
      return {
        filter: this.getFilter,
        embed: this.getEmbed,
      }
    },

    sessionsList() {
      return this.Sessions.sessionsList
    },

    hasFilter() {
      const filter = { ...this.pgtrParams.filter }
      return (
        (filter.categories && filter.categories.length > 0) ||
        Object.keys(this.pgtrParams.query).length > 0 ||
        !!this.pgtrParams.order
      )
    },
    headerDescription() {
      return this.equalsProfile('student')
        ? this.$t('classroom:header.description.student')
        : this.$t('classroom:header.description')
    },
  },

  watch: {
    pgtrIsFetching: {
      immediate: true,
      handler(value) {
        this.setFetching(value)
      },
    },
  },

  created() {
    this.isOfferListSolutions = this.fromOfferSolutions
  },

  mounted() {
    this.pgtrInitializePagination('getSessionsListResource', null, this.customParams)
  },

  destroyed() {
    this.pgtrClearQueryHistory()
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptUserCoursesRetrieval',
      'attemptMyselfDownloadCertificate',
      'attemptSessionReenrollment',
      'getSessionsList',
    ]),

    downloadCertificate(certificateHash) {
      this.$downloadCertificate(this.attemptMyselfDownloadCertificate, certificateHash)
    },

    async reenrollUser(sessionId, sessionUuid) {
      try {
        this.setFetching(true)
        await this.attemptSessionReenrollment({ sessionId, userUuid: this.userUuid })
        this.$router.push({ name: 'classroom', params: { session_uuid: sessionUuid } })
      } catch (error) {
        this.setFeedback({ message: this.$t('global:error'), type: 'error' })
      } finally {
        this.setFetching(false)
      }
    },

    showTagAllFilters(value) {
      this.tagAllFilters = value
    },

    filterStatus(index) {
      this.activeTab = index
      this.currentEnrollmentStatus = this.enrollmentStatus[this.activeTab]

      this.pgtrParams.filter = { ...this.pgtrParams.filter, ...this.getFilter }

      if (!this.currentEnrollmentStatus && this.pgtrParams.filter.enrollments_status_type_alias) {
        delete this.pgtrParams.filter.enrollments_status_type_alias
      }
    },

    hasEnrollments(session) {
      return session.enrollments && session.enrollments.length
    },

    getEnrollmentsHistories(session) {
      const currentEnrollment = session.enrollments[0]
      return currentEnrollment ? currentEnrollment.histories : []
    },
  },
}
</script>

<template>
  <div class="main-content classroom h-full p-4">
    <div class="py-4">
      <FilterList
        v-if="sessionsList"
        toggle
        :has-filter="hasFilter"
      >
        <Tabs
          v-if="equalsProfile('student')"
          slot="tabs"
          :links="tablinks"
          :index-active="activeTab"
          show-bottom-border
          class="mb-4"
          @tabChange="filterStatus"
        />
        <FilterListSearch
          slot="search"
          :hide-error-details="true"
          :dark="accessibility"
          @search="pgtrSetSearch('course_name', $event)"
          @tagAllFilters="showTagAllFilters"
        />

        <FilterListOrder
          slot="order"
          :on-server="true"
          :options="filterSolutionsListOrderOptions"
          @update-orders="pgtrUpdateOrder"
        />

        <FilterListOrder
          slot="categories"
          :label="$tc('global:category', 2)"
          :options="filterCategoriesOptions"
          :select-all-option="false"
          on-server
          multiple
          @update-orders="pgtrSetFilterCategories"
        />
      </FilterList>
    </div>
    <!-- default for student -->
    <EmptyMessage
      v-if="
        sessionsList.length === 0 &&
        !pgtrIsSearching &&
        !pgtrIsFiltering &&
        equalsProfile('student')
      "
    >
      <h2>{{ $t('classroom.list:student.empty.title') }}</h2>
      <p class="text-color">{{ $t('classroom.list:student.empty.message') }}</p>
    </EmptyMessage>

    <!-- default for managers -->
    <EmptyMessage
      v-if="
        sessionsList.length === 0 &&
        !pgtrIsSearching &&
        !pgtrIsFiltering &&
        notEqualsProfile('student')
      "
    >
      <h2>{{ $t('classroom.list:managers.empty.title') }}</h2>
      <p class="text-color">{{ $t('classroom.list:managers.empty.message') }}</p>
    </EmptyMessage>

    <!-- search -->
    <EmptyMessage v-if="sessionsList.length === 0 && pgtrIsSearching">
      <h2>{{ $t('global:search.empty.title') }}</h2>
      <p class="text-color">{{ $t('global:search.empty.message') }}</p>
    </EmptyMessage>

    <!-- Filters -->
    <EmptyMessage v-if="sessionsList.length === 0 && !pgtrIsSearching && pgtrIsFiltering">
      <h2>{{ $t('classroom.list:filter.empty.title') }}</h2>
    </EmptyMessage>

    <div>
      <SessionCard
        v-for="session in sessionsList"
        :key="session.id"
        :course-id="session.course.id"
        :to="{
          name: getClassroomRedirect(session.course),
          params: {
            session_uuid: session.uuid,
            prerequisite:
              session.prerequisite_name || (session.offering && session.offering.prerequisiteName),
            backToSessionsOnError: true,
            offering_id: $route.params.id,
          },
        }"
        :type="session.type"
        :course-type="session.course.typeAlias"
        :image="session.course.image"
        :title="session.course.name"
        :session-name="session.name"
        :certificate-hash="hasEnrollments(session) ? session.enrollments[0].certificateHash : null"
        :certificate-issued-at="
          hasEnrollments(session) ? session.enrollments[0].certificateIssuedAt : null
        "
        :start-date="session.availability.initial"
        :end-date="session.availability.final"
        :extended-date="session.availability.extended"
        :workload="session.course.workload"
        :duration="session.course.duration"
        :allow-access="
          (session.allowAccess && !session.isBlocked && session.isGrantedAccess) ||
          notEqualsProfile('student')
        "
        :enrollment-status="hasEnrollments(session) ? session.enrollments[0].statusAlias : null"
        :session-status-type="
          hasEnrollments(session) ? session.enrollments[0].statusTypeAlias : null
        "
        :rating-analysis="session.course._embedded ? session.course._embedded.rating_analysis : {}"
        :user-rating="session.course._embedded ? session.course._embedded.user_rating : {}"
        :categories="session.categories"
        :certificate-type="session.course.certificateType"
        :description="session.course.description"
        :technical-requirements="session.course.technicalRequirements"
        :available-tools="session.course.availableTools.filter((tool) => tool.alias !== 'aiTutor')"
        :progress="
          equalsProfile('student') && session.enrollments[0]._embedded
            ? session.enrollments[0]._embedded.progress
            : null
        "
        :downloaded="
          !!(hasEnrollments(session) ? session.enrollments[0].certificateDownloadedAt : false)
        "
        :blocked-message="getBlockMessage(session)"
        :reenrollment-allowed="
          hasEnrollments(session) ? session.enrollments[0].studentAllowedReenroll : false
        "
        :reenrollment-enabled="session.reenrollmentAllowed"
        :enrollments-list="getEnrollmentsHistories(session)"
        :current-enrollment="session.enrollments[0]"
        @downloadCertificate="downloadCertificate"
        @reenroll="reenrollUser(session.id, session.uuid)"
      />

      <Pagination
        :active-page="pgtrParams.page"
        :page-count="pgtrLastPage"
        @next-page="pgtrParams.page++"
        @previous-page="pgtrParams.page--"
        @first-page="pgtrParams.page = 1"
        @last-page="pgtrParams.page = pgtrLastPage"
        @go-to-page="pgtrParams.page = $event"
        @change-items-per-page="pgtrParams.limit = $event"
      />
    </div>
  </div>
</template>
